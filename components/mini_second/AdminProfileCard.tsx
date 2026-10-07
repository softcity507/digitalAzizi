'use client';

import { useState, useEffect } from 'react';
// import { useTrasnslations } from 'next-intl';
import { useSettingsStore } from '@/store/useSettingsStore';
import { authApi } from '@/callapi/auth';
import MiniLoader from '@/components/mini_second/MiniLoader';

export default function AdminProfileCard() {
  // const t = useTranslations('Settings');
  const { admin, setAdmin } = useSettingsStore();
  const [loading, setLoading] = useState(true);
  const [databaseError, setDatabaseError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    authApi.getSession()
      .then((response) => {
        if (!response.success || !response.user) {
          throw new Error(response.error || 'Unable to load the signed-in user.');
        }
        if (isCurrent) {
          const user = response.user;
          const isAdmin = user.role === 'admin';
          setAdmin({
            id: user.id,
            name: user.name || user.email.split('@')[0],
            title: isAdmin ? 'System Manager' : 'Business User',
            email: user.email,
            badge: isAdmin ? 'Administrator' : 'User',
          });
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setDatabaseError(error instanceof Error ? error.message : 'Unable to load admin profile.');
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [setAdmin]);

  if (loading) {
    return (
      <div className="w-full h-32 bg-surface border border-surface-border rounded-2xl p-5 shadow-sm flex items-center justify-center">
        <MiniLoader size="sm" variant="brand" />
      </div>
    );
  }

  if (databaseError) {
    return (
      <div className="w-full bg-surface border border-red-500/30 rounded-2xl p-4 sm:p-5">
        <p className="text-xs text-red-400">{databaseError}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-bold text-content-primary">
          {admin.name} <span className="text-content-secondary font-medium">{admin.title}</span>
        </h2>
        <p className="text-xs sm:text-sm font-mono text-content-muted">{admin.email}</p>
      </div>

      <div className="self-start sm:self-center">
        <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-surface-subtle border border-surface-border text-[11px] font-mono font-semibold text-content-primary">
          {admin.badge}
        </span>
      </div>
    </div>
  );
}
