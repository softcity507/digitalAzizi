'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/store/useSettingsStore';
import { CurrencyCode } from '@/types/customer';

const DEFAULT_CURRENCIES: CurrencyCode[] = ['AFN', 'USD', 'PKR'];

export default function AddBussinessModal() {
  const t = useTranslations('Settings');
  const { activeModal, closeModal, addUser, businesses } = useSettingsStore();
  const activeBusiness = businesses.find((business) => business.isActive) || businesses[0];
  const businessCurrencies = activeBusiness?.supportedCurrencies ?? DEFAULT_CURRENCIES;
   // Initial State: First Name, Last Name, Phone, Address
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Initial Amount Section: Amount, Currency, Description
  const [amount, setAmount] = useState('');
  const [amountCurrency, setAmountCurrency] = useState<CurrencyCode>('AFN');
  const [amountDescription, setAmountDescription] = useState('');

  if (activeModal !== 'add_customer') return null;

  const handleClose = () => {
    setFirstName('');
    setLastName('');
    setPhone('');
    setAddress('');
    setAmount('');
    setAmountCurrency('AFN');
    setAmountDescription('');
    closeModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    if (!trimmedFirst) return;

    const fullName = [trimmedFirst, trimmedLast].filter(Boolean).join(' ');
    const fullSubtitle = [
      amountDescription.trim(),
      phone.trim(),
      address.trim(),
    ].filter(Boolean).join(' • ') || 'Business Account';

    const numAmount = parseFloat(amount);
    const initialBalances: Partial<Record<CurrencyCode, number>> = {};
    if (!isNaN(numAmount) && numAmount > 0) {
      initialBalances[amountCurrency] = numAmount;
    }

    // Default supported currencies around the selected amount currency
    const finalCurrencies = businessCurrencies;

    const trimmedNotes = amountDescription.trim() || 'Opening balance';

    addUser(
      fullName,
      fullSubtitle,
      finalCurrencies,
      'Business',
      initialBalances,
      'en',
      trimmedNotes
    );

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-surface-border">
          <h3 className="text-base font-bold text-content-primary">{t('addNewBusiness')}</h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-content-muted hover:text-content-primary cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 1. Name Section: First Name & Last Name */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Wahid"
                required
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Sarraf"
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          {/* 2. Contact Section: Phone & Address */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +93 700 000 000"
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Herat Bazaar #12"
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          {/* 3. Initial Amount & Currency Selection */}
          <div className="p-3.5 rounded-2xl bg-surface-subtle/50 border border-surface-border space-y-2.5">
            <span className="block text-xs font-bold uppercase tracking-wider text-content-primary">
              Opening Balance / Initial Amount
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-content-muted mb-1">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-sm font-mono text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-content-muted mb-1">Currency</label>
                <select
                  value={amountCurrency}
                  onChange={(e) => setAmountCurrency(e.target.value as CurrencyCode)}
                  className="w-full h-[38px] px-2.5 rounded-xl bg-surface border border-surface-border text-sm font-bold text-content-primary focus:outline-none focus:ring-1 focus:ring-brand uppercase cursor-pointer"
                >
                  {businessCurrencies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-content-muted mb-1">Amount Description</label>
              <input
                type="text"
                value={amountDescription}
                onChange={(e) => setAmountDescription(e.target.value)}
                placeholder="e.g. Initial capital deposit / vault opening"
                className="w-full px-3 py-2 rounded-xl bg-surface border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          {/* Modal Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="w-1/2 h-10 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-content-muted text-xs font-semibold cursor-pointer transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={!firstName.trim()}
              className="w-1/2 h-10 rounded-xl bg-sky-400 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs cursor-pointer shadow-sm transition-all"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
