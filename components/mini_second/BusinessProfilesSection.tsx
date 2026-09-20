'use client';

import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function BusinessProfilesSection() {
  const t = useTranslations('Settings');
  const { businesses, setActiveBusiness } = useSettingsStore();

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-content-primary">
          {t('businessProfiles')}
        </h3>
        <span className="text-[11px] font-mono font-medium text-content-muted">
          {t('activeBooksCount', { count: businesses.length })}
        </span>
      </div>

      <div className="space-y-3">
        {businesses.map((b) => (
          <div
            key={b.id}
            className="w-full bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm sm:text-base font-bold text-content-primary">{b.name}</h4>
                  {b.isActive ? (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      {t('active')}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface-subtle text-content-muted border border-surface-border">
                      {t('inactive')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-content-muted mt-0.5">{b.subtitle}</p>
              </div>

              {!b.isActive && (
                <button
                  type="button"
                  onClick={() => setActiveBusiness(b.id)}
                  className="px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-xs font-semibold text-content-primary transition-colors cursor-pointer"
                >
                  {t('switch')}
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-bold tracking-wider uppercase text-content-muted">
                {t('currenciesSupported')}
              </span>
              <div className="flex items-center gap-1.5">
                {b.supportedCurrencies.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded-md bg-surface-subtle border border-surface-border text-[10px] font-mono font-bold text-content-secondary"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
