'use client';

import { useCashBookStore } from '@/store/useCashBookStore';
import CashBookTransactionItem from './CashBookTransactionItem';

export default function CashBookTransactionList() {
  const { getFilteredTransactions } = useCashBookStore();
  const transactions = getFilteredTransactions();

  if (transactions.length === 0) {
    return (
      <div className="w-full bg-surface/60 rounded-2xl border border-dashed border-surface-border p-8 text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-xl bg-surface flex items-center justify-center text-2xl text-slate-400">
          🔍
        </div>
        <div className="text-sm font-bold text-slate-200">
          No transactions found
        </div>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          No entries found for the selected date, currency, or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2.5">
      {transactions.map((tx) => (
        <CashBookTransactionItem key={tx.id} transaction={tx} />
      ))}
    </div>
  );
}
