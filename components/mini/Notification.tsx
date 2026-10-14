'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AppUser } from '@/types/auth';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export default function Notification() {
  const t = useTranslations('Header');
  const [isOpen, setIsOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [user, setUser] = useState<AppUser | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const refreshSubscription = () => {
    void fetch('/api/auth/me')
      .then(async (response) => {
        const result = await response.json();
        return result?.user ? result.user as AppUser : null;
      })
      .then(setUser)
      .catch(() => setUser(null));
  };

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/auth/me')
      .then(async (response) => {
        const result = await response.json();
        return result?.user ? result.user as AppUser : null;
      })
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => { cancelled = true; };
  }, []);

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

  const daysRemaining = useMemo(() => {
    if (!user?.subscription_expires_at) return null;
    const expiry = new Date(user.subscription_expires_at).getTime();
    if (!Number.isFinite(expiry)) return null;
    const grantedDays = Number.parseInt(user.subscription_days, 10);
    const totalDays = Number.isFinite(grantedDays) && grantedDays >= 0 ? grantedDays : 7;
    const remaining = Math.max(0, expiry - now);
    const days = Math.min(totalDays, Math.ceil(remaining / DAY_IN_MS));
    return days;
  }, [user, now]);

  const notifications = daysRemaining === null ? [] : [daysRemaining];
  const hasUnread = notifications.length > 0 && !isOpen;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen((previous) => !previous);
          refreshSubscription();
        }}
        aria-label={t('notifications')}
        aria-expanded={isOpen}
        className="relative flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-surface-subtle hover:bg-surface-hover text-content-primary border border-surface-border transition-all duration-200 active:scale-95 shadow-sm"
      >
        <svg className="w-5 h-5 text-content-secondary group-hover:text-content-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {hasUnread && (
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
            <button onClick={() => setIsOpen(false)} aria-label={t('closeNotifications')} className="text-xs text-content-muted hover:text-content-primary">
              ×
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {daysRemaining === null ? (
              <p className="py-5 text-center text-xs text-content-muted">{t('noNotifications')}</p>
            ) : (
              <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-surface-subtle border border-surface-border/50">
                <span className="text-xs font-semibold text-content-primary">Subscription expiry</span>
                <p className="text-xs text-debit font-medium">
                  You have only {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
