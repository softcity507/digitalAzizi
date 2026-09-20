'use client';

import { useTranslations } from 'next-intl';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';

export default function CustomerBalanceCard() {
  const t = useTranslations('CustomerDetails');
  const { selectedCurrency, getActiveBalances } = useCustomerDetailsStore();
  const { net, totalCredit, totalDebit } = getActiveBalances();

  const isNetPositive = net >= 0;
  const formattedNet = `${isNetPositive ? '+' : ''}${net.toLocaleString()} ${selectedCurrency}`;

  return (
    <div className="w-full bg-surface border border-surface-border rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="space-y-1">
        <span className="text-[11px] font-bold tracking-wider uppercase text-content-muted">
          {t('balance')}
        </span>
        <div
          className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
            isNetPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {formattedNet}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Total Credit / Inflow Card */}
        <div className="p-3.5 rounded-xl bg-surface-subtle border border-surface-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="block text-xs sm:text-sm font-bold font-mono text-content-primary truncate">
              {totalCredit.toLocaleString()} <span className="text-[10px] text-content-muted">{selectedCurrency}</span>
            </span>
          </div>
        </div>

        {/* Total Debit / Outflow Card */}
        <div className="p-3.5 rounded-xl bg-surface-subtle border border-surface-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="block text-xs sm:text-sm font-bold font-mono text-content-primary truncate">
              {totalDebit.toLocaleString()} <span className="text-[10px] text-content-muted">{selectedCurrency}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
