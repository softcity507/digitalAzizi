import { CurrencySummary, BookEntry, CustomerAccount } from '@/types/customer';

export const CURRENCY_SUMMARIES: CurrencySummary[] = [
  {
    currency: 'AFN',
    badge: 'Net Cr',
    total: '+9,229,800',
    customerBalance: '+9,229,800',
    deskBalance: '-9,229,800',
    isPositive: true,
  },
  {
    currency: 'USD',
    badge: 'Net Cr',
    total: '+$12,400',
    customerBalance: '+$12,400',
    deskBalance: '-$12,400',
    isPositive: true,
  },
  {
    currency: 'PKR',
    badge: 'Net Cr',
    total: '+165,000',
    customerBalance: '+165,000',
    deskBalance: '-165,000',
    isPositive: true,
  },
];

export const DOUBLE_ENTRY_BOOKS: BookEntry[] = [
  {
    currency: 'AFN',
    cr: '+9,229,800',
    dr: '-9,229,800',
    net: '0.00',
    status: 'Balanced',
  },
  {
    currency: 'USD',
    cr: '+$12,400',
    dr: '-$12,400',
    net: '0.00',
    status: 'Balanced',
  },
  {
    currency: 'PKR',
    cr: '+165,000',
    dr: '-165,000',
    net: '0.00',
    status: 'Balanced',
  },
];

export const CUSTOMER_ACCOUNTS: CustomerAccount[] = [
  {
    id: 'exchange',
    name: 'Exchange',
    badge: 'System Default',
    isSystemDefault: true,
    subtitle: 'Default Exchange',
    balances: [
      { currency: 'AFN', amount: '+1,440,000', isCredit: true },
      { currency: 'USD', amount: '-$5,000', isCredit: false },
      { currency: 'PKR', amount: '-1,440,000', isCredit: false },
    ],
  },
  {
    id: 'aziz-khan',
    name: 'Aziz Khan',
    subtitle: 'Wholesaler, Kabul Market',
    phone: '+93 70 526 9096',
    balances: [
      { currency: 'AFN', amount: '+8,449,800', isCredit: true },
      { currency: 'USD', amount: '+$5,000', isCredit: true },
      { currency: 'PKR', amount: '-785,000', isCredit: false },
    ],
  },
  {
    id: 'salam-jan',
    name: 'Salam Jan',
    subtitle: 'Sarraf, Herat Bazaar',
    phone: '+93 70 526 9096',
    balances: [
      { currency: 'AFN', amount: '+1,200,000', isCredit: true },
      { currency: 'USD', amount: '-$5,000', isCredit: false },
      { currency: 'PKR', amount: '+950,000', isCredit: true },
    ],
  },
  {
    id: 'haji-noorullah',
    name: 'Haji Noorullah',
    subtitle: 'Fruit Exporter, Kandahar',
    phone: '+93 70 526 9096',
    balances: [
      { currency: 'AFN', amount: '-420,000', isCredit: false },
      { currency: 'USD', amount: '+$12,400', isCredit: true },
    ],
  },
];

export const DEFAULT_CUSTOMER_TRANSACTIONS = [
  {
    id: 'tx-1',
    customerId: 'aziz-khan',
    title: 'Cash Deposit',
    tag: 'Cash In',
    category: 'cash_in' as const,
    amount: 8954000,
    currency: 'AFN' as const,
    isCredit: true,
    date: '2025-02-24',
    refNo: 'CD-8841',
    notes: 'Kabul Market Cash Inflow',
  },
  {
    id: 'tx-2',
    customerId: 'aziz-khan',
    title: 'Buy 5,000 USD',
    tag: 'Exchange',
    category: 'exchange' as const,
    amount: 356000,
    currency: 'AFN' as const,
    isCredit: false,
    date: '2025-02-23',
    refNo: 'EX-9012',
    notes: 'Bought 5,000 USD @ 71.20',
  },
  {
    id: 'tx-3',
    customerId: 'aziz-khan',
    title: 'Bank Wire Transfer',
    tag: 'Bank',
    category: 'bank' as const,
    amount: 790000,
    currency: 'AFN' as const,
    isCredit: false,
    date: '2025-02-22',
    refNo: 'WT-3301',
    notes: 'Azizi Bank Wire Settlement',
  },
  {
    id: 'tx-4',
    customerId: 'aziz-khan',
    title: 'Opening Balance',
    tag: 'Initial',
    category: 'initial' as const,
    amount: 641800,
    currency: 'AFN' as const,
    isCredit: true,
    date: '2025-02-20',
    refNo: 'OB-001',
    notes: 'Initial Ledger Balance',
  },
  {
    id: 'tx-5',
    customerId: 'aziz-khan',
    title: 'USD Currency Inflow',
    tag: 'Exchange',
    category: 'exchange' as const,
    amount: 5000,
    currency: 'USD' as const,
    isCredit: true,
    date: '2025-02-23',
    refNo: 'EX-9012',
    notes: 'USD exchange credit receipt',
  },
  {
    id: 'tx-6',
    customerId: 'aziz-khan',
    title: 'PKR Hawala Settlement',
    tag: 'Bank',
    category: 'bank' as const,
    amount: 785000,
    currency: 'PKR' as const,
    isCredit: false,
    date: '2025-02-21',
    refNo: 'PK-4091',
    notes: 'Peshawar branch payout debit',
  },
  {
    id: 'tx-7',
    customerId: 'salam-jan',
    title: 'Herat Bazaar Settlement',
    tag: 'Cash In',
    category: 'cash_in' as const,
    amount: 1200000,
    currency: 'AFN' as const,
    isCredit: true,
    date: '2025-02-24',
    refNo: 'HB-7721',
    notes: 'Herat currency desk deposit',
  },
  {
    id: 'tx-8',
    customerId: 'salam-jan',
    title: 'Sell 2,500 USD',
    tag: 'Exchange',
    category: 'exchange' as const,
    amount: 5000,
    currency: 'USD' as const,
    isCredit: false,
    date: '2025-02-23',
    refNo: 'EX-9102',
    notes: 'USD sold to vault',
  },
  {
    id: 'tx-9',
    customerId: 'salam-jan',
    title: 'Lahore Remittance Credit',
    tag: 'Bank',
    category: 'bank' as const,
    amount: 950000,
    currency: 'PKR' as const,
    isCredit: true,
    date: '2025-02-22',
    refNo: 'LR-4491',
    notes: 'PKR remittance receipt',
  },
  {
    id: 'tx-10',
    customerId: 'haji-noorullah',
    title: 'Kandahar Fruit Export Advance',
    tag: 'Bank',
    category: 'bank' as const,
    amount: 420000,
    currency: 'AFN' as const,
    isCredit: false,
    date: '2025-02-24',
    refNo: 'KF-2201',
    notes: 'Transport payment advance',
  },
  {
    id: 'tx-11',
    customerId: 'haji-noorullah',
    title: 'Dubai Trade USD Receipt',
    tag: 'Exchange',
    category: 'exchange' as const,
    amount: 12400,
    currency: 'USD' as const,
    isCredit: true,
    date: '2025-02-23',
    refNo: 'DB-8812',
    notes: 'Dubai trade wire settlement',
  },
];

export type CurrencyCode = 'AFN' | 'USD' | 'PKR';

export type TransactionCategory = 'cash_in' | 'cash_out' | 'exchange' | 'bank' | 'initial';

export interface LedgerTransaction {
  id: string;
  customerId: string;
  title: string;
  tag: string;
  category: TransactionCategory;
  amount: number;
  currency: CurrencyCode;
  isCredit: boolean;
  date: string;
  refNo: string;
  notes?: string;
}