'use client';

import { useTranslations } from 'next-intl';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';

export default function ExchangeTypeToggle() {
  const t = useTranslations('ExchangeDesk');
  const { type, setType } = useExchangeDeskStore();

  return (
    <div className="w-full space-y-1.5">
      <label className="block text-[11px] font-black tracking-wider uppercase text-slate-500 dark:text-slate-400">
        {t('transactionType')}
      </label>

      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-surface-subtle border border-surface-border">
        {/* BUY Button */}
        <button
          type="button"
          onClick={() => setType('BUY')}
          className={`h-12 sm:h-14 rounded-xl font-black text-sm sm:text-base tracking-wider transition-all duration-150 flex items-center justify-center cursor-pointer select-none active:scale-[0.98] ${
            type === 'BUY'
              ? 'bg-[#0f172a] dark:bg-[#1e293b] text-[#38bdf8] border border-[#38bdf8]/50 shadow-md ring-2 ring-[#38bdf8]/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-surface-hover/50'
          }`}
        >
          {t('buy')}
        </button>

        {/* SELL Button (Vibrant Pink/Coral Pill like design) */}
        <button
          type="button"
          onClick={() => setType('SELL')}
          className={`h-12 sm:h-14 rounded-xl font-black text-sm sm:text-base tracking-wider transition-all duration-150 flex items-center justify-center cursor-pointer select-none active:scale-[0.98] ${
            type === 'SELL'
              ? 'bg-[#fda4af] hover:bg-[#f87171] text-black shadow-lg shadow-[#fda4af]/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-surface-hover/50'
          }`}
        >
          {t('sell')}
        </button>
      </div>
    </div>
  );
}
