'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';

export default function ExchangeCommitButton() {
  const t = useTranslations('ExchangeDesk');
  const { commitTransaction } = useExchangeDeskStore();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClick = () => {
    const success = commitTransaction();
    if (success) {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    } else {
      alert(t('validationError'));
    }
  };

  return (
    <div className="w-full pt-1">
      <button
        type="button"
        onClick={handleClick}
        className={`w-full h-14 sm:h-16 rounded-2xl font-black text-base sm:text-lg tracking-tight transition-all duration-200 shadow-xl cursor-pointer select-none active:scale-[0.98] flex items-center justify-center gap-2.5 ${
          isSuccess
            ? 'bg-emerald-500 text-black shadow-emerald-500/30'
            : 'bg-[#38bdf8] hover:bg-[#0ea5e9] text-black shadow-[#38bdf8]/30 hover:shadow-[#38bdf8]/50'
        }`}
      >
        {isSuccess ? (
          <>
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span>Transaction Committed!</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            <span>{t('commitButton')}</span>
          </>
        )}
      </button>
    </div>
  );
}
