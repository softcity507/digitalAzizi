'use client';

import { useTranslations } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { showDynamicToast } from '@/components/max_second/DynamicToast';

export default function CashBookOperations() {
  const t = useTranslations('CashBook');
  const tSettings = useTranslations('Settings');
  const openModal = useCashBookStore((state) => state.openModal);
  const customers = useSettingsStore((state) => state.customers);
  const businesses = useSettingsStore((state) => state.businesses);
  const openSettingsModal = useSettingsStore((state) => state.openModal);
  const activeBusinessId = businesses.find((business) => business.isActive)?.id || businesses[0]?.id;
  const activeCustomerCount = activeBusinessId
    ? customers.filter((customer) => customer.businessId === activeBusinessId).length
    : customers.length;

  const openCustomerOperation = (modal: 'cash_in' | 'cash_out' | 'exchange') => {
    const requiredCustomers = modal === 'exchange' ? 2 : 1;
    if (activeCustomerCount < requiredCustomers) {
      showDynamicToast({
        message: modal === 'exchange'
          ? 'Add at least two customers before transferring between customers.'
          : 'Add a customer before recording cash in or cash out.',
        backgroundColor: '#2563eb',
        textColor: '#ffffff',
      });
      return;
    }
    openModal(modal);
  };

  return (
    <div className="w-full space-y-2 pt-1">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* 1. Cash Out (-) Button */}
        <button
          type="button"
          onClick={() => openCustomerOperation('cash_out')}
          className="h-12 sm:h-14 rounded-2xl bg-[#fda4af] hover:bg-[#f87171] active:scale-[0.98] text-black font-extrabold text-xs sm:text-sm tracking-tight transition-all duration-150 shadow-md flex items-center justify-center gap-1.5 text-center px-2 cursor-pointer select-none group"
        >
          <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center font-black text-xs shrink-0">-</span>
          <span className="truncate">{t('cashOutBtn')}</span>
        </button>

        {/* 2. transferBtn */}
        <button
          type="button"
          onClick={() => openCustomerOperation('exchange')}
          className="h-12 sm:h-14 rounded-2xl bg-[#38bdf8] hover:bg-[#0ea5e9] active:scale-[0.98] text-black font-extrabold text-xs sm:text-sm tracking-tight transition-all duration-150 shadow-md flex items-center justify-center gap-1.5 text-center px-2 cursor-pointer select-none group"
        >
          <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center font-black text-xs shrink-0">⇄</span>
          <span className="truncate">{t('transferBtn')}</span>
        </button>

        {/* 3. Cash In (+) Button */}
        <button
          type="button"
          onClick={() => openCustomerOperation('cash_in')}
          className="h-12 sm:h-14 rounded-2xl bg-[#34d399] hover:bg-[#10b981] active:scale-[0.98] text-black font-extrabold text-xs sm:text-sm tracking-tight transition-all duration-150 shadow-md flex items-center justify-center gap-1.5 text-center px-2 cursor-pointer select-none group"
        >
          <span className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center font-black text-xs shrink-0">+</span>
          <span className="truncate">{t('cashInBtn')}</span>
        </button>
      </div>

      {/* 4. Add New Customer Button */}
      <button
        type="button"
        onClick={() => openSettingsModal('add_customer')}
        className="w-full h-11 sm:h-12 rounded-2xl bg-surface-subtle hover:bg-surface-hover border border-surface-border active:scale-[0.99] text-content-primary font-bold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm group"
      >
        <span className="w-5 h-5 rounded-lg bg-brand/15 text-brand flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-brand/25 transition-colors">
          +
        </span>
        <span className="truncate">{tSettings('addNewCustomer')}</span>
      </button>
    </div>
  );
}

