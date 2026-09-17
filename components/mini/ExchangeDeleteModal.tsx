'use client';

import { useTranslations } from 'next-intl';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';

export default function ExchangeDeleteModal() {
  const t = useTranslations('ExchangeDesk');
  const { deletingTransactionId, closeDeleteModal, deleteTransaction } = useExchangeDeskStore();

  if (!deletingTransactionId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
        {/* Warning Icon */}
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center text-2xl font-bold">
          🗑
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            {t('deleteExchange')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {t('deleteConfirmDesc')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={closeDeleteModal}
            className="w-1/2 h-11 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-700 dark:text-slate-300 font-bold text-sm transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={() => deleteTransaction(deletingTransactionId)}
            className="w-1/2 h-11 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm transition-all shadow-md shadow-rose-500/20 cursor-pointer"
          >
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
