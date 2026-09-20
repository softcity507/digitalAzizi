'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function AddCustomerModal() {
  const t = useTranslations('Settings');
  const { activeModal, closeModal, addUser } = useSettingsStore();
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');

  if (activeModal !== 'add_customer') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addUser(name.trim(), subtitle.trim() || 'Customer Account');
    setName('');
    setSubtitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-border">
          <h3 className="text-base font-bold text-content-primary">{t('addNewCustomer')}</h3>
          <button
            type="button"
            onClick={closeModal}
            className="p-1 rounded-lg text-content-muted hover:text-content-primary cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-content-muted mb-1">{t('customerName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wahid Sarraf"
              required
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-content-muted mb-1">{t('customerDescription')}</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Sarraf, Herat Bazaar"
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="w-1/2 h-10 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-content-muted text-xs font-semibold cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="w-1/2 h-10 rounded-xl bg-sky-400 hover:bg-sky-500 text-slate-950 font-bold text-xs cursor-pointer shadow-sm"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
