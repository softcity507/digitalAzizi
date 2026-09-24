'use client';

import { useTranslations } from 'next-intl';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';
import { LedgerTransaction } from '@/data/customerData';
import { useSettingsStore } from '@/store/useSettingsStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import CustomerTransactionItemCard from '@/components/mini_second/CustomerTransactionItemCard';

interface HandleExportProps {
  transactions: LedgerTransaction[];
  selectedCurrency: string;
  customerName: string;
}

export default function CustomerTransactionsFeed() {
  const t = useTranslations('CustomerDetails');
  const { getFilteredTransactions, selectedCurrency, selectedCustomerId } = useCustomerDetailsStore();
  const customers = useSettingsStore((state) => state.customers);

  const transactions = getFilteredTransactions() as LedgerTransaction[];

  // Find current customer name for the export
  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);
  const customerName = currentCustomer ? currentCustomer.name : 'Customer';

  const handleExport = ({ transactions, selectedCurrency, customerName }: HandleExportProps) => {
    try {
      const doc = new jsPDF();

      // Title & Header info (Safe English to prevent font encoding issues)
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text(`Customer Ledger Statement (${selectedCurrency})`, 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Customer: ${customerName}`, 14, 26);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 32);

      // Keep totals separate because different currencies cannot be added together.
      const currencyTotals: Record<string, { credit: number; debit: number }> = {};

      const addTotal = (currency: string, side: 'credit' | 'debit', amount: number) => {
        const normalizedCurrency = currency.toUpperCase();
        currencyTotals[normalizedCurrency] ??= { credit: 0, debit: 0 };
        currencyTotals[normalizedCurrency][side] += amount;
      };

      // Table Headers & Rows mapping
      const headers = [['Date', 'Title', 'Tag', 'Credit (+)', 'Debit (-)', 'Net Balance']];
      const runningBalances: Record<string, number> = {};

      const rows = transactions.map((tx) => {
        const amountVal = Number(tx.amount) || 0;

        const currency = tx.currency || selectedCurrency;
        addTotal(currency, tx.isCredit ? 'credit' : 'debit', amountVal);
        runningBalances[currency] = (runningBalances[currency] || 0) + (tx.isCredit ? amountVal : -amountVal);

        return [
          tx.date || '-',
          tx.title || '-',
          tx.tag || '-',
          tx.isCredit ? `${amountVal.toLocaleString()} ${currency}` : '-',
          !tx.isCredit ? `${amountVal.toLocaleString()} ${currency}` : '-',
          `${runningBalances[currency] >= 0 ? '+' : ''}${runningBalances[currency].toLocaleString()} ${currency}`,
        ];
      });

      // Generate Table
      autoTable(doc, {
        startY: 38,
        head: headers,
        body: rows,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 26 },
          1: { cellWidth: 38 },
          2: { cellWidth: 25 },
          3: { cellWidth: 31, halign: 'right' },
          4: { cellWidth: 31, halign: 'right' },
          5: { cellWidth: 41, halign: 'right' },
        },
        didParseCell: (data) => {
          if (data.section === 'head' && data.column.index === 4) {
            data.cell.styles.fillColor = [220, 38, 38];
          }

          if (data.section !== 'body') return;

          if (data.column.index === 3) {
            data.cell.styles.textColor = [5, 150, 105];
          } else if (data.column.index === 4) {
            data.cell.styles.textColor = [220, 38, 38];
          } else if (data.column.index === 5) {
            const isNegative = String(data.cell.raw).trim().startsWith('-');
            data.cell.styles.textColor = isNegative ? [220, 38, 38] : [5, 150, 105];
          }
        },
      });

      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

      const currencies = Object.keys(currencyTotals).sort();
      const summaryHeight = 14 + Math.max(currencies.length, 1) * 7;

      doc.setFillColor(245, 247, 250);
      doc.roundedRect(14, finalY, 182, summaryHeight, 2, 2, 'F');

      doc.setFontSize(9);
      doc.setTextColor(50, 50, 50);
      doc.text('Totals by Currency', 18, finalY + 6);

      doc.setFontSize(8);
      currencies.forEach((currency, index) => {
        const totals = currencyTotals[currency];
        const netBalance = totals.credit - totals.debit;
        const y = finalY + 12 + index * 7;
        doc.setTextColor(5, 150, 105);
        doc.text(`Credit: ${totals.credit.toLocaleString()} ${currency}`, 18, y);
        doc.setTextColor(220, 38, 38);
        doc.text(`Debit: ${totals.debit.toLocaleString()} ${currency}`, 78, y);
        doc.setTextColor(netBalance >= 0 ? 5 : 220, netBalance >= 0 ? 150 : 38, netBalance >= 0 ? 105 : 38);
        doc.text(`Net: ${netBalance >= 0 ? '+' : ''}${netBalance.toLocaleString()} ${currency}`, 140, y);
      });

      // Save PDF file
      doc.save(`customer_ledger_${customerName.replace(/\s+/g, '_')}_${selectedCurrency}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };
  return (
    <div className="w-full space-y-3">
      {/* Header with Title, Count Badge, and Export Button */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-base sm:text-lg font-bold text-content-primary">
            {t('transactions')}
          </h2>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-surface-subtle border border-surface-border text-content-muted">
            {t('records', { count: transactions.length })}
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleExport({ transactions, selectedCurrency, customerName })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-xs font-semibold text-content-primary transition-colors cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{t('export')}</span>
        </button>
      </div>

      {/* Transaction List Cards */}
      <div className="space-y-2.5">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <CustomerTransactionItemCard key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <div className="p-8 text-center bg-surface border border-surface-border rounded-2xl space-y-2">
            <span className="text-2xl">📑</span>
            <p className="text-xs sm:text-sm font-semibold text-content-primary">{t('noTransactions')}</p>
            <p className="text-xs text-content-muted">{t('noTransactionsDesc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}