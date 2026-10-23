'use client';

import { useTranslations } from 'next-intl';

interface LandingFooterProps {
  className?: string;
}

export default function LandingFooter({ className = '' }: LandingFooterProps) {
  const t = useTranslations('Landing');
  return (
    <footer
      className={`w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-6 px-4 pt-2 pb-8 ${className}`}
    >
      

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
