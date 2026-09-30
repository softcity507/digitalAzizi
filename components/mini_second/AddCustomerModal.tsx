'use client';

import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCreateBussines } from '@/store/useCreateBussines';

export default function AddCustomerModal() {
  const t = useTranslations('Settings');
  const { activeModal, closeModal } = useSettingsStore();
  const {
    name,
    setName,
    details,
    setDetails,
    selectedCurrencies,
    toggleCurrency,
    availableCurrencies,
    createBusiness,
    resetForm,
  } = useCreateBussines();

  if (activeModal !== 'add_customer') return null;

  const handleClose = () => {
    resetForm();
    closeModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = createBusiness();
    if (success) {
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-surface-border">
          <h3 className="text-base font-bold text-content-primary">{t('addNewBusiness')}</h3>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-content-muted hover:text-content-primary cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Business Name */}
          <div>
            <label className="block text-xs font-semibold text-content-muted mb-1">{t('businessName')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kabul Express Hawala"
              required
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* Business Details / Description */}
          <div>
            <label className="block text-xs font-semibold text-content-muted mb-1">{t('businessDescription')}</label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Primary Trading Hub, Kabul Market"
              className="w-full px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border text-sm text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          {/* Deal Currencies Selection */}
          <fieldset className="space-y-2">
            <div className="flex items-center justify-between">
              <legend className="text-xs font-semibold text-content-muted">
                {t('dealCurrencies')} ({selectedCurrencies.length}/3)
              </legend>
              <span className="text-[11px] text-content-muted">
                {t('select3Currencies')}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {availableCurrencies.map((currency) => {
                const isSelected = selectedCurrencies.includes(currency);
                return (
                  <button
                    type="button"
                    key={currency}
                    onClick={() => toggleCurrency(currency)}
                    className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                      isSelected
                        ? 'border-brand bg-brand/15 text-brand shadow-sm scale-[1.02]'
                        : 'border-surface-border bg-surface-subtle text-content-muted hover:bg-surface-hover hover:text-content-primary'
                    }`}
                  >
                    <span>{currency}</span>
                    {isSelected && <span className="text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>
            {selectedCurrencies.length !== 3 && (
              <p className="text-[11px] font-medium text-rose-500">
                {t('select3Currencies')}
              </p>
            )}
          </fieldset>

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
              disabled={selectedCurrencies.length !== 3 || !name.trim()}
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