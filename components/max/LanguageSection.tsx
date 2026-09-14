'use client';

import QuickLanguageSelector from '@/components/mini/QuickLanguageSelector';
import { useTranslations, useLocale } from 'next-intl';
import { LANGUAGES, SupportedLocale } from '@/i18n/languages';

interface LanguageSectionProps {
  className?: string;
}

export default function LanguageSection({ className = '' }: LanguageSectionProps) {
  const t = useTranslations('Landing');
  const currentLocale = useLocale() as SupportedLocale;

  const currentLang =
    LANGUAGES.find(l => l.code === currentLocale) || LANGUAGES[0];

  return (
    <section className={`w-full max-w-xl mx-auto space-y-3 px-1 ${className}`}>
      {/* Header Row */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs sm:text-sm font-semibold text-content-primary">
          {t('selectAppLanguage')}
        </h3>
        <span className="text-xs font-semibold text-brand">
          {currentLang.nativeName}
        </span>
      </div>

      {/* 4 Quick Language Cards */}
      <QuickLanguageSelector />
    </section>
  );
}
