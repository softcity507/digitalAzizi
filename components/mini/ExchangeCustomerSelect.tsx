'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';
import { CUSTOMER_ACCOUNTS } from '@/data/customerData';

export default function ExchangeCustomerSelect() {
  const t = useTranslations('ExchangeDesk');
  const { customerId, setCustomerId, getCurrency } = useExchangeDeskStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCustomer =
    CUSTOMER_ACCOUNTS.find((c) => c.id === customerId) || CUSTOMER_ACCOUNTS[1] || CUSTOMER_ACCOUNTS[0];

  // Find balance matching target currency or default to first balance
  const primaryBalance =
    selectedCustomer.balances.find((b) => b.currency === getCurrency) ||
    selectedCustomer.balances[0] || { amount: '+8,449,800', currency: 'AFN', isCredit: true };

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full space-y-1.5 relative" ref={dropdownRef}>
      <label className="block text-[11px] font-black tracking-wider uppercase text-slate-500 dark:text-slate-400">
        {t('customer')}
      </label>

      {/* Main Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-14 px-4 rounded-2xl bg-surface-subtle hover:bg-surface-hover border border-surface-border transition-all flex items-center justify-between text-left cursor-pointer shadow-sm group"
      >
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-8 h-8 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand font-bold text-sm shrink-0">
            {selectedCustomer.name.charAt(0)}
          </div>
          <div className="truncate">
            <span className="block text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {selectedCustomer.name}
            </span>
            {selectedCustomer.subtitle && (
              <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {selectedCustomer.subtitle}
              </span>
            )}
          </div>
        </div>

        {/* Balance Badge & Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs sm:text-sm font-mono font-extrabold px-2.5 py-1 rounded-xl border ${primaryBalance.isCredit
                ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20'
              }`}
          >
            {primaryBalance.amount} {primaryBalance.currency}
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
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
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-surface border border-surface-border shadow-2xl p-2 space-y-1 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {CUSTOMER_ACCOUNTS.map((customer) => {
            const isSelected = customer.id === customerId;
            const bal =
              customer.balances.find((b) => b.currency === getCurrency) || customer.balances[0];

            return (
              <button
                key={customer.id}
                type="button"
                onClick={() => {
                  setCustomerId(customer.id);
                  setIsOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors ${isSelected
                    ? 'bg-brand/15 border border-brand/40 text-brand'
                    : 'hover:bg-surface-hover text-slate-800 dark:text-slate-200'
                  }`}
              >
                <div>
                  <span className="block text-xs sm:text-sm font-bold">{customer.name}</span>
                  {customer.subtitle && (
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                      {customer.subtitle}
                    </span>
                  )}
                </div>
                {bal && (
                  <span
                    className={`text-xs font-mono font-bold ${bal.isCredit ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                  >
                    {bal.amount} {bal.currency}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
