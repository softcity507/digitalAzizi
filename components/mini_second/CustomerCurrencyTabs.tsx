'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CurrencyCode } from '@/types/customer';
import { CustomerCurrencySelection, useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import jsPDF from 'jspdf';

interface CurrencyTabConfig {
  code: CustomerCurrencySelection;
  label: string;
}

export default function CustomerCurrencyTabs() {
  const t = useTranslations('CustomerDetails');
  const { selectedCurrency, setSelectedCurrency, selectedCustomerId, transactions } =
    useCustomerDetailsStore();
  const customers = useSettingsStore((state) => state.customers);

  const customer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || customers[1] || customers[0];
  }, [customers, selectedCustomerId]);

  const currencyConfig = useMemo<CurrencyTabConfig[]>(() => {
    const customerCurrencies = new Set<CurrencyCode>([
      ...customer.balances.map((balance) => balance.currency),
      ...transactions
        .filter((tx) => tx.customerId === selectedCustomerId)
        .map((tx) => tx.currency),
    ]);
    const preferredOrder: CurrencyCode[] = ['AFN', 'USD', 'PKR'];
    const currencies = [
      ...preferredOrder.filter((code) => customerCurrencies.has(code)),
      ...Array.from(customerCurrencies).filter((code) => !preferredOrder.includes(code)),
    ];

    return [{ code: 'ALL', label: 'ALL' }, ...currencies.map((code) => ({ code, label: code }))];
  }, [customer.balances, selectedCustomerId, transactions]);

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

  const getAllCurrenciesSummary = () => ({
    amountFormatted: `${currencyConfig.length - 1} currencies`,
    isPositive: true,
    dotColor: 'bg-slate-400',
  });

  const getBalanceSummaries = () => currencyConfig
    .filter((item) => item.code !== 'ALL')
    .map((item) => {
      const currency = item.code as CurrencyCode;
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
        const balance = customer.balances.find((entry) => entry.currency === currency);
        if (balance) {
          if (balance.isCredit) credit = Number(balance.amount) || 0;
          else debit = Number(balance.amount) || 0;
        }
      }

      return { currency, credit, debit, net: credit - debit };
    });

  const getBalanceLines = () => getBalanceSummaries().map(({ currency, credit, debit, net }) =>
    `${currency}: Credit ${credit.toLocaleString()} ${currency} | Debit ${debit.toLocaleString()} ${currency} | Net ${net >= 0 ? '+' : ''}${net.toLocaleString()} ${currency}`
  );

  // Handler to send remaining balance details via WhatsApp
  const handleSendWhatsApp = () => {
    const targetNumber = customer.phone || "03471881624"; // Uses customer phone if available, falls back to default
    const message = `Hello ${customer.name},\n\nHere is your remaining balance statement:\n\n${getBalanceLines().join('\n')}\n\nThank you,\nAl-Rahman Company`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${targetNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  const handleDownloadBalancePdf = () => {
    const doc = new jsPDF();
    const generatedAt = new Date();

    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text('Customer Remaining Balance Notice', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(`Customer: ${customer.name}`, 14, 28);
    doc.text(`Date: ${generatedAt.toISOString().slice(0, 16).replace('T', ' ')}`, 14, 34);

    doc.setDrawColor(210, 214, 220);
    doc.line(14, 40, 196, 40);
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text('Remaining Balance by Currency', 14, 49);

    doc.setFontSize(9);
    getBalanceSummaries().forEach(({ currency, credit, debit, net }, index) => {
      const y = 59 + index * 10;
      doc.setTextColor(30, 30, 30);
      doc.text(currency, 20, y);
      doc.setTextColor(5, 150, 105);
      doc.text(`Credit: ${credit.toLocaleString()}`, 45, y);
      doc.setTextColor(220, 38, 38);
      doc.text(`Debit: ${debit.toLocaleString()}`, 95, y);
      doc.setTextColor(net >= 0 ? 5 : 220, net >= 0 ? 150 : 38, net >= 0 ? 105 : 38);
      doc.text(`Net: ${net >= 0 ? '+' : ''}${net.toLocaleString()}`, 145, y);
    });

    const summaryBottom = 67 + (currencyConfig.length - 2) * 10;
    doc.line(14, summaryBottom, 196, summaryBottom);
    doc.setFontSize(9);
    doc.text('Thank you for your business.', 14, summaryBottom + 10);
    doc.save(`balance_${customer.name.replace(/\s+/g, '_')}_${generatedAt.toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-bold tracking-wider uppercase text-content-muted">
          {t('currency')}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium tracking-tight text-content-muted">
            {t('tapToSwitch')}
          </span>
          {/* WhatsApp Send Button */}
          <button
            type="button"
            onClick={handleSendWhatsApp}
            title="Send all currency balances via WhatsApp"
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold transition-colors cursor-pointer shadow-sm"
          >
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
            <span>WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadBalancePdf}
            title="Download all currency balances as PDF"
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand hover:bg-brand-hover text-brand-foreground text-[10px] font-bold transition-colors cursor-pointer shadow-sm"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {currencyConfig.map((item) => {
          const isActive = selectedCurrency === item.code;
          const summary = item.code === 'ALL' ? getAllCurrenciesSummary() : getCurrencySummary(item.code);

          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setSelectedCurrency(item.code)}
              className={`min-w-0 p-2 sm:p-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${isActive
                ? 'bg-brand border-brand text-brand-foreground shadow-sm ring-1 ring-brand/40'
                : 'bg-surface/60 border-surface-border hover:bg-surface hover:border-surface-border/80'
                }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[10px] sm:text-xs font-bold ${isActive ? 'text-brand-foreground' : 'text-content-primary'}`}>
                  {item.label}
                </span>
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-brand-foreground' : summary.dotColor}`} />
              </div>
              <span
                className={`min-w-0 w-full truncate text-[10px] sm:text-xs font-bold font-mono mt-1.5 ${isActive
                  ? 'text-brand-foreground'
                  : summary.isPositive ? 'text-emerald-400' : 'text-rose-400'
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