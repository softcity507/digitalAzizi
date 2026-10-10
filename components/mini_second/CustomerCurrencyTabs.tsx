'use client';

import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const urlParamId = searchParams.get('id');

  const { selectedCurrency, setSelectedCurrency, selectedCustomerId, transactions } =
    useCustomerDetailsStore();
    
  const customers = useSettingsStore((state) => state.customers);
  const businesses = useSettingsStore((state) => state.businesses);
  const activeBusiness = useMemo(() => businesses.find((b) => b.isActive) || businesses[0], [businesses]);

  const effectiveCustomerId = urlParamId || selectedCustomerId;

  const customer = useMemo(() => {
    return customers.find((c) => c.id === effectiveCustomerId) || customers[0] || {
      id: 'cust_001',
      name: 'Customer',
      balances: [],
    };
  }, [customers, effectiveCustomerId]);
  const customerBusiness = useMemo(
    () => businesses.find((business) => business.id === customer.businessId) || activeBusiness,
    [businesses, customer.businessId, activeBusiness]
  );
  const supportedCurrencies = useMemo(
    () => customerBusiness?.supportedCurrencies ?? [],
    [customerBusiness]
  );

  const currencyConfig = useMemo<CurrencyTabConfig[]>(() => {
    return [
      { code: 'ALL', label: 'ALL' },
      ...supportedCurrencies.map((code) => ({ code, label: code })),
    ];
  }, [supportedCurrencies]);

  useEffect(() => {
    if (selectedCurrency !== 'ALL' && !supportedCurrencies.includes(selectedCurrency)) {
      setSelectedCurrency('ALL');
    }
  }, [selectedCurrency, setSelectedCurrency, supportedCurrencies]);

  const getNetBalance = (code: CurrencyCode) => {
    const openingBalance = customer.balances
      ?.filter((balance) => balance.currency === code)
      .reduce((total, balance) => total + (parseFloat(String(balance.amount).replace(/[^0-9.-]+/g, '')) || 0), 0) ?? 0;
    const transactionBalance = transactions
      .filter((tx) => tx.customerId === effectiveCustomerId && tx.currency === code && tx.category !== 'initial')
      .reduce((net, tx) => net + (tx.isCredit ? tx.amount : -tx.amount), 0);

    return openingBalance + transactionBalance;
  };

  const getCurrencySummary = (code: CurrencyCode) => {
    const net = getNetBalance(code);
    const formatted = `${net >= 0 ? '+' : ''}${net.toLocaleString()}`;
    return {
      amountFormatted: formatted,
      isPositive: net >= 0,
      dotColor: net > 0 ? 'bg-emerald-400' : net < 0 ? 'bg-rose-400' : 'bg-slate-400',
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
      return { currency, net: getNetBalance(currency) };
    });

  const getBalanceLines = () => getBalanceSummaries().map(({ currency, net }) =>
    `${currency}: Net Balance ${net >= 0 ? '+' : ''}${net.toLocaleString()} ${currency}`
  );

  // Handler to send remaining balance details via WhatsApp
  const handleSendWhatsApp = () => {
    const targetNumber = customer.phone || "03471881624";
    const companyName = activeBusiness?.name || "Digital Azizi";
    const message = `Hello ${customer.name},\n\nHere is your remaining balance statement:\n\n${getBalanceLines().join('\n')}\n\nThank you,\n${companyName}`;

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
    doc.text('Net Balance by Currency', 14, 49);

    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text('Currency', 20, 58);
    doc.text('Net Balance', 150, 58);
    doc.line(14, 61, 196, 61);
    getBalanceSummaries().forEach(({ currency, net }, index) => {
      const y = 69 + index * 9;
      doc.setTextColor(30, 30, 30);
      doc.text(currency, 20, y);
      doc.setTextColor(net >= 0 ? 5 : 220, net >= 0 ? 150 : 38, net >= 0 ? 105 : 38);
      doc.text(`${net >= 0 ? '+' : ''}${net.toLocaleString()} ${currency}`, 150, y);
    });

    const summaryBottom = 73 + Math.max(currencyConfig.length - 2, 0) * 9;
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
