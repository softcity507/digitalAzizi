'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CustomerTransaction } from '@/types/customer';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';

interface EditFormProps {
  transaction: CustomerTransaction;
  onClose: () => void;
  onSave: (id: string, data: Partial<CustomerTransaction>) => void;
}

function EditForm({ transaction, onClose, onSave }: EditFormProps) {
  const t = useTranslations('CustomerDetails');
  const [title, setTitle] = useState(transaction.title);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [notes, setNotes] = useState(transaction.notes || '');
  const [refNo, setRefNo] = useState(transaction.refNo || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSave(transaction.id, {
      title: title.trim(),
      amount: parsedAmount,
      notes: notes.trim() || undefined,
      refNo: refNo.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-content-muted mb-1">{t('title')}</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-content-muted mb-1">{t('amount')}</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min="1"
          step="any"
          className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-content-muted mb-1">{t('refNo')}</label>
        <input
          type="text"
          value={refNo}
          onChange={(e) => setRefNo(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-content-muted mb-1">{t('notes')}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="w-1/2 h-10 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-content-muted text-xs font-semibold cursor-pointer"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          className="w-1/2 h-10 rounded-xl bg-brand text-brand-contrast font-bold text-xs hover:opacity-95 cursor-pointer shadow-sm"
        >
          {t('saveChanges')}
        </button>
      </div>
    </form>
  );
}

export default function EditCustomerTxModal() {
  const t = useTranslations('CustomerDetails');
  const { activeModal, editingTransaction, closeModal, updateTransaction } = useCustomerDetailsStore();

  if (activeModal !== 'edit' || !editingTransaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-border">
          <h3 className="text-base font-bold text-content-primary">{t('editTransaction')}</h3>
          <button
            type="button"
            onClick={closeModal}
            className="p-1 rounded-lg text-content-muted hover:text-content-primary"
          >
            ✕
          </button>
        </div>

        <EditForm
          key={editingTransaction.id}
          transaction={editingTransaction}
          onClose={closeModal}
          onSave={updateTransaction}
        />
      </div>
    </div>
  );
}
