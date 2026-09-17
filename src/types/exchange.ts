export type ExchangeCurrencyCode = 'AFN' | 'USD' | 'PKR' | 'EUR';

export type ExchangeType = 'BUY' | 'SELL';

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
