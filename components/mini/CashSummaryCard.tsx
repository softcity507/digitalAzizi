'use client';

import { useTranslations } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';

export default function CashSummaryCard() {
  const t = useTranslations('CashBook');
  const { getCashNetBalances } = useCashBookStore();
  const balances = getCashNetBalances();

  const formatAmount = (num: number, currency: string) => {
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
          <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
          <span>{t('cashDesk')}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* PKR Box */}
        <div className="bg-canvas/90 rounded-2xl p-3 border border-surface-border/50 flex flex-col justify-between hover:border-[#38bdf8]/30 transition-colors">
          <span className="text-[11px] font-semibold text-slate-400">PKR</span>
          <span
            className={`text-sm sm:text-base font-mono font-bold tracking-tight truncate ${
              balances.pkr >= 0 ? 'text-[#34d399]' : 'text-[#f87171]'
            }`}
          >
            {formatAmount(balances.pkr, 'PKR')}
          </span>
        </div>

        {/* AFN Box */}
        <div className="bg-canvas/90 rounded-2xl p-3 border border-surface-border/50 flex flex-col justify-between hover:border-[#38bdf8]/30 transition-colors">
          <span className="text-[11px] font-semibold text-slate-400">AFN</span>
          <span
            className={`text-sm sm:text-base font-mono font-bold tracking-tight truncate ${
              balances.afn >= 0 ? 'text-[#34d399]' : 'text-[#f87171]'
            }`}
          >
            {formatAmount(balances.afn, 'AFN')}
          </span>
        </div>

        {/* USD Box */}
        <div className="bg-canvas/90 rounded-2xl p-3 border border-surface-border/50 flex flex-col justify-between hover:border-[#38bdf8]/30 transition-colors">
          <span className="text-[11px] font-semibold text-slate-400">USD</span>
          <span
            className={`text-sm sm:text-base font-mono font-bold tracking-tight truncate ${
              balances.usd >= 0 ? 'text-[#38bdf8]' : 'text-[#f87171]'
            }`}
          >
            {formatAmount(balances.usd, 'USD')}
          </span>
        </div>
      </div>
    </div>
  );
}
