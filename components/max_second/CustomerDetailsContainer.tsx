'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ClientNameCard from '@/components/mini_second/ClientNameCard';
import CustomerCurrencyTabs from '@/components/mini_second/CustomerCurrencyTabs';
import CustomerBalanceCard from '@/components/mini_second/CustomerBalanceCard';
import CustomerTransactionFilterBar from '@/components/mini_second/CustomerTransactionFilterBar';
import CustomerTransactionsFeed from '@/components/mini_second/CustomerTransactionsFeed';
import EditCustomerTxModal from '@/components/mini_second/EditCustomerTxModal';
import DeleteCustomerTxModal from '@/components/mini_second/DeleteCustomerTxModal';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';

export default function CustomerDetailsContainer() {
  const searchParams = useSearchParams();
  const urlParamId = searchParams.get('id');

  const { selectedCustomerId, setSelectedCustomerId } = useCustomerDetailsStore();
  const { customers, businesses, setDefaultUser, setActiveBusiness } = useSettingsStore();
  const { setCustomerId } = useExchangeDeskStore();
  const activeBusiness = businesses.find((b) => b.isActive) || businesses[0];

  // Sync state with ?id=... URL query parameter
  useEffect(() => {
    if (urlParamId) {
      const targetCustomer = customers.find((c) => c.id === urlParamId);
      if (targetCustomer) {
        if (selectedCustomerId !== targetCustomer.id) {
          setSelectedCustomerId(targetCustomer.id);
          setDefaultUser(targetCustomer.id);
          setCustomerId(targetCustomer.id);
        }
        if (targetCustomer.businessId && targetCustomer.businessId !== activeBusiness?.id) {
          void setActiveBusiness(targetCustomer.businessId).catch((error: unknown) => console.error(error));
        }
      }
    } else if (!selectedCustomerId && customers.length > 0) {
      // If no customer is currently selected, default to first customer of active business
      const businessCust = customers.find((c) => c.businessId === activeBusiness?.id) || customers[0];
      if (businessCust) {
        setSelectedCustomerId(businessCust.id);
        setDefaultUser(businessCust.id);
        setCustomerId(businessCust.id);
      }
    }
  }, [urlParamId, customers, activeBusiness, selectedCustomerId, setSelectedCustomerId, setDefaultUser, setCustomerId, setActiveBusiness]);

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-5 sm:space-y-6 pb-28 sm:pb-20 transition-colors duration-200">
      {/* Responsive 12-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        {/* Left Column: Client Name, Currency Tabs & Balance Summary (Sticky on Laptop/Desktop) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-20">
          <ClientNameCard />
          <CustomerCurrencyTabs />
          <CustomerBalanceCard />
        </div>

        {/* Right Column: Search & Transactions Feed */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          <CustomerTransactionFilterBar />
          <CustomerTransactionsFeed />
        </div>
      </div>

      {/* Interaction Modals */}
      <EditCustomerTxModal />
      <DeleteCustomerTxModal />
    </div>
  );
}
