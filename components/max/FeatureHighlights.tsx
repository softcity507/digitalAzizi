'use client';

import FeatureCard from '@/components/mini/FeatureCard';
import { useTranslations } from 'next-intl';

interface FeatureHighlightsProps {
  className?: string;
}

export default function FeatureHighlights({ className = '' }: FeatureHighlightsProps) {
  const t = useTranslations('Landing');

  return (
    <section
      className={`grid grid-cols-3 gap-2.5 sm:gap-3.5 w-full max-w-xl mx-auto px-1 ${className}`}
    >
      {/* 1. Multi-Currency Live Desk */}
      <FeatureCard
        badge={
          <div className="px-2 py-0.5 rounded-lg bg-brand-500/20 text-brand font-black text-xs sm:text-sm border border-brand/30">
            3C
          </div>
        }
        title={t('currenciesTitle')}
        subtitle={t('currenciesSubtitle')}
      />

      {/* 2. Balanced Ledger (Debit & Credit) */}
      <FeatureCard
        badge={
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
        }
        title={t('balancedLedgerTitle')}
        subtitle={t('balancedLedgerSubtitle')}
      />

      {/* 3. Instant PDF Roznamcha */}
      <FeatureCard
        badge={
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        }
        title={t('instantPdfTitle')}
        subtitle={t('instantPdfSubtitle')}
      />
    </section>
  );
}
