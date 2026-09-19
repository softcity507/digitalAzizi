'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';
import { ExchangeCurrencyCode, ExchangeType } from '@/types/exchange';
import { CUSTOMER_ACCOUNTS } from '@/data/customerData';

export default function ExchangeEditModal() {
  const t = useTranslations('ExchangeDesk');
  const { editingTransaction, closeEditModal, updateTransaction } = useExchangeDeskStore();

  const [customerId, setCustomerId] = useState(() => editingTransaction?.customerId || '');
  const [giveAmount, setGiveAmount] = useState(() => editingTransaction?.giveAmount.toString() || '');
  const [giveCurrency, setGiveCurrency] = useState<ExchangeCurrencyCode>(
    () => editingTransaction?.giveCurrency || 'USD'
  );
  const [calcMode, setCalcMode] = useState<'multiply' | 'divide'>(
    () => editingTransaction?.calcMode || 'multiply'
  );
  const [exchangeRate, setExchangeRate] = useState(() => editingTransaction?.exchangeRate.toString() || '');
  const [getCurrency, setGetCurrency] = useState<ExchangeCurrencyCode>(
    () => editingTransaction?.getCurrency || 'AFN'
  );
  const [type, setType] = useState<ExchangeType>(() => editingTransaction?.type || 'SELL');
  const [memo, setMemo] = useState(() => editingTransaction?.memo || '');

  const matchedCustomer = CUSTOMER_ACCOUNTS.find((c) => c.id === customerId);
  const userCurrencies = (matchedCustomer?.balances?.map((b) => b.currency) || [
    'USD',
    'AFN',
    'PKR',
  ]) as ExchangeCurrencyCode[];

  if (!editingTransaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const gAmt = parseFloat(giveAmount);
    const rate = parseFloat(exchangeRate);

    if (isNaN(gAmt) || gAmt <= 0 || isNaN(rate) || rate <= 0) {
      alert(t('validationError'));
      return;
    }

    const currentCustomer = CUSTOMER_ACCOUNTS.find((c) => c.id === customerId);
    const customerName = currentCustomer ? currentCustomer.name : editingTransaction.customerName;

    updateTransaction(editingTransaction.id, {
      customerId,
      customerName,
      giveAmount: gAmt,
      giveCurrency,
      calcMode,
      exchangeRate: rate,
      getCurrency,
      type,
      memo: memo || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand font-bold text-sm">
              ✎
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('editExchange')}</h2>
          </div>
          <button
            type="button"
            onClick={closeEditModal}
            aria-label={t('cancel')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Customer */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              {t('customer')}
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-surface-input border border-surface-border text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-brand"
            >
              {CUSTOMER_ACCOUNTS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              {t('transactionType')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('BUY')}
                className={`py-2 rounded-xl text-xs font-black transition-all border ${
                  type === 'BUY'
                    ? 'bg-[#38bdf8]/20 border-[#38bdf8] text-[#38bdf8]'
                    : 'bg-surface-input border-surface-border text-slate-400'
                }`}
              >
                {t('buy')}
              </button>
              <button
                type="button"
                onClick={() => setType('SELL')}
                className={`py-2 rounded-xl text-xs font-black transition-all border ${
                  type === 'SELL'
                    ? 'bg-[#fda4af] text-black font-black border-[#fda4af]'
                    : 'bg-surface-input border-surface-border text-slate-400'
                }`}
              >
                {t('sell')}
              </button>
            </div>
          </div>

          {/* Give Amount & Currency */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                {t('youGive')}
              </label>
              <input
                type="number"
                step="any"
                required
                value={giveAmount}
                onChange={(e) => setGiveAmount(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-input border border-surface-border text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                Currency
              </label>
              <select
                value={giveCurrency}
                onChange={(e) => setGiveCurrency(e.target.value as ExchangeCurrencyCode)}
                className="w-full h-11 px-2.5 rounded-xl bg-surface-input border border-surface-border text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-brand uppercase"
              >
                {userCurrencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Operation Mode (Multiply vs Divide) & Rate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t('exchangeRate')}
              </label>
              <div className="flex items-center gap-1 bg-surface-subtle border border-surface-border rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setCalcMode('multiply')}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all ${
                    calcMode === 'multiply'
                      ? 'bg-[#38bdf8] text-black font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ✖ Multiply
                </button>
                <button
                  type="button"
                  onClick={() => setCalcMode('divide')}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded transition-all ${
                    calcMode === 'divide'
                      ? 'bg-[#38bdf8] text-black font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ➗ Divide
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  type="number"
                  step="any"
                  required
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  placeholder={calcMode === 'multiply' ? '278.4' : '1500'}
                  className="w-full h-11 px-3 rounded-xl bg-surface-input border border-surface-border text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <select
                  value={getCurrency}
                  onChange={(e) => setGetCurrency(e.target.value as ExchangeCurrencyCode)}
                  className="w-full h-11 px-2.5 rounded-xl bg-surface-input border border-surface-border text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-brand uppercase"
                >
                  {userCurrencies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Memo */}
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              {t('memo')}
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="e.g. Herat Sarraf settlement"
              className="w-full h-11 px-3.5 rounded-xl bg-surface-input border border-surface-border text-slate-900 dark:text-white text-sm focus:outline-none focus:border-brand"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={closeEditModal}
              className="w-1/2 h-11 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-slate-600 dark:text-slate-300 font-bold text-sm transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="w-1/2 h-11 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-sm transition-all shadow-glow-brand cursor-pointer"
            >
              {t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
