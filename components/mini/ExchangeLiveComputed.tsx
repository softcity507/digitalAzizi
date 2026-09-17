'use client';

import { useTranslations } from 'next-intl';
import { useExchangeDeskStore, computeDoubleEntryLedger } from '@/store/useExchangeDeskStore';

export default function ExchangeLiveComputed() {
  const t = useTranslations('ExchangeDesk');
  const { type, giveAmount, giveCurrency, exchangeRate, getCurrency } = useExchangeDeskStore();

  const gAmt = parseFloat(giveAmount) || 0;
  const rate = parseFloat(exchangeRate) || 0;
  const computedGetAmount = Math.round(gAmt * rate * 100) / 100;

  const ledger = computeDoubleEntryLedger(type, gAmt, giveCurrency, computedGetAmount, getCurrency);

  return (
    <div className="w-full rounded-3xl bg-surface-subtle/90 dark:bg-canvas/90 border border-surface-border p-4 sm:p-5 space-y-4 shadow-xl">
      {/* Header: Title & Live Computed Badge */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-slate-500 dark:text-slate-400">
          {t('doubleEntryLedgerImpact')}
        </span>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-[11px] font-black tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t('liveComputed')}</span>
        </span>
      </div>

      {/* Main Equation Display */}
      <div className="text-center py-2 px-3 rounded-2xl bg-surface/70 border border-surface-border">
        <div className="text-lg sm:text-2xl font-mono font-black tracking-tight text-slate-900 dark:text-white">
          <span>{gAmt.toLocaleString()} {giveCurrency}</span>
          <span className="text-slate-400 dark:text-slate-500 mx-2">×</span>
          <span>{rate}</span>
          <span className="text-slate-400 dark:text-slate-500 mx-2">=</span>
          <span className="text-[#38bdf8] font-black">{computedGetAmount.toLocaleString()} {getCurrency}</span>
        </div>
      </div>

      {/* 2-Column Ledger Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Customer Ledger */}
        <div className="p-3.5 rounded-2xl bg-surface border border-surface-border space-y-2">
          <span className="block text-[10px] font-black tracking-wider uppercase text-slate-500 dark:text-slate-400">
            {t('customerLedger')}
          </span>
          <div className="space-y-1 text-xs sm:text-sm font-mono font-bold">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-sans text-xs">{t('receives')}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                {ledger.customerReceives.formatted} {ledger.customerReceives.currency}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-sans text-xs">{t('pays')}</span>
              <span className="text-rose-600 dark:text-rose-400 font-extrabold">
                {ledger.customerPays.formatted} {ledger.customerPays.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Exchange Ledger */}
        <div className="p-3.5 rounded-2xl bg-surface border border-surface-border space-y-2">
          <span className="block text-[10px] font-black tracking-wider uppercase text-slate-500 dark:text-slate-400">
            {t('exchangeLedger')}
          </span>
          <div className="space-y-1 text-xs sm:text-sm font-mono font-bold">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-sans text-xs">{t('pays')}</span>
              <span className="text-rose-600 dark:text-rose-400 font-extrabold">
                {ledger.exchangePays.formatted} {ledger.exchangePays.currency}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-sans text-xs">{t('receives')}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                {ledger.exchangeReceives.formatted} {ledger.exchangeReceives.currency}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
