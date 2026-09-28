'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
  subtitle?: string;
  variant?: 'default' | 'shield' | 'sarafi';
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({
  className = '',
  size = 'md',
}: LogoProps) {
  const locale = useLocale();

  return (
    <Link
      href={`/${locale}/customers`}
      className={`group flex items-center select-none transition-transform duration-200 hover:opacity-95 ${className}`}
    >
      <span
        className={`font-black tracking-tight text-content-primary ${
          size === 'lg' ? 'text-xl sm:text-2xl' : size === 'sm' ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
        }`}
      >
        DigitalAzizi
      </span>
    </Link>
  );
}

