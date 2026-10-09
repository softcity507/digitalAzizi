'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import ClientNameCard from '@/components/mini_second/ClientNameCard';
import CustomerCurrencyTabs from '@/components/mini_second/CustomerCurrencyTabs';
import CustomerBalanceCard from '@/components/mini_second/CustomerBalanceCard';
import CustomerTransactionFilterBar from '@/components/mini_second/CustomerTransactionFilterBar';
import CustomerTransactionsFeed from '@/components/mini_second/CustomerTransactionsFeed';
import EditCustomerTxModal from '@/components/mini_second/EditCustomerTxModal';
import DeleteCustomerTxModal from '@/components/mini_second/DeleteCustomerTxModal';
// import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';
import { useCashBookStore } from '@/store/useCashBookStore';
import MiniLoader from '@/components/mini_second/MiniLoader';
import { authApi } from '@/callapi/auth';

export default function CustomerDetailsContainer() {
  const locale = useLocale();
  const router = useRouter();
  const navigationT = useTranslations('Navigation');
  const searchParams = useSearchParams();
  const urlParamId = searchParams.get('id');

  // const { selectedCustomerId, setSelectedCustomerId } = useCustomerDetailsStore();
  const { setDefaultUser } = useSettingsStore();
  const { setCustomerId } = useExchangeDeskStore();
  const fetchBusinesses = useSettingsStore((state) => state.fetchBusinesses);
  const fetchTransactions = useCashBookStore((state) => state.fetchTransactions);
  const [accessState, setAccessState] = useState<'checking' | 'allowed' | 'error'>('checking');

  useEffect(() => {
    let isCurrent = true;
    const verifyCustomerAccess = async () => {
      setAccessState('checking');
      try {
        if (!urlParamId) {
          router.replace(`/${locale}/customers`);
          return;
        }

        await fetchBusinesses();
        if (!isCurrent) return;

        const ownedData = useSettingsStore.getState();
        const selectedBusiness = ownedData.businesses.find((business) => business.isActive) || ownedData.businesses[0];
        const customer = ownedData.customers.find((item) => item.id === urlParamId);

        if (!customer || !selectedBusiness || customer.businessId !== selectedBusiness.id) {
          console.warn('Rejected customer detail access for an unknown customer ID or a customer outside the selected business.');
          if (!isCurrent) return;
          await authApi.logout();
          if (isCurrent) router.replace(`/${locale}`);
          return;
        }

        // setSelectedCustomerId(customer.id);
        setDefaultUser(customer.id);
        setCustomerId(customer.id);
        await fetchTransactions();

        if (isCurrent) setAccessState('allowed');
      } catch (error) {
        console.error('Customer details access verification failed:', error);
        if (isCurrent) setAccessState('error');
      }
    };

    void verifyCustomerAccess();
    return () => {
      isCurrent = false;
    };
  }, [urlParamId, locale, router, fetchBusinesses, fetchTransactions,  setDefaultUser, setCustomerId]);

  if (accessState === 'checking') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <MiniLoader size="md" variant="brand" text="Verifying customer access..." />
      </div>
    );
  }

  if (accessState === 'error') {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-sm text-content-secondary">Unable to verify this customer. Please return to the customer list and try again.</p>
        <Link href={`/${locale}/customers`} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">
          {navigationT('customers')}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-5 sm:space-y-6 pb-28 sm:pb-20 transition-colors duration-200">
      <Link
        href={`/${locale}/customers`}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-content-secondary hover:text-content-primary hover:bg-surface-hover transition-colors"
        aria-label={navigationT('customers')}
      >
        <svg className="h-4 w-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7M8 12h13" />
        </svg>
        <span>{navigationT('customers')}</span>
      </Link>

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
