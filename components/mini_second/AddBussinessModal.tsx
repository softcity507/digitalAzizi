'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/store/useSettingsStore';
import { CurrencyCode } from '@/types/customer';

const INITIAL_FORM_STATE = {
  firstName: '',
  lastName: '',
  phone: '',
  address: '',
  amount: '',
  amountCurrency: 'AFN' as CurrencyCode,
  amountDescription: '',
};

export default function AddBussinessModal() {
  const t = useTranslations('Settings');
  const { activeModal, closeModal, addUser, businesses, customers } = useSettingsStore();
  const [saveError, setSaveError] = useState<string | null>(null);
  const activeBusiness = businesses.find((business) => business.isActive) || businesses[0];
  const businessCurrencies = activeBusiness?.supportedCurrencies ?? [];
  const [formData, setFormData] = useState({ ...INITIAL_FORM_STATE });
  const selectedAmountCurrency = businessCurrencies.includes(formData.amountCurrency)
    ? formData.amountCurrency
    : businessCurrencies[0];

  if (activeModal !== 'add_customer') return null;

  const handleClose = () => {
    setFormData({ ...INITIAL_FORM_STATE });
    setSaveError(null);
    closeModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    const trimmedFirst = formData.firstName.trim();
    const trimmedLast = formData.lastName.trim();
    if (!trimmedFirst) {
      setSaveError('First name is required.');
      return;
    }

    const normalizedPhone = formData.phone.replace(/\D/g, '');
    if (normalizedPhone && (normalizedPhone.length < 7 || normalizedPhone.length > 15)) {
      setSaveError('Enter a valid phone number with 7 to 15 digits.');
      return;
    }

    const fullName = [trimmedFirst, trimmedLast].filter(Boolean).join(' ');
    const normalizedName = fullName.toLowerCase();
    if (customers.some((customer) =>
      customer.businessId === activeBusiness?.id && customer.name.trim().toLowerCase() === normalizedName
    )) {
      setSaveError('A customer with this name already exists in this business.');
      return;
    }
    const fullSubtitle = [
      formData.amountDescription.trim(),
      formData.phone.trim(),
      formData.address.trim(),
    ].filter(Boolean).join(' • ') || 'Business Account';

    const amountText = formData.amount.trim();
    const numAmount = amountText ? Number(amountText) : 0;
    if (amountText && (!Number.isFinite(numAmount) || numAmount <= 0)) {
      setSaveError('Initial balance must be greater than 0 when provided.');
      return;
    }
    if (amountText && !selectedAmountCurrency) {
      setSaveError('Select a business with supported currencies before adding an opening balance.');
      return;
    }

    // Persist an explicit value for every supported currency so currencies with
    // zero opening balances are not lost when the customer is loaded again.
    const initialBalances: Partial<Record<CurrencyCode, number>> = Object.fromEntries(
      businessCurrencies.map((currency) => [currency, amountText && currency === selectedAmountCurrency ? numAmount : 0])
    );

    const trimmedNotes = formData.amountDescription.trim();

    try {
      await addUser(
        fullName,
        fullSubtitle,
        businessCurrencies,
        'Business',
        initialBalances,
        'en',
        trimmedNotes,
        normalizedPhone,
        formData.address.trim()
      );
      handleClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save this customer.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border rounded p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-surface-border">
          <h3 className="text-base font-bold text-content-primary"> {t('addNewCustomer')}</h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded text-content-muted hover:text-content-primary cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {saveError && <p role="alert" className="text-xs text-red-400">{saveError}</p>}
          {/* 1. Name Section: First Name & Last Name */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">{t('firstName')} *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData((current) => ({ ...current, firstName: e.target.value }))}
                placeholder="e.g. Wahid"
                required
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">{t('lastName')}</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData((current) => ({ ...current, lastName: e.target.value }))}
                placeholder="e.g. Sarraf"
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          {/* 2. Contact Section: Phone & Address */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">{t('phoneNumber')}</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={15}
                value={formData.phone}
                onChange={(e) => setFormData((current) => ({ ...current, phone: e.target.value.replace(/\D/g, '') }))}
                placeholder="e.g. 93700000000"
                autoComplete="tel"
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">{t('address')}</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData((current) => ({ ...current, address: e.target.value }))}
                placeholder="e.g. Herat Bazaar #12"
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          {/* 3. Initial Amount & Currency Selection */}
          <div className="p-3.5 rounded bg-surface-subtle/50 border border-surface-border space-y-2.5">
            <span className="block text-xs font-bold uppercase tracking-wider text-content-primary">
              {t('openingBalance')}
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-content-muted mb-1">{t('amount')}</label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={formData.amount}
                  onChange={(e) => setFormData((current) => ({ ...current, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded bg-surface border border-surface-border text-sm font-mono text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-content-muted mb-1">{t('currency')}</label>
                <select
                  value={selectedAmountCurrency ?? ''}
                  onChange={(e) => setFormData((current) => ({ ...current, amountCurrency: e.target.value as CurrencyCode }))}
                  className="w-full h-[38px] px-2.5 rounded bg-surface border border-surface-border text-sm font-bold text-content-primary focus:outline-none focus:ring-1 focus:ring-brand uppercase cursor-pointer"
                >
                  {businessCurrencies.length === 0 && <option value="">{t('noCurrencies')}</option>}
                  {businessCurrencies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-content-muted mb-1">{t('amountDesc')}</label>
              <input
                type="text"
                value={formData.amountDescription}
                onChange={(e) => setFormData((current) => ({ ...current, amountDescription: e.target.value }))}
                placeholder="e.g. Initial capital deposit / vault opening"
                className="w-full px-3 py-2 rounded bg-surface border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          {/* Modal Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="w-1/2 h-10 rounded bg-surface-subtle hover:bg-surface-hover border border-surface-border text-content-muted text-xs font-semibold cursor-pointer transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="w-1/2 h-10 rounded bg-sky-400 hover:bg-sky-500 text-slate-950 font-bold text-xs cursor-pointer shadow-sm transition-all"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
