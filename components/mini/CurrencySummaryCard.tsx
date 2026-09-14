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
      {/* Card Header: Currency Code and Net Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm font-semibold text-content-secondary tracking-wider">
          {summary.currency}
        </span>
        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-credit-500/15 text-credit border border-credit-500/25 uppercase">
          {summary.badge}
        </span>
      </div>

      {/* Main Total Number */}
      <div className="text-xl sm:text-2xl font-black text-credit tracking-tight mb-2">
        {summary.total}
      </div>

      {/* Breakdown Rows: Cust & Desk */}
      <div className="space-y-0.5 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-credit">
          <span className="text-content-muted">Cust</span>
          <span className="font-semibold">{summary.customerBalance}</span>
        </div>
        <div className="flex items-center gap-1.5 text-content-muted">
          <span>Desk</span>
          <span className="font-semibold">{summary.deskBalance}</span>
        </div>
      </div>
    </div>
  );
}
