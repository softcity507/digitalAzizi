'use client';

import SecurityPill from '@/components/mini/SecurityPill';
import { useTranslations } from 'next-intl';

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className = '' }: HeroSectionProps) {
  const t = useTranslations('Landing');

  return (
    <section
      className={`flex flex-col items-center text-center space-y-4 max-w-xl mx-auto px-4 ${className}`}
    >
      {/* Central Glowing Lock Icon */}
      <div className="relative flex items-center justify-center mb-1">
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-brand/20 blur-xl scale-125 pointer-events-none" />

        {/* Outer Ring & Icon Box */}
        <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-b from-[#0e304f] to-[#081c30] border-2 border-brand/50 shadow-2xl shadow-brand/30">
          <svg
            className="w-9 h-9 sm:w-11 sm:h-11 text-brand"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-content-primary tracking-tight leading-tight">
        {t('heroTitle')}
      </h1>

      {/* Subtitle / Description */}
      <p className="text-xs sm:text-sm text-content-secondary max-w-md leading-relaxed">
        {t('heroDescription')}
      </p>

      {/* Security Badge */}
      <div className="pt-1">
        <SecurityPill label={t('encryptedStorage')} />
      </div>
    </section>
  );
}
