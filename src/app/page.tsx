'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { LANGUAGES, SupportedLocale } from '@/i18n/languages';

export default function HomePage() {
  const t = useTranslations('HomePage');
  const currentLocale = useLocale() as SupportedLocale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [count, setCount] = useState(0);

  const currentLanguage =
    LANGUAGES.find(lang => lang.code === currentLocale) || LANGUAGES[0];

  const handleLanguageChange = (newLocale: SupportedLocale) => {
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
    <div
      dir={currentLanguage.dir}
      className="flex flex-col items-center justify-center min-h-screen gap-8 p-6 bg-canvas text-content-primary transition-colors duration-200"
    >
      {/* 1. Language Dropdown Bar with <select> and <option> tags */}
      <div className="w-full max-w-xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-surface-border shadow-lg">
        <label
          htmlFor="language-select"
          className="text-sm font-semibold text-content-secondary flex items-center gap-2"
        >
          <span className="text-lg">🌐</span>
          <span>{t('selectLanguage')}</span>
        </label>

        <div className="relative w-full sm:w-auto">
          <select
            id="language-select"
            value={currentLocale}
            disabled={isPending}
            onChange={e => handleLanguageChange(e.target.value as SupportedLocale)}
            className="w-full sm:w-64 appearance-none bg-surface-input text-content-primary border border-surface-border rounded-xl px-4 py-2.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer disabled:opacity-50 transition-all shadow-inner"
          >
            {LANGUAGES.map(lang => (
              <option
                key={lang.code}
                value={lang.code}
                className="bg-surface text-content-primary py-1"
              >
                {lang.flag} {lang.nativeName} ({lang.name})
              </option>
            ))}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-content-muted">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Interactive Language Tag Chips (Clickable quick switch tags) */}
      {/* <div className="w-full max-w-xl bg-surface/70 backdrop-blur p-4 rounded-2xl border border-surface-border space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider font-semibold text-content-muted">
            Language Tags ({LANGUAGES.length} Available)
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-brand/10 text-brand border border-brand/20">
            {isPending ? 'Switching...' : `Active: ${currentLanguage.code.toUpperCase()}`}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => {
            const isActive = lang.code === currentLocale;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={isPending}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand text-black font-bold shadow-glow-brand scale-105 ring-2 ring-brand'
                    : 'bg-surface-input text-content-secondary hover:bg-surface-hover hover:text-content-primary border border-surface-border'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.nativeName}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono uppercase ${
                    isActive ? 'bg-black/20 text-black' : 'bg-surface text-content-muted'
                  }`}
                >
                  {lang.dir}
                </span>
              </button>
            );
          })}
        </div>
      </div> */}

      {/* 3. Main Translation Title & Active Language Meta Info */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-credit-400 to-brand-500">
          {t('title')}
        </h1>
        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-content-muted">
          <span className="font-semibold text-brand">{currentLanguage.nativeName}</span>
          <span>•</span>
          <span>{currentLanguage.region}</span>
          <span>•</span>
          <span className="uppercase font-mono font-semibold text-credit">
            {currentLanguage.dir}
          </span>
        </div>
      </div>

      {/* 4. Interactive Counter Card */}
      <div className="flex flex-col items-center gap-5 w-full max-w-md">
        <div className="flex items-center justify-center gap-6 bg-surface rounded-2xl p-6 shadow-xl border border-surface-border w-full">
          <button
            onClick={() => setCount(prev => prev - 1)}
            aria-label="Decrement"
            className="flex items-center justify-center w-14 h-14 bg-debit-btn hover:bg-debit-hover active:scale-95 text-black font-bold rounded-xl shadow-lg transition-all duration-200"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M20 12H4"
              />
            </svg>
          </button>

          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-credit-400 min-w-[120px] text-center tabular-nums">
            {count}
          </span>

          <button
            onClick={() => setCount(prev => prev + 1)}
            aria-label="Increment"
            className="flex items-center justify-center w-14 h-14 bg-credit-btn hover:bg-credit-hover active:scale-95 text-black font-bold rounded-xl shadow-lg transition-all duration-200"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>

        <p className="text-base sm:text-lg text-content-secondary font-medium text-center bg-surface-subtle px-5 py-2.5 rounded-xl border border-surface-border/50 shadow-inner">
          {t('description', { count })}
        </p>
      </div>
    </div>
  );
}