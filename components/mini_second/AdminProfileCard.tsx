'use client';

import { useSettingsStore } from '@/store/useSettingsStore';

export default function AdminProfileCard() {
  const { admin } = useSettingsStore();

  return (
    <div className="w-full bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
      <div className="space-y-1">
        <h2 className="text-base sm:text-lg font-bold text-content-primary">
          {admin.name} — <span className="text-content-secondary font-medium">{admin.title}</span>
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
