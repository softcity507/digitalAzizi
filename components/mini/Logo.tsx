'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export default function Logo({ className = '', showSubtitle = true }: LogoProps) {
  const t = useTranslations('Header');

  return (
    <Link
      href="/"
      className={`group flex flex-col items-start select-none transition-transform duration-200 hover:opacity-95 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl md:text-2xl font-black tracking-tight text-content-primary">
          <span className="text-brand">digital</span>
          <span className="text-content-primary group-hover:text-credit transition-colors">
            azizi
          </span>
        </span>
      </div>

      {showSubtitle && (
        <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-content-muted uppercase">
          {t('subtitle')}
        </span>
      )}
    </Link>
  );
}
