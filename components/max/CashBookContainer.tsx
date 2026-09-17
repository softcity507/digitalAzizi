'use client';

import CashBookHeader from '@/components/mini/CashBookHeader';
import CashBookDateBar from '@/components/mini/CashBookDateBar';
import CashBookCurrencyFilter from '@/components/mini/CashBookCurrencyFilter';
import CashSummaryCard from '@/components/mini/CashSummaryCard';
import TodayCashInOutSummary from '@/components/mini/TodayCashInOutSummary';
import CashBookSearch from '@/components/mini/CashBookSearch';
import TransactionCounterBadge from '@/components/mini/TransactionCounterBadge';
import CashBookTransactionList from '@/components/mini/CashBookTransactionList';
import CashBookOperations from '@/components/mini/CashBookOperations';
import CashInModal from '@/components/mini/CashInModal';
import CashOutModal from '@/components/mini/CashOutModal';
import ExchangeModal from '@/components/mini/ExchangeModal';
import EditTransactionModal from '@/components/mini/EditTransactionModal';
import DeleteConfirmModal from '@/components/mini/DeleteConfirmModal';
import { useCashBookStore } from '@/store/useCashBookStore';

export default function CashBookContainer() {
  const { getFilteredTransactions } = useCashBookStore();
  const transactions = getFilteredTransactions();

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-5 sm:space-y-6 pb-28 sm:pb-20">
      {/* 1. Header (Company Title, Subtitle, Notifications & Page Heading) */}
      <CashBookHeader />

      {/* 2. Responsive Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        {/* Left Column: Summary, Date, Filters & Operations (Sticky on Laptop/Desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-20">
          {/* Operations Action Buttons */}
          <div className="bg-surface/60 rounded-3xl p-3 border border-surface-border shadow-sm">
            <CashBookOperations />
          </div>

          {/* Date Navigation Bar (< Date >) */}
          <CashBookDateBar />

          {/* Currency Filter Tabs (All, PKR, AFN, USD) */}
          <CashBookCurrencyFilter />

          {/* Cash Summary Card (PKR, AFN, USD) */}
          <CashSummaryCard />

          {/* Today Cash In & Today Cash Out Dual Summary Cards */}
          <TodayCashInOutSummary />
        </div>

        {/* Right Column: Search & Transactions Details Feed */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          {/* Search Bar (Customer, Memo, Serial...) */}
          <CashBookSearch />

          {/* Transactions Count & Status Header */}
          <div className="flex items-center justify-between gap-2 px-1">
            <TransactionCounterBadge count={transactions.length} />
          </div>

          {/* Cash Book Transaction Details List */}
          <CashBookTransactionList />
        </div>
      </div>

      {/* Interactive Modals */}
      <CashInModal />
      <CashOutModal />
      <ExchangeModal />
      <EditTransactionModal />
      <DeleteConfirmModal />
    </div>
  );
}
