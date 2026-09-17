'use client';

import { useTranslations } from 'next-intl';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';
import { ExchangeCurrencyCode } from '@/types/exchange';

const TARGET_CURRENCIES: ExchangeCurrencyCode[] = ['AFN', 'USD', 'PKR', 'EUR'];

export default function ExchangeRateInput() {
  const t = useTranslations('ExchangeDesk');
  const { exchangeRate, setExchangeRate, getCurrency, setGetCurrency, swapCurrencies } =
    useExchangeDeskStore();

  return (
    <div className="w-full space-y-1.5">
      {/* Label & Invert Button */}
      <div className="flex items-center justify-between text-[11px] font-black tracking-wider uppercase">
        <span className="text-slate-500 dark:text-slate-400">{t('exchangeRate')}</span>
        <button
          type="button"
          onClick={swapCurrencies}
          title={t('swapCurrencies')}
          className="text-[#38bdf8] hover:text-[#7dd3fc] flex items-center gap-1 font-bold text-xs lowercase first-letter:uppercase transition-colors"
        >
          <span>{t('swapCurrencies')}</span>
          <span className="text-sm">⇄</span>
        </button>
      </div>

      {/* Input & Target Currency Pill Group */}
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-surface-subtle border border-surface-border focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/20 transition-all shadow-sm">
        {/* Rate Numeric Input */}
        <div className="flex items-center flex-1 px-3">
          <input
            type="number"
            step="any"
            min="0"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
            placeholder="71.2"
            className="w-full bg-transparent text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none tracking-tight"
          />
        </div>

        {/* Target Currency Selector Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-input border border-surface-border shrink-0">
          {TARGET_CURRENCIES.map((curr) => {
            const isSelected = getCurrency === curr;
            return (
              <button
                key={curr}
                type="button"
                onClick={() => setGetCurrency(curr)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-black tracking-wider transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-[#38bdf8] text-black shadow-md shadow-[#38bdf8]/30 scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-surface-hover'
                }`}
              >
                {curr}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
