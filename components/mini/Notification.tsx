'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function Notification() {
  const t = useTranslations('Header');
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 1,
      title: 'Aziz Khan',
      detail: 'Cash In +8,954,000 PKR completed',
      time: '2m ago',
      type: 'credit',
    },
    {
      id: 2,
      title: 'Exchange Executed',
      detail: '5,000 USD → 356,000 AFN @ 71.20',
      time: '18m ago',
      type: 'brand',
    },
    {
      id: 3,
      title: 'Haji Noorullah',
      detail: 'Cash Out -5,000 AFN processed',
      time: '1h ago',
      type: 'debit',
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(prev => !prev);
          setHasUnread(false);
        }}
        aria-label={t('notifications')}
        className="relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-surface-subtle hover:bg-surface-hover text-content-primary border border-surface-border transition-all duration-200 active:scale-95 shadow-sm"
      >
        <svg
          className="w-5 h-5 text-content-secondary group-hover:text-content-primary transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {hasUnread && (
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-debit-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-debit-500"></span>
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
              className="text-xs text-content-muted hover:text-content-primary"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {notifications.map(item => (
              <div
                key={item.id}
                className="flex flex-col gap-1 p-2.5 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-content-primary">
                    {item.title}
                  </span>
                  <span className="text-[10px] text-content-muted">{item.time}</span>
                </div>
                <p
                  className={`text-xs ${
                    item.type === 'credit'
                      ? 'text-credit font-medium'
                      : item.type === 'debit'
                      ? 'text-debit font-medium'
                      : 'text-brand font-medium'
                  }`}
                >
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
