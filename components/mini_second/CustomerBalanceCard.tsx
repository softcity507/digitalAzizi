'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CurrencyCode } from '@/types/customer';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function CustomerBalanceCard() {
  const t = useTranslations('CustomerDetails');
  const { selectedCurrency, setSelectedCurrency, selectedCustomerId, transactions, getActiveBalances } =
    useCustomerDetailsStore();
  const customers = useSettingsStore((state) => state.customers);

  const customer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || customers[1] || customers[0];
  }, [customers, selectedCustomerId]);

  const allCurrencySummaries = useMemo(() => {
    const customerCurrencies = new Set<CurrencyCode>([
      ...(customer?.balances?.map((b) => b.currency) || []),
      ...transactions
        .filter((tx) => tx.customerId === selectedCustomerId)
        .map((tx) => tx.currency),
    ]);
    const preferredOrder: CurrencyCode[] = ['AFN', 'USD', 'PKR'];
    const currencies = [
      ...preferredOrder.filter((code) => customerCurrencies.has(code)),
      ...Array.from(customerCurrencies).filter((code) => !preferredOrder.includes(code)),
    ];
    const targetCurrencies = currencies.length > 0 ? currencies : (['AFN', 'USD', 'PKR'] as CurrencyCode[]);

    return targetCurrencies.map((currency) => {
      const matchingTx = transactions.filter(
        (tx) => tx.customerId === selectedCustomerId && tx.currency === currency
      );
      let credit = 0;
      let debit = 0;

      if (matchingTx.length > 0) {
        for (const tx of matchingTx) {
          if (tx.isCredit) credit += tx.amount;
          else debit += tx.amount;
        }
      } else {
        const balance = customer?.balances?.find((entry) => entry.currency === currency);
        if (balance) {
          const amt = parseFloat(String(balance.amount).replace(/[^0-9.-]+/g, '')) || 0;
          if (balance.isCredit) credit = amt;
          else debit = amt;
        }
      }

      const net = credit - debit;
      return { currency, credit, debit, net, isPositive: net >= 0 };
    });
  }, [customer, selectedCustomerId, transactions]);

  // If ALL currencies are selected, show balance for all currencies
  if (selectedCurrency === 'ALL') {
    return (
      <div className="w-full bg-surface border border-surface-border rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-content-muted">
            {t('balance')}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand/10 text-brand border border-brand/20">
            ALL CURRENCIES
          </span>
        </div>

        {/* 3 Currencies Balances List */}
        <div className="space-y-2.5">
          {allCurrencySummaries.map((item) => (
            <div
              key={item.currency}
              onClick={() => setSelectedCurrency(item.currency)}
              className="p-3 sm:p-3.5 rounded-xl bg-surface-subtle border border-surface-border hover:border-brand/40 transition-all duration-150 space-y-2 cursor-pointer group"
              title={`View ${item.currency} transactions`}
            >
              {/* Top: Currency Tag & Net Balance */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-surface border border-surface-border text-xs font-bold font-mono text-content-primary group-hover:border-brand/40 transition-colors">
                    {item.currency}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`font-mono font-extrabold text-sm sm:text-base tracking-tight ${
                      item.isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.isPositive ? '+' : ''}{item.net.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-content-muted ml-1 uppercase">
                    {item.currency}
                  </span>
                </div>
              </div>

              {/* Bottom: Inflow / Outflow Row */}
              <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-surface-border/40">
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-5 h-5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                  <span className="font-mono text-content-primary font-semibold text-[11px] truncate">
                    {item.credit.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="w-5 h-5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </div>
                  <span className="font-mono text-content-primary font-semibold text-[11px] truncate">
                    {item.debit.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Single Currency View
  const selectedSummary = allCurrencySummaries.find((item) => item.currency === selectedCurrency);
  const activeBalances = getActiveBalances();
  const net = selectedSummary?.net ?? activeBalances.net;
  const totalCredit = selectedSummary?.credit ?? activeBalances.totalCredit;
  const totalDebit = selectedSummary?.debit ?? activeBalances.totalDebit;
  const isNetPositive = net >= 0;
  const formattedNet = `${isNetPositive ? '+' : ''}${net.toLocaleString()} ${selectedCurrency}`;

  // Helper to dynamically shrink font size for long numbers
  const getDynamicFontSize = (text: string) => {
    if (text.length > 15) return 'text-lg sm:text-xl';
    if (text.length > 11) return 'text-xl sm:text-2xl';
    return 'text-2xl sm:text-3xl';
  };

  const getSubCardFontSize = (text: string) => {
    if (text.length > 12) return 'text-[10px] sm:text-xs';
    if (text.length > 9) return 'text-xs sm:text-sm';
    return 'text-xs sm:text-sm';
  };

  const creditStr = totalCredit.toLocaleString();
  const debitStr = totalDebit.toLocaleString();

  return (
    <div className="w-full bg-surface border border-surface-border rounded-2xl p-5 space-y-4 shadow-sm">
      <div className="space-y-1">
        <span className="text-[11px] font-bold tracking-wider uppercase text-content-muted">
          {t('balance')}
        </span>
        <div
          className={`${getDynamicFontSize(
            formattedNet
          )} font-extrabold font-mono tracking-tight transition-all duration-200 ${
            isNetPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {formattedNet}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Total Credit / Inflow Card */}
        <div className="p-3.5 rounded-xl bg-surface-subtle border border-surface-border flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className={`block ${getSubCardFontSize(creditStr)} font-bold font-mono text-content-primary`}>
              {creditStr} <span className="text-[10px] text-content-muted">{selectedCurrency}</span>
            </span>
          </div>
        </div>

        {/* Total Debit / Outflow Card */}
        <div className="p-3.5 rounded-xl bg-surface-subtle border border-surface-border flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className={`block ${getSubCardFontSize(debitStr)} font-bold font-mono text-content-primary`}>
              {debitStr} <span className="text-[10px] text-content-muted">{selectedCurrency}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}