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

import seedData from './AllJs.json';

const seedBusinesses = seedData[0].businesses;
const initialBusiness = seedBusinesses.find((b) => b.id === seedData[0].current_business_id) || seedBusinesses[0];
const initialCustomerId = initialBusiness?.customers[0] ? `${initialBusiness.id}_${initialBusiness.customers[0].id}` : 'biz_001_cust_001';

const seedCustomerNames: Record<string, string> = {};
const seedCustomerCurrencies: Record<string, ExchangeCurrencyCode[]> = {};

interface SeedCustomerCurrency {
  type: string;
  amount: number;
}

interface SeedCustomer {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  customer_currencies: SeedCustomerCurrency[];
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

seedBusinesses.forEach((biz) => {
  biz.customers.forEach((cust: SeedCustomer) => {
    const custId = `${biz.id}_${cust.id}`;
    seedCustomerNames[custId] = `${cust.first_name} ${cust.last_name}`.trim();
    seedCustomerCurrencies[custId] = cust.customer_currencies
      .filter((c: SeedCustomerCurrency) => biz.active_currencies.includes(c.type))
      .map((c: SeedCustomerCurrency) => c.type as ExchangeCurrencyCode);
  });
});

CUSTOMER_ACCOUNTS.forEach((customer) => {
  if (!seedCustomerNames[customer.id]) {
    seedCustomerNames[customer.id] = customer.name;
    seedCustomerCurrencies[customer.id] = customer.balances.map((b) => b.currency as ExchangeCurrencyCode);
  }
});

const jsonExchangeEntries: ExchangeDeskEntry[] = seedBusinesses.flatMap((biz) =>
  (biz.exchanges || []).map((exc: SeedExchangeTx) => {
    const cust = biz.customers.find((c: SeedCustomer) => c.id === exc.customer_id);
    const customerName = cust ? `${cust.first_name} ${cust.last_name}`.trim() : exc.customer_id;
    const customerId = `${biz.id}_${exc.customer_id}`;
    const giveAmount = exc.from_amount;
    const giveCurrency = exc.from_currency as ExchangeCurrencyCode;
    const getAmount = exc.to_amount;
    const getCurrency = exc.to_currency as ExchangeCurrencyCode;
    const dateStr = (exc.date || '').slice(0, 10) || new Date().toISOString().slice(0, 10);
    const timeStr = exc.date ? new Date(exc.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '12:00 PM';
    const impact = computeDoubleEntryLedger('SELL', giveAmount, giveCurrency, getAmount, getCurrency);

    return {
      id: exc.exchange_id,
      customerId,
      customerName,
      type: 'SELL',
      giveAmount,
      giveCurrency,
      calcMode: 'multiply',
      exchangeRate: exc.exchange_rate,
      getAmount,
      getCurrency,
      date: dateStr,
      time: timeStr,
      timeAgo: 'Recently',
      ledgerImpact: impact,
      createdAt: new Date(exc.date || Date.now()).getTime(),
    };
  })
);

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
  customerId: initialCustomerId,
  customerNames: seedCustomerNames,
  customerCurrencies: seedCustomerCurrencies,
  type: 'SELL',
  giveAmount: '5000',
  giveCurrency: 'USD',
  calcMode: 'multiply',
  exchangeRate: '71.2',
  getCurrency: 'AFN',
  memo: '',
  serialNo: '',
  exchanges: jsonExchangeEntries.length > 0 ? jsonExchangeEntries : [
    {
      id: 'ex-1',
      customerId: 'biz_001_cust_001',
      customerName: 'Ahmed Khan',
      type: 'SELL',
      giveAmount: 5000,
      giveCurrency: 'USD',
      calcMode: 'multiply',
      exchangeRate: 71.2,
      getAmount: 356000,
      getCurrency: 'AFN',
      date: '2025-02-23',
      time: '11:00 AM',
      timeAgo: 'Recently',
      ledgerImpact: {
        customerReceives: { amount: 356000, formatted: '+356,000', currency: 'AFN' },
        customerPays: { amount: 5000, formatted: '-5,000', currency: 'USD' },
        exchangePays: { amount: 356000, formatted: '-356,000', currency: 'AFN' },
        exchangeReceives: { amount: 5000, formatted: '+5,000', currency: 'USD' },
      },
      createdAt: Date.now() - 1000 * 60 * 30,
    },
  ],
  editingTransaction: null,
  deletingTransactionId: null,
  notificationMessage: null,

  setCustomerId: (id) => {
    const userCurrs = get().customerCurrencies[id] || [];
    if (userCurrs.length > 0) {
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
  registerCustomer: (id, name, currencies) =>
    set((state) => ({
      customerNames: { ...state.customerNames, [id]: name },
      customerCurrencies: { ...state.customerCurrencies, [id]: currencies },
    })),
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
