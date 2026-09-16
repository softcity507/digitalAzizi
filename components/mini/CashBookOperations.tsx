'use client';

import { useCashBookStore } from '@/store/useCashBookStore';

export default function CashBookOperations() {
  const { openModal } = useCashBookStore();

  return (
    <div className="w-full pt-2">
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* 1. Cash Out (-) Button */}
        <button
          type="button"
          onClick={() => openModal('cash_out')}
          className="h-12 sm:h-14 rounded-2xl bg-[#fda4af] hover:bg-[#f87171] active:scale-[0.98] text-black font-extrabold text-xs sm:text-sm tracking-tight transition-all duration-150 shadow-md flex items-center justify-center text-center px-2 cursor-pointer select-none"
        >
          Cash Out (-)
        </button>

        {/* 2. Exchange Button */}
        <button
          type="button"
          onClick={() => openModal('exchange')}
          className="h-12 sm:h-14 rounded-2xl bg-[#38bdf8] hover:bg-[#0ea5e9] active:scale-[0.98] text-black font-extrabold text-xs sm:text-sm tracking-tight transition-all duration-150 shadow-md flex items-center justify-center text-center px-2 cursor-pointer select-none"
        >
          Exchange
        </button>

        {/* 3. Cash In (+) Button */}
        <button
          type="button"
          onClick={() => openModal('cash_in')}
          className="h-12 sm:h-14 rounded-2xl bg-[#34d399] hover:bg-[#10b981] active:scale-[0.98] text-black font-extrabold text-xs sm:text-sm tracking-tight transition-all duration-150 shadow-md flex items-center justify-center text-center px-2 cursor-pointer select-none"
        >
          Cash In (+)
        </button>
      </div>
    </div>
  );
}
