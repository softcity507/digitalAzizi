'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { AccountFilterType } from '@/types/customer';
import { CURRENCY_SUMMARIES, DOUBLE_ENTRY_BOOKS, DEFAULT_CUSTOMER_TRANSACTIONS } from '@/data/customerData';
import CurrencySummaryGrid from '@/components/max/CurrencySummaryGrid';
import CustomerSearch from '@/components/mini/CustomerSearch';
import DeskMirrorSection from '@/components/max/DeskMirrorSection';
import AccountFilterTabs from '@/components/mini/AccountFilterTabs';
import CustomerList from '@/components/max/CustomerList';
import AddCustomerButton from '@/components/mini/AddCustomerButton';
import CustomerPdfExport from '../max_second/CustomerPdfExport';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function CustomerLedgerContainer() {
  const t = useTranslations('CustomerBook');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<AccountFilterType>('all');
  const customers = useSettingsStore((state) => state.customers);

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // 1. Search filter matching name, subtitle, or phone
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.subtitle && customer.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (customer.phone && customer.phone.includes(searchQuery));

      if (!matchesSearch) return false;

      // 2. Tab filter (all / receivable / payable)
      if (activeFilter === 'receivable') {
        return customer.balances.some((b) => b.isCredit);
      }
      if (activeFilter === 'payable') {
        return customer.balances.some((b) => !b.isCredit);
      }

      return true;
    });
  }, [customers, searchQuery, activeFilter]);

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-5 sm:space-y-6 pb-28 sm:pb-20 transition-colors duration-200">
      {/* 1. Top Currency Net Balances (AFN, USD, PKR) */}
      <CurrencySummaryGrid summaries={CURRENCY_SUMMARIES} />

      {/* 2. Responsive 12-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        {/* Left Column: Desk Mirror Position & Filter Tabs (Sticky on Laptop/Desktop) */}
        <div className="lg:col-span-5 xl:col-span-4  space-y-4 lg:sticky lg:top-20">
          {/* Desk Mirror Position & Double-Entry Section */}
          <DeskMirrorSection books={DOUBLE_ENTRY_BOOKS} />

          {/* Account Filter Pills (All Accounts, Receivable, Payable) */}
          <div className="p-3.5 rounded-3xl bg-surface border border-surface-border shadow-sm space-y-2">
            <span className="block text-[10px] font-black tracking-wider uppercase text-slate-500 dark:text-slate-400 px-1">
              {t('allAccounts')}
            </span>
            <AccountFilterTabs
              currentFilter={activeFilter}
              onSelect={setActiveFilter}
              totalAccounts={customers.length}
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
              <CustomerPdfExport customers={customers} transactions={DEFAULT_CUSTOMER_TRANSACTIONS} />
            </div>
          </div>

          {/* Customers Feed Counter Header */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('allAccounts')}
            </h2>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-surface-subtle border border-surface-border text-slate-600 dark:text-slate-400">
              {filteredCustomers.length} / {customers.length}
            </span>
          </div>

          {/* Customer Ledger Accounts List */}
          <CustomerList customers={filteredCustomers} />
        </div>
      </div>

      </div>
  );
}