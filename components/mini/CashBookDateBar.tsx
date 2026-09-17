'use client';

import { useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';

export default function CashBookDateBar() {
  const t = useTranslations('CashBook');
  const locale = useLocale();
  const { selectedDate, setSelectedDate, prevDay, nextDay, setToday } =
    useCashBookStore();
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Format date string to localized format
  const formatDateDisplay = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString(locale || 'en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isToday =
    selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 w-full">
      {/* Previous Day Button */}
      <button
        type="button"
        onClick={prevDay}
        aria-label={t('previousDay')}
        title={t('previousDay')}
        className="w-11 sm:w-12 h-11 flex items-center justify-center rounded-2xl bg-surface hover:bg-surface-hover active:bg-surface-active border border-surface-border text-slate-300 hover:text-white transition-all shadow-sm shrink-0 rtl:rotate-180"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Date Pill Button with Calendar trigger */}
      <div className="relative flex-1 max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()}
          className="w-full h-11 px-3 sm:px-5 rounded-2xl bg-surface hover:bg-surface-hover active:bg-surface-active border border-surface-border/80 text-center flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base font-semibold text-slate-100 transition-all shadow-sm group"
        >
          <svg className="w-4 h-4 text-[#38bdf8] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="truncate">{formatDateDisplay(selectedDate)}</span>
        </button>

        {/* Hidden date picker input for native cross-browser modal calendar */}
        <input
          ref={dateInputRef}
          type="date"
          value={selectedDate}
          onChange={(e) => {
            if (e.target.value) setSelectedDate(e.target.value);
          }}
          className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
        />
      </div>

      {/* Today Quick Jump Button (if not already today) */}
      {!isToday && (
        <button
          type="button"
          onClick={setToday}
          className="hidden sm:inline-flex items-center px-2.5 h-11 rounded-2xl bg-[#38bdf8]/10 hover:bg-[#38bdf8]/20 border border-[#38bdf8]/30 text-xs font-bold text-[#38bdf8] transition-all shrink-0"
        >
          {t('today')}
        </button>
      )}

      {/* Next Day Button */}
      <button
        type="button"
        onClick={nextDay}
        aria-label={t('nextDay')}
        title={t('nextDay')}
        className="w-11 sm:w-12 h-11 flex items-center justify-center rounded-2xl bg-surface hover:bg-surface-hover active:bg-surface-active border border-surface-border text-slate-300 hover:text-white transition-all shadow-sm shrink-0 rtl:rotate-180"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
