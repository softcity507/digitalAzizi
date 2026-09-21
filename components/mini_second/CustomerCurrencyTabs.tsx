'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CurrencyCode } from '@/types/customer';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';
import { CUSTOMER_ACCOUNTS } from '@/data/customerData';

interface CurrencyTabConfig {
  code: CurrencyCode;
  label: string;
}

const CURRENCY_CONFIG: CurrencyTabConfig[] = [
  { code: 'AFN', label: 'AFN (؋)' },
  { code: 'USD', label: 'USD ($)' },
  { code: 'PKR', label: 'PKR (Rs)' },
];

export default function CustomerCurrencyTabs() {
  const t = useTranslations('CustomerDetails');
  const { selectedCurrency, setSelectedCurrency, selectedCustomerId, transactions } =
    useCustomerDetailsStore();

  const customer = useMemo(() => {
    return CUSTOMER_ACCOUNTS.find((c) => c.id === selectedCustomerId) || CUSTOMER_ACCOUNTS[1];
  }, [selectedCustomerId]);

  const getCurrencySummary = (code: CurrencyCode) => {
    // 1. Check if matching ledger transactions exist
    const matchingTx = transactions.filter(
      (tx) => tx.customerId === selectedCustomerId && tx.currency === code
    );

    if (matchingTx.length > 0) {
      let net = 0;
      for (const tx of matchingTx) {
        net += tx.isCredit ? tx.amount : -tx.amount;
      }
      const formatted = `${net >= 0 ? '+' : ''}${net.toLocaleString()}`;
      return {
        amountFormatted: formatted,
        isPositive: net >= 0,
        dotColor: net > 0 ? 'bg-emerald-400' : net < 0 ? 'bg-rose-400' : 'bg-slate-400',
      };
    }

    // 2. Fallback to customer default balances
    const bal = customer.balances.find((b) => b.currency === code);
    if (bal) {
      return {
        amountFormatted: bal.amount,
        isPositive: bal.isCredit,
        dotColor: bal.isCredit ? 'bg-emerald-400' : 'bg-rose-400',
      };
    }

    return {
      amountFormatted: '0',
      isPositive: true,
      dotColor: 'bg-slate-400',
    };
  };

  return (
    <div className="w-full space-y-2.5 ">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold tracking-wider uppercase text-content-muted">
          {t('currency')}
        </span>
        <span className="text-[11px] font-medium tracking-tight text-content-muted">
          {t('tapToSwitch')}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {CURRENCY_CONFIG.map((item) => {
          const isActive = selectedCurrency === item.code;
          const summary = getCurrencySummary(item.code);

          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setSelectedCurrency(item.code)}
              className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${isActive
                ? 'bg-surface border-brand shadow-sm ring-1 ring-brand/40'
                : 'bg-surface/60 border-surface-border hover:bg-surface hover:border-surface-border/80'
                }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-content-primary">{item.label}</span>
                <span className={`w-2 h-2 rounded-full ${summary.dotColor}`} />
              </div>
              <span
                className={`text-xs sm:text-sm font-bold font-mono mt-1.5 ${summary.isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
              >
                {summary.amountFormatted}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
