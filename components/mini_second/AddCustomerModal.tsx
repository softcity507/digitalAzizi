'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/store/useSettingsStore';
import { CurrencyCode } from '@/types/customer';

const AVAILABLE_CURRENCIES: CurrencyCode[] = ['AFN', 'USD', 'PKR', 'IRR', 'INR', 'AED', 'EUR', 'GBP', 'CNY', 'TRY'];
const DEFAULT_CURRENCIES: CurrencyCode[] = ['AFN', 'USD', 'PKR'];

export default function AddCustomerModal() {
  const t = useTranslations('Settings');
  const { activeModal, closeModal, addUser } = useSettingsStore();
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [selectedCurrencies, setSelectedCurrencies] = useState<CurrencyCode[]>(DEFAULT_CURRENCIES);

  if (activeModal !== 'add_customer') return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || selectedCurrencies.length !== 3) return;
    addUser(name.trim(), subtitle.trim() || 'Customer Account', selectedCurrencies);
    setName('');
    setSubtitle('');
    setSelectedCurrencies(DEFAULT_CURRENCIES);
  };

  const toggleCurrency = (currency: CurrencyCode) => {
    setSelectedCurrencies((current) => {
      if (current.includes(currency)) return current.filter((item) => item !== currency);
      if (current.length >= 3) return [...current.slice(1), currency];
      return [...current, currency];
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
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
          <div>
            <label className="block text-xs font-semibold text-content-muted mb-1">{t('customerName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wahid Sarraf"
              required
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-xs font-semibold text-content-muted">
              Deal currencies ({selectedCurrencies.length}/3)
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {AVAILABLE_CURRENCIES.map((currency) => {
                const isSelected = selectedCurrencies.includes(currency);
                return (
                  <label
                    key={currency}
                    className={`flex items-center gap-1.5 px-2 py-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                      isSelected
                        ? 'border-brand bg-brand/10 text-brand'
                        : 'border-surface-border text-content-muted hover:bg-surface-hover'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCurrency(currency)}
                      className="accent-brand"
                    />
                    {currency}
                  </label>
                );
              })}
            </div>
            {selectedCurrencies.length !== 3 && (
              <p className="text-[11px] text-rose-500">Select exactly 3 currencies.</p>
            )}
          </fieldset>
            
          <div>
            <label className="block text-xs font-semibold text-content-muted mb-1">{t('customerDescription')}</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Sarraf, Herat Bazaar"
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

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
