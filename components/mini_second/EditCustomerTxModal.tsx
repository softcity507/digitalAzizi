'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CustomerTransaction } from '@/types/customer';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';

interface EditFormProps {
  transaction: CustomerTransaction;
  onClose: () => void;
  onSave: (id: string, data: Partial<CustomerTransaction>) => Promise<void>;
}

const inputClass = 'w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand';

function EditForm({ transaction, onClose, onSave }: EditFormProps) {
  const t = useTranslations('CustomerDetails');
  const tCash = useTranslations('CashBook');
  // Rows from customer_ledger_transactions are saved to Supabase; their title and
  // reference number are derived (type / serial_no), so type and date are edited instead.
  const isLedgerRow = transaction.id.startsWith('customer-ledger:');
  const [title, setTitle] = useState(transaction.title);
  const [type, setType] = useState<'cash_in' | 'cash_out'>(transaction.isCredit ? 'cash_in' : 'cash_out');
  const [date, setDate] = useState(transaction.date);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [notes, setNotes] = useState(transaction.notes || '');
  const [refNo, setRefNo] = useState(transaction.refNo || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    if (isLedgerRow ? !date : !title.trim()) return;

    setSaving(true);
    setError('');
    try {
      await onSave(transaction.id, isLedgerRow
        ? { category: type, amount: parsedAmount, date, notes: notes.trim() || undefined }
        : {
            title: title.trim(),
            amount: parsedAmount,
            notes: notes.trim() || undefined,
            refNo: refNo.trim() || undefined,
          });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {isLedgerRow ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-content-muted mb-1">{tCash('entryType')}</label>
            <select value={type} onChange={(e) => setType(e.target.value as 'cash_in' | 'cash_out')} className={inputClass}>
              <option value="cash_in">{tCash('cashIn')}</option>
              <option value="cash_out">{tCash('cashOut')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-content-muted mb-1">{tCash('date')}</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputClass} />
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-content-muted mb-1">{t('title')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-content-muted mb-1">{t('amount')}</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          min={isLedgerRow ? '0.000001' : '1'}
          step="any"
          className={inputClass}
        />
      </div>

      {!isLedgerRow && (
        <div>
          <label className="block text-xs font-semibold text-content-muted mb-1">{t('refNo')}</label>
          <input
            type="text"
            value={refNo}
            onChange={(e) => setRefNo(e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-content-muted mb-1">{isLedgerRow ? tCash('memo') : t('notes')}</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={inputClass}
        />
      </div>

      {error && <p role="alert" className="text-xs text-debit">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="w-1/2 h-10 rounded bg-surface-subtle hover:bg-surface-hover border border-surface-border text-content-muted text-xs font-semibold cursor-pointer"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="w-1/2 h-10 rounded bg-brand text-brand-contrast font-bold text-xs hover:opacity-95 cursor-pointer shadow-sm disabled:opacity-50"
        >
          {saving ? '…' : t('saveChanges')}
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
      <div className="bg-surface border border-surface-border rounded p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-surface-border">
          <h3 className="text-base font-bold text-content-primary">{t('editTransaction')}</h3>
          <button
            type="button"
            onClick={closeModal}
            className="p-1 rounded text-content-muted hover:text-content-primary"
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
