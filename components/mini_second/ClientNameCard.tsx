'use client';

import { useMemo, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';

export default function ClientNameCard() {
  const t = useTranslations('CustomerBook');
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const urlParamId = searchParams.get('id');

  const { selectedCustomerId, setSelectedCustomerId } = useCustomerDetailsStore();
  const { setDefaultUser, setActiveBusiness } = useSettingsStore();
  const { setCustomerId } = useExchangeDeskStore();
  const businesses = useSettingsStore((state) => state.businesses);
  const allCustomers = useSettingsStore((state) => state.customers);
  const setCustomerWhatsAppToggle = useSettingsStore((state) => state.setCustomerWhatsAppToggle);
  const [savingWhatsAppToggle, setSavingWhatsAppToggle] = useState(false);
  const [whatsAppToggleError, setWhatsAppToggleError] = useState('');
  const activeBusiness = useMemo(() => businesses.find((b) => b.isActive) || businesses[0], [businesses]);

  const activeCustomers = useMemo(() => {
    if (!activeBusiness) return allCustomers;
    const filtered = allCustomers.filter((c) => c.businessId === activeBusiness.id);
    return filtered.length > 0 ? filtered : allCustomers;
  }, [allCustomers, activeBusiness]);

  const effectiveCustomerId = urlParamId || selectedCustomerId;

  const currentCustomer = useMemo(() => {
    return (
      allCustomers.find((c) => c.id === effectiveCustomerId) ||
      activeCustomers[0] ||
      allCustomers[0]
    );
  }, [allCustomers, effectiveCustomerId, activeCustomers]);
  const isWhatsAppEnabled = Boolean(currentCustomer?.whatsAppToggle);
  const hasCustomerPhone = Boolean(currentCustomer?.phone?.trim());

  // Synchronize store with URL parameter
  useEffect(() => {
    if (urlParamId && urlParamId !== selectedCustomerId) {
      setSelectedCustomerId(urlParamId);
      setDefaultUser(urlParamId);
      setCustomerId(urlParamId);
      const targetCustomer = allCustomers.find((c) => c.id === urlParamId);
      if (targetCustomer?.businessId && targetCustomer.businessId !== activeBusiness?.id) {
        void setActiveBusiness(targetCustomer.businessId).catch((error: unknown) => console.error(error));
      }
    }
  }, [urlParamId, selectedCustomerId, allCustomers, activeBusiness, setSelectedCustomerId, setDefaultUser, setCustomerId, setActiveBusiness]);

  const handleSelectCustomer = (newId: string) => {
    setSelectedCustomerId(newId);
    setDefaultUser(newId);
    setCustomerId(newId);
    const targetCustomer = allCustomers.find((c) => c.id === newId);
    if (targetCustomer?.businessId && targetCustomer.businessId !== activeBusiness?.id) {
      void setActiveBusiness(targetCustomer.businessId).catch((error: unknown) => console.error(error));
    }
    router.replace(`/${locale}/details?id=${newId}`);
  };

  const handleWhatsAppToggle = async () => {
    if (!currentCustomer || savingWhatsAppToggle) return;
    if (!hasCustomerPhone && !isWhatsAppEnabled) return;
    setWhatsAppToggleError('');
    setSavingWhatsAppToggle(true);
    try {
      await setCustomerWhatsAppToggle(currentCustomer.id, !isWhatsAppEnabled);
    } catch (error) {
      setWhatsAppToggleError(error instanceof Error ? error.message : 'Unable to update WhatsApp setting.');
    } finally {
      setSavingWhatsAppToggle(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded border border-surface-border bg-surface p-4 shadow-sm transition-all sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-center gap-3.5">
         
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
            {currentCustomer?.name || 'Customer'}
          </h1>
          {/* {currentCustomer?.subtitle && (
            <p className="text-xs text-content-muted">{currentCustomer.subtitle}</p>
          )} */}
        </div>
      </div>

      <div className="flex w-full flex-col items-end gap-2 sm:w-auto">
        <select
          value={currentCustomer?.id || effectiveCustomerId}
          onChange={(e) => handleSelectCustomer(e.target.value)}
          aria-label={t('selectCustomer')}
          className="max-w-full rounded border border-surface-border bg-surface-subtle px-3 py-2 text-xs font-semibold text-content-primary focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
        >
          {activeCustomers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-content-muted">WhatsApp</span>
          <button
            type="button"
            role="switch"
            aria-checked={isWhatsAppEnabled}
            aria-label="Send cash transaction messages through WhatsApp"
            title={hasCustomerPhone ? 'Send a WhatsApp message after cash transactions' : 'Add a phone number to enable WhatsApp'}
            disabled={(!hasCustomerPhone && !isWhatsAppEnabled) || savingWhatsAppToggle}
            onClick={() => void handleWhatsAppToggle()}
            data-enabled={isWhatsAppEnabled}
            className="whatsapp-toggle-track relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className={`whatsapp-toggle-knob inline-block h-4 w-4 rounded-full shadow-sm transition-transform ${isWhatsAppEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span data-enabled={isWhatsAppEnabled} className="whatsapp-toggle-label text-[10px] font-semibold uppercase text-content-muted">
            {savingWhatsAppToggle ? 'Saving' : isWhatsAppEnabled ? 'On' : 'Off'}
          </span>
        </div>
        {whatsAppToggleError && <p role="alert" className="max-w-56 text-right text-[11px] text-debit">{whatsAppToggleError}</p>}
      </div>
    </div>
  );
}
