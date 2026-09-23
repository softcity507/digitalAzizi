export type CurrencyCode = 'AFN' | 'USD' | 'PKR' | 'INR' | 'IRR' | 'EUR' | 'GBP' | 'AED' | 'CNY' | 'TRY';

export interface CurrencySummary {
  currency: CurrencyCode;
  badge: string;
  total: string;
  customerBalance: string;
  deskBalance: string;
  isPositive: boolean;
}

export interface BookEntry {
  currency: CurrencyCode;
  cr: string;
  dr: string;
  net: string;
  status: string;
}

export interface CustomerBalance {
  currency: CurrencyCode;
  amount: string;
  isCredit: boolean;
}

export interface CustomerAccount {
  id: string;
  name: string;
  subtitle?: string;
  phone?: string;
  badge?: string;
  isSystemDefault?: boolean;
  balances: CustomerBalance[];
}

export type AccountFilterType = 'all' | 'receivable' | 'payable';

export type TransactionCategory = 'cash_in' | 'cash_out' | 'exchange' | 'bank' | 'initial';

export interface CustomerTransaction {
  id: string;
  customerId: string;
  title: string;
  tag: string;
  category: TransactionCategory;
  amount: number;
  currency: CurrencyCode;
  isCredit: boolean;
  date: string;
  refNo?: string;
  notes?: string;
}

export interface CustomerCurrencyTab {
  currency: CurrencyCode;
  symbol: string;
  balanceFormatted: string;
  dotColor: 'emerald' | 'slate' | 'rose';
}
