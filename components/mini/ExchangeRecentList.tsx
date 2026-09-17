'use client';

import { useTranslations } from 'next-intl';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';
import ExchangeRecentItem from '@/components/mini/ExchangeRecentItem';

export default function ExchangeRecentList() {
  const t = useTranslations('ExchangeDesk');
  const { exchanges } = useExchangeDeskStore();

  return (
    <div className="w-full space-y-3.5">
      {/* Header: Title & Count Badge */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
          {t('recentExchanges')}
        </h2>
        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-surface-subtle border border-surface-border text-slate-600 dark:text-slate-400">
          {t('todayCount', { count: exchanges.length })}
        </span>
      </div>

      {/* Exchanges Feed */}
      {exchanges.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-surface border border-surface-border space-y-2">
          <span className="text-3xl">💱</span>
          <p className="text-sm font-semibold text-slate-400">{t('emptyState')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exchanges.map((entry) => (
            <ExchangeRecentItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
