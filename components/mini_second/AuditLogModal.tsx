'use client';

import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function AuditLogModal() {
  const t = useTranslations('Settings');
  const { activeModal, closeModal, auditLogs } = useSettingsStore();

  if (activeModal !== 'audit_log') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-content-primary">{t('recycleBinTitle')}</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-subtle border border-surface-border text-content-muted">
              {auditLogs.length}
            </span>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="p-1 rounded-lg text-content-muted hover:text-content-primary cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3.5 rounded-xl bg-surface-subtle border border-surface-border space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-content-primary">{log.title}</h4>
                <span className="text-[10px] font-mono text-content-muted">{log.date}</span>
              </div>
              <p className="text-[11px] text-content-muted">{log.description}</p>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={closeModal}
            className="w-full h-10 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-content-primary text-xs font-semibold cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
