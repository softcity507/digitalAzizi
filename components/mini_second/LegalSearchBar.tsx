'use client';

import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';

interface LegalSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function LegalSearchBar({ value, onChange }: LegalSearchBarProps) {
  const t = useTranslations('about');

  return (
    <div className="flex items-center gap-2.5 px-3.5 rounded bg-surface border border-surface-border shadow-sm transition-colors duration-150 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand">
      <Search className="w-4 h-4 text-content-muted dark:text-content-secondary shrink-0" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={t('searchPlaceholder')}
        aria-label={t('searchPlaceholder')}
        className="flex-1 min-w-0 py-3 bg-transparent text-sm font-medium text-content-primary placeholder:text-content-tertiary focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t('clearSearch')}
          className="p-1 rounded text-content-muted dark:text-content-secondary hover:text-content-primary dark:hover:text-content-primary hover:bg-surface-hover transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
