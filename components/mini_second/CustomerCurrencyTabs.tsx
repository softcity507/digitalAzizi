'use client';

import { useTranslations } from 'next-intl';
import { CurrencyCode } from '@/types/customer';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';

interface CurrencyChipConfig {
  code: CurrencyCode;
  label: string;
  badgeAmount: string;
  dotColor: string;
}

const CURRENCY_CHIPS: CurrencyChipConfig[] = [
  { code: 'AFN', label: 'AFN (؋)', badgeAmount: '+8.45M', dotColor: 'bg-emerald-400' },
  { code: 'USD', label: 'USD ($)', badgeAmount: '+$5,000', dotColor: 'bg-slate-400' },
  { code: 'PKR', label: 'PKR (Rs)', badgeAmount: '-785K', dotColor: 'bg-rose-400' },
];

export default function CustomerCurrencyTabs() {
  const t = useTranslations('CustomerDetails');
  const { selectedCurrency, setSelectedCurrency } = useCustomerDetailsStore();

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold tracking-wider uppercase text-content-muted">
          {t('currency')}
        </span>
        <span className="text-[11px] font-medium tracking-tight text-content-muted">
          {t('tapToSwitch')}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {CURRENCY_CHIPS.map((item) => {
          const isActive = selectedCurrency === item.code;
          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setSelectedCurrency(item.code)}
              className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-surface border-brand shadow-sm ring-1 ring-brand/40'
                  : 'bg-surface/60 border-surface-border hover:bg-surface hover:border-surface-border/80'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-content-primary">{item.label}</span>
                <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
              </div>
              <span
                className={`text-xs sm:text-sm font-bold font-mono mt-1.5 ${
                  item.badgeAmount.startsWith('-')
                    ? 'text-rose-400'
                    : 'text-emerald-400'
                }`}
              >
                {item.badgeAmount}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
