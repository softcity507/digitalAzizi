'use client';

import { useTranslations } from 'next-intl';
import { AccountFilterType } from '@/types/customer';

interface AccountFilterTabsProps {
  currentFilter: AccountFilterType;
  onSelect: (filter: AccountFilterType) => void;
  totalAccounts?: number;
  className?: string;
}

export default function AccountFilterTabs({
  currentFilter,
  onSelect,
  totalAccounts = 4,
  className = '',
}: AccountFilterTabsProps) {
  const t = useTranslations('CustomerBook');

  const tabs: { id: AccountFilterType; label: string }[] = [
    { id: 'all', label: `${t('allAccounts')} (${totalAccounts})` },
    { id: 'receivable', label: t('receivable') },
    { id: 'payable', label: t('payable') },
  ];

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 py-1 ${className}`}>
      {tabs.map(tab => {
        const isActive = currentFilter === tab.id;
        return (
          <label
            key={tab.id}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
              isActive
                ? 'bg-brand-subtle text-content-primary border-brand/40 font-bold'
                : 'bg-surface hover:bg-surface-hover text-content-secondary hover:text-content-primary border-surface-border'
            }`}
          >
            <input
              type="radio"
              name="account-filter"
              value={tab.id}
              checked={isActive}
              onChange={() => onSelect(tab.id)}
              className="h-4 w-4 accent-brand"
            />
            {tab.label}
          </label>
        );
      })}
    </div>
  );
}
