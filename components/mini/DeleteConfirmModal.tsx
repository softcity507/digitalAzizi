'use client';

import { useTranslations } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';

export default function DeleteConfirmModal() {
  const t = useTranslations('CashBook');
  const { activeModal, closeModal, deleteTransaction, deletingTransactionId } =
    useCashBookStore();

  if (activeModal !== 'delete' || !deletingTransactionId) return null;

  const handleConfirm = () => {
    deleteTransaction(deletingTransactionId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/30 flex items-center justify-center text-2xl">
          🗑️
        </div>

        <h3 className="text-lg font-bold text-white">{t('deleteConfirmTitle')}</h3>
        <p className="text-xs text-slate-300">
          {t('deleteConfirmDesc')}
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={closeModal}
            className="w-1/2 h-11 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-slate-300 font-semibold text-sm transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="w-1/2 h-11 rounded-xl bg-[#f87171] hover:bg-red-600 text-white font-bold text-sm transition-all shadow-glow-debit cursor-pointer"
          >
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
