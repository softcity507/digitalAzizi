'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { CashBookEntry } from '@/types/cashbook';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function formatRelativeTime(timestamp: number, now: number) {
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60_000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return 'Yesterday';
}

function getTransactionTitle(transaction: CashBookEntry) {
  if (transaction.type === 'exchange') {
    return transaction.fromCustomer && transaction.toCustomer
      ? `${transaction.fromCustomer} → ${transaction.toCustomer}`
      : transaction.customerName || 'Currency exchange';
  }
  return transaction.customerName || 'Customer transaction';
}

function getTransactionDetail(transaction: CashBookEntry) {
  if (transaction.type === 'exchange' && transaction.exchangeDetails) {
    const { fromAmount, fromCurrency, toAmount, toCurrency, rate } = transaction.exchangeDetails;
    return `${fromAmount.toLocaleString()} ${fromCurrency} → ${toAmount.toLocaleString()} ${toCurrency} @ ${rate}`;
  }

  const label = transaction.type === 'cash_in' ? 'Cash In' : 'Cash Out';
  const sign = transaction.type === 'cash_in' ? '+' : '−';
  return `${label} ${sign}${transaction.amount.toLocaleString()} ${transaction.currency}`;
}

function getTransactionColor(type: CashBookEntry['type']) {
  if (type === 'cash_in') return 'text-credit';
  if (type === 'cash_out') return 'text-debit';
  return 'text-brand';
}

export default function Notification() {
  const t = useTranslations('Header');
  const [isOpen, setIsOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const transactions = useCashBookStore((state) => state.transactions);
  const fetchTransactions = useCashBookStore((state) => state.fetchTransactions);
  const businesses = useSettingsStore((state) => state.businesses);
  const activeBusiness = businesses.find((business) => business.isActive) || businesses[0];

  useEffect(() => {
    if (!activeBusiness?.id) return;
    void fetchTransactions().catch((error: unknown) => {
      console.warn('Notification transactions could not be loaded:', error instanceof Error ? error.message : error);
    });
  }, [fetchTransactions, activeBusiness?.id]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = useMemo(
    () => transactions
      .filter((transaction) => {
        if (activeBusiness && transaction.businessId && transaction.businessId !== activeBusiness.id) return false;
        return transaction.createdAt <= now && now - transaction.createdAt < DAY_IN_MS;
      })
      .sort((a, b) => b.createdAt - a.createdAt),
    [transactions, activeBusiness, now],
  );

  const hasUnread = notifications.length > 0 && !isOpen;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen((previous) => !previous);
        }}
        aria-label={t('notifications')}
        aria-expanded={isOpen}
        className="relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-surface-subtle hover:bg-surface-hover text-content-primary border border-surface-border transition-all duration-200 active:scale-95 shadow-sm"
      >
        <svg
          className="w-5 h-5 text-content-secondary group-hover:text-content-primary transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {hasUnread && notifications.length > 0 && (
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-debit-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-debit-500" />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute ltr:right-0 rtl:left-0 mt-3 w-80 sm:w-88 rounded-2xl bg-surface border border-surface-border shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-content-primary">{t('notifications')}</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-brand/10 text-brand">
                {notifications.length} New
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
              className="text-xs text-content-muted hover:text-content-primary"
            >
              ×
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="py-5 text-center text-xs text-content-muted">No transactions in the last 24 hours.</p>
            ) : notifications.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1 p-2.5 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-content-primary truncate">
                    {getTransactionTitle(item)}
                  </span>
                  <span className="text-[10px] text-content-muted whitespace-nowrap">
                    {formatRelativeTime(item.createdAt, now)}
                  </span>
                </div>
                <p className={`text-xs ${getTransactionColor(item.type)} font-medium`}>
                  {getTransactionDetail(item)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
