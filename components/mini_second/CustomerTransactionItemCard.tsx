'use client';

import { CustomerTransaction } from '@/types/customer';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';

interface ItemProps {
  transaction: CustomerTransaction;
}

export default function CustomerTransactionItemCard({ transaction }: ItemProps) {
  const { openModal } = useCustomerDetailsStore();

  const isCredit = transaction.isCredit;
  const formattedAmount = `${isCredit ? '+' : '-'}${transaction.amount.toLocaleString()} ${transaction.currency}`;

  const getCategoryStyles = () => {
    switch (transaction.category) {
      case 'cash_in':
        return {
          iconBox: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
          tagBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
          amountColor: 'text-emerald-400',
        };
      case 'exchange':
        return {
          iconBox: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
          tagBadge: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
          amountColor: isCredit ? 'text-emerald-400' : 'text-rose-400',
        };
      case 'bank':
        return {
          iconBox: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
          tagBadge: 'bg-surface-subtle text-slate-400 border-surface-border',
          amountColor: 'text-rose-400',
        };
      default:
        return {
          iconBox: 'bg-surface-subtle text-slate-400 border-surface-border',
          tagBadge: 'bg-surface-subtle text-slate-400 border-surface-border',
          amountColor: isCredit ? 'text-emerald-400' : 'text-rose-400',
        };
    }
  };

  const styles = getCategoryStyles();

  return (
    <div className="w-full bg-surface border border-surface-border rounded-2xl p-3.5 sm:p-4 transition-all duration-200 hover:border-surface-border/80 flex items-center justify-between gap-3 shadow-sm">
      {/* Left Icon and Title Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${styles.iconBox}`}>
          {transaction.category === 'cash_in' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {transaction.category === 'exchange' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {transaction.category === 'bank' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7m0 0H7m10 0v10" />
            </svg>
          )}
          {transaction.category === 'initial' && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xs sm:text-sm font-bold text-content-primary truncate">
              {transaction.title}
            </h2>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${styles.tagBadge}`}>
              {transaction.tag}
            </span>
          </div>
          {transaction.notes && (
            <p className="text-[11px] text-content-muted truncate">{transaction.notes}</p>
          )}
        </div>
      </div>

      {/* Right Amount and Action Buttons */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={`text-xs sm:text-sm font-bold font-mono ${styles.amountColor}`}>
          {formattedAmount}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => openModal('edit', transaction)}
            aria-label="Edit transaction"
            className="p-1.5 rounded-lg bg-surface-subtle hover:bg-surface-hover border border-surface-border text-content-muted hover:text-content-primary transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => openModal('delete', null, transaction.id)}
            aria-label="Delete transaction"
            className="p-1.5 rounded-lg bg-surface-subtle hover:bg-rose-500/20 border border-surface-border text-content-muted hover:text-rose-400 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
