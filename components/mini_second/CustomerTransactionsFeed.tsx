'use client';

import { useTranslations } from 'next-intl';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';
import CustomerTransactionItemCard from '@/components/mini_second/CustomerTransactionItemCard';

export default function CustomerTransactionsFeed() {
  const t = useTranslations('CustomerDetails');
  const { getFilteredTransactions, selectedCurrency } = useCustomerDetailsStore();
  const transactions = getFilteredTransactions();

  const handleExport = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Date,Title,Tag,Amount,Currency,Type,Notes']
        .concat(
          transactions.map(
            (tx) =>
              `${tx.date},"${tx.title}","${tx.tag}",${tx.amount},${tx.currency},${
                tx.isCredit ? 'Credit' : 'Debit'
              },"${tx.notes || ''}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer_ledger_${selectedCurrency}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          onClick={handleExport}
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
