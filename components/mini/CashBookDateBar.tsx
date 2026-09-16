'use client';

import { useState, useRef } from 'react';
import { useCashBookStore } from '@/store/useCashBookStore';

export default function CashBookDateBar() {
  const { selectedDate, setSelectedDate, prevDay, nextDay, setToday } =
    useCashBookStore();
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Format date string to "Tue, 01 Sep 2026"
  const formatDateDisplay = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 w-full">
      {/* Previous Day Button */}
      <button
        type="button"
        onClick={prevDay}
        aria-label="Previous Day"
        className="w-12 h-11 flex items-center justify-center rounded-2xl bg-surface hover:bg-surface-hover active:bg-surface-active border border-surface-border text-slate-300 hover:text-white transition-all shadow-sm"
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
          className="w-full h-11 px-5 rounded-2xl bg-surface hover:bg-surface-hover active:bg-surface-active border border-surface-border/80 text-center flex items-center justify-center gap-2 text-sm md:text-base font-semibold text-slate-100 transition-all shadow-sm group"
        >
          <span>{formatDateDisplay(selectedDate)}</span>
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

      {/* Next Day Button */}
      <button
        type="button"
        onClick={nextDay}
        aria-label="Next Day"
        className="w-12 h-11 flex items-center justify-center rounded-2xl bg-surface hover:bg-surface-hover active:bg-surface-active border border-surface-border text-slate-300 hover:text-white transition-all shadow-sm"
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
