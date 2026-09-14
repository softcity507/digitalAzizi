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
    <div className={`flex items-center justify-center gap-2 sm:gap-2.5 overflow-x-auto py-1 ${className}`}>
      {tabs.map(tab => {
        const isActive = currentFilter === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 ${
              isActive
                ? 'bg-brand text-black shadow-sm font-bold'
                : 'bg-surface hover:bg-surface-hover text-content-secondary hover:text-content-primary border border-surface-border'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
