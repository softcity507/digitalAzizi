'use client';

import { useCashBookStore, CurrencyFilterType } from '@/store/useCashBookStore';

const CURRENCIES: { label: string; value: CurrencyFilterType }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'PKR', value: 'PKR' },
  { label: 'AFN', value: 'AFN' },
  { label: 'USD', value: 'USD' },
];

export default function CashBookCurrencyFilter() {
  const { filterCurrency, setFilterCurrency } = useCashBookStore();

  return (
    <div className="flex items-center justify-between gap-2 w-full py-1">
      {/* Horizontal Pills */}
      <div className="inline-flex items-center gap-1.5 p-1 bg-surface/80 rounded-2xl border border-surface-border/60">
        {CURRENCIES.map((item) => {
          const isActive = filterCurrency === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilterCurrency(item.value)}
              className={`px-4 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-200 ${
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
      <div className="w-8 h-1 rounded-full bg-slate-700/60" />
    </div>
  );
}
