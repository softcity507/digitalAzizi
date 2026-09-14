export type CurrencyCode = 'AFN' | 'USD' | 'PKR';

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
