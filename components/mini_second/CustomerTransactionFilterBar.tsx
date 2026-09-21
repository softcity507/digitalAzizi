'use client';

import { useTranslations } from 'next-intl';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';

export default function CustomerTransactionFilterBar() {
  const t = useTranslations('CustomerDetails');
  const {
    searchQuery,
    setSearchQuery,
    dateFilter,
    setDateFilter,
    sortAscending,
    toggleSortOrder,
  } = useCustomerDetailsStore();

  return (
    <div className="w-full space-y-3">
      {/* Search Input */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-surface-border text-xs sm:text-sm text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-content-muted hover:text-content-primary"
          >
            ✕
          </button>
        )}
      </div>

      {/* Date & Sort Actions */}
      <div className="flex items-center   gap-2">
        <button
          type="button"
          onClick={() => setDateFilter(dateFilter === 'all' ? 'today' : 'all')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-surface-border text-xs font-semibold text-content-primary hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{t('allDates')}</span>
          <svg className="w-3.5 h-3.5 text-content-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={toggleSortOrder}
          title={sortAscending ? 'Oldest first' : 'Newest first'}
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${sortAscending
              ? 'bg-brand/15 border-brand/40 text-brand'
              : 'bg-surface border-surface-border text-content-muted hover:text-content-primary hover:bg-surface-hover'
            }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
