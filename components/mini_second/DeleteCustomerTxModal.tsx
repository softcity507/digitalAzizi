'use client';

import { useTranslations } from 'next-intl';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';

export default function DeleteCustomerTxModal() {
  const t = useTranslations('CustomerDetails');
  const { activeModal, closeModal, deleteTransaction, deletingTransactionId } =
    useCustomerDetailsStore();

  if (activeModal !== 'delete' || !deletingTransactionId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center text-xl">
          🗑️
        </div>

        <h3 className="text-base font-bold text-content-primary">{t('deleteConfirmTitle')}</h3>
        <p className="text-xs text-content-muted leading-relaxed">
          {t('deleteConfirmDesc')}
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={closeModal}
            className="w-1/2 h-10 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-content-muted font-semibold text-xs transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={() => deleteTransaction(deletingTransactionId)}
            className="w-1/2 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
