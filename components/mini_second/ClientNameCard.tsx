'use client';

import { useMemo } from 'react';
import { CUSTOMER_ACCOUNTS } from '@/data/customerData';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';

export default function ClientNameCard() {
  const { selectedCustomerId, setSelectedCustomerId } = useCustomerDetailsStore();
  const { setDefaultUser } = useSettingsStore();
  const { setCustomerId } = useExchangeDeskStore();

  const currentCustomer = useMemo(() => {
    return CUSTOMER_ACCOUNTS.find((c) => c.id === selectedCustomerId) || CUSTOMER_ACCOUNTS[1];
  }, [selectedCustomerId]);

  const handleSelectCustomer = (newId: string) => {
    setSelectedCustomerId(newId);
    setDefaultUser(newId);
    setCustomerId(newId);
  };

  return (
    <div className="w-full bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-sm transition-all">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-surface-subtle border border-surface-border flex items-center justify-center text-lg font-bold text-content-primary">
          {currentCustomer.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
            {currentCustomer.name}
          </h1>
          {currentCustomer.subtitle && (
            <p className="text-xs text-content-muted">{currentCustomer.subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={selectedCustomerId}
          onChange={(e) => handleSelectCustomer(e.target.value)}
          aria-label="Select Customer"
          className="bg-surface-subtle border border-surface-border text-xs font-semibold rounded-xl px-3 py-2 text-content-primary focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
        >
          {CUSTOMER_ACCOUNTS.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
