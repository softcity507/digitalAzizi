'use client';

import { useTranslations } from 'next-intl';
import { useCashBookStore, CurrencyFilterType } from '@/store/useCashBookStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function CashBookCurrencyFilter() {
  const t = useTranslations('CashBook');
  const { filterCurrency, setFilterCurrency } = useCashBookStore();
  const activeBusiness = useSettingsStore((state) => state.businesses.find((business) => business.isActive));

  const currencies: { label: string; value: CurrencyFilterType }[] = [
    { label: t('allCurrencies'), value: 'ALL' },
    ...(activeBusiness?.supportedCurrencies ?? ['PKR', 'AFN', 'USD']).map((currency) => ({ label: currency, value: currency as CurrencyFilterType })),
  ];

  return (
    <div className="flex items-center justify-between gap-2 w-full py-1">
      {/* Horizontal Pills */}
      <div className="inline-flex items-center gap-1.5 p-1 bg-surface/80 rounded border border-surface-border/60 w-full sm:w-auto overflow-x-auto">
        {currencies.map((item) => {
          const isActive = filterCurrency === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilterCurrency(item.value)}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded text-xs md:text-sm font-bold transition-all duration-200 text-center ${
                isActive
                  ? 'bg-surface-active text-content-primary shadow-sm font-extrabold'
                  : 'text-content-muted hover:text-content-primary hover:bg-surface-hover'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      </div>
  );
}
