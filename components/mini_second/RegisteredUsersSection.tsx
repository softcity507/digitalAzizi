'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function RegisteredUsersSection() {
  const t = useTranslations('Settings');
  const { users, setDefaultUser, openModal } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const defaultUser = users.find((u) => u.isDefault) || users[0];

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
    <div className="w-full space-y-3 relative" ref={dropdownRef}>
      {/* Section Title & Records Count */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-content-primary">
          {t('registeredUsersTitle')}
        </h3>
        <span className="text-[11px] font-mono font-medium text-content-muted">
          {t('recordsCount', { count: users.length })}
        </span>
      </div>

      {/* Main Dropdown Container */}
      <div className="bg-surface border border-surface-border rounded-2xl shadow-sm overflow-hidden transition-all">
        {/* Selected Default User Dropdown Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-surface-hover/40 transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
              {defaultUser?.name ? defaultUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-bold text-content-primary truncate">
                  {defaultUser?.name}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
                  {defaultUser?.roleTag || t('active')}
                </span>
              </div>
              <p className="text-xs text-content-muted truncate">{defaultUser?.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-block text-[11px] font-semibold text-content-muted group-hover:text-content-primary transition-colors">
              {isOpen ? t('close') : t('switch')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-surface-border flex items-center justify-center text-content-muted group-hover:text-content-primary transition-all">
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>

        {/* Dropdown User List Body & Bottom Add Button */}
        {isOpen && (
          <div className="border-t border-surface-border divide-y divide-surface-border bg-surface-subtle/30 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="divide-y divide-surface-border max-h-80 overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                    user.isDefault
                      ? 'bg-brand/5 border-l-2 border-brand'
                      : 'hover:bg-surface-hover/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${
                        user.isDefault
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-surface border-surface-border text-content-muted'
                      }`}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-xs sm:text-sm font-bold text-content-primary truncate">
                          {user.name}
                        </h5>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                            user.isDefault
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                              : 'bg-surface text-content-muted border-surface-border'
                          }`}
                        >
                          {user.roleTag}
                        </span>
                      </div>
                      <p className="text-[11px] text-content-muted truncate">{user.subtitle}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {user.isDefault ? (
                      <span className="text-xs font-bold text-emerald-400 font-mono px-2 py-1">
                        {t('active')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setDefaultUser(user.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-xs font-semibold text-content-primary transition-colors cursor-pointer"
                      >
                        {t('setDefault')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Customer Button at the bottom */}
            <div className="p-3 sm:p-4 bg-surface/60">
              <button
                type="button"
                onClick={() => openModal('add_customer')}
                className="w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-xs sm:text-sm font-bold text-content-primary transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span className="w-4 h-4 rounded-md bg-brand/15 text-brand flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-brand/25 transition-colors">
                  +
                </span>
                <span>{t('addNewCustomer')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

