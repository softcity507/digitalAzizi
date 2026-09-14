'use client';

import { useLocale } from 'next-intl';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LANGUAGES, SupportedLocale } from '@/i18n/languages';

const PRIMARY_LANGUAGES: { code: SupportedLocale; title: string; subtitle: string }[] = [
  { code: 'en', title: 'EN', subtitle: 'English' },
  { code: 'ps', title: 'پښتو', subtitle: 'Pashto' },
  { code: 'fa', title: 'دری', subtitle: 'Farsi' },
  { code: 'ar', title: 'العربية', subtitle: 'Arabic' },
];

export default function QuickLanguageSelector({ className = '' }: { className?: string }) {
  const currentLocale = useLocale() as SupportedLocale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: SupportedLocale) => {
    if (newLocale === currentLocale) return;

    // Set cookie for next-intl server request resolution
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

    // Update HTML direction and language attributes
    const langInfo = LANGUAGES.find(l => l.code === newLocale);
    if (langInfo) {
      document.documentElement.dir = langInfo.dir;
      document.documentElement.lang = langInfo.code;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full ${className}`}>
      {PRIMARY_LANGUAGES.map(lang => {
        const isActive = currentLocale === lang.code;
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
            <span
              className={`text-sm sm:text-base font-bold tracking-tight ${
                isActive ? 'text-brand' : 'text-content-primary'
              }`}
            >
              {lang.title}
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium text-content-secondary mt-0.5">
              {lang.subtitle}
            </span>
          </button>
        );
      })}
    </div>
  );
}
