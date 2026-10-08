import { create } from 'zustand';
import { CashBookEntry, CurrencyCode, TransactionType } from '@/types/cashbook';
import { CustomerTransaction } from '@/types/customer';
import { useSettingsStore } from './useSettingsStore';
import { useCustomerDetailsStore } from './useCustomerDetailsStore';
import { supabaseClient } from '@/lib/supabaseClient';

export type CurrencyFilterType = 'ALL' | CurrencyCode;
export type ModalType = 'cash_in' | 'cash_out' | 'exchange' | 'edit' | 'delete' | null;

const toCustomerLedgerTransactions = (entry: CashBookEntry): CustomerTransaction[] => {
  const customers = useSettingsStore.getState().customers.filter(
    (customer) => !entry.businessId || customer.businessId === entry.businessId
  );
  const findCustomer = (id?: string, name?: string) =>
    customers.find((customer) => id && customer.id === id) ||
    customers.find((customer) => name && customer.name.toLowerCase() === name.trim().toLowerCase());
  const details = entry.exchangeDetails;

  if (entry.type === 'exchange' && entry.fromCustomer && entry.toCustomer) {
    const sender = findCustomer(entry.customerId, entry.fromCustomer);
    const receiver = findCustomer(undefined, entry.toCustomer);
    const fromAmount = details?.fromAmount ?? entry.amount;
    const fromCurrency = details?.fromCurrency ?? entry.currency;
    const toAmount = details?.toAmount ?? entry.amount;
    const toCurrency = details?.toCurrency ?? entry.currency;
    const transactions: CustomerTransaction[] = [];

    if (sender) {
      transactions.push({
        id: `${entry.id}_from`,
        customerId: sender.id,
        title: `Transfer to ${receiver?.name || entry.toCustomer}`,
        tag: 'Transfer',
        category: 'cash_out',
        amount: fromAmount,
        currency: fromCurrency,
        isCredit: false,
        date: entry.date,
        refNo: entry.serialNo || entry.id,
        notes: entry.memo,
      });
    }

    if (receiver) {
      transactions.push({
        id: `${entry.id}_to`,
        customerId: receiver.id,
        title: `Transfer from ${sender?.name || entry.fromCustomer}`,
        tag: 'Transfer',
        category: 'cash_in',
        amount: toAmount,
        currency: toCurrency,
        isCredit: true,
        date: entry.date,
        refNo: entry.serialNo || entry.id,
        notes: entry.memo,
      });
    }

    return transactions;
  }

  const customer = findCustomer(entry.customerId, entry.customerName);
  if (!customer) return [];

  const isExchange = entry.type === 'exchange' && details;
  const isCredit = entry.type === 'cash_in';
  const amount = isExchange ? details.fromAmount : entry.amount;
  const currency = isExchange ? details.fromCurrency : entry.currency;
  const title = isExchange
    ? `Exchange ${details.fromAmount.toLocaleString()} ${details.fromCurrency} -> ${details.toAmount.toLocaleString()} ${details.toCurrency}`
    : isCredit ? 'Cash Deposit' : 'Cash Disbursement';

  return [{
    id: entry.id,
    customerId: customer.id,
    title,
    tag: isExchange ? 'Exchange' : isCredit ? 'Cash In' : 'Cash Out',
    category: isExchange ? 'exchange' : isCredit ? 'cash_in' : 'cash_out',
    amount,
    currency,
    isCredit,
    date: entry.date,
    refNo: entry.serialNo || entry.id,
    notes: entry.memo,
  }];
};

const replaceCustomerLedgerTransactions = (entry: CashBookEntry) => {
  useCustomerDetailsStore.getState().replaceLinkedTransactions(
    [entry.id, `${entry.id}_from`, `${entry.id}_to`],
    toCustomerLedgerTransactions(entry)
  );
};

const customerDatabaseId = (customerId?: string, customerName?: string, businessId?: string) => {
  const customers = useSettingsStore.getState().customers;
  const customer = customers.find((item) => customerId && item.id === customerId)
    || customers.find((item) => customerName && item.name.trim().toLowerCase() === customerName.trim().toLowerCase());
  const id = customer?.id ?? customerId;
  const numericId = Number(String(id ?? '').replace(/[^0-9]/g, ''));
  if (!Number.isSafeInteger(numericId) || numericId <= 0) return null;
  if (businessId && customer?.businessId && customer.businessId !== businessId) return null;
  return numericId;
};

const toCashbookRow = (entry: CashBookEntry) => {
  const timeMatch = entry.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  let time = entry.time || '12:00 AM';
  if (timeMatch) {
    let hours = Number(timeMatch[1]) % 12;
    if (timeMatch[3].toUpperCase() === 'PM') hours += 12;
    time = `${String(hours).padStart(2, '0')}:${timeMatch[2]}:00`;
  }
  const transactionDate = new Date(`${entry.date}T${time}`);
  const details = {
    serial_no: entry.serialNo ?? null,
    customer_name: entry.customerName,
    from_customer: entry.fromCustomer ?? null,
    to_customer: entry.toCustomer ?? null,
    memo: entry.memo ?? null,
  };

  return {
    business_id: entry.businessId ? Number(entry.businessId) : null,
    customer_id: customerDatabaseId(entry.customerId, entry.customerName, entry.businessId),
    from_customer_id: customerDatabaseId(undefined, entry.fromCustomer, entry.businessId),
    to_customer_id: customerDatabaseId(undefined, entry.toCustomer, entry.businessId),
    type: entry.type,
    currency: entry.currency,
    amount: entry.amount,
    mode: entry.type,
    transaction_date: transactionDate.toISOString(),
    description: entry.memo ?? null,
    from_currency: entry.exchangeDetails?.fromCurrency ?? null,
    to_currency: entry.exchangeDetails?.toCurrency ?? null,
    from_amount: entry.exchangeDetails?.fromAmount ?? null,
    to_amount: entry.exchangeDetails?.toAmount ?? null,
    exchange_rate: entry.exchangeDetails?.rate ?? null,
    details: { ...details, ...(entry.exchangeDetails ?? {}) },
  };
};

const fromCashbookRow = (row: Record<string, unknown>): CashBookEntry => {
  const transactionDate = new Date(String(row.transaction_date));
  const details = row.details && typeof row.details === 'object'
    ? row.details as Record<string, unknown>
    : {};
  const type = String(row.type) as TransactionType;
  const hasExchange = type === 'exchange';
  const date = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}-${String(transactionDate.getDate()).padStart(2, '0')}`;
  const fromCustomer = String(details.from_customer ?? '');
  const toCustomer = String(details.to_customer ?? '');
  const customerName = String(details.customer_name ?? fromCustomer);

  return {
    id: String(row.id),
    businessId: row.business_id == null ? undefined : String(row.business_id),
    customerId: row.customer_id == null ? undefined : String(row.customer_id),
    customerName,
    fromCustomer: fromCustomer || undefined,
    toCustomer: toCustomer || undefined,
    type,
    amount: Number(row.amount),
    currency: String(row.currency) as CurrencyCode,
    date,
    time: transactionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    memo: String(row.description ?? details.memo ?? '') || undefined,
    serialNo: String(details.serial_no ?? '') || undefined,
    exchangeDetails: hasExchange ? {
      fromUser: fromCustomer,
      toUser: toCustomer,
      fromCurrency: String(row.from_currency ?? row.currency) as CurrencyCode,
      fromAmount: Number(row.from_amount ?? row.amount),
      toCurrency: String(row.to_currency ?? row.currency) as CurrencyCode,
      toAmount: Number(row.to_amount ?? row.amount),
      rate: Number(row.exchange_rate ?? 1),
    } : undefined,
    createdAt: row.created_at ? new Date(String(row.created_at)).getTime() : transactionDate.getTime(),
  };
};

const hasSupabaseSession = async () => {
  const { data, error } = await supabaseClient.auth.getUser();
  return !error && Boolean(data.user);
};

interface CashBookState {
  // Filters & Navigation
  selectedDate: string; // YYYY-MM-DD format
  filterCurrency: CurrencyFilterType;
  selectedCustomerId: string | null;
  searchQuery: string;

  // Transactions State
  transactions: CashBookEntry[];
  isLoading: boolean;
  loadError: string | null;
  fetchTransactions: () => Promise<void>;

  // Baseline Opening Balances for computation
  openingBalances: {
    pkr: number;
    afn: number;
    usd: number;
  };

  // Modal Management
  activeModal: ModalType;
  editingTransaction: CashBookEntry | null;
  deletingTransactionId: string | null;

  // Actions
  setSelectedDate: (date: string) => void;
  prevDay: () => void;
  nextDay: () => void;
  setToday: () => void;
  setFilterCurrency: (currency: CurrencyFilterType) => void;
  setSelectedCustomerId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  addOpeningBalance: (currency: 'PKR' | 'AFN' | 'USD', amount: number) => void;

  // Modal Actions
  openModal: (type: ModalType, transaction?: CashBookEntry | null, deleteId?: string | null) => void;
  closeModal: () => void;

  // Transaction CRUD Actions
  addTransaction: (
    data: Omit<CashBookEntry, 'id' | 'createdAt'>
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    data: Partial<Omit<CashBookEntry, 'id' | 'createdAt'>>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Computed Selectors
  getFilteredTransactions: () => CashBookEntry[];
  getTodaySummary: () => {
    cashIn: { pkr: number; afn: number; usd: number };
    cashOut: { pkr: number; afn: number; usd: number };
  };
  getCashNetBalances: () => {
    pkr: number;
    afn: number;
    usd: number;
  };
}

export const useCashBookStore = create<CashBookState>((set, get) => ({
  selectedDate: new Date().toISOString().split('T')[0],
  filterCurrency: 'ALL',
  selectedCustomerId: null,
  searchQuery: '',
  transactions: [],
  isLoading: true,
  loadError: null,
  fetchTransactions: async () => {
    set({ isLoading: true, loadError: null });
    try {
      const business = useSettingsStore.getState().businesses.find((item) => item.isActive)
        || useSettingsStore.getState().businesses[0];
      if (!business?.id) {
        set({ transactions: [], isLoading: false });
        return;
      }
      if (!(await hasSupabaseSession())) throw new Error('No authenticated Supabase session.');

      const { data, error } = await supabaseClient
        .from('cashbook')
        .select('*')
        .eq('business_id', Number(business.id))
        .order('transaction_date', { ascending: false });
      if (error) throw error;

      const entries = (data ?? []).map((row) => fromCashbookRow(row as Record<string, unknown>));
      const selectedDate = get().selectedDate;
      const dateToShow = entries.some((entry) => entry.date === selectedDate)
        ? selectedDate
        : entries[0]?.date ?? selectedDate;
      set({ transactions: entries, selectedDate: dateToShow, isLoading: false, loadError: null });
      entries.forEach(replaceCustomerLedgerTransactions);
    } catch (error) {
      set({ transactions: [], isLoading: false, loadError: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
  openingBalances: {
    pkr: 0,
    afn: 0,
    usd: 0,
  },
  activeModal: null,
  editingTransaction: null,
  deletingTransactionId: null,

  setSelectedDate: (date: string) => set({ selectedDate: date }),

  prevDay: () => {
    const current = new Date(get().selectedDate);
    current.setDate(current.getDate() - 1);
    const prevDateStr = current.toISOString().split('T')[0];
    set({ selectedDate: prevDateStr });
  },

  nextDay: () => {
    const current = new Date(get().selectedDate);
    current.setDate(current.getDate() + 1);
    const nextDateStr = current.toISOString().split('T')[0];
    set({ selectedDate: nextDateStr });
  },

  setToday: () => {
    const today = new Date().toISOString().split('T')[0];
    set({ selectedDate: today });
  },

  setFilterCurrency: (currency: CurrencyFilterType) => set({ filterCurrency: currency }),

  setSelectedCustomerId: (id: string | null) => set({ selectedCustomerId: id }),

  setSearchQuery: (query: string) => set({ searchQuery: query }),

  addOpeningBalance: (currency, amount) => {
    const balanceKey = currency.toLowerCase() as 'pkr' | 'afn' | 'usd';
    set((state) => ({
      openingBalances: {
        ...state.openingBalances,
        [balanceKey]: state.openingBalances[balanceKey] + amount,
      },
    }));
  },

  openModal: (type: ModalType, transaction: CashBookEntry | null = null, deleteId: string | null = null) =>
    set({
      activeModal: type,
      editingTransaction: transaction,
      deletingTransactionId: deleteId || (transaction ? transaction.id : null),
    }),

  closeModal: () =>
    set({
      activeModal: null,
      editingTransaction: null,
      deletingTransactionId: null,
    }),

  addTransaction: async (data) => {
    const activeBusiness = useSettingsStore.getState().businesses.find((business) => business.isActive) || useSettingsStore.getState().businesses[0];
    const newEntry: CashBookEntry = {
      ...data,
      businessId: data.businessId ?? activeBusiness?.id,
      id: '',
      createdAt: Date.now(),
    };

    if (!newEntry.businessId) throw new Error('Select an active business before saving.');
    if (!(await hasSupabaseSession())) throw new Error('Sign in before saving cashbook transactions.');

    const { data: inserted, error } = await supabaseClient
      .from('cashbook')
      .insert(toCashbookRow(newEntry))
      .select('*')
      .single();
    if (error) throw error;

    const savedEntry = fromCashbookRow(inserted as Record<string, unknown>);
    set((state) => ({
      transactions: [savedEntry, ...state.transactions],
      activeModal: null,
    }));
    replaceCustomerLedgerTransactions(savedEntry);
  },

  updateTransaction: async (id, data) => {
    const existingEntry = get().transactions.find((tx) => tx.id === id);
    if (!existingEntry) return;
    if (!(await hasSupabaseSession())) throw new Error('Sign in before updating cashbook transactions.');
    const updatedEntry = { ...existingEntry, ...data };
    const { data: updatedRow, error } = await supabaseClient
      .from('cashbook')
      .update(toCashbookRow(updatedEntry))
      .eq('id', Number(id))
      .select('*')
      .single();
    if (error) throw error;
    const savedEntry = fromCashbookRow(updatedRow as Record<string, unknown>);
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? savedEntry : tx
      ),
      activeModal: null,
      editingTransaction: null,
    }));
    replaceCustomerLedgerTransactions(savedEntry);
  },

  deleteTransaction: async (id) => {
    if (!(await hasSupabaseSession())) throw new Error('Sign in before deleting cashbook transactions.');
    const { error } = await supabaseClient.from('cashbook').delete().eq('id', Number(id));
    if (error) throw error;
    useCustomerDetailsStore.getState().replaceLinkedTransactions(
      [id, `${id}_from`, `${id}_to`],
      []
    );
    set((state) => ({
      transactions: state.transactions.filter((tx) => tx.id !== id),
      activeModal: null,
      deletingTransactionId: null,
    }));
  },

  getFilteredTransactions: () => {
    const { transactions, selectedDate, filterCurrency, searchQuery, selectedCustomerId } = get();
    const activeBusiness = useSettingsStore.getState().businesses.find((business) => business.isActive) || useSettingsStore.getState().businesses[0];
    const allCustomers = useSettingsStore.getState().customers;
    const targetCustomer = selectedCustomerId ? allCustomers.find((c) => c.id === selectedCustomerId) : null;

    return transactions.filter((tx) => {
      // 1. Business filter
      if (activeBusiness && tx.businessId && tx.businessId !== activeBusiness.id) return false;

      // 2. Specific Business Customer filter
      if (selectedCustomerId && targetCustomer) {
        const matchId = tx.customerId === selectedCustomerId;
        const targetName = targetCustomer.name.toLowerCase();
        const matchName = tx.customerName.toLowerCase().includes(targetName) ||
          (tx.fromCustomer && tx.fromCustomer.toLowerCase().includes(targetName)) ||
          (tx.toCustomer && tx.toCustomer.toLowerCase().includes(targetName));
        if (!matchId && !matchName) return false;
      }

      // 3. Date filter
      if (tx.date !== selectedDate) return false;

      // 4. Currency filter
      if (filterCurrency !== 'ALL' && tx.currency !== filterCurrency) return false;

      // 5. Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = tx.customerName.toLowerCase().includes(q);
        const matchesMemo = tx.memo ? tx.memo.toLowerCase().includes(q) : false;
        const matchesSerial = tx.serialNo ? tx.serialNo.toLowerCase().includes(q) : false;
        const matchesAmount = tx.amount.toString().includes(q);
        const matchesCurrency = tx.currency.toLowerCase().includes(q);
        if (!matchesName && !matchesMemo && !matchesSerial && !matchesAmount && !matchesCurrency) {
          return false;
        }
      }

      return true;
    });
  },

  getTodaySummary: () => {
    const { transactions, selectedDate, selectedCustomerId } = get();
    const activeBusiness = useSettingsStore.getState().businesses.find((business) => business.isActive) || useSettingsStore.getState().businesses[0];
    const allCustomers = useSettingsStore.getState().customers;
    const targetCustomer = selectedCustomerId ? allCustomers.find((c) => c.id === selectedCustomerId) : null;

    const dayTransactions = transactions.filter((tx) => {
      if (activeBusiness && tx.businessId && tx.businessId !== activeBusiness.id) return false;
      if (selectedCustomerId && targetCustomer) {
        const matchId = tx.customerId === selectedCustomerId;
        const targetName = targetCustomer.name.toLowerCase();
        const matchName = tx.customerName.toLowerCase().includes(targetName) ||
          (tx.fromCustomer && tx.fromCustomer.toLowerCase().includes(targetName)) ||
          (tx.toCustomer && tx.toCustomer.toLowerCase().includes(targetName));
        if (!matchId && !matchName) return false;
      }
      return tx.date === selectedDate;
    });

    const summary = {
      cashIn: { pkr: 0, afn: 0, usd: 0 },
      cashOut: { pkr: 0, afn: 0, usd: 0 },
    };

    dayTransactions.forEach((tx) => {
      if (tx.type === 'cash_in') {
        if (tx.currency === 'PKR') summary.cashIn.pkr += tx.amount;
        if (tx.currency === 'AFN') summary.cashIn.afn += tx.amount;
        if (tx.currency === 'USD') summary.cashIn.usd += tx.amount;
      } else if (tx.type === 'cash_out') {
        if (tx.currency === 'PKR') summary.cashOut.pkr += tx.amount;
        if (tx.currency === 'AFN') summary.cashOut.afn += tx.amount;
        if (tx.currency === 'USD') summary.cashOut.usd += tx.amount;
      } else if (tx.type === 'exchange' && tx.exchangeDetails) {
        const { fromCurrency, fromAmount, toCurrency, toAmount } = tx.exchangeDetails;
        if (fromCurrency === 'PKR') summary.cashOut.pkr += fromAmount;
        if (fromCurrency === 'AFN') summary.cashOut.afn += fromAmount;
        if (fromCurrency === 'USD') summary.cashOut.usd += fromAmount;

        if (toCurrency === 'PKR') summary.cashIn.pkr += toAmount;
        if (toCurrency === 'AFN') summary.cashIn.afn += toAmount;
        if (toCurrency === 'USD') summary.cashIn.usd += toAmount;
      }
    });

    return summary;
  },

  getCashNetBalances: () => {
    const { getTodaySummary, openingBalances } = get();
    const { cashIn, cashOut } = getTodaySummary();

    return {
      pkr: openingBalances.pkr + cashIn.pkr - cashOut.pkr,
      afn: openingBalances.afn + cashIn.afn - cashOut.afn,
      usd: openingBalances.usd + cashIn.usd - cashOut.usd,
    };
  },
}));
