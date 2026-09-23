'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';
import { CurrencyCode } from '@/types/cashbook';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function CashOutModal() {
  const t = useTranslations('CashBook');
  const { activeModal, closeModal, addTransaction, selectedDate } = useCashBookStore();
  const customers = useSettingsStore((state) => state.customers);

  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>('PKR');
  const [memo, setMemo] = useState('');
  const [serialNo, setSerialNo] = useState(() => `CB-${Math.floor(1000 + Math.random() * 9000)}`);
  const [date, setDate] = useState(selectedDate);

  if (activeModal !== 'cash_out') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!customerName.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert(t('validationError'));
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    addTransaction({
      customerName: customerName.trim(),
      type: 'cash_out',
      amount: numAmount,
      currency,
      date,
      time: timeStr,
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
            <div className="w-8 h-8 rounded-xl bg-[#fda4af]/20 border border-[#fda4af]/40 flex items-center justify-center text-[#fda4af] font-bold">
              -
            </div>
            <h2 className="text-lg font-bold text-white">{t('recordCashOut')}</h2>
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
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              {t('beneficiaryName')}
            </label>
            <input
              type="text"
              list="customers-list-out"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t('beneficiaryPlaceholder')}
              className="w-full h-11 px-3.5 rounded-xl bg-surface-input border border-surface-border text-white text-sm focus:outline-none focus:border-brand"
            />
            <datalist id="customers-list-out">
              {customers.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t('amountPaidOut')}
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
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

          {/* Date & Serial */}
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
                {t('serialVoucher')}
              </label>
              <input
                type="text"
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-input border border-surface-border text-white text-xs font-mono focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Memo / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              {t('memo')}
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={t('memoCashOutPlaceholder')}
              className="w-full h-11 px-3.5 rounded-xl bg-surface-input border border-surface-border text-white text-sm focus:outline-none focus:border-brand"
            />
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
              className="w-1/2 h-11 rounded-xl bg-[#fda4af] hover:bg-[#f87171] text-black font-bold text-sm transition-all shadow-glow-debit cursor-pointer"
            >
              {t('confirmCashOut')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
