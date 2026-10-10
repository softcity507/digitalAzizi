'use client';

import { useTranslations } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function CashSummaryCard() {
  const t = useTranslations('CashBook');
  const { getCashNetBalances } = useCashBookStore();
  const balances = getCashNetBalances();
  const activeBusiness = useSettingsStore((state) => state.businesses.find((business) => business.isActive));
  const currencies = activeBusiness?.supportedCurrencies ?? ['PKR', 'AFN', 'USD'];
  const amountColor = (amount: number) => amount < 0 ? 'text-debit-text' : 'text-credit-text';
  const borderColor = (amount: number) => amount < 0 ? 'hover:border-debit/30' : 'hover:border-credit/30';

  const formatAmount = (amount: number | null | undefined, currency: string) => {
    const num = Number(amount);
    if (!Number.isFinite(num) || num === 0) {
      return currency === 'USD' ? '$0' : '0';
    }

    const formatted = Math.abs(num).toLocaleString('en-US');
    if (currency === 'USD') {
      return num < 0 ? `-$${formatted}` : `$${formatted}`;
    }
    return num < 0 ? `-${formatted}` : formatted;
  };

  return (
    <div className="w-full bg-surface/90 rounded-3xl p-4 sm:p-5 border border-surface-border shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-credit" />
          <span>{t('cashDesk')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
        {currencies.map((currency) => {
          const balance = balances[currency] ?? 0;
          return (
            <div
              key={currency}
              className={`bg-canvas/90 rounded-2xl p-3 border border-surface-border/50 flex flex-col justify-between ${borderColor(balance)} transition-colors`}
            >
              <span className="text-[11px] font-semibold text-slate-400">{currency}</span>
              <span className={`text-sm sm:text-base font-mono font-bold tracking-tight truncate ${amountColor(balance)}`}>
                {formatAmount(balance, currency)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
