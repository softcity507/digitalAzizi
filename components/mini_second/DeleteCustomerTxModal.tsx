'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';

export default function DeleteCustomerTxModal() {
  const t = useTranslations('CustomerDetails');
  const { activeModal, closeModal, deleteTransaction, deletingTransactionId } =
    useCustomerDetailsStore();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (activeModal !== 'delete' || !deletingTransactionId) return null;

  const handleClose = () => {
    setError('');
    closeModal();
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await deleteTransaction(deletingTransactionId);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border rounded p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
        <div className="w-12 h-12 mx-auto rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center text-xl">
          🗑️
        </div>

        <h3 className="text-base font-bold text-content-primary">{t('deleteConfirmTitle')}</h3>
        <p className="text-xs text-content-muted leading-relaxed">
          {t('deleteConfirmDesc')}
        </p>
        {error && <p role="alert" className="text-xs text-debit">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="w-1/2 h-10 rounded bg-surface-subtle hover:bg-surface-hover border border-surface-border text-content-muted font-semibold text-xs transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="w-1/2 h-10 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {deleting ? '…' : t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
