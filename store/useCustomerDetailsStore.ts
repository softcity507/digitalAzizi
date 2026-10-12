import { create } from 'zustand';
import { CustomerTransaction, CurrencyCode } from '@/types/customer';
import { supabaseClient } from '@/lib/supabaseClient';

export type CustomerDetailsModalType = 'edit' | 'delete' | null;
export type CustomerCurrencySelection = CurrencyCode | 'ALL';

const describeSupabaseError = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const fields = error as Record<string, unknown>;
    const details = [fields.message, fields.details, fields.hint, fields.code]
      .filter((value): value is string => typeof value === 'string' && value.length > 0);
    if (details.length) return details.join(' — ');
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown Supabase error';
    }
  }
  return String(error);
};

const LEDGER_ID_PREFIX = 'customer-ledger:';

// Feed ids for customer_ledger_transactions rows are `customer-ledger:<id>`; other ids are local.
const getLedgerRowId = (id: string) =>
  id.startsWith(LEDGER_ID_PREFIX) ? Number(id.slice(LEDGER_ID_PREFIX.length)) : null;

const mapLedgerRow = (row: Record<string, unknown>): CustomerTransaction => {
  const type = String(row.type) as 'cash_in' | 'cash_out';
  return {
    id: `${LEDGER_ID_PREFIX}${row.id}`,
    customerId: String(row.customer_id),
    title: type === 'cash_in' ? 'Cash In' : 'Cash Out',
    tag: type === 'cash_in' ? 'Cash In' : 'Cash Out',
    category: type,
    amount: Number(row.amount),
    currency: String(row.currency) as CurrencyCode,
    isCredit: type === 'cash_in',
    date: String(row.transaction_date).slice(0, 10),
    refNo: row.serial_no ? String(row.serial_no) : String(row.id),
    notes: row.memo ? String(row.memo) : undefined,
  };
};

const getSupabaseUser = async () => {
  const { data, error } = await supabaseClient.auth.getUser();
  return error ? null : data.user;
};

interface CustomerDetailsState {
  selectedCustomerId: string;
  selectedCurrency: CustomerCurrencySelection;
  searchQuery: string;
  dateFilter: string;
  sortAscending: boolean;
  transactions: CustomerTransaction[];
  activeModal: CustomerDetailsModalType;
  editingTransaction: CustomerTransaction | null;
  deletingTransactionId: string | null;

  setSelectedCustomerId: (id: string) => void;
  setSelectedCurrency: (curr: CustomerCurrencySelection) => void;
  setSearchQuery: (query: string) => void;
  setDateFilter: (filter: string) => void;
  toggleSortOrder: () => void;
  openModal: (type: CustomerDetailsModalType, tx?: CustomerTransaction | null, id?: string | null) => void;
  closeModal: () => void;
  addTransaction: (data: Omit<CustomerTransaction, 'id'>) => void;
  addCustomerCashTransaction: (data: { customerId: string; type: 'cash_in' | 'cash_out'; amount: number; currency: CurrencyCode; date: string; memo?: string }) => Promise<void>;
  fetchCustomerCashTransactions: (customerId: string) => Promise<void>;
  replaceLinkedTransactions: (ids: string[], transactions: CustomerTransaction[]) => void;
  updateTransaction: (id: string, data: Partial<CustomerTransaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getFilteredTransactions: () => CustomerTransaction[];
  getActiveBalances: () => { net: number; totalCredit: number; totalDebit: number };
}

export const useCustomerDetailsStore = create<CustomerDetailsState>((set, get) => (
  
  {
  selectedCustomerId: '',
  selectedCurrency: 'ALL',
  searchQuery: '',
  dateFilter: 'all',
  sortAscending: false,
  transactions: [],
  activeModal: null,
  editingTransaction: null,
  deletingTransactionId: null,

  setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
  setSelectedCurrency: (selectedCurrency) => set({ selectedCurrency }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setDateFilter: (dateFilter) => set({ dateFilter }),
  toggleSortOrder: () => set((s) => ({ sortAscending: !s.sortAscending })),

  openModal: (activeModal, editingTransaction = null, deletingTransactionId = null) =>
    set({ activeModal, editingTransaction, deletingTransactionId }),

  closeModal: () =>
    set({ activeModal: null, editingTransaction: null, deletingTransactionId: null }),

  addTransaction: (data) =>
    set((s) => ({
      transactions: [
        { ...data, id: `ledger-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
        ...s.transactions,
      ],
    })),

  fetchCustomerCashTransactions: async (customerId) => {
    const { data, error } = await supabaseClient
      .from('customer_ledger_transactions')
      .select('*')
      .eq('customer_id', Number(customerId))
      .order('transaction_date', { ascending: false });
    if (error) throw new Error(describeSupabaseError(error));
    const rows = (data ?? []).map(mapLedgerRow);
    set((state) => ({
      transactions: [...rows, ...state.transactions.filter((tx) => !tx.id.startsWith('customer-ledger:'))],
    }));
  },

  addCustomerCashTransaction: async (data) => {
    const customerId = Number(data.customerId);
    if (!Number.isSafeInteger(customerId) || customerId <= 0) {
      throw new Error('Select a valid customer before saving.');
    }
    const authUser = await getSupabaseUser();
    if (!authUser) {
      throw new Error('Sign in before saving customer cash transactions.');
    }

    const { data: inserted, error } = await supabaseClient
      .from('customer_ledger_transactions')
      .insert({
        customer_id: customerId,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        transaction_date: data.date,
        memo: data.memo || null,
      })
      .select('*')
      .single();
    if (error?.code === '23505') {
      // customer_ledger_transactions has unique (customer_id): one entry per customer.
      throw new Error('This customer already has a ledger entry. Edit or delete it instead of adding another.');
    }
    if (error?.code === '42501') {
      // RLS rejected the row: show exactly which identity and ids the policy evaluated.
      throw new Error(`${describeSupabaseError(error)} (customer ${customerId}, signed in as ${authUser.email} / ${authUser.id})`);
    }
    if (error) throw new Error(describeSupabaseError(error));
    set((state) => ({ transactions: [mapLedgerRow(inserted), ...state.transactions] }));
  },

  replaceLinkedTransactions: (ids, transactions) =>
    set((s) => ({
      transactions: [
        ...transactions,
        ...s.transactions.filter((tx) => !ids.includes(tx.id)),
      ],
    })),

  updateTransaction: async (id, data) => {
    const ledgerId = getLedgerRowId(id);
    if (ledgerId === null) {
      set((s) => ({
        transactions: s.transactions.map((tx) => (tx.id === id ? { ...tx, ...data } : tx)),
        activeModal: null,
        editingTransaction: null,
      }));
      return;
    }

    const changes: Record<string, unknown> = {};
    if (data.category === 'cash_in' || data.category === 'cash_out') changes.type = data.category;
    if (data.amount !== undefined) changes.amount = data.amount;
    if (data.currency !== undefined) changes.currency = data.currency;
    if (data.date !== undefined) changes.transaction_date = data.date;
    if ('notes' in data) changes.memo = data.notes || null;

    const { data: updated, error } = await supabaseClient
      .from('customer_ledger_transactions')
      .update(changes)
      .eq('id', ledgerId)
      .select('*')
      .single();
    if (error) throw new Error(describeSupabaseError(error));

    const updatedTx = mapLedgerRow(updated);
    set((s) => ({
      transactions: s.transactions.map((tx) => (tx.id === id ? updatedTx : tx)),
      activeModal: null,
      editingTransaction: null,
    }));
  },

  deleteTransaction: async (id) => {
    const ledgerId = getLedgerRowId(id);
    if (ledgerId !== null) {
      const { error } = await supabaseClient
        .from('customer_ledger_transactions')
        .delete()
        .eq('id', ledgerId);
      if (error) throw new Error(describeSupabaseError(error));
    }
    set((s) => ({
      transactions: s.transactions.filter((tx) => tx.id !== id),
      activeModal: null,
      deletingTransactionId: null,
    }));
  },

  getFilteredTransactions: () => {
    const { transactions, selectedCustomerId, selectedCurrency, searchQuery, sortAscending } = get();
    const query = searchQuery.trim().toLowerCase();

    return transactions
      .filter((tx) => {
        if (tx.customerId !== selectedCustomerId) return false;
        if (selectedCurrency !== 'ALL' && tx.currency !== selectedCurrency) return false;
        if (!query) return true;
        return (
          tx.title.toLowerCase().includes(query) ||
          tx.tag.toLowerCase().includes(query) ||
          (tx.refNo && tx.refNo.toLowerCase().includes(query)) ||
          (tx.notes && tx.notes.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => {
        const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
        return sortAscending ? -diff : diff;
      });
  },

  getActiveBalances: () => {
    const filtered = get().getFilteredTransactions();
    let totalCredit = 0;
    let totalDebit = 0;

    for (const tx of filtered) {
      if (tx.isCredit) {
        totalCredit += tx.amount;
      } else {
        totalDebit += tx.amount;
      }
    }

    return {
      net: totalCredit - totalDebit,
      totalCredit,
      totalDebit,
    };
  },
}));
