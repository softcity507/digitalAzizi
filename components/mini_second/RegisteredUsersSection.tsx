'use client';

import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function RegisteredUsersSection() {
  const t = useTranslations('Settings');
  const { users, setDefaultUser, openModal } = useSettingsStore();

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-content-primary">
          {t('registeredUsersTitle')}
        </h3>
        <span className="text-[11px] font-mono font-medium text-content-muted">
          {t('recordsCount', { count: users.length })}
        </span>
      </div>

      <div className="bg-surface border border-surface-border rounded-2xl divide-y divide-surface-border overflow-hidden shadow-sm">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-4 sm:p-5 flex items-center justify-between gap-3 transition-colors hover:bg-surface-hover/30"
          >
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-bold text-content-primary truncate">
                  {user.name}
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    user.isDefault
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                      : 'bg-surface-subtle text-content-muted border-surface-border'
                  }`}
                >
                  {user.roleTag}
                </span>
              </div>
              <p className="text-xs text-content-muted truncate">{user.subtitle}</p>
            </div>

            <div className="shrink-0">
              {user.isDefault ? (
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {t('active')}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setDefaultUser(user.id)}
                  className="px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-xs font-semibold text-content-primary transition-colors cursor-pointer"
                >
                  {t('setDefault')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => openModal('add_customer')}
        className="w-full py-3 px-4 rounded-2xl bg-surface hover:bg-surface-hover border border-surface-border text-xs sm:text-sm font-bold text-content-primary transition-all shadow-sm cursor-pointer"
      >
        {t('addNewCustomer')}
      </button>
    </div>
  );
}
