import { create } from 'zustand';
import { CustomerTransaction, CurrencyCode } from '@/types/customer';
import { DEFAULT_CUSTOMER_TRANSACTIONS } from '@/data/customerData';

export type CustomerDetailsModalType = 'edit' | 'delete' | null;
export type CustomerCurrencySelection = CurrencyCode | 'ALL';

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
  updateTransaction: (id: string, data: Partial<CustomerTransaction>) => void;
  deleteTransaction: (id: string) => void;
  getFilteredTransactions: () => CustomerTransaction[];
  getActiveBalances: () => { net: number; totalCredit: number; totalDebit: number };
}

export const useCustomerDetailsStore = create<CustomerDetailsState>((set, get) => ({
  selectedCustomerId: 'aziz-khan',
  selectedCurrency: 'AFN',
  searchQuery: '',
  dateFilter: 'all',
  sortAscending: false,
  transactions: DEFAULT_CUSTOMER_TRANSACTIONS,
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
