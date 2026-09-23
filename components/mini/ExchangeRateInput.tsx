'use client';

import { useTranslations } from 'next-intl';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';
import { ExchangeCurrencyCode } from '@/types/exchange';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function ExchangeRateInput() {
  const t = useTranslations('ExchangeDesk');
  const {
    customerId,
    exchangeRate,
    setExchangeRate,
    getCurrency,
    setGetCurrency,
    swapCurrencies,
    calcMode,
    setCalcMode,
  } = useExchangeDeskStore();
  const customers = useSettingsStore((state) => state.customers);

  // Find customer's assigned 3 currencies
  const matchedCustomer = customers.find((c) => c.id === customerId);
  const userCurrencies = (matchedCustomer?.balances?.map((b) => b.currency) || [
    'AFN',
    'USD',
    'PKR',
  ]) as ExchangeCurrencyCode[];

  return (
    <div className="w-full space-y-2">
      {/* Label, Multiply/Divide Mode Toggle & Swap Button */}
      <div className="flex items-center justify-between text-[11px] font-black tracking-wider uppercase flex-wrap gap-2">
        <span className="text-slate-500 dark:text-slate-400">{t('exchangeRate')}</span>

        {/* Multiply (✖) and Divide (➗) Toggle */}
        <div className="flex items-center gap-1 bg-surface-subtle border border-surface-border rounded-xl p-0.5">
          <button
            type="button"
            onClick={() => setCalcMode('multiply')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1 ${
              calcMode === 'multiply'
                ? 'bg-[#38bdf8] text-black font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>✖</span>
            <span>Multiply</span>
          </button>
          <button
            type="button"
            onClick={() => setCalcMode('divide')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1 ${
              calcMode === 'divide'
                ? 'bg-[#38bdf8] text-black font-extrabold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>➗</span>
            <span>Divide</span>
          </button>
        </div>

        {/* Swap Currencies Button */}
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
        {/* Operation Indicator (✖ or ➗) & Rate Numeric Input */}
        <div className="flex items-center gap-2 flex-1 px-3">
          <span className="text-sm font-black text-brand bg-brand/10 px-2 py-0.5 rounded-lg border border-brand/20 select-none">
            {calcMode === 'multiply' ? '✖' : '➗'}
          </span>
          <input
            type="number"
            step="any"
            min="0"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
            placeholder={calcMode === 'multiply' ? '278.4' : '1500'}
            className="w-full bg-transparent text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none tracking-tight"
          />
        </div>

        {/* Target Currency Selector Pills (Customer's 3 Currencies) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-input border border-surface-border shrink-0">
          {userCurrencies.map((curr) => {
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
