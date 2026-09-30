'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/store/useSettingsStore';
import { CurrencyCode } from '@/types/customer';

const AVAILABLE_CURRENCIES: CurrencyCode[] = ['AFN', 'USD', 'PKR', 'IRR', 'INR', 'AED', 'EUR', 'GBP', 'CNY', 'TRY'];

export default function AddCustomerModal() {
  const t = useTranslations('Settings');
  const { activeModal, closeModal, addUser } = useSettingsStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('AFN');

  if (activeModal !== 'add_customer') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const fullSubtitle = [details.trim(), phone.trim(), address.trim()].filter(Boolean).join(' • ') || 'Customer Account';

    // Calls the existing store action with the collected details
    addUser(fullName, fullSubtitle, [selectedCurrency], 'Customer', Number(openingBalance) || 0);

    // Reset Form
    setFirstName('');
    setLastName('');
    setAddress('');
    setPhone('');
    setDetails('');
    setOpeningBalance('');
    setSelectedCurrency('AFN');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-surface-border">
          <h3 className="text-base font-bold text-content-primary">{t('addNewCustomer')}</h3>
          <button
            type="button"
            onClick={closeModal}
            className="p-1 rounded-lg text-content-muted hover:text-content-primary cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">First Name</label>
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

          {/* Phone Number */}
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

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-content-muted mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Herat Bazaar, Shop #12"
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* Details / Subtitle */}
          <div>
            <label className="block text-xs font-semibold text-content-muted mb-1">{t('customerDescription')}</label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Primary Gold Trader"
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* Opening Balance & Currency Selector */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-content-muted mb-1">Opening Balance</label>
              <input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">Currency</label>
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
              >
                {AVAILABLE_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Modal Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="w-1/2 h-10 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-content-muted text-xs font-semibold cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="w-1/2 h-10 rounded-xl bg-sky-400 hover:bg-sky-500 text-slate-950 font-bold text-xs cursor-pointer shadow-sm"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}