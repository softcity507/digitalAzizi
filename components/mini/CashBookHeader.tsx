'use client';

import { useTranslations } from 'next-intl';

interface CashBookHeaderProps {
  companyName?: string;
  companySubtitle?: string;
}

export default function CashBookHeader({
  companyName = 'Al-Rehman Co',
  companySubtitle = 'HAWALA & LEDGER',
}: CashBookHeaderProps) {
  const t = useTranslations('Navigation');

  return (
    <div className="w-full space-y-4 pt-1">
      {/* Top Company Info Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Cyan/Teal Brand Icon */}
          <div className="w-10 h-10 rounded-xl bg-[#0d9488]/20 border border-[#0d9488]/40 flex items-center justify-center text-teal-400 shadow-sm">
            <svg
              className="w-5 h-5 text-teal-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>

          <div>
            <span className="block text-[10px] font-bold tracking-widest text-[#38bdf8] uppercase">
              {companySubtitle}
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              {companyName}
            </h2>
          </div>
        </div>


      </div>

      {/* Main Cash Book Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t('cashBook') || 'Cash Book'}
        </h1>
        <div className="w-8 h-1.5 rounded-full bg-slate-700/60" />
      </div>
    </div>
  );
}
