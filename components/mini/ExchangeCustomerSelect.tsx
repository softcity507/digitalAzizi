'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function ExchangeCustomerSelect() {
  const t = useTranslations('ExchangeDesk');
  const { customerId, setCustomerId } = useExchangeDeskStore();
  const businesses = useSettingsStore((state) => state.businesses);
  const allCustomers = useSettingsStore((state) => state.customers);
  const activeBusiness = useMemo(() => businesses.find((b) => b.isActive) || businesses[0], [businesses]);

  const customers = useMemo(() => {
    if (!activeBusiness) return [];
    return allCustomers.filter((customer) => customer.businessId === activeBusiness.id);
  }, [allCustomers, activeBusiness]);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedCustomer = customers.find((customer) => customer.id === customerId) || customers[0];

  useEffect(() => {
    if (customers.some((customer) => customer.id === customerId)) return;
    const nextCustomerId = customers[0]?.id ?? '';
    useExchangeDeskStore.getState().setCustomerId(nextCustomerId);
    useCustomerDetailsStore.getState().setSelectedCustomerId(nextCustomerId);
  }, [customers, customerId]);

  const filteredCustomers = useMemo(() => {
    if (!appliedSearchQuery.trim()) return customers;
    const q = appliedSearchQuery.trim().toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [customers, appliedSearchQuery]);

  // Search input handler with 2-second loading simulation
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    if (!value.trim()) {
      setIsSearching(false);
      setAppliedSearchQuery('');
      return;
    }

    setIsSearching(true);
    searchTimerRef.current = setTimeout(() => {
      setAppliedSearchQuery(value);
      setIsSearching(false);
    }, 2000);
  };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const handleSelect = (newId: string) => {
    setCustomerId(newId);
    useCustomerDetailsStore.getState().setSelectedCustomerId(newId);
    useSettingsStore.getState().setDefaultUser(newId);
    setIsOpen(false);
  };

  return (
    <div className="w-full space-y-2 relative" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-black tracking-wider uppercase text-slate-500 dark:text-slate-400">
          {t('customer')}
        </label>
        {searchQuery.trim() && (
          <span className="text-[10px] font-bold text-brand flex items-center gap-1">
            {isSearching ? (
              <span className="animate-pulse">Searching in 2s...</span>
            ) : (
              <span>{filteredCustomers.length} accounts found</span>
            )}
          </span>
        )}
      </div>

      {/* Search Input Bar Before Selector */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          {isSearching ? (
            <svg className="animate-spin h-4 w-4 text-brand" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        <input
          type="text"
          value={searchQuery}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search customer by name, market, phone..."
          className="w-full pl-10 pr-9 py-2 rounded-xl bg-surface-subtle border border-surface-border text-xs sm:text-sm text-content-primary placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => handleSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-slate-400 hover:text-content-primary cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* Main Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[3.75rem] py-2 px-3.5 sm:px-4 rounded-2xl bg-surface-subtle hover:bg-surface-hover border border-surface-border transition-all flex items-center justify-between text-left cursor-pointer shadow-sm group gap-2"
      >
        <div className="flex items-center gap-2.5 truncate min-w-0">
          <div className="w-8 h-8 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand font-bold text-sm shrink-0">
            {selectedCustomer?.name ? selectedCustomer.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="truncate">
            <span className="block text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {selectedCustomer?.name || t('customer')}
            </span>
             
          </div>
        </div>

        {/* Responsive Balances Display & Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-1.5 justify-end">
            {(selectedCustomer?.balances || []).map((bal, idx) => {
              const num = parseFloat((bal.amount || '').replace(/[^0-9.-]/g, ''));
              if (!isNaN(num) && num === 0) return null;
              return (
                <span
                  key={idx}
                  className={`text-[10px] sm:text-xs font-mono font-extrabold px-2 py-0.5 rounded-lg border whitespace-nowrap ${bal.isCredit
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20'
                    }`}
                >
                  {bal.amount}{' '}
                  <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-300">
                    {bal.currency}
                  </span>
                </span>
              );
            })}
          </div>
          <svg
            className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''
              }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-surface border border-surface-border shadow-2xl p-2 space-y-1 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {isSearching ? (
            <div className="p-6 text-center space-y-2">
              <div className="w-7 h-7 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-content-muted animate-pulse">
                Searching customer database (2s)...
              </p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-4 text-center text-xs font-semibold text-content-muted">
              No matching customers found for &quot;{searchQuery}&quot;
            </div>
          ) : (
            filteredCustomers.map((customer) => {
              const isSelected = customer.id === customerId;

              return (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleSelect(customer.id)}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${isSelected
                    ? 'bg-brand/15 border border-brand/40 text-brand'
                    : 'hover:bg-surface-hover text-slate-800 dark:text-slate-200'
                    }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="block text-xs sm:text-sm font-bold truncate">{customer.name}</span>
                    {customer.subtitle && (
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {customer.phone}
                      </span>
                    )}
                  </div>

                  {/* Responsive Balances for Dropdown Items */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-1.5 justify-end shrink-0">
                    {customer.balances.map((bal, idx) => {
                      const num = parseFloat(bal.amount.replace(/[^0-9.-]/g, ''));
                      if (!isNaN(num) && num === 0) return null;
                      return (
                        <span
                          key={idx}
                          className={`text-[10px] sm:text-xs font-mono font-extrabold px-1.5 sm:px-2 py-0.5 rounded-md border whitespace-nowrap ${bal.isCredit
                            ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : 'text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/20'
                            }`}
                        >
                          {bal.amount}{' '}
                          <span className="text-[9px] uppercase font-bold text-slate-400">
                            {bal.currency}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
