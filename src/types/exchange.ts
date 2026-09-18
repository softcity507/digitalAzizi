export type ExchangeCurrencyCode =
  | 'PKR'
  | 'AFN'
  | 'USD'
  | 'INR'
  | 'IRR'
  | 'EUR'
  | 'GBP'
  | 'AED'
  | 'CNY'
  | 'TRY'
  | string;

export type ExchangeType = 'BUY' | 'SELL';

export type ExchangeCalcMode = 'multiply' | 'divide';

export interface DoubleEntryLedgerImpact {
  customerReceives: {
    amount: number;
    formatted: string;
    currency: ExchangeCurrencyCode;
  };
  customerPays: {
    amount: number;
    formatted: string;
    currency: ExchangeCurrencyCode;
  };
  exchangePays: {
    amount: number;
    formatted: string;
    currency: ExchangeCurrencyCode;
  };
  exchangeReceives: {
    amount: number;
    formatted: string;
    currency: ExchangeCurrencyCode;
  };
}

export interface ExchangeDeskEntry {
  id: string;
  customerId: string;
  customerName: string;
  type: ExchangeType;
  giveAmount: number;
  giveCurrency: ExchangeCurrencyCode;
  calcMode?: ExchangeCalcMode;
  exchangeRate: number;
  getAmount: number;
  getCurrency: ExchangeCurrencyCode;
  date: string;
  time: string;
  timeAgo?: string;
  memo?: string;
  serialNo?: string;
  ledgerImpact: DoubleEntryLedgerImpact;
  createdAt: number;
}
