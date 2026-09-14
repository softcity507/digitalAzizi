'use client';

import { useState, useMemo } from 'react';
import { AccountFilterType } from '@/types/customer';
import { CURRENCY_SUMMARIES, DOUBLE_ENTRY_BOOKS, CUSTOMER_ACCOUNTS } from '@/data/customerData';
import CurrencySummaryGrid from '@/components/max/CurrencySummaryGrid';
import CustomerSearch from '@/components/mini/CustomerSearch';
import DeskMirrorSection from '@/components/max/DeskMirrorSection';
import AccountFilterTabs from '@/components/mini/AccountFilterTabs';
import CustomerList from '@/components/max/CustomerList';
import AddCustomerButton from '@/components/mini/AddCustomerButton';

export default function CustomerLedgerContainer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<AccountFilterType>('all');

  const filteredCustomers = useMemo(() => {
    return CUSTOMER_ACCOUNTS.filter(customer => {
      // 1. Search filter matching name, subtitle, or phone
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.subtitle && customer.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (customer.phone && customer.phone.includes(searchQuery));

      if (!matchesSearch) return false;

      // 2. Tab filter (all / receivable / payable)
      if (activeFilter === 'receivable') {
        return customer.balances.some(b => b.isCredit);
      }
      if (activeFilter === 'payable') {
        return customer.balances.some(b => !b.isCredit);
      }

      return true;
    });
  }, [searchQuery, activeFilter]);

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 sm:pb-12">
      {/* 1. Top Currency Net Balances (AFN, USD, PKR) */}
      <CurrencySummaryGrid summaries={CURRENCY_SUMMARIES} />

      {/* 2. Customer & Phone Search Bar */}
      <CustomerSearch value={searchQuery} onChange={setSearchQuery} />

      {/* 3. Desk Mirror Position & Double-Entry Section */}
      <DeskMirrorSection books={DOUBLE_ENTRY_BOOKS} />

      {/* 4. Account Filter Pills */}
      <AccountFilterTabs
        currentFilter={activeFilter}
        onSelect={setActiveFilter}
        totalAccounts={CUSTOMER_ACCOUNTS.length}
      />

      {/* 5. Customer Ledger Accounts List */}
      <CustomerList customers={filteredCustomers} />

      {/* 6. Add Customer Floating Button */}
      <AddCustomerButton onClick={() => alert('Add Customer Modal')} />
    </div>
  );
}
