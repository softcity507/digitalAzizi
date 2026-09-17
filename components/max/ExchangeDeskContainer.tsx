'use client';

import ExchangeCustomerSelect from '@/components/mini/ExchangeCustomerSelect';
import ExchangeTypeToggle from '@/components/mini/ExchangeTypeToggle';
import ExchangeAmountInput from '@/components/mini/ExchangeAmountInput';
import ExchangeRateInput from '@/components/mini/ExchangeRateInput';
import ExchangeLiveComputed from '@/components/mini/ExchangeLiveComputed';
import ExchangeCommitButton from '@/components/mini/ExchangeCommitButton';
import ExchangeRecentList from '@/components/mini/ExchangeRecentList';
import ExchangeEditModal from '@/components/mini/ExchangeEditModal';
import ExchangeDeleteModal from '@/components/mini/ExchangeDeleteModal';

export default function ExchangeDeskContainer() {
  return (
    <div className="min-h-screen bg-canvas text-content-primary py-4 sm:py-6 px-3 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-[1500px] mx-auto space-y-5 pb-24 lg:pb-12 transition-colors duration-200">
       

      {/* 2. Responsive Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        {/* Left Column: Exchange Terminal Inputs & Live Double-Entry Math */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-4">
          <div className="bg-surface/80 dark:bg-surface/60 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-surface-border shadow-xl space-y-4">
            {/* Customer Selector */}
            <ExchangeCustomerSelect />

            {/* Transaction Type Toggle (BUY / SELL) */}
            <ExchangeTypeToggle />

            {/* Amount & Currency Input (YOU GIVE / Client Pays) */}
            <ExchangeAmountInput />

            {/* Exchange Rate Input */}
            <ExchangeRateInput />

            {/* Live Computed Double-Entry Ledger Breakdown */}
            <ExchangeLiveComputed />

            {/* Commit Exchange Transaction Action Button */}
            <ExchangeCommitButton />
          </div>
        </div>

        {/* Right Column: Recent Exchanges Feed */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-4 lg:sticky lg:top-6">
          <div className="bg-surface/80 dark:bg-surface/60 backdrop-blur-md rounded-3xl p-4 sm:p-6 border border-surface-border shadow-xl">
            <ExchangeRecentList />
          </div>
        </div>
      </div>

      {/* 3. Global Modals */}
      <ExchangeEditModal />
      <ExchangeDeleteModal />
    </div>
  );
}
