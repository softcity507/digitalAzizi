'use client';

import { useLocale } from 'next-intl';
import { useTransition, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LANGUAGES, SupportedLocale } from '@/i18n/languages';

const PRIMARY_CODES: SupportedLocale[] = ['en', 'ps', 'fa', 'ar'];

export default function QuickLanguageSelector({ className = '' }: { className?: string }) {
  const currentLocale = useLocale() as SupportedLocale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showAll, setShowAll] = useState(false);
  const [activeLocale, setActiveLocale] = useState(() => currentLocale);

  const displayLanguages = showAll
    ? LANGUAGES
    : LANGUAGES.filter(l => PRIMARY_CODES.includes(l.code));

  useEffect(() => {
    if (activeLocale === currentLocale) return;

    document.cookie = `NEXT_LOCALE=${activeLocale}; path=/; max-age=31536000; SameSite=Lax`;

    const langInfo = LANGUAGES.find(l => l.code === activeLocale);
    if (langInfo) {
      document.documentElement.dir = langInfo.dir;
      document.documentElement.lang = langInfo.code;
    }

    startTransition(() => {
      router.refresh();
    });
  }, [activeLocale, currentLocale, router, startTransition]);

  const handleLanguageChange = (newLocale: SupportedLocale) => {
    if (newLocale === activeLocale) return;

    setActiveLocale(newLocale);
  };

  return (
    <div className={`space-y-2.5 w-full ${className}`}>
      {/* Dynamic Language Grid mapped over LANGUAGES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full">
        {displayLanguages.map(lang => {
          const isActive = activeLocale === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isPending}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-surface border-brand shadow-md shadow-brand/15 ring-1 ring-brand text-brand'
                  : 'bg-surface/80 border-surface-border hover:bg-surface-hover hover:border-surface-border text-content-primary'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{lang.flag}</span>
                <span
                  className={`text-sm sm:text-base font-bold tracking-tight ${
                    isActive ? 'text-brand' : 'text-content-primary'
                  }`}
                >
                  {lang.nativeName}
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-content-secondary mt-0.5">
                {lang.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toggle to view all 12 languages from languages.ts */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={() => setShowAll(prev => !prev)}
          className="text-xs font-semibold text-brand hover:text-brand-300 transition-colors"
        >
          {showAll ? 'Show Fewer Languages' : `View All ${LANGUAGES.length} Languages`}
        </button>
      </div>
    </div>
  );
}
