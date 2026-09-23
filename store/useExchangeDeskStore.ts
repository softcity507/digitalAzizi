'use client';

import { create } from 'zustand';
import { ExchangeCurrencyCode, ExchangeType, ExchangeDeskEntry, DoubleEntryLedgerImpact, ExchangeCalcMode } from '@/types/exchange';
import { CUSTOMER_ACCOUNTS } from '@/data/customerData';

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
    // BUY: Client gives giveCurrency (e.g. AFN) to buy getCurrency (e.g. USD)
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
  }
}

const INITIAL_EXCHANGES: ExchangeDeskEntry[] = [
  {
    id: 'ex-1',
    customerId: 'aziz-khan',
    customerName: 'Aziz Khan',
    type: 'SELL',
    giveAmount: 5000,
    giveCurrency: 'USD',
    calcMode: 'multiply',
    exchangeRate: 71.2,
    getAmount: 356000,
    getCurrency: 'AFN',
    date: '2026-09-17',
    time: '11:42 AM',
    timeAgo: '11:42 AM',
    ledgerImpact: {
      customerReceives: { amount: 356000, formatted: '+356,000', currency: 'AFN' },
      customerPays: { amount: 5000, formatted: '-5,000', currency: 'USD' },
      exchangePays: { amount: 356000, formatted: '-356,000', currency: 'AFN' },
      exchangeReceives: { amount: 5000, formatted: '+5,000', currency: 'USD' },
    },
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'ex-2',
    customerId: 'salam-jan',
    customerName: 'Salam Jan',
    type: 'SELL',
    giveAmount: 2500,
    giveCurrency: 'USD',
    calcMode: 'multiply',
    exchangeRate: 278.4,
    getAmount: 696000,
    getCurrency: 'PKR',
    date: '2026-09-17',
    time: '09:15 AM',
    timeAgo: '09:15 AM',
    ledgerImpact: {
      customerReceives: { amount: 696000, formatted: '+696,000', currency: 'PKR' },
      customerPays: { amount: 2500, formatted: '-2,500', currency: 'USD' },
      exchangePays: { amount: 696000, formatted: '-696,000', currency: 'PKR' },
      exchangeReceives: { amount: 2500, formatted: '+2,500', currency: 'USD' },
    },
    createdAt: Date.now() - 1000 * 60 * 180,
  },
  {
    id: 'ex-3',
    customerId: 'rajesh-kumar',
    customerName: 'Rajesh Kumar & Sons',
    type: 'SELL',
    giveAmount: 5000,
    giveCurrency: 'USD',
    calcMode: 'multiply',
    exchangeRate: 83.5,
    getAmount: 417500,
    getCurrency: 'INR',
    date: '2026-09-16',
    time: '04:20 PM',
    timeAgo: 'Yesterday',
    ledgerImpact: {
      customerReceives: { amount: 417500, formatted: '+417,500', currency: 'INR' },
      customerPays: { amount: 5000, formatted: '-5,000', currency: 'USD' },
      exchangePays: { amount: 417500, formatted: '-417,500', currency: 'INR' },
      exchangeReceives: { amount: 5000, formatted: '+5,000', currency: 'USD' },
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
  },
];

interface ExchangeDeskState {
  customerId: string;
  customerNames: Record<string, string>;
  type: ExchangeType;
  giveAmount: string;
  giveCurrency: ExchangeCurrencyCode;
  calcMode: ExchangeCalcMode;
  exchangeRate: string;
  getCurrency: ExchangeCurrencyCode;
  memo: string;
  serialNo: string;
  exchanges: ExchangeDeskEntry[];
  editingTransaction: ExchangeDeskEntry | null;
  deletingTransactionId: string | null;
  notificationMessage: string | null;

  // Setters
  setCustomerId: (id: string) => void;
  registerCustomer: (id: string, name: string) => void;
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
  commitTransaction: () => boolean;
  openEditModal: (entry: ExchangeDeskEntry) => void;
  closeEditModal: () => void;
  updateTransaction: (id: string, updated: Partial<ExchangeDeskEntry>) => void;
  openDeleteModal: (id: string) => void;
  closeDeleteModal: () => void;
  deleteTransaction: (id: string) => void;
  clearNotification: () => void;
}

export const useExchangeDeskStore = create<ExchangeDeskState>((set, get) => ({
  customerId: 'aziz-khan',
  customerNames: Object.fromEntries(CUSTOMER_ACCOUNTS.map((customer) => [customer.id, customer.name])),
  type: 'SELL',
  giveAmount: '5000',
  giveCurrency: 'USD',
  calcMode: 'multiply',
  exchangeRate: '71.2',
  getCurrency: 'AFN',
  memo: '',
  serialNo: '',
  exchanges: INITIAL_EXCHANGES,
  editingTransaction: null,
  deletingTransactionId: null,
  notificationMessage: null,

  setCustomerId: (id) => {
    const cust = CUSTOMER_ACCOUNTS.find((c) => c.id === id);
    if (cust && cust.balances && cust.balances.length > 0) {
      const userCurrs = cust.balances.map((b) => b.currency);
      const newGive = userCurrs[0] || 'USD';
      const newGet = userCurrs.find((c) => c !== newGive) || userCurrs[1] || 'PKR';
      set({
        customerId: id,
        giveCurrency: newGive,
        getCurrency: newGet,
      });
    } else {
      set({ customerId: id });
    }
  },
  registerCustomer: (id, name) =>
    set((state) => ({ customerNames: { ...state.customerNames, [id]: name } })),
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

  commitTransaction: () => {
    const { customerId, type, giveAmount, giveCurrency, calcMode, exchangeRate, getCurrency, memo, serialNo, exchanges } = get();
    const gAmt = parseFloat(giveAmount);
    const rate = parseFloat(exchangeRate);

    if (isNaN(gAmt) || gAmt <= 0 || isNaN(rate) || rate <= 0) {
      return false;
    }

    const customerName = get().customerNames[customerId] || 'Counterparty';
    
    // Multiply vs Divide Calculation:
    const computedGetAmount = calcMode === 'multiply'
      ? Math.round(gAmt * rate * 100) / 100
      : Math.round((gAmt / rate) * 100) / 100;

    const ledgerImpact = computeDoubleEntryLedger(
      type,
      gAmt,
      giveCurrency,
      computedGetAmount,
      getCurrency
    );

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newEntry: ExchangeDeskEntry = {
      id: `ex-${Date.now()}`,
      customerId,
      customerName,
      type,
      giveAmount: gAmt,
      giveCurrency,
      calcMode,
      exchangeRate: rate,
      getAmount: computedGetAmount,
      getCurrency,
      date: now.toISOString().split('T')[0],
      time: timeStr,
      timeAgo: timeStr,
      memo: memo || undefined,
      serialNo: serialNo || `EX-${Math.floor(1000 + Math.random() * 9000)}`,
      ledgerImpact,
      createdAt: Date.now(),
    };

    set({
      exchanges: [newEntry, ...exchanges],
      notificationMessage: `Committed ${gAmt.toLocaleString()} ${giveCurrency} ${calcMode === 'multiply' ? '✖' : '➗'} ${rate} ➔ ${computedGetAmount.toLocaleString()} ${getCurrency}`,
    });

    return true;
  },

  openEditModal: (entry) => set({ editingTransaction: entry }),
  closeEditModal: () => set({ editingTransaction: null }),

  updateTransaction: (id, updated) => {
    set((state) => ({
      exchanges: state.exchanges.map((ex) => {
        if (ex.id !== id) return ex;
        const gAmt = updated.giveAmount ?? ex.giveAmount;
        const gCurr = updated.giveCurrency ?? ex.giveCurrency;
        const rAmt = updated.exchangeRate ?? ex.exchangeRate;
        const targetCurr = updated.getCurrency ?? ex.getCurrency;
        const exType = updated.type ?? ex.type;
        const mode = updated.calcMode ?? ex.calcMode ?? 'multiply';
        const computedGetAmount = mode === 'multiply'
          ? Math.round(gAmt * rAmt * 100) / 100
          : Math.round((gAmt / rAmt) * 100) / 100;
        const ledgerImpact = computeDoubleEntryLedger(exType, gAmt, gCurr, computedGetAmount, targetCurr);

        return {
          ...ex,
          ...updated,
          getAmount: computedGetAmount,
          ledgerImpact,
        };
      }),
      editingTransaction: null,
    }));
  },

  openDeleteModal: (id) => set({ deletingTransactionId: id }),
  closeDeleteModal: () => set({ deletingTransactionId: null }),

  deleteTransaction: (id) => {
    set((state) => ({
      exchanges: state.exchanges.filter((ex) => ex.id !== id),
      deletingTransactionId: null,
    }));
  },

  clearNotification: () => set({ notificationMessage: null }),
}));
