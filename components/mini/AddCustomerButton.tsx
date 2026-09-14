'use client';

import { useTranslations } from 'next-intl';

interface AddCustomerButtonProps {
  onClick?: () => void;
  className?: string;
}

export default function AddCustomerButton({
  onClick,
  className = '',
}: AddCustomerButtonProps) {
  const t = useTranslations('CustomerBook');

  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-8 z-30 flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-brand hover:bg-brand-hover active:scale-95 text-black font-bold text-sm shadow-xl shadow-brand/25 transition-all duration-200 cursor-pointer ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
      </svg>
      <span>{t('addCustomer')}</span>
    </button>
  );
}
