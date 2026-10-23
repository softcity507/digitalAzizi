'use client';

import { useTranslations } from 'next-intl';

export default function AboutHeader() {
  const t = useTranslations('about');
  return (
    <header className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-end">
      {/* Title Block */}
      <div className="lg:col-span-7 space-y-2">
        <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-content-muted dark:text-content-secondary">
          {t('appName')}
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-content-primary tracking-tight leading-tight">
          {t('title')}
        </h1>
        <p className="text-sm text-content-secondary leading-relaxed max-w-xl">
          {t('subtitle')}
        </p>
      </div>

      {/* Trust Panel: Verification, Protection Score & Encryption */}
      {/* <div className="lg:col-span-5 bg-surface border border-surface-border rounded p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs sm:text-sm font-bold text-content-primary">{scoreLabel}</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-credit-subtle text-credit-text border border-credit/20">
            <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />
            {t('verified')}
          </span>
        </div>

        <div
          role="meter"
          aria-label={scoreLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={score}
          className="h-2 w-full rounded-full bg-surface-input overflow-hidden"
        >
          <div className="h-full rounded-full bg-brand" style={{ width: `${score}%` }} />
        </div>

        <p className="flex items-center gap-2 text-xs text-content-muted dark:text-content-secondary">
          <Lock className="w-3.5 h-3.5 text-brand shrink-0" aria-hidden="true" />
          <span>{t('encryptedDb')}</span>
        </p>
      </div> */}
    </header>
  );
}
