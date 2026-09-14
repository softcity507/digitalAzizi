'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
  subtitle?: string;
  variant?: 'default' | 'shield' | 'landing';
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({
  className = '',
  showSubtitle = true,
  subtitle,
  variant = 'shield',
  size = 'md',
}: LogoProps) {
  const t = useTranslations('Header');
  const displaySubtitle = subtitle || t('subtitle');

  return (
    <Link
      href="/"
      className={`group flex items-center gap-3 select-none transition-transform duration-200 hover:opacity-95 ${className}`}
    >
      {/* Shield Icon Badge */}
      {variant !== 'default' && (
        <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-surface-subtle border border-brand/40 text-brand shadow-sm shadow-brand/10 group-hover:border-brand transition-colors flex-shrink-0">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
      )}

      {/* Brand Name and Subtitle */}
      <div className="flex flex-col items-start leading-tight">
        <span
          className={`font-black tracking-tight text-content-primary ${
            size === 'lg'
              ? 'text-2xl sm:text-3xl'
              : size === 'sm'
              ? 'text-lg'
              : 'text-xl sm:text-2xl'
          }`}
        >
          <span>Digital</span>
          <span className="text-content-primary group-hover:text-brand transition-colors">
            Azizi
          </span>
        </span>

        {showSubtitle && (
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-brand uppercase">
            {displaySubtitle}
          </span>
        )}
      </div>
    </Link>
  );
}
