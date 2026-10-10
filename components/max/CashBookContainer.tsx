'use client';

import { useEffect } from 'react';

// import CashBookHeader from '@/components/mini/CashBookHeader';
import CashBookDateBar from '@/components/mini/CashBookDateBar';
import CashBookCurrencyFilter from '@/components/mini/CashBookCurrencyFilter';
import CashSummaryCard from '@/components/mini/CashSummaryCard';
import TodayCashInOutSummary from '@/components/mini/TodayCashInOutSummary';
import TransactionCounterBadge from '@/components/mini/TransactionCounterBadge';
import CashBookTransactionList from '@/components/mini/CashBookTransactionList';
import CashBookOperations from '@/components/mini/CashBookOperations';
import CashInModal from '@/components/mini/CashInModal';
import CashOutModal from '@/components/mini/CashOutModal';
import ExchangeModal from '@/components/mini/ExchangeModal';
import EditTransactionModal from '@/components/mini/EditTransactionModal';
import DeleteConfirmModal from '@/components/mini/DeleteConfirmModal';
import AddBussinessModal from '@/components/mini_second/AddBussinessModal';
import MiniLoader from '@/components/mini_second/MiniLoader';
import { useCashBookStore } from '@/store/useCashBookStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { CashBookEntry } from '@/types/cashbook';

export default function CashBookContainer() {
  const { getFilteredTransactions, editingTransaction, fetchTransactions, isLoading, loadError } = useCashBookStore();
  const activeBusiness = useSettingsStore((state) =>
    state.businesses.find((business) => business.isActive) || state.businesses[0]
  );
  const businessId = activeBusiness?.id;
  useEffect(() => {
    if (businessId) {
      void fetchTransactions().catch((error) => console.error('Cashbook load failed:', error));
    }
  }, [businessId, fetchTransactions]);
  const transactions = getFilteredTransactions();

  const handleExport = () => {
    try {
      const doc = new jsPDF({ orientation: 'landscape' });

      // Title & Header info matching app tone
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Cash Book Transactions Report', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 26);

      const currencySet = new Set<string>(activeBusiness?.supportedCurrencies ?? ['AFN', 'USD', 'PKR']);
      transactions.forEach((tx) => {
        currencySet.add(tx.currency);
        if (tx.exchangeDetails) {
          currencySet.add(tx.exchangeDetails.fromCurrency);
          currencySet.add(tx.exchangeDetails.toCurrency);
        }
      });
      const currencies = [...currencySet];
      const headers = [[
        'Customer Name',
        'Description',
        ...currencies.flatMap((currency) => [`${currency} Credit`, `${currency} Debit`]),
        'Net Balance',
      ]];
      const currencyTotals: Record<string, { credit: number; debit: number }> = {};
      const runningBalances: Record<string, number> = {};

      const addTotal = (currency: string, side: 'credit' | 'debit', amount: number) => {
        const normalizedCurrency = currency.toUpperCase() || 'N/A';
        currencyTotals[normalizedCurrency] ??= { credit: 0, debit: 0 };
        currencyTotals[normalizedCurrency][side] += amount;
      };

      const rows = transactions.map((tx: CashBookEntry) => {
        const movements: Record<string, { credit: number; debit: number }> = {};
        currencies.forEach((currency) => {
          movements[currency] = { credit: 0, debit: 0 };
        });

        if (tx.type === 'exchange' && tx.exchangeDetails) {
          const { fromCurrency, fromAmount, toCurrency, toAmount } = tx.exchangeDetails;
          movements[fromCurrency] ??= { credit: 0, debit: 0 };
          movements[toCurrency] ??= { credit: 0, debit: 0 };
          movements[fromCurrency].debit += fromAmount;
          movements[toCurrency].credit += toAmount;
        } else if (tx.type === 'cash_in') {
          movements[tx.currency] ??= { credit: 0, debit: 0 };
          movements[tx.currency].credit += tx.amount;
        } else {
          movements[tx.currency] ??= { credit: 0, debit: 0 };
          movements[tx.currency].debit += tx.amount;
        }

        Object.entries(movements).forEach(([currency, amount]) => {
          if (amount.credit > 0) addTotal(currency, 'credit', amount.credit);
          if (amount.debit > 0) addTotal(currency, 'debit', amount.debit);
          runningBalances[currency] = (runningBalances[currency] ?? 0) + amount.credit - amount.debit;
        });

        const customerName = tx.type === 'exchange' && tx.fromCustomer && tx.toCustomer
          ? `${tx.fromCustomer} -> ${tx.toCustomer}`
          : tx.customerName || '-';
        const description = tx.memo?.trim() || (tx.type === 'exchange' ? 'Exchange' : tx.type === 'cash_in' ? 'Cash In' : 'Cash Out');
        const netBalance = currencies
          .map((currency) => `${currency}: ${runningBalances[currency] >= 0 ? '+' : ''}${(runningBalances[currency] ?? 0).toLocaleString()}`)
          .join(' | ');

        return [
          customerName,
          description,
          ...currencies.flatMap((currency) => {
            const amount = movements[currency] ?? { credit: 0, debit: 0 };
            return [
              amount.credit ? amount.credit.toLocaleString() : '-',
              amount.debit ? amount.debit.toLocaleString() : '-',
            ];
          }),
          netBalance,
        ];
      });

      const currencyColumnStyles = Object.fromEntries(currencies.flatMap((_, index) => [
        [2 + index * 2, { cellWidth: 19, halign: 'right' as const }] as const,
        [3 + index * 2, { cellWidth: 19, halign: 'right' as const }] as const,
      ]));

      autoTable(doc, {
        startY: 32,
        head: headers,
        body: rows,
        foot: [[
          'TOTAL',
          '',
          ...currencies.flatMap((currency) => {
            const totals = currencyTotals[currency] ?? { credit: 0, debit: 0 };
            return [totals.credit.toLocaleString(), totals.debit.toLocaleString()];
          }),
          currencies.map((currency) => `${currency}: ${((currencyTotals[currency]?.credit ?? 0) - (currencyTotals[currency]?.debit ?? 0)) >= 0 ? '+' : ''}${((currencyTotals[currency]?.credit ?? 0) - (currencyTotals[currency]?.debit ?? 0)).toLocaleString()}`).join(' | '),
        ]],
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        footStyles: { fillColor: [240, 243, 246], textColor: [40, 40, 40], fontStyle: 'bold' },
        styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 34 },
          1: { cellWidth: 42 },
          ...currencyColumnStyles,
          [2 + currencies.length * 2]: { cellWidth: 67 },
        },
        didParseCell: (data) => {
          if (data.section === 'head' || data.section === 'foot') {
            if (data.column.index >= 2 && data.column.index < 2 + currencies.length * 2) {
              data.cell.styles.textColor = data.column.index % 2 === 0 ? [5, 150, 105] : [220, 38, 38];
            }
          }

          if (data.section !== 'body') return;
          if (data.column.index >= 2 && data.column.index < 2 + currencies.length * 2) {
            data.cell.styles.textColor = data.column.index % 2 === 0 ? [5, 150, 105] : [220, 38, 38];
          } else if (data.column.index === 2 + currencies.length * 2) {
            const isNegative = String(data.cell.raw).includes('-');
            data.cell.styles.textColor = isNegative ? [220, 38, 38] : [5, 150, 105];
          }
        },
      });

      doc.save(`cashbook_report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-5 sm:space-y-6 pb-28 sm:pb-20">
      
      {/* <CashBookHeader /> */}

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
          {isLoading ? (
            <div className="flex min-h-48 items-center justify-center">
              <MiniLoader size="md" variant="brand" text="Loading cashbook..." />
            </div>
          ) : loadError ? (
            <div role="alert" className="rounded-2xl border border-debit/30 bg-debit-subtle p-4 text-sm text-debit-text">
              <p>Couldn&apos;t load cashbook data: {loadError}</p>
              <button
                type="button"
                onClick={() => void fetchTransactions().catch((error) => console.error('Cashbook load failed:', error))}
                className="mt-2 font-semibold underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <CashBookTransactionList />
          )}
        </div>
      </div>

      {/* Interactive Modals */}
      <CashInModal />
      <CashOutModal />
      <ExchangeModal />
      <EditTransactionModal key={editingTransaction?.id || 'idle'} />
      <DeleteConfirmModal />
      <AddBussinessModal />
    </div>
  );
}
