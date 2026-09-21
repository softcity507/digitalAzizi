'use client';

import ClientNameCard from '@/components/mini_second/ClientNameCard';
import CustomerCurrencyTabs from '@/components/mini_second/CustomerCurrencyTabs';
import CustomerBalanceCard from '@/components/mini_second/CustomerBalanceCard';
import CustomerTransactionFilterBar from '@/components/mini_second/CustomerTransactionFilterBar';
import CustomerTransactionsFeed from '@/components/mini_second/CustomerTransactionsFeed';
import EditCustomerTxModal from '@/components/mini_second/EditCustomerTxModal';
import DeleteCustomerTxModal from '@/components/mini_second/DeleteCustomerTxModal';

export default function CustomerDetailsContainer() {
  return (
    <div className="w-full max-w-7xl 2xl:max-w-[1500px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-5 sm:space-y-6 pb-28 sm:pb-20 transition-colors duration-200">
      {/* Responsive 12-Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        {/* Left Column: Client Name, Currency Tabs & Balance Summary (Sticky on Laptop/Desktop) */}
        <div className="lg:col-span-5   xl:col-span-4 space-y-4 lg:sticky lg:top-20">
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
