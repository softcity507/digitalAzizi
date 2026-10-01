import { create } from 'zustand';
import { CashBookEntry, CurrencyCode, TransactionType } from '@/types/cashbook';
import { CustomerTransaction } from '@/types/customer';
import { useSettingsStore } from './useSettingsStore';
import { useCustomerDetailsStore } from './useCustomerDetailsStore';
import seedData from './AllJs.json';

export type CurrencyFilterType = 'ALL' | CurrencyCode;
export type ModalType = 'cash_in' | 'cash_out' | 'exchange' | 'edit' | 'delete' | null;

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

const jsonCashBookEntries: CashBookEntry[] = seedBusinesses.flatMap((biz) => {
  const customerMap = new Map<string, string>();
  (biz.customers || []).forEach((c) => {
    customerMap.set(c.id, `${c.first_name} ${c.last_name}`.trim());
  });

  const cashBookList: CashBookEntry[] = (biz.cash_book || []).map((tx: SeedCashBookTx) => {
    const rawDate = tx.date || '2025-02-24T07:36:00Z';
    const date = rawDate.slice(0, 10);
    const dateObj = new Date(rawDate);
    const time = isNaN(dateObj.getTime())
      ? '12:00 PM'
      : dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (tx.type === 'customer_transfer') {
      const fromName = (tx.from_customer_id ? customerMap.get(tx.from_customer_id) : undefined) || tx.from_customer_id || 'Customer';
      const toName = (tx.to_customer_id ? customerMap.get(tx.to_customer_id) : undefined) || tx.to_customer_id || 'Customer';
      return {
        id: tx.transaction_id,
        businessId: biz.id,
        customerId: tx.from_customer_id ? `${biz.id}_${tx.from_customer_id}` : undefined,
        customerName: `${fromName} ➔ ${toName}`,
        fromCustomer: fromName,
        toCustomer: toName,
        type: 'exchange' as TransactionType,
        amount: tx.amount,
        currency: tx.currency as CurrencyCode,
        date,
        time,
        memo: tx.description || tx.details?.memo || `${fromName} transfer to ${toName}`,
        serialNo: tx.details?.ref_no || tx.transaction_id,
        exchangeDetails: {
          fromUser: fromName,
          toUser: toName,
          fromCurrency: tx.currency as CurrencyCode,
          fromAmount: tx.amount,
          toCurrency: tx.currency as CurrencyCode,
          toAmount: tx.amount,
          rate: 1,
        },
        createdAt: dateObj.getTime() || Date.now(),
      };
    }

    const custName = (tx.customer_id ? customerMap.get(tx.customer_id) : undefined) || tx.customer_id || 'Customer';
    return {
      id: tx.transaction_id,
      businessId: biz.id,
      customerId: tx.customer_id ? `${biz.id}_${tx.customer_id}` : undefined,
      customerName: custName,
      type: tx.type as TransactionType,
      amount: tx.amount,
      currency: tx.currency as CurrencyCode,
      date,
      time,
      memo: tx.description || tx.details?.memo || '',
      serialNo: tx.details?.ref_no || tx.transaction_id,
      createdAt: dateObj.getTime() || Date.now(),
    };
  });

  const exchangeList: CashBookEntry[] = (biz.exchanges || []).map((exc: SeedExchangeTx) => {
    const rawDate = exc.date || '2025-02-23T11:00:00Z';
    const date = rawDate.slice(0, 10);
    const dateObj = new Date(rawDate);
    const time = isNaN(dateObj.getTime())
      ? '12:00 PM'
      : dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const custName = customerMap.get(exc.customer_id) || exc.customer_id || 'Customer';

    return {
      id: exc.exchange_id,
      businessId: biz.id,
      customerId: exc.customer_id ? `${biz.id}_${exc.customer_id}` : undefined,
      customerName: custName,
      type: 'exchange' as TransactionType,
      amount: exc.from_amount,
      currency: exc.from_currency as CurrencyCode,
      date,
      time,
      memo: `${exc.description || 'Forex Exchange'} @ rate ${exc.exchange_rate}`,
      serialNo: exc.details?.ref_no || exc.exchange_id,
      exchangeDetails: {
        fromUser: custName,
        toUser: custName,
        fromCurrency: exc.from_currency as CurrencyCode,
        fromAmount: exc.from_amount,
        toCurrency: exc.to_currency as CurrencyCode,
        toAmount: exc.to_amount,
        rate: exc.exchange_rate,
      },
      createdAt: dateObj.getTime() || Date.now(),
    };
  });

  return [...cashBookList, ...exchangeList];
});

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
  useCustomerDetailsStore.getState().replaceCashBookTransactions(
    [entry.id, `${entry.id}_from`, `${entry.id}_to`],
    toCustomerLedgerTransactions(entry)
  );
};

interface CashBookState {
  // Filters & Navigation
  selectedDate: string; // YYYY-MM-DD format
  filterCurrency: CurrencyFilterType;
  selectedCustomerId: string | null;
  searchQuery: string;

  // Transactions State
  transactions: CashBookEntry[];

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
  ) => void;
  updateTransaction: (
    id: string,
    data: Partial<Omit<CashBookEntry, 'id' | 'createdAt'>>
  ) => void;
  deleteTransaction: (id: string) => void;

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
  selectedDate: '2025-02-24',
  filterCurrency: 'ALL',
  selectedCustomerId: null,
  searchQuery: '',
  transactions: jsonCashBookEntries,
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

  addTransaction: (data) => {
    const activeBusiness = useSettingsStore.getState().businesses.find((business) => business.isActive) || useSettingsStore.getState().businesses[0];
    const newEntry: CashBookEntry = {
      ...data,
      businessId: data.businessId ?? activeBusiness?.id,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
    };
    set((state) => ({
      transactions: [newEntry, ...state.transactions],
      activeModal: null,
    }));
    replaceCustomerLedgerTransactions(newEntry);
  },

  updateTransaction: (id, data) => {
    const existingEntry = get().transactions.find((tx) => tx.id === id);
    const updatedEntry = existingEntry ? { ...existingEntry, ...data } : null;
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...data } : tx
      ),
      activeModal: null,
      editingTransaction: null,
    }));
    if (updatedEntry) replaceCustomerLedgerTransactions(updatedEntry);
  },

  deleteTransaction: (id) => {
    useCustomerDetailsStore.getState().replaceCashBookTransactions(
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
