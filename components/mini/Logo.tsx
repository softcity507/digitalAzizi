'use client';

import Link from 'next/link';
import Image from 'next/image';
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
      <Image
        src="/img/headerlogo.png"
        alt="DigitalAzizi Logo"
        width={100}
        height={80}
        className={`object-contain ${size === 'lg' ? 'w-16 h-16' : size === 'sm' ? 'w-8 h-8' : 'w-25   h-20'}`}
      />
    </Link>
  );
}

