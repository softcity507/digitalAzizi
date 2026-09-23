'use client';

import { useTranslations } from 'next-intl';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';
import { ExchangeCurrencyCode } from '@/types/exchange';
import { useSettingsStore } from '@/store/useSettingsStore';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  AFN: '؋',
  PKR: '₨',
  INR: '₹',
  IRR: '﷼',
  EUR: '€',
  GBP: '£',
  AED: 'د.إ',
  CNY: '¥',
  TRY: '₺',
};

export default function ExchangeAmountInput() {
  const t = useTranslations('ExchangeDesk');
  const { customerId, giveAmount, setGiveAmount, giveCurrency, setGiveCurrency, type } =
    useExchangeDeskStore();
  const customers = useSettingsStore((state) => state.customers);

  // Find customer's assigned 3 currencies
  const matchedCustomer = customers.find((c) => c.id === customerId);
  const userCurrencies = (matchedCustomer?.balances?.map((b) => b.currency) || [
    'USD',
    'AFN',
    'PKR',
  ]) as ExchangeCurrencyCode[];

  const symbol = CURRENCY_SYMBOLS[giveCurrency] || '$';

  return (
    <div className="w-full space-y-1.5">
      {/* Label & Subtitle */}
      <div className="flex items-center justify-between text-[11px] font-black tracking-wider uppercase">
        <span className="text-slate-500 dark:text-slate-400">{t('youGive')}</span>
        <span className="text-slate-400 dark:text-slate-500 font-medium lowercase first-letter:uppercase">
          {type === 'SELL' ? t('clientPays') : t('youPay')}
        </span>
      </div>

      {/* Input & Currency Pill Group */}
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-surface-subtle border border-surface-border focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/20 transition-all shadow-sm">
        {/* Currency Symbol & Large Input */}
        <div className="flex items-center gap-2 flex-1 px-2">
          <span className="text-lg sm:text-xl font-black text-slate-400 dark:text-slate-500 select-none">
            {symbol}
          </span>
          <input
            type="number"
            step="any"
            min="0"
            value={giveAmount}
            onChange={(e) => setGiveAmount(e.target.value)}
            placeholder="5,000"
            className="w-full bg-transparent text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none tracking-tight"
          />
        </div>

        {/* User's 3 Specific Currency Selector Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-input border border-surface-border shrink-0">
          {userCurrencies.map((curr) => {
            const isSelected = giveCurrency === curr;
            return (
              <button
                key={curr}
                type="button"
                onClick={() => setGiveCurrency(curr)}
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
