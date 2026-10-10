'use client';

import { useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';

export default function ClientNameCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const urlParamId = searchParams.get('id');

  const { selectedCustomerId, setSelectedCustomerId } = useCustomerDetailsStore();
  const { setDefaultUser, setActiveBusiness } = useSettingsStore();
  const { setCustomerId } = useExchangeDeskStore();
  const businesses = useSettingsStore((state) => state.businesses);
  const allCustomers = useSettingsStore((state) => state.customers);
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

  return (
    <div className="w-full bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm transition-all">
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

      <div className="flex items-center gap-2">
        <select
          value={currentCustomer?.id || effectiveCustomerId}
          onChange={(e) => handleSelectCustomer(e.target.value)}
          aria-label="Select Customer"
          className="bg-surface-subtle border border-surface-border text-xs font-semibold rounded-xl px-3 py-2 text-content-primary focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
        >
          {activeCustomers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
