'use client';

import { useTranslations } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';

export default function CashBookSearch() {
  const t = useTranslations('CashBook');
  const { searchQuery, setSearchQuery } = useCashBookStore();

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        {/* Search Icon */}
        <div className="absolute left-4 rtl:left-auto rtl:right-4 flex items-center pointer-events-none text-slate-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Search Input Field */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full h-12 pl-12 pr-10 rtl:pl-10 rtl:pr-12 rounded-2xl bg-surface-input/90 border border-surface-border text-content-primary placeholder:text-content-muted text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all shadow-inner"
        />

        {/* Clear Button */}
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label={t('clearSearch')}
            title={t('clearSearch')}
            className="absolute right-3.5 rtl:right-auto rtl:left-3.5 p-1 rounded-full text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
