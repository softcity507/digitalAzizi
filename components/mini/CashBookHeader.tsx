'use client';

import { useTranslations } from 'next-intl';

interface CashBookHeaderProps {
  companyName?: string;
  companySubtitle?: string;
}

export default function CashBookHeader({
  companyName,
  companySubtitle,
}: CashBookHeaderProps) {
  const t = useTranslations('CashBook');
  const tNav = useTranslations('Navigation');

  const displaySubtitle = companySubtitle || t('subtitle');
  const displayCompanyName = companyName || t('companyName');

  return (
    <div className="w-full space-y-3 pt-1">
      {/* Top Company Info Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Cyan/Teal Brand Icon */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0d9488]/20 border border-[#0d9488]/40 flex items-center justify-center text-teal-400 shadow-sm shrink-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-teal-400"
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
            <span className="block text-[10px] sm:text-xs font-bold tracking-widest text-[#38bdf8] uppercase">
              {displaySubtitle}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {displayCompanyName}
            </h2>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface/80 border border-surface-border text-xs font-semibold text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{t('cashDesk')}</span>
        </div>
      </div>

      {/* Main Cash Book Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            {t('title') || tNav('cashBook')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            {t('pageHeading')}
          </p>
        </div>
        <div className="w-10 h-1.5 rounded-full bg-slate-700/60 hidden sm:block" />
      </div>
    </div>
  );
}
