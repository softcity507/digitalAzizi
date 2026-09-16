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
    <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-3 sm:py-5 space-y-4 pb-28 sm:pb-24">
      {/* 1. Header (Company Title, Subtitle, Notifications & Page Heading) */}
      <CashBookHeader />

      {/* 2. Date Navigation Bar (< Date >) */}
      <CashBookDateBar />

      {/* 3. Customer / Desk Currency Filter Tabs (All, PKR, AFN, USD) */}
      <CashBookCurrencyFilter />

      {/* 4. Cash Summary Card (PKR, AFN, USD) */}
      <CashSummaryCard />

      {/* 5. Today Cash In & Today Cash Out Dual Summary Cards */}
      <TodayCashInOutSummary />

      {/* 6. Search Bar (Customer, Memo, Serial...) */}
      <CashBookSearch />

      {/* 7. Transactions Count Badge */}
      <TransactionCounterBadge count={transactions.length} />

      {/* 8. Cash Book Transaction Details List */}
      <CashBookTransactionList />

      {/* 9. Operations Action Buttons (Cash Out (-), Exchange, Cash In (+)) */}
      <CashBookOperations />

      {/* Interactive Modals */}
      <CashInModal />
      <CashOutModal />
      <ExchangeModal />
      <EditTransactionModal />
      <DeleteConfirmModal />
    </div>
  );
}
