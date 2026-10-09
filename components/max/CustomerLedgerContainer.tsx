'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AccountFilterType, BookEntry, CurrencyCode, CurrencySummary, CustomerAccount } from '@/types/customer';
import { useCashBookStore } from '@/store/useCashBookStore';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';
import CurrencySummaryGrid from '@/components/max/CurrencySummaryGrid';
import CustomerSearch from '@/components/mini/CustomerSearch';
import DeskMirrorSection from '@/components/max/DeskMirrorSection';
import AccountFilterTabs from '@/components/mini/AccountFilterTabs';
import CustomerList from '@/components/max/CustomerList';
// import AddCustomerButton from '@/components/mini/AddCustomerButton';
import CustomerPdfExport from '../max_second/CustomerPdfExport';
import { useSettingsStore } from '@/store/useSettingsStore';

const DEFAULT_CURRENCIES: CurrencyCode[] = ['AFN', 'USD', 'PKR'];

const parseAmount = (amount: string) => {
  const parsed = Number(amount.replaceAll(',', '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatBalance = (amount: number, currency: CurrencyCode) =>
  `${amount < 0 ? '-' : '+'}${currency === 'USD' ? '$' : ''}${Math.abs(amount).toLocaleString()}`;

export default function CustomerLedgerContainer() {
  const t = useTranslations('CustomerBook');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<AccountFilterType>('all');
  const businesses = useSettingsStore((state) => state.businesses);
  const allCustomers = useSettingsStore((state) => state.customers);
  const fetchBusinesses = useSettingsStore((state) => state.fetchBusinesses);
  const fetchTransactions = useCashBookStore((state) => state.fetchTransactions);
  const ledgerTransactions = useCustomerDetailsStore((state) => state.transactions);

  const activeBusiness = useMemo(() => businesses.find((b) => b.isActive) || businesses[0], [businesses]);

  useEffect(() => {
    if (businesses.length > 0) return;
    void fetchBusinesses().catch((error: unknown) => {
      console.error('Customer ledger business load failed:', error);
    });
  }, [businesses.length, fetchBusinesses]);

  useEffect(() => {
    if (!activeBusiness?.id) return;
    void fetchTransactions().catch((error: unknown) => {
      console.error('Customer ledger transaction load failed:', error);
    });
  }, [activeBusiness?.id, fetchTransactions]);

  const currencies = activeBusiness?.supportedCurrencies?.length
    ? activeBusiness.supportedCurrencies
    : DEFAULT_CURRENCIES;

  const activeBusinessCustomers = useMemo(() => {
    if (!activeBusiness) return [];

    const businessCustomers = allCustomers.filter((customer) => customer.businessId === activeBusiness.id);
    const customerIds = new Set(businessCustomers.map((customer) => customer.id));
    const businessTransactions = ledgerTransactions.filter((transaction) => customerIds.has(transaction.customerId));

    return businessCustomers.map((customer): CustomerAccount => {
      const customerTransactions = businessTransactions.filter((transaction) => transaction.customerId === customer.id);
      const balances = currencies.map((currency) => {
        const openingBalance = customer.balances
          .filter((balance) => balance.currency === currency)
          .reduce((total, balance) => total + parseAmount(balance.amount), 0);
        const transactionBalance = customerTransactions
          .filter((transaction) => transaction.currency === currency && transaction.category !== 'initial')
          .reduce((total, transaction) => total + (transaction.isCredit ? transaction.amount : -transaction.amount), 0);
        const amount = openingBalance + transactionBalance;

        return {
          currency,
          amount: formatBalance(amount, currency),
          isCredit: amount >= 0,
        };
      });

      return { ...customer, balances };
    });
  }, [allCustomers, activeBusiness, currencies, ledgerTransactions]);

  const businessTransactions = useMemo(() => {
    const customerIds = new Set(activeBusinessCustomers.map((customer) => customer.id));
    return ledgerTransactions.filter((transaction) => customerIds.has(transaction.customerId));
  }, [activeBusinessCustomers, ledgerTransactions]);

  const { currencySummaries, doubleEntryBooks } = useMemo(() => {
    const netByCurrency = new Map<CurrencyCode, number>(currencies.map((currency) => [currency, 0]));
    activeBusinessCustomers.forEach((customer) => {
      customer.balances.forEach((balance) => {
        netByCurrency.set(balance.currency, (netByCurrency.get(balance.currency) ?? 0) + parseAmount(balance.amount));
      });
    });

    const summaries: CurrencySummary[] = currencies.map((currency) => {
      const net = netByCurrency.get(currency) ?? 0;
      const isPositive = net >= 0;
      const formatted = formatBalance(net, currency);
      const deskBalance = formatBalance(-net, currency);
      return {
        currency,
        badge: isPositive ? 'Net Cr' : 'Net Dr',
        total: formatted,
        customerBalance: formatted,
        deskBalance,
        isPositive,
      };
    });

    const books: BookEntry[] = currencies.map((currency) => {
      const net = netByCurrency.get(currency) ?? 0;
      const amount = `${currency === 'USD' ? '$' : ''}${Math.abs(net).toLocaleString()}`;
      return {
        currency,
        cr: `+${amount}`,
        dr: `-${amount}`,
        net: '0.00',
        status: 'Balanced',
      };
    });

    return { currencySummaries: summaries, doubleEntryBooks: books };
  }, [activeBusinessCustomers, currencies]);

  const filteredCustomers = useMemo(() => {
    return activeBusinessCustomers.filter((customer) => {
      // 1. Search filter matching name, subtitle, or phone
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.subtitle && customer.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (customer.phone && customer.phone.includes(searchQuery));

      if (!matchesSearch) return false;

      // 2. Tab filter (all / receivable / payable)
      if (activeFilter === 'receivable') {
        return customer.balances.some((balance) => parseAmount(balance.amount) > 0);
      }
      if (activeFilter === 'payable') {
        return customer.balances.some((balance) => parseAmount(balance.amount) < 0);
      }

      return true;
    });
  }, [activeBusinessCustomers, searchQuery, activeFilter]);

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-5 sm:space-y-6 pb-28 sm:pb-20 transition-colors duration-200">
      {/* 1. Top Currency Net Balances (AFN, USD, PKR) */}
      <CurrencySummaryGrid summaries={currencySummaries} />

      {/* 2. Responsive 12-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        {/* Left Column: Desk Mirror Position & Filter Tabs (Sticky on Laptop/Desktop) */}
        <div className="lg:col-span-5 xl:col-span-4  space-y-4 lg:sticky lg:top-20">
          {/* Desk Mirror Position & Double-Entry Section */}
          <DeskMirrorSection books={doubleEntryBooks} />

          {/* Account Filter Pills (All Accounts, Receivable, Payable) */}
          <div className="p-3.5 rounded-3xl bg-surface border border-surface-border shadow-sm space-y-2">
            <span className="block text-[10px] font-black tracking-wider uppercase text-slate-500 dark:text-slate-400 px-1">
              {t('allAccounts')}
            </span>
            <AccountFilterTabs
              currentFilter={activeFilter}
              onSelect={setActiveFilter}
              totalAccounts={activeBusinessCustomers.length}
            />
          </div>
        </div>

        {/* Right Column: Search, PDF Export & Customer Accounts Feed */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Customer & Phone Search Bar */}
            <div className="w-full flex-1">
              <CustomerSearch value={searchQuery} onChange={setSearchQuery} />
            </div>
            {/* PDF Export Component Button */}
            <div className="w-full sm:w-auto shrink-0 flex justify-end">
              <CustomerPdfExport customers={activeBusinessCustomers} transactions={businessTransactions} />
            </div>
          </div>

          {/* Customers Feed Counter Header */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('allAccounts')}
            </h2>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-surface-subtle border border-surface-border text-slate-600 dark:text-slate-400">
              {filteredCustomers.length} / {activeBusinessCustomers.length}
            </span>
          </div>

          {/* Customer Ledger Accounts List */}
          <CustomerList customers={filteredCustomers} />
        </div>
      </div>

    </div>
  );
}
