import { CurrencySummary, BookEntry, CustomerAccount, CurrencyCode, TransactionCategory } from '@/types/customer';
import seedData from '@/store/AllJs.json';

interface SeedCustomerCurrency {
  type: string;
  amount: number;
}

interface SeedCashBookTx {
  transaction_id: string;
  customer_id?: string;
  from_customer_id?: string;
  to_customer_id?: string;
  currency: string;
  amount: number;
  type: string;
  mode?: string;
  date?: string;
  description?: string;
  details?: {
    memo?: string;
    ref_no?: string;
  };
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

const seedBusinesses = seedData[0].businesses;
const initialBusiness = seedBusinesses.find((b) => b.id === seedData[0].current_business_id) || seedBusinesses[0];

export const CUSTOMER_ACCOUNTS: CustomerAccount[] = seedBusinesses.flatMap((business) =>
  business.customers.map((customer) => {
    const fullName = `${customer.first_name} ${customer.last_name}`.trim();
    return {
      id: `${business.id}_${customer.id}`,
      name: fullName,
      phone: customer.phone,
      subtitle: customer.address,
      businessId: business.id,
      balances: customer.customer_currencies
        .filter((balance: SeedCustomerCurrency) => business.active_currencies.includes(balance.type))
        .map((balance: SeedCustomerCurrency) => {
          const isCredit = balance.amount >= 0;
          const formatted = Math.abs(balance.amount).toLocaleString('en-US');
          const prefix = isCredit ? '+' : '-';
          const symbol = balance.type === 'USD' ? '$' : '';
          return {
            currency: balance.type as CurrencyCode,
            amount: `${prefix}${symbol}${formatted}`,
            isCredit,
          };
        }),
    };
  })
);

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

export const DEFAULT_CUSTOMER_TRANSACTIONS: LedgerTransaction[] = seedBusinesses.flatMap((biz) => {
  const customerMap = new Map<string, string>();
  (biz.customers || []).forEach((c) => {
    customerMap.set(c.id, `${c.first_name} ${c.last_name}`.trim());
  });

  const cashBookTxs: LedgerTransaction[] = (biz.cash_book || []).flatMap((tx: SeedCashBookTx) => {
    const list: LedgerTransaction[] = [];
    if (tx.type === 'customer_transfer') {
      if (tx.from_customer_id) {
        const toName = (tx.to_customer_id ? customerMap.get(tx.to_customer_id) : undefined) || tx.to_customer_id || 'customer';
        list.push({
          id: `${tx.transaction_id}_from`,
          customerId: `${biz.id}_${tx.from_customer_id}`,
          title: `Transfer to ${toName}`,
          tag: 'Transfer',
          category: 'cash_out' as TransactionCategory,
          amount: tx.amount,
          currency: tx.currency as CurrencyCode,
          isCredit: false,
          date: (tx.date || '').slice(0, 10) || '2025-02-24',
          refNo: tx.details?.ref_no || tx.transaction_id,
          notes: tx.description || tx.details?.memo || '',
        });
      }
      if (tx.to_customer_id) {
        const fromName = (tx.from_customer_id ? customerMap.get(tx.from_customer_id) : undefined) || tx.from_customer_id || 'customer';
        list.push({
          id: `${tx.transaction_id}_to`,
          customerId: `${biz.id}_${tx.to_customer_id}`,
          title: `Transfer from ${fromName}`,
          tag: 'Transfer',
          category: 'cash_in' as TransactionCategory,
          amount: tx.amount,
          currency: tx.currency as CurrencyCode,
          isCredit: true,
          date: (tx.date || '').slice(0, 10) || '2025-02-24',
          refNo: tx.details?.ref_no || tx.transaction_id,
          notes: tx.description || tx.details?.memo || '',
        });
      }
    } else {
      const isCredit = tx.type === 'cash_in';
      list.push({
        id: tx.transaction_id,
        customerId: `${biz.id}_${tx.customer_id || 'cust'}`,
        title: isCredit ? 'Cash Deposit' : 'Cash Disbursement',
        tag: isCredit ? 'Cash In' : 'Cash Out',
        category: (isCredit ? 'cash_in' : 'cash_out') as TransactionCategory,
        amount: tx.amount,
        currency: tx.currency as CurrencyCode,
        isCredit,
        date: (tx.date || '').slice(0, 10) || '2025-02-24',
        refNo: tx.details?.ref_no || tx.transaction_id,
        notes: tx.description || tx.details?.memo || '',
      });
    }
    return list;
  });

  const exchangeTxs: LedgerTransaction[] = (biz.exchanges || []).map((exc: SeedExchangeTx) => ({
    id: exc.exchange_id,
    customerId: `${biz.id}_${exc.customer_id}`,
    title: `Exchange ${exc.from_amount?.toLocaleString()} ${exc.from_currency} -> ${exc.to_amount?.toLocaleString()} ${exc.to_currency}`,
    tag: 'Exchange',
    category: 'exchange' as TransactionCategory,
    amount: exc.from_amount,
    currency: exc.from_currency as CurrencyCode,
    isCredit: false,
    date: (exc.date || '').slice(0, 10) || '2025-02-23',
    refNo: exc.details?.ref_no || exc.exchange_id,
    notes: `${exc.description || ''} @ rate ${exc.exchange_rate}`,
  }));

  return [...cashBookTxs, ...exchangeTxs];
});

// Compute currency totals from initial active business customers in AllJs.json
const activeCurrencies = (initialBusiness?.active_currencies || ['AFN', 'PKR', 'USD']) as CurrencyCode[];

export const CURRENCY_SUMMARIES: CurrencySummary[] = activeCurrencies.map((curr) => {
  let totalNet = 0;
  (initialBusiness?.customers || []).forEach((c) => {
    const bal = c.customer_currencies.find((cc: SeedCustomerCurrency) => cc.type === curr);
    if (bal) totalNet += bal.amount;
  });

  const isPositive = totalNet >= 0;
  const formatted = `${isPositive ? '+' : '-'}${curr === 'USD' ? '$' : ''}${Math.abs(totalNet).toLocaleString('en-US')}`;
  const deskFormatted = `${!isPositive ? '+' : '-'}${curr === 'USD' ? '$' : ''}${Math.abs(totalNet).toLocaleString('en-US')}`;

  return {
    currency: curr,
    badge: isPositive ? 'Net Cr' : 'Net Dr',
    total: formatted,
    customerBalance: formatted,
    deskBalance: deskFormatted,
    isPositive,
  };
});

export const DOUBLE_ENTRY_BOOKS: BookEntry[] = activeCurrencies.map((curr) => {
  let totalNet = 0;
  (initialBusiness?.customers || []).forEach((c) => {
    const bal = c.customer_currencies.find((cc: SeedCustomerCurrency) => cc.type === curr);
    if (bal) totalNet += bal.amount;
  });

  const formatted = `${curr === 'USD' ? '$' : ''}${Math.abs(totalNet).toLocaleString('en-US')}`;

  return {
    currency: curr,
    cr: `+${formatted}`,
    dr: `-${formatted}`,
    net: '0.00',
    status: 'Balanced',
  };
});