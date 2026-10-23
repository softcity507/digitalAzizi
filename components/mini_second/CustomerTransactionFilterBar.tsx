'use client';

import { useTranslations } from 'next-intl';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';

export default function CustomerTransactionFilterBar() {
  const t = useTranslations('CustomerDetails');
  const {
    searchQuery,
    setSearchQuery,
  } = useCustomerDetailsStore();

  return (
    <div className="w-full space-y-3">
      {/* Search Input */}
      <div className="  w-full">

        <div className="flex bg-surface border border-surface-border focus:outline-none focus:ring-1 focus:ring-brand rounded focus:border-brand justify-center items-center px-2 ">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full py-2.5 px-1   text-xs sm:text-sm text-content-primary placeholder:text-content-muted transition-all border-0 outline-0 "
        />
        </div>
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


    </div>
  );
}
