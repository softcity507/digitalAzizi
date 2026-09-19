'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

interface LandingFooterProps {
  className?: string;
}

export default function LandingFooter({ className = '' }: LandingFooterProps) {
  const t = useTranslations('Landing');
  const locale = useLocale();

  return (
    <footer
      className={`w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-6 px-4 pt-2 pb-8 ${className}`}
    >
      {/* Explore Demo CTA Button */}
      <Link
        href={`/${locale}/cash-book`}
        className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand hover:text-brand-300 transition-colors py-1 px-3 rounded-xl hover:bg-brand/10 select-none"
      >
        <span>{t('exploreDemo')}</span>
        <svg
          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 rtl:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>

      {/* Subtle Divider */}
      <div className="w-full h-px bg-surface-border" />

      {/* Copyright & Compliance Disclaimer */}
      <div className="space-y-1.5 select-none">
        <p className="text-[11px] sm:text-xs text-content-secondary font-medium">
          {t('copyright')}
        </p>
        <p className="text-[10px] sm:text-[11px] text-content-muted">
          {t('compliance')}
        </p>
      </div>
    </footer>
  );
}
