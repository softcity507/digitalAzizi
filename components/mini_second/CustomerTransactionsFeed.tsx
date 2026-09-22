'use client';

import { useTranslations } from 'next-intl';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';
import { CUSTOMER_ACCOUNTS, LedgerTransaction } from '@/data/customerData';
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

  const transactions = getFilteredTransactions() as LedgerTransaction[];

  // Find current customer name for the export
  const currentCustomer = CUSTOMER_ACCOUNTS.find((c) => c.id === selectedCustomerId);
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

      // Track calculations dynamically
      let totalCredit = 0;
      let totalDebit = 0;

      // Table Headers & Rows mapping
      const headers = [['Date', 'Customer', 'Title', 'Tag', 'Amount', 'Currency', 'Type', 'Notes']];

      const rows = transactions.map((tx) => {
        const amountVal = Number(tx.amount) || 0;

        if (tx.isCredit) {
          totalCredit += amountVal;
        } else {
          totalDebit += amountVal;
        }

        return [
          tx.date || '-',
          customerName || '-',
          tx.title || '-',
          tx.tag || '-',
          `${tx.isCredit ? '+' : '-'}${amountVal.toLocaleString()}`,
          tx.currency || selectedCurrency,
          tx.isCredit ? 'Credit' : 'Debit',
          tx.notes || '-',
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
      });

      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

      // Net Balance Calculation
      const netBalance = totalCredit - totalDebit;

      // Summary Box Footer matching calculations
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(14, finalY, 182, 16, 2, 2, 'F');

      doc.setFontSize(8);
      doc.setTextColor(50, 50, 50);
      doc.text(`Total Credit (+): ${totalCredit.toLocaleString()} ${selectedCurrency}`, 18, finalY + 6);
      doc.text(`Total Debit (-): ${totalDebit.toLocaleString()} ${selectedCurrency}`, 85, finalY + 6);

      doc.setFontSize(9);
      doc.setTextColor(41, 128, 185);
      doc.text(`Net Balance: ${netBalance >= 0 ? '+' : ''}${netBalance.toLocaleString()} ${selectedCurrency}`, 18, finalY + 12);

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