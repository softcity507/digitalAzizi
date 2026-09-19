'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
  subtitle?: string;
  variant?: 'default' | 'shield' | 'sarafi';
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({
  className = '',
  showSubtitle = true,
  subtitle,
  variant = 'sarafi',
  size = 'md',
}: LogoProps) {
  const t = useTranslations('Header');
  const locale = useLocale();
  const displaySubtitle = subtitle || t('subtitle');

  return (
    <Link
      href={`/${locale}/customers`}
      className={`group flex items-center gap-2.5 select-none transition-transform duration-200 hover:opacity-95 ${className}`}
    >
      {/* Icon Badge */}
      {variant === 'sarafi' ? (
        <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 text-brand flex-shrink-0">
          <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4" />
          </svg>
        </div>
      ) : variant === 'shield' ? (
        <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface-subtle border border-brand/40 text-brand shadow-sm flex-shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      ) : null}

      {/* Brand Title and Subtitle */}
      <div className="flex flex-col items-start leading-none">
        <span
          className={`font-black tracking-tight text-content-primary ${
            size === 'lg' ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
          }`}
        >
          {variant === 'sarafi' ? 'Sarafi Ledger' : 'DigitalAzizi'}
        </span>

        {showSubtitle && (
          <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-content-muted uppercase mt-0.5">
            {displaySubtitle}
          </span>
        )}
      </div>
    </Link>
  );
}
