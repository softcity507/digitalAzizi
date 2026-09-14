'use client';

import { CurrencySummary } from '@/types/customer';
import CurrencySummaryCard from '@/components/mini/CurrencySummaryCard';

interface CurrencySummaryGridProps {
  summaries: CurrencySummary[];
  className?: string;
}

export default function CurrencySummaryGrid({
  summaries,
  className = '',
}: CurrencySummaryGridProps) {
  return (
    <section className={`grid grid-cols-3 gap-2.5 sm:gap-4 w-full ${className}`}>
      {summaries.map(summary => (
        <CurrencySummaryCard key={summary.currency} summary={summary} />
      ))}
    </section>
  );
}
