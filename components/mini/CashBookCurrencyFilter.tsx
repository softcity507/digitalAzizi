'use client';

import { useTranslations } from 'next-intl';
import { useCashBookStore, CurrencyFilterType } from '@/store/useCashBookStore';

export default function CashBookCurrencyFilter() {
  const t = useTranslations('CashBook');
  const { filterCurrency, setFilterCurrency } = useCashBookStore();

  const currencies: { label: string; value: CurrencyFilterType }[] = [
    { label: t('allCurrencies'), value: 'ALL' },
    { label: 'PKR', value: 'PKR' },
    { label: 'AFN', value: 'AFN' },
    { label: 'USD', value: 'USD' },
  ];

  return (
    <div className="flex items-center justify-between gap-2 w-full py-1">
      {/* Horizontal Pills */}
      <div className="inline-flex items-center gap-1.5 p-1 bg-surface/80 rounded-2xl border border-surface-border/60 w-full sm:w-auto overflow-x-auto">
        {currencies.map((item) => {
          const isActive = filterCurrency === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilterCurrency(item.value)}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 text-center ${
                isActive
                  ? 'bg-[#38bdf8] text-black shadow-glow-brand font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-surface-hover'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Right accent line / indicator */}
      <div className="w-8 h-1 rounded-full bg-slate-700/60 hidden sm:block shrink-0" />
    </div>
  );
}
