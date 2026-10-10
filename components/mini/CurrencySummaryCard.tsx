'use client';

import { CurrencySummary } from '@/types/customer';

interface CurrencySummaryCardProps {
  summary: CurrencySummary;
  className?: string;
}

export default function CurrencySummaryCard({
  summary,
  className = '',
}: CurrencySummaryCardProps) {
  return (
    <div
      className={`flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-surface border border-surface-border shadow-sm hover:border-surface-border/80 transition-all ${className}`}
    >
      {/* Currency and net position */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm font-semibold text-content-secondary tracking-wider">
          {summary.currency}
        </span>
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-credit-500/15 text-credit border border-credit-500/25 uppercase">
          {summary.badge}
        </span>
      </div>

      {/* Credit, debit, and net totals */}
      <div className="space-y-1.5 text-[11px] sm:text-xs font-mono">
        <div className="flex items-center justify-between gap-1.5 text-credit">
          <span className="text-content-muted">Credit</span>
          <span className="font-semibold">{summary.credit}</span>
        </div>
        <div className="flex items-center justify-between gap-1.5 text-debit">
          <span className="text-content-muted">Debit</span>
          <span className="font-semibold">{summary.debit}</span>
        </div>
        <div className="flex items-center justify-between gap-1.5 border-t border-surface-border pt-1 text-content-primary">
          <span className="text-content-muted">Net</span>
          <span className="font-bold">{summary.net}</span>
        </div>
      </div>
    </div>
  );
}
