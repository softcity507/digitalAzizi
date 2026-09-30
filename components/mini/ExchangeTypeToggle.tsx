'use client';

import { useTranslations } from 'next-intl';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function ExchangeTypeToggle() {
  const t = useTranslations('ExchangeDesk');
  const { customerId, type, setType, giveCurrency, getCurrency } = useExchangeDeskStore();
  const customers = useSettingsStore((state) => state.customers);

  const activeCustomer =
    customers.find((c) => c.id === customerId) || customers[1] || customers[0];

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-black tracking-wider uppercase text-slate-500 dark:text-slate-400">
          {t('transactionType')}
        </label>
        {activeCustomer && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-[60%]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
            <span className="truncate text-content-primary">{activeCustomer.name}</span>
            {activeCustomer.subtitle && (
              <span className="hidden sm:inline text-slate-400 truncate">• {activeCustomer.subtitle}</span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-surface-subtle border border-surface-border">
        {/* BUY Button */}
        <button
          type="button"
          onClick={() => setType('BUY')}
          className={`h-14 rounded-xl font-black transition-all duration-150 flex flex-col items-center justify-center cursor-pointer select-none active:scale-[0.98] ${
            type === 'BUY'
              ? 'bg-[#0f172a] dark:bg-[#1e293b] text-[#38bdf8] border border-[#38bdf8]/50 shadow-md ring-2 ring-[#38bdf8]/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-surface-hover/50'
          }`}
        >
          <span className="text-sm sm:text-base tracking-wider">{t('buy')} {getCurrency}</span>
          <span className="text-[10px] font-semibold opacity-75">
            Client buys {getCurrency}
          </span>
        </button>

        {/* SELL Button */}
        <button
          type="button"
          onClick={() => setType('SELL')}
          className={`h-14 rounded-xl font-black transition-all duration-150 flex flex-col items-center justify-center cursor-pointer select-none active:scale-[0.98] ${
            type === 'SELL'
              ? 'bg-[#fda4af] hover:bg-[#f87171] text-black shadow-lg shadow-[#fda4af]/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-surface-hover/50'
          }`}
        >
          <span className="text-sm sm:text-base tracking-wider">{t('sell')} {giveCurrency}</span>
          <span className="text-[10px] font-semibold opacity-75">
            Client sells {giveCurrency}
          </span>
        </button>
      </div>
    </div>
  );
}
