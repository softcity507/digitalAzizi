import { create } from 'zustand';
import { CashBookEntry, CurrencyCode, TransactionType, ExchangeData } from '@/types/cashbook';

export type CurrencyFilterType = 'ALL' | 'PKR' | 'AFN' | 'USD';
export type ModalType = 'cash_in' | 'cash_out' | 'exchange' | 'edit' | 'delete' | null;

interface CashBookState {
  // Filters & Navigation
  selectedDate: string; // YYYY-MM-DD format
  filterCurrency: CurrencyFilterType;
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
  setSearchQuery: (query: string) => void;

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

const INITIAL_TRANSACTIONS: CashBookEntry[] = [
  {
    id: 'tx-1',
    customerName: 'Aziz Khan',
    type: 'cash_in',
    amount: 8954000,
    currency: 'PKR',
    date: '2026-09-01',
    time: '07:36 PM',
    memo: 'Cash receipt for trade clearance',
    serialNo: 'CB-8821',
    createdAt: 1788284160000,
  },
  {
    id: 'tx-2',
    customerName: 'Salam Jan',
    type: 'cash_in',
    amount: 645800,
    currency: 'PKR',
    date: '2026-09-01',
    time: '07:35 PM',
    memo: 'Partial Hawala settlement',
    serialNo: 'CB-8820',
    createdAt: 1788284100000,
  },
  {
    id: 'tx-3',
    customerName: 'Haji Noorullah',
    type: 'cash_out',
    amount: 5000,
    currency: 'AFN',
    date: '2026-09-01',
    time: '07:26 PM',
    memo: 'Cash payout for customer debit',
    serialNo: 'CB-8819',
    createdAt: 1788283560000,
  },
  {
    id: 'tx-4',
    customerName: 'Exchange Wahid',
    type: 'cash_out',
    amount: 250000,
    currency: 'PKR',
    date: '2026-09-01',
    time: '07:25 PM',
    memo: 'Forex inter-desk handover',
    serialNo: 'CB-8818',
    createdAt: 1788283500000,
  },
  // Extra seed items for previous today cash summary matching
  {
    id: 'tx-5',
    customerName: 'Kabul Forex Corp',
    type: 'cash_in',
    amount: 5000,
    currency: 'AFN',
    date: '2026-09-01',
    time: '04:15 PM',
    memo: 'Branch settlement in AFN',
    serialNo: 'CB-8810',
    createdAt: 1788272100000,
  },
  {
    id: 'tx-6',
    customerName: 'Dubai Express',
    type: 'cash_in',
    amount: 500,
    currency: 'USD',
    date: '2026-09-01',
    time: '02:10 PM',
    memo: 'USD remittance intake',
    serialNo: 'CB-8805',
    createdAt: 1788264600000,
  },
  {
    id: 'tx-7',
    customerName: 'Quetta Transport Co',
    type: 'cash_out',
    amount: 1150000,
    currency: 'PKR',
    date: '2026-09-01',
    time: '01:30 PM',
    memo: 'Logistics cargo cash disbursement',
    serialNo: 'CB-8802',
    createdAt: 1788262200000,
  },
  {
    id: 'tx-8',
    customerName: 'Sher Khan Trading',
    type: 'cash_out',
    amount: 780000,
    currency: 'AFN',
    date: '2026-09-01',
    time: '11:45 AM',
    memo: 'AFN withdrawal for supplier',
    serialNo: 'CB-8798',
    createdAt: 1788255900000,
  },
];

export const useCashBookStore = create<CashBookState>((set, get) => ({
  selectedDate: '2026-09-01',
  filterCurrency: 'ALL',
  searchQuery: '',
  transactions: INITIAL_TRANSACTIONS,
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

  setSearchQuery: (query: string) => set({ searchQuery: query }),

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
    const newEntry: CashBookEntry = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now(),
    };
    set((state) => ({
      transactions: [newEntry, ...state.transactions],
      activeModal: null,
    }));
  },

  updateTransaction: (id, data) => {
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id ? { ...tx, ...data } : tx
      ),
      activeModal: null,
      editingTransaction: null,
    }));
  },

  deleteTransaction: (id) => {
    set((state) => ({
      transactions: state.transactions.filter((tx) => tx.id !== id),
      activeModal: null,
      deletingTransactionId: null,
    }));
  },

  getFilteredTransactions: () => {
    const { transactions, selectedDate, filterCurrency, searchQuery } = get();
    return transactions.filter((tx) => {
      // 1. Date filter (match date)
      if (tx.date !== selectedDate) return false;

      // 2. Currency filter
      if (filterCurrency !== 'ALL' && tx.currency !== filterCurrency) return false;

      // 3. Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = tx.customerName.toLowerCase().includes(q);
        const matchesMemo = tx.memo ? tx.memo.toLowerCase().includes(q) : false;
        const matchesSerial = tx.serialNo ? tx.serialNo.toLowerCase().includes(q) : false;
        const matchesAmount = tx.amount.toString().includes(q);
        if (!matchesName && !matchesMemo && !matchesSerial && !matchesAmount) {
          return false;
        }
      }

      return true;
    });
  },

  getTodaySummary: () => {
    const { transactions, selectedDate } = get();
    const dayTransactions = transactions.filter((tx) => tx.date === selectedDate);

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
        // From is cash out, To is cash in
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
