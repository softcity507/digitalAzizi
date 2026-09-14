'use client';

import { useTranslations } from 'next-intl';

interface CustomerSearchProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export default function CustomerSearch({
  value,
  onChange,
  className = '',
}: CustomerSearchProps) {
  const t = useTranslations('CustomerBook');

  return (
    <div className={`relative w-full ${className}`}>
      {/* Search Magnifying Glass Icon */}
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Search Input Field */}
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface border border-surface-border text-sm text-content-primary placeholder-content-muted focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all shadow-inner"
      />

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-content-muted hover:text-content-primary text-xs"
        >
          ✕
        </button>
      )}
    </div>
  );
}
