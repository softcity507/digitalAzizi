'use client';

import { useTranslations } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Users, User, X } from 'lucide-react';

export default function CashBookSearch() {
  const t = useTranslations('CashBook');
  const { searchQuery, setSearchQuery, selectedCustomerId, setSelectedCustomerId } = useCashBookStore();
  const businesses = useSettingsStore((state) => state.businesses);
  const allCustomers = useSettingsStore((state) => state.customers);

  const activeBusiness = businesses.find((b) => b.isActive) || businesses[0];
  const businessCustomers = activeBusiness
    ? allCustomers.filter((c) => c.businessId === activeBusiness.id)
    : allCustomers;

  const handleSelectCustomer = (customerId: string | null) => {
    if (selectedCustomerId === customerId) {
      setSelectedCustomerId(null);
    } else {
      setSelectedCustomerId(customerId);
    }
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Search Input Field */}
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
            placeholder={
              selectedCustomerId
                ? `Filter within selected customer...`
                : t('searchPlaceholder')
            }
            className="w-full h-12 pl-12 pr-10 rtl:pl-10 rtl:pr-12 rounded-2xl bg-surface-input/90 border border-surface-border text-content-primary placeholder:text-content-muted text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all shadow-inner"
          />

          {/* Clear Button */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label={t('clearSearch')}
              title={t('clearSearch')}
              className="absolute right-3.5 rtl:right-auto rtl:left-3.5 p-1.5 rounded-full text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Business Customers Filter Pills */}
      {businessCustomers.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {/* "All Customers" Pill */}
          <button
            type="button"
            onClick={() => setSelectedCustomerId(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
              selectedCustomerId === null
                ? 'bg-brand text-slate-950 border-brand shadow-sm font-extrabold'
                : 'bg-surface-subtle hover:bg-surface-hover text-content-muted hover:text-content-primary border-surface-border'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Customers</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
                selectedCustomerId === null
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-surface border border-surface-border text-content-muted'
              }`}
            >
              {businessCustomers.length}
            </span>
          </button>

          {/* Individual Business Customer Pills */}
          {businessCustomers.map((cust) => {
            const isSelected = selectedCustomerId === cust.id;
            return (
              <button
                key={cust.id}
                type="button"
                onClick={() => handleSelectCustomer(cust.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? 'bg-sky-400 text-slate-950 border-sky-400 shadow-sm font-extrabold ring-1 ring-sky-400'
                    : 'bg-surface-subtle hover:bg-surface-hover text-content-secondary hover:text-content-primary border-surface-border'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{cust.name}</span>
                {cust.subtitle && (
                  <span className="text-[10px] opacity-70 hidden sm:inline">
                    ({cust.subtitle.split(',')[0]})
                  </span>
                )}
                {isSelected && (
                  <X className="w-3 h-3 ml-0.5 opacity-80 hover:opacity-100" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
