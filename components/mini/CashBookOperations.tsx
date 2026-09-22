'use client';

import { useTranslations } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';

export default function CashBookOperations() {
  const t = useTranslations('CashBook');
  const { openModal } = useCashBookStore();

  return (
    <div className="w-full pt-1">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* 1. Cash Out (-) Button */}
        <button
          type="button"
          onClick={() => openModal('cash_out')}
          className="h-12 sm:h-14 rounded-2xl bg-[#fda4af] hover:bg-[#f87171] active:scale-[0.98] text-black font-extrabold text-xs sm:text-sm tracking-tight transition-all duration-150 shadow-md flex items-center justify-center gap-1.5 text-center px-2 cursor-pointer select-none group"
        >
          <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center font-black text-xs shrink-0">-</span>
          <span className="truncate">{t('cashOutBtn')}</span>
        </button>

        {/* 2. Exchange Button */}
        <button
          type="button"
          onClick={() => openModal('exchange')}
          className="h-12 sm:h-14 rounded-2xl bg-[#38bdf8] hover:bg-[#0ea5e9] active:scale-[0.98] text-black font-extrabold text-xs sm:text-sm tracking-tight transition-all duration-150 shadow-md flex items-center justify-center gap-1.5 text-center px-2 cursor-pointer select-none group"
        >
          <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center font-black text-xs shrink-0">⇄</span>
          <span className="truncate">{t('transferBtn')}</span>
        </button>

        {/* 3. Cash In (+) Button */}
        <button
          type="button"
          onClick={() => openModal('cash_in')}
          className="h-12 sm:h-14 rounded-2xl bg-[#34d399] hover:bg-[#10b981] active:scale-[0.98] text-black font-extrabold text-xs sm:text-sm tracking-tight transition-all duration-150 shadow-md flex items-center justify-center gap-1.5 text-center px-2 cursor-pointer select-none group"
        >
          <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center font-black text-xs shrink-0">+</span>
          <span className="truncate">{t('cashInBtn')}</span>
        </button>
      </div>
    </div>
  );
}
