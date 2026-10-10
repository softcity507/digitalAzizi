'use client';

import { create } from 'zustand';
import { ExchangeCurrencyCode, ExchangeType, ExchangeDeskEntry, DoubleEntryLedgerImpact, ExchangeCalcMode } from '@/types/exchange';
import { CurrencyCode, CustomerTransaction } from '@/types/customer';
import { useCustomerDetailsStore } from './useCustomerDetailsStore';
import { useSettingsStore } from './useSettingsStore';
import { supabaseClient } from '@/lib/supabaseClient';

export function computeDoubleEntryLedger(
  type: ExchangeType,
  giveAmount: number,
  giveCurrency: ExchangeCurrencyCode,
  getAmount: number,
  getCurrency: ExchangeCurrencyCode
): DoubleEntryLedgerImpact {
  if (type === 'SELL') {
    // Client gives giveCurrency (e.g. USD) and receives getCurrency (e.g. AFN)
    return {
      customerReceives: {
        amount: getAmount,
        formatted: `+${getAmount.toLocaleString('en-US')}`,
        currency: getCurrency,
      },
      customerPays: {
        amount: giveAmount,
        formatted: `-${giveAmount.toLocaleString('en-US')}`,
        currency: giveCurrency,
      },
      exchangePays: {
        amount: getAmount,
        formatted: `-${getAmount.toLocaleString('en-US')}`,
        currency: getCurrency,
      },
      exchangeReceives: {
        amount: giveAmount,
        formatted: `+${giveAmount.toLocaleString('en-US')}`,
        currency: giveCurrency,
      },
    };
  } else {
    // BUY: The exchange gives giveCurrency and receives getCurrency from the customer.
    return {
      customerReceives: {
        amount: giveAmount,
        formatted: `+${giveAmount.toLocaleString('en-US')}`,
        currency: giveCurrency,
      },
      customerPays: {
        amount: getAmount,
        formatted: `-${getAmount.toLocaleString('en-US')}`,
        currency: getCurrency,
      },
      exchangePays: {
        amount: giveAmount,
        formatted: `-${giveAmount.toLocaleString('en-US')}`,
        currency: giveCurrency,
      },
      exchangeReceives: {
        amount: getAmount,
        formatted: `+${getAmount.toLocaleString('en-US')}`,
        currency: getCurrency,
      },
    };
  }
}

const syncCustomerLedger = (entry: ExchangeDeskEntry | null, id: string) => {
  const transactions: CustomerTransaction[] = entry
    ? [
      {
        id: `${entry.id}_give`,
        customerId: entry.customerId,
        title: `Exchange paid ${entry.giveAmount.toLocaleString()} ${entry.giveCurrency}`,
        tag: 'Exchange',
        category: 'exchange',
        amount: entry.giveAmount,
        currency: entry.giveCurrency as CurrencyCode,
        isCredit: false,
        date: entry.date,
        refNo: entry.serialNo || entry.id,
        notes: entry.memo,
      },
      {
        id: `${entry.id}_get`,
        customerId: entry.customerId,
        title: `Exchange received ${entry.getAmount.toLocaleString()} ${entry.getCurrency}`,
        tag: 'Exchange',
        category: 'exchange',
        amount: entry.getAmount,
        currency: entry.getCurrency as CurrencyCode,
        isCredit: true,
        date: entry.date,
        refNo: entry.serialNo || entry.id,
        notes: entry.memo,
      },
    ]
    : [];

  useCustomerDetailsStore.getState().replaceLinkedTransactions(
    [id, `${id}_give`, `${id}_get`],
    transactions
  );
};

const databaseCustomerId = (id: string) => {
  const parsed = Number(id.replace(/[^0-9]/g, ''));
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

const toCashbookExchangeRow = (entry: ExchangeDeskEntry) => {
  const business = useSettingsStore.getState().businesses.find((item) => item.isActive)
    || useSettingsStore.getState().businesses[0];
  const timeMatch = entry.time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  let time = entry.time || '12:00 AM';
  if (timeMatch) {
    let hours = Number(timeMatch[1]) % 12;
    if (timeMatch[3].toUpperCase() === 'PM') hours += 12;
    time = `${String(hours).padStart(2, '0')}:${timeMatch[2]}:00`;
  }
  const timestamp = new Date(`${entry.date}T${time}`);
  const customerId = databaseCustomerId(entry.customerId);

  if (!business?.id) throw new Error('Select an active business before saving an exchange.');
  if (!customerId) throw new Error('Select a valid customer account before saving an exchange.');
  if (Number.isNaN(timestamp.getTime())) throw new Error('The exchange date or time is invalid.');

  return {
    business_id: Number(business.id),
    customer_id: customerId,
    type: 'exchange',
    currency: entry.giveCurrency,
    amount: entry.giveAmount,
    mode: entry.type,
    transaction_date: timestamp.toISOString(),
    description: entry.memo ?? null,
    from_currency: entry.giveCurrency,
    to_currency: entry.getCurrency,
    from_amount: entry.giveAmount,
    to_amount: entry.getAmount,
    exchange_rate: entry.exchangeRate,
    details: {
      customer_name: entry.customerName,
      serial_no: entry.serialNo ?? null,
      memo: entry.memo ?? null,
      exchange_type: entry.type,
      calc_mode: entry.calcMode ?? 'multiply',
    },
  };
};

const fromCashbookExchangeRow = (row: Record<string, unknown>): ExchangeDeskEntry => {
  const details = row.details && typeof row.details === 'object'
    ? row.details as Record<string, unknown>
    : {};
  const transactionDate = new Date(String(row.transaction_date));
  const customerId = String(row.customer_id ?? '');
  const type = String(details.exchange_type ?? row.mode ?? 'SELL') === 'BUY' ? 'BUY' : 'SELL';
  const giveAmount = Number(row.from_amount ?? row.amount ?? 0);
  const giveCurrency = String(row.from_currency ?? row.currency ?? '') as ExchangeCurrencyCode;
  const getAmount = Number(row.to_amount ?? row.amount ?? 0);
  const getCurrency = String(row.to_currency ?? row.currency ?? '') as ExchangeCurrencyCode;
  const exchangeRate = Number(row.exchange_rate ?? 0);
  const calcMode = details.calc_mode === 'divide' ? 'divide' : 'multiply';

  return {
    id: String(row.id),
    customerId,
    customerName: String(
      details.customer_name
      ?? useSettingsStore.getState().customers.find((customer) => customer.id === customerId)?.name
      ?? 'Customer'
    ),
    type,
    giveAmount,
    giveCurrency,
    calcMode,
    exchangeRate,
    getAmount,
    getCurrency,
    date: `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}-${String(transactionDate.getDate()).padStart(2, '0')}`,
    time: transactionDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    memo: String(row.description ?? details.memo ?? '') || undefined,
    serialNo: String(details.serial_no ?? '') || undefined,
    ledgerImpact: computeDoubleEntryLedger(type, giveAmount, giveCurrency, getAmount, getCurrency),
    createdAt: row.created_at ? new Date(String(row.created_at)).getTime() : transactionDate.getTime(),
  };
};

const hasSupabaseSession = async () => {
  const { data, error } = await supabaseClient.auth.getUser();
  return !error && Boolean(data.user);
};

interface ExchangeDeskState {
  customerId: string;
  customerNames: Record<string, string>;
  customerCurrencies: Record<string, ExchangeCurrencyCode[]>;
  type: ExchangeType;
  giveAmount: string;
  giveCurrency: ExchangeCurrencyCode;
  calcMode: ExchangeCalcMode;
  exchangeRate: string;
  getCurrency: ExchangeCurrencyCode;
  memo: string;
  serialNo: string;
  exchanges: ExchangeDeskEntry[];
  isLoading: boolean;
  loadError: string | null;
  editingTransaction: ExchangeDeskEntry | null;
  deletingTransactionId: string | null;
  notificationMessage: string | null;

  // Setters
  setCustomerId: (id: string) => void;
  registerCustomer: (id: string, name: string, currencies: ExchangeCurrencyCode[]) => void;
  setType: (type: ExchangeType) => void;
  setGiveAmount: (amt: string) => void;
  setGiveCurrency: (curr: ExchangeCurrencyCode) => void;
  setCalcMode: (mode: ExchangeCalcMode) => void;
  setExchangeRate: (rate: string) => void;
  setGetCurrency: (curr: ExchangeCurrencyCode) => void;
  setMemo: (memo: string) => void;
  setSerialNo: (serial: string) => void;
  swapCurrencies: () => void;

  // Actions
  fetchExchanges: () => Promise<void>;
  commitTransaction: () => Promise<boolean>;
  openEditModal: (entry: ExchangeDeskEntry) => void;
  closeEditModal: () => void;
  updateTransaction: (id: string, updated: Partial<ExchangeDeskEntry>) => Promise<void>;
  openDeleteModal: (id: string) => void;
  closeDeleteModal: () => void;
  deleteTransaction: (id: string) => Promise<void>;
  clearNotification: () => void;
}

export const useExchangeDeskStore = create<ExchangeDeskState>((set, get) => ({
  customerId: '',
  customerNames: {},
  customerCurrencies: {},
  type: 'SELL',
  giveAmount: '',
  giveCurrency: '',
  calcMode: 'multiply',
  exchangeRate: '',
  getCurrency: '',
  memo: '',
  serialNo: '',
  exchanges: [],
  isLoading: true,
  loadError: null,
  editingTransaction: null,
  deletingTransactionId: null,
  notificationMessage: null,

  setCustomerId: (id) => {
    const userCurrs = get().customerCurrencies[id] || [];
    if (userCurrs.length > 0) {
      const newGive = userCurrs[0];
      const newGet = userCurrs.find((c) => c !== newGive) || '';
      set({
        customerId: id,
        giveCurrency: newGive,
        getCurrency: newGet,
      });
    } else {
      set({ customerId: id });
    }
  },
  registerCustomer: (id, name, currencies) => {
    set((state) => ({
      customerNames: { ...state.customerNames, [id]: name },
      customerCurrencies: { ...state.customerCurrencies, [id]: currencies },
    }));
  },
  setType: (type) => set({ type }),
  setGiveAmount: (giveAmount) => set({ giveAmount }),
  setGiveCurrency: (giveCurrency) => set({ giveCurrency }),
  setCalcMode: (calcMode) => set({ calcMode }),
  setExchangeRate: (exchangeRate) => set({ exchangeRate }),
  setGetCurrency: (getCurrency) => set({ getCurrency }),
  setMemo: (memo) => set({ memo }),
  setSerialNo: (serialNo) => set({ serialNo }),

  swapCurrencies: () => {
    const { giveCurrency, getCurrency, exchangeRate } = get();
    const rateNum = parseFloat(exchangeRate);
    const newRate = rateNum > 0 ? (1 / rateNum).toFixed(4) : exchangeRate;
    set({
      giveCurrency: getCurrency,
      getCurrency: giveCurrency,
      exchangeRate: newRate,
    });
  },

  fetchExchanges: async () => {
    set({ exchanges: [], isLoading: true, loadError: null });
    try {
      const business = useSettingsStore.getState().businesses.find((item) => item.isActive)
        || useSettingsStore.getState().businesses[0];
      if (!business?.id) {
        set({ exchanges: [], isLoading: false });
        return;
      }
      if (!(await hasSupabaseSession())) throw new Error('No authenticated Supabase session.');
      const { data, error } = await supabaseClient
        .from('cashbook').select('*')
        .eq('business_id', Number(business.id))
        .eq('type', 'exchange')
        .in('mode', ['BUY', 'SELL'])
        .order('transaction_date', { ascending: false });
      if (error) throw error;
      const entries = (data ?? []).map((row) => fromCashbookExchangeRow(row as Record<string, unknown>));
      set({ exchanges: entries, isLoading: false, loadError: null });
      entries.forEach((entry) => syncCustomerLedger(entry, entry.id));
    } catch (error) {
      set({ exchanges: [], isLoading: false, loadError: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },

  commitTransaction: async () => {
    const { customerId, type, giveAmount, giveCurrency, calcMode, exchangeRate, getCurrency, memo, serialNo } = get();
    const gAmt = parseFloat(giveAmount);
    const rate = parseFloat(exchangeRate);
    if (!customerId || !giveCurrency || !getCurrency || isNaN(gAmt) || gAmt <= 0 || isNaN(rate) || rate <= 0) return false;
    if (!(await hasSupabaseSession())) throw new Error('Sign in before saving exchange transactions.');
    const business = useSettingsStore.getState().businesses.find((item) => item.isActive)
      || useSettingsStore.getState().businesses[0];
    if (!business?.id) throw new Error('Select an active business before saving an exchange.');

    const customerName = get().customerNames[customerId] || 'Customer';
    const computedGetAmount = calcMode === 'multiply'
      ? Math.round(gAmt * rate * 100) / 100
      : Math.round((gAmt / rate) * 100) / 100;
    const ledgerImpact = computeDoubleEntryLedger(type, gAmt, giveCurrency, computedGetAmount, getCurrency);
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const newEntry: ExchangeDeskEntry = {
      id: '', customerId, customerName, type, giveAmount: gAmt, giveCurrency, calcMode,
      exchangeRate: rate, getAmount: computedGetAmount, getCurrency, date, time,
      memo: memo || undefined, serialNo: serialNo || undefined, ledgerImpact, createdAt: Date.now(),
    };
    const { data, error } = await supabaseClient
      .from('cashbook').insert(toCashbookExchangeRow(newEntry)).select('*').single();
    if (error) throw error;
    const savedEntry = fromCashbookExchangeRow(data as Record<string, unknown>);
    set((state) => ({
      exchanges: [savedEntry, ...state.exchanges],
      notificationMessage: `Committed ${gAmt.toLocaleString()} ${giveCurrency} at ${rate} to ${computedGetAmount.toLocaleString()} ${getCurrency}`,
    }));
    syncCustomerLedger(savedEntry, savedEntry.id);
    return true;
  },
  openEditModal: (entry) => set({ editingTransaction: entry }),
  closeEditModal: () => set({ editingTransaction: null }),

  updateTransaction: async (id, updated) => {
    const currentEntry = get().exchanges.find((entry) => entry.id === id);
    if (!currentEntry) return;
    if (!(await hasSupabaseSession())) throw new Error('Sign in before updating exchange transactions.');

    const giveAmount = updated.giveAmount ?? currentEntry.giveAmount;
    const giveCurrency = updated.giveCurrency ?? currentEntry.giveCurrency;
    const exchangeRate = updated.exchangeRate ?? currentEntry.exchangeRate;
    const getCurrency = updated.getCurrency ?? currentEntry.getCurrency;
    const type = updated.type ?? currentEntry.type;
    const calcMode = updated.calcMode ?? currentEntry.calcMode ?? 'multiply';
    const getAmount = calcMode === 'multiply'
      ? Math.round(giveAmount * exchangeRate * 100) / 100
      : Math.round((giveAmount / exchangeRate) * 100) / 100;
    const updatedEntry: ExchangeDeskEntry = {
      ...currentEntry,
      ...updated,
      giveAmount,
      giveCurrency,
      exchangeRate,
      getCurrency,
      type,
      calcMode,
      getAmount,
      ledgerImpact: computeDoubleEntryLedger(type, giveAmount, giveCurrency, getAmount, getCurrency),
    };

    const { data, error } = await supabaseClient
      .from('cashbook')
      .update(toCashbookExchangeRow(updatedEntry))
      .eq('id', Number(id))
      .select('*')
      .single();
    if (error) throw error;
    const savedEntry = fromCashbookExchangeRow(data as Record<string, unknown>);

    set((state) => ({
      exchanges: state.exchanges.map((entry) => entry.id === id ? savedEntry : entry),
      editingTransaction: null,
    }));
    syncCustomerLedger(savedEntry, id);
  },

  openDeleteModal: (id) => set({ deletingTransactionId: id }),
  closeDeleteModal: () => set({ deletingTransactionId: null }),

  deleteTransaction: async (id) => {
    if (!(await hasSupabaseSession())) throw new Error('Sign in before deleting exchange transactions.');
    const { error } = await supabaseClient.from('cashbook').delete().eq('id', Number(id));
    if (error) throw error;
    syncCustomerLedger(null, id);
    set((state) => ({
      exchanges: state.exchanges.filter((ex) => ex.id !== id),
      deletingTransactionId: null,
    }));
  },

  clearNotification: () => set({ notificationMessage: null }),
}));
