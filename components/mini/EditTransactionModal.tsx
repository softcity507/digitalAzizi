'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';
import { CurrencyCode, TransactionType } from '@/types/cashbook';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function EditTransactionModal() {
  const t = useTranslations('CashBook');
  const { activeModal, closeModal, updateTransaction, editingTransaction } =
    useCashBookStore();
  const businesses = useSettingsStore((state) => state.businesses);
  const allCustomers = useSettingsStore((state) => state.customers);
  const activeBusiness = businesses.find((b) => b.isActive) || businesses[0];
  const customers = activeBusiness ? allCustomers.filter((c) => c.businessId === activeBusiness.id) : allCustomers;
  const availableCurrencies: CurrencyCode[] = activeBusiness?.supportedCurrencies ?? [];

  // Initialize state directly from editingTransaction using fallback values
  const [customerName, setCustomerName] = useState(() => editingTransaction?.customerName || '');
  const [fromCustomer, setFromCustomer] = useState(() => editingTransaction?.fromCustomer || '');
  const [toCustomer, setToCustomer] = useState(() => editingTransaction?.toCustomer || '');
  const [amount, setAmount] = useState(() => editingTransaction?.amount?.toString() || '');
  const [currency, setCurrency] = useState<CurrencyCode>(() => editingTransaction?.currency || 'PKR');
  const [type, setType] = useState<TransactionType>(() => editingTransaction?.type || 'cash_in');
  const [memo, setMemo] = useState(() => editingTransaction?.memo || '');
  const [serialNo, setSerialNo] = useState(() => editingTransaction?.serialNo || '');
  const [date, setDate] = useState(() => editingTransaction?.date || '');
  const [time, setTime] = useState(() => editingTransaction?.time || '');
  const isCustomerTransfer = editingTransaction?.type === 'exchange'
    && Boolean(editingTransaction.fromCustomer && editingTransaction.toCustomer);
  const selectedCurrency = availableCurrencies.includes(currency) ? currency : availableCurrencies[0];

  if (activeModal !== 'edit' || !editingTransaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isCustomerTransfer) {
      const senderAccount = customers.find(
        (customer) => customer.name.toLowerCase() === fromCustomer.trim().toLowerCase()
      );
      const receiverAccount = customers.find(
        (customer) => customer.name.toLowerCase() === toCustomer.trim().toLowerCase()
      );

      if (!senderAccount || !receiverAccount || isNaN(numAmount) || numAmount <= 0 || !selectedCurrency) {
        alert(t('editValidationError'));
        return;
      }
      if (senderAccount.id === receiverAccount.id) {
        alert(t('sameUserWarning'));
        return;
      }

      updateTransaction(editingTransaction.id, {
        customerId: senderAccount.id,
        customerName: `${senderAccount.name} ➔ ${receiverAccount.name}`,
        fromCustomer: senderAccount.name,
        toCustomer: receiverAccount.name,
        amount: numAmount,
        currency: selectedCurrency,
        type: 'exchange',
        exchangeDetails: {
          ...editingTransaction.exchangeDetails,
          fromUser: senderAccount.name,
          toUser: receiverAccount.name,
          fromCurrency: selectedCurrency,
          fromAmount: numAmount,
          toCurrency: selectedCurrency,
          toAmount: numAmount,
          rate: 1,
        },
        date,
        time,
        memo: memo.trim() || undefined,
        serialNo: serialNo.trim() || undefined,
      });
      return;
    }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-surface-hover border border-surface-border flex items-center justify-center text-brand font-bold">
              ✎
            </div>
              <h2 className="text-lg font-bold text-content-primary">{t('editTransaction')}</h2>
          </div>
          <button
            type="button"
            onClick={closeModal}
            aria-label={t('cancel')}
            className="p-1 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-hover transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type Radio Selector */}
          {!isCustomerTransfer && <div>
            <label className="block text-xs font-semibold text-content-muted mb-1.5">
              {t('entryType')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('cash_in')}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${type === 'cash_in'
                  ? 'bg-credit-subtle border-credit text-credit'
                  : 'bg-surface-input border-surface-border text-content-secondary'
                  }`}
              >
                {t('cashInBtn')}
              </button>
              <button
                type="button"
                onClick={() => setType('cash_out')}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${type === 'cash_out'
                  ? 'bg-debit-subtle border-debit text-debit'
                  : 'bg-surface-input border-surface-border text-content-secondary'
                  }`}
              >
                {t('cashOutBtn')}
              </button>
            </div>
          </div>}

          {/* Customer Name */}
          {isCustomerTransfer ? (
            <div className="bg-canvas/80 rounded-2xl p-3.5 border border-surface-border/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-content-secondary">
                <span>{t('interUserBridge')}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFromCustomer(toCustomer);
                    setToCustomer(fromCustomer);
                  }}
                  className="text-[11px] text-brand hover:bg-brand-subtle flex items-center gap-1 px-2.5 py-1 rounded-xl bg-brand-subtle border border-brand/30 transition-all font-semibold"
                >
                  {t('transferBtn')} ⇄
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-content-secondary">{t('senderWallet')}</label>
                  <input
                    type="text"
                    list="customers-list-edit-from"
                    required
                    value={fromCustomer}
                    onChange={(e) => setFromCustomer(e.target.value)}
                    placeholder={t('senderPlaceholder')}
                    className="w-full h-11 px-3 rounded-xl bg-surface-input border border-debit/30 text-content-primary text-xs sm:text-sm font-semibold focus:outline-none focus:border-debit"
                  />
                  <datalist id="customers-list-edit-from">
                    {customers.map((customer) => <option key={customer.id} value={customer.name} />)}
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-content-secondary">{t('receiverWallet')}</label>
                  <input
                    type="text"
                    list="customers-list-edit-to"
                    required
                    value={toCustomer}
                    onChange={(e) => setToCustomer(e.target.value)}
                    placeholder={t('receiverPlaceholder')}
                    className="w-full h-11 px-3 rounded-xl bg-surface-input border border-credit/30 text-content-primary text-xs sm:text-sm font-semibold focus:outline-none focus:border-credit"
                  />
                  <datalist id="customers-list-edit-to">
                    {customers.map((customer) => <option key={customer.id} value={customer.name} />)}
                  </datalist>
                </div>
              </div>
            </div>
          ) : <div>
            <label className="block text-xs font-semibold text-content-muted mb-1">
              {t('customerName')}
            </label>
            <input
              type="text"
              list="customers-list-edit"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t('customerPlaceholder')}
              className="w-full h-11 px-3.5 rounded-xl bg-surface-input border border-surface-border text-content-primary text-sm focus:outline-none focus:border-brand"
            />
            <datalist id="customers-list-edit">
              {customers.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>}

          {/* Amount & Currency */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-content-muted mb-1">
                {isCustomerTransfer ? t('transferOutAmount') : t('amount')}
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-surface-input border border-surface-border text-content-primary text-sm font-mono focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">
                {t('currency')}
              </label>
              <select
                value={isCustomerTransfer ? selectedCurrency ?? '' : currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                disabled={isCustomerTransfer && availableCurrencies.length === 0}
                className="w-full h-11 px-2.5 rounded-xl bg-surface-input border border-surface-border text-content-primary text-sm font-semibold focus:outline-none focus:border-brand"
              >
                {isCustomerTransfer
                  ? availableCurrencies.map((availableCurrency) => (
                    <option key={availableCurrency} value={availableCurrency}>{availableCurrency}</option>
                  ))
                  : <>
                    <option value="PKR">PKR</option>
                    <option value="AFN">AFN</option>
                    <option value="USD">USD</option>
                  </>}
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">
                {t('date')}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-input border border-surface-border text-content-primary text-xs focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">
                {t('time')}
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-input border border-surface-border text-content-primary text-xs font-mono focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Serial & Memo */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">
                {t('serial')}
              </label>
              <input
                type="text"
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-input border border-surface-border text-content-primary text-xs font-mono focus:outline-none focus:border-brand"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-content-muted mb-1">
                {t('memo')}
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-input border border-surface-border text-content-primary text-xs focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={closeModal}
              className="w-1/2 h-11 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-content-secondary font-semibold text-sm transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="w-1/2 h-11 rounded-xl bg-brand hover:bg-brand-hover text-brand-foreground font-bold text-sm transition-all shadow-glow-brand cursor-pointer"
            >
              {t('saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}