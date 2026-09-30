import { create } from 'zustand';
import { CurrencyCode } from '@/types/customer';
import { useSettingsStore } from './useSettingsStore';

export const AVAILABLE_CURRENCIES: CurrencyCode[] = [
  'AFN',
  'USD',
  'PKR',
  'IRR',
  'INR',
  'AED',
  'EUR',
  'GBP',
  'CNY',
  'TRY',
];

export const DEFAULT_CURRENCIES: CurrencyCode[] = ['AFN', 'USD', 'PKR'];

interface CreateBusinessState {
  name: string;
  details: string;
  selectedCurrencies: CurrencyCode[];
  availableCurrencies: CurrencyCode[];

  setName: (name: string) => void;
  setDetails: (details: string) => void;
  setSelectedCurrencies: (currencies: CurrencyCode[]) => void;
  toggleCurrency: (currency: CurrencyCode) => void;
  resetForm: () => void;
  createBusiness: () => boolean;
}

export const useCreateBussines = create<CreateBusinessState>((set, get) => ({
  name: '',
  details: '',
  selectedCurrencies: [...DEFAULT_CURRENCIES],
  availableCurrencies: AVAILABLE_CURRENCIES,

  setName: (name) => set({ name }),
  setDetails: (details) => set({ details }),
  setSelectedCurrencies: (selectedCurrencies) => set({ selectedCurrencies }),

  toggleCurrency: (currency) => {
    const { selectedCurrencies } = get();
    if (selectedCurrencies.includes(currency)) {
      if (selectedCurrencies.length > 1) {
        set({ selectedCurrencies: selectedCurrencies.filter((c) => c !== currency) });
      }
    } else {
      if (selectedCurrencies.length < 3) {
        set({ selectedCurrencies: [...selectedCurrencies, currency] });
      } else {
        // Replace the oldest selected currency to maintain 3
        set({ selectedCurrencies: [...selectedCurrencies.slice(1), currency] });
      }
    }
  },

  resetForm: () =>
    set({
      name: '',
      details: '',
      selectedCurrencies: [...DEFAULT_CURRENCIES],
    }),

  createBusiness: () => {
    const { name, details, selectedCurrencies } = get();
    const trimmedName = name.trim();
    if (!trimmedName || selectedCurrencies.length !== 3) {
      return false;
    }

    const trimmedDetails = details.trim() || 'Business Account';

    useSettingsStore.getState().addUser(
      trimmedName,
      trimmedDetails,
      selectedCurrencies,
      'Business'
    );

    get().resetForm();
    return true;
  },
}));
