import { create } from 'zustand';
import { CustomerTransaction, CurrencyCode, TransactionCategory } from '@/types/customer';
import { DEFAULT_CUSTOMER_TRANSACTIONS } from '@/data/customerData';
import seedData from './AllJs.json';

export type CustomerDetailsModalType = 'edit' | 'delete' | null;
export type CustomerCurrencySelection = CurrencyCode | 'ALL';

interface SeedCashBookTx {
  transaction_id: string;
  customer_id?: string;
  from_customer_id?: string;
  to_customer_id?: string;
  currency: string;
  amount: number;
  type: string;
  mode?: string;
  date?: string;
  description?: string;
  details?: {
    memo?: string;
    ref_no?: string;
  };
}

interface SeedExchangeTx {
  exchange_id: string;
  customer_id: string;
  from_currency: string;
  to_currency: string;
  from_amount: number;
  to_amount: number;
  exchange_rate: number;
  date?: string;
  description?: string;
  details?: {
    ref_no?: string;
    memo?: string;
  };
}

const seedBusinesses = seedData[0].businesses;
const initialBusiness = seedBusinesses.find((b) => b.id === seedData[0].current_business_id) || seedBusinesses[0];
const initialCustomerId = initialBusiness?.customers[0] ? `${initialBusiness.id}_${initialBusiness.customers[0].id}` : 'biz_001_cust_001';

const jsonLedgerTransactions: CustomerTransaction[] = seedBusinesses.flatMap((biz) => {
  const cashBookTxs: CustomerTransaction[] = (biz.cash_book || []).flatMap((tx: SeedCashBookTx) => {
    const list: CustomerTransaction[] = [];
    if (tx.type === 'customer_transfer') {
      if (tx.from_customer_id) {
        list.push({
          id: `${tx.transaction_id}_from`,
          customerId: `${biz.id}_${tx.from_customer_id}`,
          title: `Transfer to ${tx.to_customer_id || 'customer'}`,
          tag: 'Transfer',
          category: 'cash_out' as TransactionCategory,
          amount: tx.amount,
          currency: tx.currency as CurrencyCode,
          isCredit: false,
          date: (tx.date || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
          refNo: tx.details?.ref_no || tx.transaction_id,
          notes: tx.description || tx.details?.memo || '',
        });
      }
      if (tx.to_customer_id) {
        list.push({
          id: `${tx.transaction_id}_to`,
          customerId: `${biz.id}_${tx.to_customer_id}`,
          title: `Transfer from ${tx.from_customer_id || 'customer'}`,
          tag: 'Transfer',
          category: 'cash_in' as TransactionCategory,
          amount: tx.amount,
          currency: tx.currency as CurrencyCode,
          isCredit: true,
          date: (tx.date || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
          refNo: tx.details?.ref_no || tx.transaction_id,
          notes: tx.description || tx.details?.memo || '',
        });
      }
    } else {
      const isCredit = tx.type === 'cash_in';
      list.push({
        id: tx.transaction_id,
        customerId: `${biz.id}_${tx.customer_id}`,
        title: isCredit ? 'Cash Deposit' : 'Cash Disbursement',
        tag: isCredit ? 'Cash In' : 'Cash Out',
        category: (isCredit ? 'cash_in' : 'cash_out') as TransactionCategory,
        amount: tx.amount,
        currency: tx.currency as CurrencyCode,
        isCredit,
        date: (tx.date || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
        refNo: tx.details?.ref_no || tx.transaction_id,
        notes: tx.description || tx.details?.memo || '',
      });
    }
    return list;
  });

  const exchangeTxs: CustomerTransaction[] = (biz.exchanges || []).map((exc: SeedExchangeTx) => ({
    id: exc.exchange_id,
    customerId: `${biz.id}_${exc.customer_id}`,
    title: `Exchange ${exc.from_amount} ${exc.from_currency} -> ${exc.to_amount} ${exc.to_currency}`,
    tag: 'Exchange',
    category: 'exchange' as TransactionCategory,
    amount: exc.from_amount,
    currency: exc.from_currency as CurrencyCode,
    isCredit: false,
    date: (exc.date || '').slice(0, 10) || new Date().toISOString().slice(0, 10),
    refNo: exc.details?.ref_no || exc.exchange_id,
    notes: `${exc.description || ''} @ rate ${exc.exchange_rate}`,
  }));

  return [...cashBookTxs, ...exchangeTxs];
});

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
  updateTransaction: (id: string, data: Partial<CustomerTransaction>) => void;
  deleteTransaction: (id: string) => void;
  getFilteredTransactions: () => CustomerTransaction[];
  getActiveBalances: () => { net: number; totalCredit: number; totalDebit: number };
}

export const useCustomerDetailsStore = create<CustomerDetailsState>((set, get) => ({
  selectedCustomerId: initialCustomerId,
  selectedCurrency: 'ALL',
  searchQuery: '',
  dateFilter: 'all',
  sortAscending: false,
  transactions: jsonLedgerTransactions.length > 0 ? jsonLedgerTransactions : DEFAULT_CUSTOMER_TRANSACTIONS,
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

  updateTransaction: (id, data) =>
    set((s) => ({
      transactions: s.transactions.map((tx) => (tx.id === id ? { ...tx, ...data } : tx)),
      activeModal: null,
      editingTransaction: null,
    })),

  deleteTransaction: (id) =>
    set((s) => ({
      transactions: s.transactions.filter((tx) => tx.id !== id),
      activeModal: null,
      deletingTransactionId: null,
    })),

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
