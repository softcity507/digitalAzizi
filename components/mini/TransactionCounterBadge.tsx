'use client';

import { useTranslations } from 'next-intl';

interface TransactionCounterBadgeProps {
  count: number;
}

export default function TransactionCounterBadge({ count }: TransactionCounterBadgeProps) {
  const t = useTranslations('CashBook');

  return (
    <div className="flex items-center justify-between w-full">
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface/80 border border-surface-border/80 text-xs font-semibold text-content-primary shadow-sm">
        <span className="font-mono font-bold text-content-primary bg-surface-subtle px-1.5 py-0.5 rounded-md">{count}</span>
        <span>{count === 1 ? t('transaction') : t('transactions')}</span>
      </div>
    </div>
  );
}
