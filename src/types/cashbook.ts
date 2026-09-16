export type CurrencyCode = 'AFN' | 'USD' | 'PKR';

export type TransactionType = 'cash_in' | 'cash_out' | 'exchange';

export interface ExchangeData {
  fromCurrency: CurrencyCode;
  fromAmount: number;
  toCurrency: CurrencyCode;
  toAmount: number;
  rate: number;
}

export interface CashBookEntry {
  id: string;
  customerName: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "07:36 PM"
  memo?: string;
  serialNo?: string;
  exchangeDetails?: ExchangeData;
  createdAt: number;
}

export interface CashBalanceSummary {
  pkr: number;
  afn: number;
  usd: number;
}

export interface TodayInOutSummary {
  cashIn: CashBalanceSummary;
  cashOut: CashBalanceSummary;
}
