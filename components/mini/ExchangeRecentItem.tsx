'use client';

import { useTranslations } from 'next-intl';
import { ExchangeDeskEntry } from '@/types/exchange';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';

interface ExchangeRecentItemProps {
  entry: ExchangeDeskEntry;
}

export default function ExchangeRecentItem({ entry }: ExchangeRecentItemProps) {
  const t = useTranslations('ExchangeDesk');
  const { openEditModal, openDeleteModal } = useExchangeDeskStore();

  const { ledgerImpact } = entry;

  return (
    <div className="w-full p-4 rounded-3xl bg-surface border border-surface-border hover:border-brand/40 transition-all duration-200 shadow-sm space-y-3">
      {/* Top Header: Title, Timestamp, Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 truncate">
          <span className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white truncate">
            {entry.giveAmount.toLocaleString()} {entry.giveCurrency} ➔ {entry.getCurrency} @{' '}
            {entry.exchangeRate}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {entry.timeAgo || entry.time}
          </span>

          {/* Edit Action Button */}
          <button
            type="button"
            onClick={() => openEditModal(entry)}
            aria-label={t('editExchange')}
            title={t('editExchange')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>

          {/* Delete Action Button */}
          <button
            type="button"
            onClick={() => openDeleteModal(entry.id)}
            aria-label={t('deleteExchange')}
            title={t('deleteExchange')}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Double-Entry Ledger Impact Badges (Customer vs Exchange) */}
      <div className="grid grid-cols-2 gap-3 pt-1 text-xs sm:text-sm font-mono font-black border-t border-surface-border/60">
        {/* Customer Ledger */}
        <div className="space-y-1">
          <span className="block text-[10px] font-black tracking-wider uppercase text-slate-500 dark:text-slate-400">
            {t('customer')}
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="text-emerald-600 dark:text-emerald-400">
              {ledgerImpact.customerReceives.formatted} {ledgerImpact.customerReceives.currency}
            </span>
            <span className="text-rose-600 dark:text-rose-400">
              {ledgerImpact.customerPays.formatted} {ledgerImpact.customerPays.currency}
            </span>
          </div>
        </div>

        {/* Exchange Ledger */}
        <div className="space-y-1">
          <span className="block text-[10px] font-black tracking-wider uppercase text-slate-500 dark:text-slate-400">
            {t('exchangeLedger')}
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="text-rose-600 dark:text-rose-400">
              {ledgerImpact.exchangePays.formatted} {ledgerImpact.exchangePays.currency}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {ledgerImpact.exchangeReceives.formatted} {ledgerImpact.exchangeReceives.currency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
