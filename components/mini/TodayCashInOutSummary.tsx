'use client';

import { useTranslations } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';

export default function TodayCashInOutSummary() {
  const t = useTranslations('CashBook');
  const { getTodaySummary } = useCashBookStore();
  const { cashIn, cashOut } = getTodaySummary();

  const formatPlusAmount = (num: number, currency: string) => {
    if (num === 0) {
      return currency === 'USD' ? '$0' : '0';
    }
    const formatted = num.toLocaleString('en-US');
    if (currency === 'USD') return `+$${formatted}`;
    return `+${formatted}`;
  };

  const formatMinusAmount = (num: number, currency: string) => {
    if (num === 0) {
      return currency === 'USD' ? '$0' : '0';
    }
    const formatted = num.toLocaleString('en-US');
    if (currency === 'USD') return `-$${formatted}`;
    return `-${formatted}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
      {/* Today Cash In Card */}
      <div className="bg-surface/90 rounded-3xl p-4 sm:p-5 border border-surface-border shadow-md space-y-3 hover:border-emerald-500/30 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-[#34d399] tracking-tight flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#34d399]" />
            <span>{t('todayCashIn')}</span>
          </h3>
          <span className="text-[10px] uppercase font-bold text-[#34d399] bg-[#34d399]/10 px-2 py-0.5 rounded-md">
            + Cr
          </span>
        </div>

        <div className="space-y-1.5">
          {/* PKR */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-400 font-semibold">PKR</span>
            <span
              className={`font-mono font-bold tracking-tight ${
                cashIn.pkr > 0 ? 'text-[#34d399]' : 'text-slate-500'
              }`}
            >
              {formatPlusAmount(cashIn.pkr, 'PKR')}
            </span>
          </div>

          {/* AFN */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-400 font-semibold">AFN</span>
            <span
              className={`font-mono font-bold tracking-tight ${
                cashIn.afn > 0 ? 'text-[#34d399]' : 'text-slate-500'
              }`}
            >
              {formatPlusAmount(cashIn.afn, 'AFN')}
            </span>
          </div>

          {/* USD */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-400 font-semibold">USD</span>
            <span
              className={`font-mono font-bold tracking-tight ${
                cashIn.usd > 0 ? 'text-[#34d399]' : 'text-slate-500'
              }`}
            >
              {formatPlusAmount(cashIn.usd, 'USD')}
            </span>
          </div>
        </div>
      </div>

      {/* Today Cash Out Card */}
      <div className="bg-surface/90 rounded-3xl p-4 sm:p-5 border border-surface-border shadow-md space-y-3 hover:border-rose-500/30 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold text-[#fda4af] tracking-tight flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#fda4af]" />
            <span>{t('todayCashOut')}</span>
          </h3>
          <span className="text-[10px] uppercase font-bold text-[#fda4af] bg-[#fda4af]/10 px-2 py-0.5 rounded-md">
            - Dr
          </span>
        </div>

        <div className="space-y-1.5">
          {/* PKR */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-400 font-semibold">PKR</span>
            <span
              className={`font-mono font-bold tracking-tight ${
                cashOut.pkr > 0 ? 'text-[#f87171]' : 'text-slate-500'
              }`}
            >
              {formatMinusAmount(cashOut.pkr, 'PKR')}
            </span>
          </div>

          {/* AFN */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-400 font-semibold">AFN</span>
            <span
              className={`font-mono font-bold tracking-tight ${
                cashOut.afn > 0 ? 'text-[#f87171]' : 'text-slate-500'
              }`}
            >
              {formatMinusAmount(cashOut.afn, 'AFN')}
            </span>
          </div>

          {/* USD */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-400 font-semibold">USD</span>
            <span
              className={`font-mono font-bold tracking-tight ${
                cashOut.usd > 0 ? 'text-[#f87171]' : 'text-slate-500'
              }`}
            >
              {cashOut.usd > 0 ? formatMinusAmount(cashOut.usd, 'USD') : '$0'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
