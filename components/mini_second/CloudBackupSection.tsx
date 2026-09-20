'use client';

import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function CloudBackupSection() {
  const t = useTranslations('Settings');
  const { lastSynced, auditLogs, triggerBackup, triggerRestore, openModal } = useSettingsStore();

  const handleDownloadPersonalData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      system: 'DigitalAzizi Hawala Cloud Vault',
      status: 'encrypted_backup',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `digitalazizi_personal_ledger_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-content-primary">
          {t('cloudBackupTitle')}
        </h3>
        <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
          {t('encrypted')}
        </span>
      </div>

      <div className="bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="space-y-1">
          <h4 className="text-sm sm:text-base font-bold text-content-primary">
            {t('googleDriveSync')}
          </h4>
          <p className="text-xs text-content-muted font-mono">{lastSynced}</p>
        </div>

        {/* Dual Backup / Restore Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={triggerBackup}
            className="py-3 px-4 rounded-xl bg-sky-400 hover:bg-sky-500 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer text-center"
          >
            {t('backupNow')}
          </button>
          <button
            type="button"
            onClick={triggerRestore}
            className="py-3 px-4 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-content-primary font-bold text-xs sm:text-sm transition-colors cursor-pointer text-center"
          >
            {t('restoreBackup')}
          </button>
        </div>
      </div>

      {/* Action Links List */}
      <div className="bg-surface border border-surface-border rounded-2xl divide-y divide-surface-border overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={handleDownloadPersonalData}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-surface-hover/40 transition-colors cursor-pointer"
        >
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-content-primary">{t('downloadData')}</h4>
            <p className="text-xs text-content-muted">{t('downloadDataSubtitle')}</p>
          </div>
          <span className="text-content-muted text-lg font-bold">›</span>
        </button>

        <button
          type="button"
          onClick={() => openModal('audit_log')}
          className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-surface-hover/40 transition-colors cursor-pointer"
        >
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-content-primary">{t('recycleBinTitle')}</h4>
            <p className="text-xs text-content-muted">{t('recycleBinSubtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-surface-subtle border border-surface-border text-content-muted">
              {t('itemsCount', { count: auditLogs.length })}
            </span>
            <span className="text-content-muted text-lg font-bold">›</span>
          </div>
        </button>
      </div>
    </div>
  );
}
