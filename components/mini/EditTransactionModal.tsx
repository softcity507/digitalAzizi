'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';
import { CurrencyCode, TransactionType } from '@/types/cashbook';
import { CUSTOMER_ACCOUNTS } from '@/data/customerData';

export default function EditTransactionModal() {
  const t = useTranslations('CashBook');
  const { activeModal, closeModal, updateTransaction, editingTransaction } =
    useCashBookStore();

  // Initialize state directly from editingTransaction using fallback values
  const [customerName, setCustomerName] = useState(() => editingTransaction?.customerName || '');
  const [amount, setAmount] = useState(() => editingTransaction?.amount?.toString() || '');
  const [currency, setCurrency] = useState<CurrencyCode>(() => editingTransaction?.currency || 'PKR');
  const [type, setType] = useState<TransactionType>(() => editingTransaction?.type || 'cash_in');
  const [memo, setMemo] = useState(() => editingTransaction?.memo || '');
  const [serialNo, setSerialNo] = useState(() => editingTransaction?.serialNo || '');
  const [date, setDate] = useState(() => editingTransaction?.date || '');
  const [time, setTime] = useState(() => editingTransaction?.time || '');

  if (activeModal !== 'edit' || !editingTransaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!customerName.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert(t('editValidationError'));
      return;
    }

    updateTransaction(editingTransaction.id, {
      customerName: customerName.trim(),
      amount: numAmount,
      currency,
      type,
      date,
      time,
      memo: memo.trim() || undefined,
      serialNo: serialNo.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-surface-hover border border-surface-border flex items-center justify-center text-[#38bdf8] font-bold">
              ✎
            </div>
            <h2 className="text-lg font-bold text-white">{t('editTransaction')}</h2>
          </div>
          <button
            type="button"
            onClick={closeModal}
            aria-label={t('cancel')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type Radio Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              {t('entryType')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('cash_in')}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${type === 'cash_in'
                  ? 'bg-[#34d399]/20 border-[#34d399] text-[#34d399]'
                  : 'bg-surface-input border-surface-border text-slate-400'
                  }`}
              >
                {t('cashInBtn')}
              </button>
              <button
                type="button"
                onClick={() => setType('cash_out')}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${type === 'cash_out'
                  ? 'bg-[#fda4af]/20 border-[#fda4af] text-[#fda4af]'
                  : 'bg-surface-input border-surface-border text-slate-400'
                  }`}
              >
                {t('cashOutBtn')}
              </button>
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              {t('customerName')}
            </label>
            <input
              type="text"
              list="customers-list-edit"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t('customerPlaceholder')}
              className="w-full h-11 px-3.5 rounded-xl bg-surface-input border border-surface-border text-white text-sm focus:outline-none focus:border-brand"
            />
            <datalist id="customers-list-edit">
              {CUSTOMER_ACCOUNTS.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t('amount')}
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-surface-input border border-surface-border text-white text-sm font-mono focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t('currency')}
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full h-11 px-2.5 rounded-xl bg-surface-input border border-surface-border text-white text-sm font-semibold focus:outline-none focus:border-brand"
              >
                <option value="PKR">PKR</option>
                <option value="AFN">AFN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t('date')}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-input border border-surface-border text-white text-xs focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t('time')}
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-input border border-surface-border text-white text-xs font-mono focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Serial & Memo */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t('serial')}
              </label>
              <input
                type="text"
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-input border border-surface-border text-white text-xs font-mono focus:outline-none focus:border-brand"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t('memo')}
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-input border border-surface-border text-white text-xs focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={closeModal}
              className="w-1/2 h-11 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-slate-300 font-semibold text-sm transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="w-1/2 h-11 rounded-xl bg-brand hover:bg-brand-hover text-black font-bold text-sm transition-all shadow-glow-brand cursor-pointer"
            >
              {t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}