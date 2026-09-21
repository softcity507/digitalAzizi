'use client';

import { useTranslations } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';
import CashBookTransactionItem from './CashBookTransactionItem';

export default function CashBookTransactionList() {
  const t = useTranslations('CashBook');
  const { getFilteredTransactions } = useCashBookStore();
  const transactions = getFilteredTransactions();

  if (transactions.length === 0) {
    return (
      <div className="w-full bg-surface/60 rounded-3xl border border-dashed border-surface-border p-8 sm:p-12 text-center space-y-3">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-surface/90 border border-surface-border flex items-center justify-center text-2xl text-slate-400 shadow-sm">
          🔍
        </div>
        <div className="text-sm sm:text-base font-bold text-slate-200">
          {t('noTransactions')}
        </div>
        <p className="text-xs  sm:text-sm text-slate-400 max-w-sm mx-auto">
          {t('noTransactionsDesc')}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2.5  ">
      {transactions.map((tx) => (
        <CashBookTransactionItem key={tx.id} transaction={tx} />
      ))}
    </div>
  );
}
