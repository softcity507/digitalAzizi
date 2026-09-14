import { CurrencySummary, BookEntry, CustomerAccount } from '@/types/customer';

export const CURRENCY_SUMMARIES: CurrencySummary[] = [
  {
    currency: 'AFN',
    badge: 'Net Cr',
    total: '+9.23M',
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
    total: '+165.0K',
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
    phone: '+93 70 821 4402',
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
    phone: '+93 79 984 1120',
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
    phone: '+93 78 400 6655',
    balances: [
      { currency: 'AFN', amount: '-420,000', isCredit: false },
      { currency: 'USD', amount: '+$12,400', isCredit: true },
    ],
  },
];
