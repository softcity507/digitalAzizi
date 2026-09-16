'use client';

interface TransactionCounterBadgeProps {
  count: number;
}

export default function TransactionCounterBadge({ count }: TransactionCounterBadgeProps) {
  return (
    <div className="flex items-center justify-start">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface/80 border border-surface-border/80 text-xs font-semibold text-[#38bdf8] shadow-sm">
        <span className="font-mono font-bold text-white">{count}</span>
        <span>{count === 1 ? 'Transaction' : 'Transactions'}</span>
      </div>
    </div>
  );
}
