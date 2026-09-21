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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CashBookContainer() {
  const { getFilteredTransactions, editingTransaction } = useCashBookStore();
  const transactions = getFilteredTransactions() as unknown as Record<string, unknown>[];

  const handleExport = () => {
    try {
      const doc = new jsPDF();

      // Title & Header info matching app tone
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Cash Book Transactions Report', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 26);

      // Table Headers matching item details
      const headers = [['Serial / Time', 'Customer Name / Exchange', 'Type', 'Amount', 'Currency', 'Memo']];

      const rows = transactions.map((item) => {
        const tx = item as unknown as Record<string, unknown>;
        const serialNo = (tx.serialNo as string) || '';
        const time = (tx.time as string) || '';
        const serialDisplay = serialNo ? `${serialNo} (${time})` : time || '-';

        const type = (tx.type as string) || '';
        const typeDisplay = type === 'cash_in' ? 'Cash In' : type === 'exchange' ? 'Exchange' : 'Cash Out';

        // Format customer name or exchange routing (From -> To)
        let customerDisplay = (tx.customerName as string) || '-';
        if (type === 'exchange') {
          const fromCust = tx.fromCustomer as string;
          const toCust = tx.toCustomer as string;
          if (fromCust && toCust) {
            customerDisplay = `${fromCust} ➔ ${toCust}`;
          }
        }

        const amountVal = typeof tx.amount === 'number' ? tx.amount : 0;
        const amountDisplay = type === 'cash_in' ? `+${amountVal.toLocaleString()}` : type === 'exchange' ? `⇄ ${amountVal.toLocaleString()}` : `-${amountVal.toLocaleString()}`;

        const currency = (tx.currency as string) || '';
        const memo = (tx.memo as string) || '-';

        return [
          serialDisplay,
          customerDisplay,
          typeDisplay,
          amountDisplay,
          currency,
          memo,
        ];
      });

      autoTable(doc, {
        startY: 32,
        head: headers,
        body: rows,
        theme: 'striped',
        // Emerald header theme matching your app styling accents
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 3 },
      });

      // Save PDF file
      doc.save(`cashbook_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

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

          {/* Transactions Count, Status Header & Compact PDF Export Button */}
          <div className="flex items-center justify-between gap-2 px-1 py-1">
            <TransactionCounterBadge count={transactions.length} />

            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border text-[11px] font-semibold text-content-primary transition-colors cursor-pointer shadow-sm"
            >
              <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>PDF</span>
            </button>
          </div>

          {/* Cash Book Transaction Details List */}
          <CashBookTransactionList />
        </div>
      </div>

      {/* Interactive Modals */}
      <CashInModal />
      <CashOutModal />
      <ExchangeModal />
      <EditTransactionModal key={editingTransaction?.id || 'idle'} />
      <DeleteConfirmModal />
    </div>
  );
}