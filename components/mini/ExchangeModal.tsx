'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';
import { CurrencyCode } from '@/types/cashbook';
import { CUSTOMER_ACCOUNTS } from '@/data/customerData';

export default function ExchangeModal() {
  const t = useTranslations('CashBook');
  const { activeModal, closeModal, addTransaction, selectedDate } = useCashBookStore();

  const [fromCustomer, setFromCustomer] = useState('Aziz Khan');
  const [toCustomer, setToCustomer] = useState('Haji Noorullah');
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [fromAmount, setFromAmount] = useState('1000');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('PKR');
  const [toAmount, setToAmount] = useState('280500');
  const [rate, setRate] = useState('280.50');
  const [memo, setMemo] = useState('');
  const [serialNo, setSerialNo] = useState(`EX-${Math.floor(1000 + Math.random() * 9000)}`);
  const [date, setDate] = useState(selectedDate);

  if (activeModal !== 'exchange') return null;

  // Auto calculate when fromAmount changes
  const handleFromAmountChange = (val: string) => {
    setFromAmount(val);
    const num = parseFloat(val);
    const numRate = parseFloat(rate);
    if (!isNaN(num) && !isNaN(numRate)) {
      setToAmount((num * numRate).toFixed(2));
    }
  };

  const handleRateChange = (val: string) => {
    setRate(val);
    const num = parseFloat(fromAmount);
    const numRate = parseFloat(val);
    if (!isNaN(num) && !isNaN(numRate)) {
      setToAmount((num * numRate).toFixed(2));
    }
  };

  // Swap From & To users
  const handleSwapUsers = () => {
    const tempUser = fromCustomer;
    setFromCustomer(toCustomer);
    setToCustomer(tempUser);
  };

  // Swap currencies
  const handleSwapCurrencies = () => {
    const tempCurr = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(tempCurr);
    if (parseFloat(rate) > 0) {
      const invRate = (1 / parseFloat(rate)).toFixed(4);
      setRate(invRate);
      const num = parseFloat(fromAmount);
      if (!isNaN(num)) {
        setToAmount((num * parseFloat(invRate)).toFixed(2));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fAmt = parseFloat(fromAmount);
    const tAmt = parseFloat(toAmount);
    const rAmt = parseFloat(rate);

    if (!fromCustomer.trim() || !toCustomer.trim() || isNaN(fAmt) || isNaN(tAmt) || fAmt <= 0) {
      alert(t('exchangeValidationError'));
      return;
    }

    if (fromCustomer.trim().toLowerCase() === toCustomer.trim().toLowerCase()) {
      alert(t('sameUserWarning'));
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const combinedCustomerLabel = `${fromCustomer.trim()} ➔ ${toCustomer.trim()}`;
    const autoMemo = `${fromCustomer.trim()} sent ${fAmt} ${fromCurrency} to ${toCustomer.trim()} received ${tAmt} ${toCurrency} @ ${rAmt}`;

    addTransaction({
      customerName: combinedCustomerLabel,
      fromCustomer: fromCustomer.trim(),
      toCustomer: toCustomer.trim(),
      type: 'exchange',
      amount: fAmt,
      currency: fromCurrency,
      date,
      time: timeStr,
      memo: memo.trim() || autoMemo,
      serialNo: serialNo.trim() || undefined,
      exchangeDetails: {
        fromUser: fromCustomer.trim(),
        toUser: toCustomer.trim(),
        fromCurrency,
        fromAmount: fAmt,
        toCurrency,
        toAmount: tAmt,
        rate: rAmt,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-surface border border-surface-border rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#38bdf8]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] font-black text-base shadow-sm">
              ⇄
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{t('transferAndExchange')}</span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">{t('interWalletRecordOnly')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            aria-label={t('cancel')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 3-Pill Operation Indicator matching CashBookOperations */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-canvas/60 border border-surface-border/80">
          <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#fda4af]/15 border border-[#fda4af]/30 text-[#fda4af] text-xs font-bold">
            <span className="w-4 h-4 rounded-full bg-[#fda4af]/20 flex items-center justify-center text-[10px] font-black">-</span>
            <span className="truncate">{t('transferOut')}</span>
          </div>
          <div className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-[#38bdf8]/20 border border-[#38bdf8]/40 text-[#38bdf8] text-xs font-black shadow-sm">
            <span>⇄</span>
            <span className="truncate">{t('exchangeBtn')}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[#34d399]/15 border border-[#34d399]/30 text-[#34d399] text-xs font-bold">
            <span className="w-4 h-4 rounded-full bg-[#34d399]/20 flex items-center justify-center text-[10px] font-black">+</span>
            <span className="truncate">{t('transferIn')}</span>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TWO USERS / WALLETS SECTION (From User [Out -] ➔ To User [In +]) */}
          <div className="bg-canvas/80 rounded-2xl p-3.5 border border-surface-border/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                <span>{t('interUserBridge')}</span>
              </span>
              <button
                type="button"
                onClick={handleSwapUsers}
                className="text-[11px] text-[#38bdf8] hover:text-[#7dd3fc] hover:bg-[#38bdf8]/20 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/30 transition-all font-semibold"
              >
                <span>{t('swapUsers')}</span> ⇄
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
              {/* From User (Sender Wallet / Out -) */}
              <div className="space-y-1">
                <label className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#fda4af]/20 text-[#fda4af] inline-flex items-center justify-center text-[9px] font-black">-</span>
                    {t('senderWallet')}
                  </span>
                </label>
                <input
                  type="text"
                  list="customers-list-from"
                  required
                  value={fromCustomer}
                  onChange={(e) => setFromCustomer(e.target.value)}
                  placeholder={t('senderPlaceholder')}
                  className="w-full h-11 px-3 rounded-xl bg-surface-input border border-[#fda4af]/30 focus:border-[#fda4af] text-white text-xs sm:text-sm font-semibold focus:outline-none transition-colors"
                />
                <datalist id="customers-list-from">
                  {CUSTOMER_ACCOUNTS.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              {/* To User (Receiver Wallet / In +) */}
              <div className="space-y-1">
                <label className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span className="flex items-center gap-1">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#34d399]/20 text-[#34d399] inline-flex items-center justify-center text-[9px] font-black">+</span>
                    {t('receiverWallet')}
                  </span>
                </label>
                <input
                  type="text"
                  list="customers-list-to"
                  required
                  value={toCustomer}
                  onChange={(e) => setToCustomer(e.target.value)}
                  placeholder={t('receiverPlaceholder')}
                  className="w-full h-11 px-3 rounded-xl bg-surface-input border border-[#34d399]/30 focus:border-[#34d399] text-white text-xs sm:text-sm font-semibold focus:outline-none transition-colors"
                />
                <datalist id="customers-list-to">
                  {CUSTOMER_ACCOUNTS.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* CURRENCY & AMOUNTS SECTION (Out Amount ➔ Rate ➔ In Amount) */}
          <div className="space-y-3">
            {/* From / Out Currency & Amount */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-[#fda4af] mb-1">
                  {t('transferOutAmount')}
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-11 px-3.5 rounded-xl bg-surface-input border border-[#fda4af]/30 focus:border-[#fda4af] text-white text-sm font-mono focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t('giveCurrency')}
                </label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
                  className="w-full h-11 px-2.5 rounded-xl bg-surface-input border border-surface-border text-white text-sm font-semibold focus:outline-none focus:border-brand"
                >
                  <option value="USD">USD</option>
                  <option value="AFN">AFN</option>
                  <option value="PKR">PKR</option>
                </select>
              </div>
            </div>

            {/* Rate & To / In Currency & Amount */}
            <div className="grid grid-cols-3 gap-2 items-end">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#38bdf8]">
                    {t('rate')}
                  </label>
                  <button
                    type="button"
                    onClick={handleSwapCurrencies}
                    title="Swap Currencies"
                    className="text-[11px] text-[#38bdf8] hover:text-[#7dd3fc] font-bold"
                  >
                    ⇄
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  required
                  value={rate}
                  onChange={(e) => handleRateChange(e.target.value)}
                  placeholder="280.5"
                  className="w-full h-11 px-3 rounded-xl bg-surface-input border border-[#38bdf8]/40 focus:border-[#38bdf8] text-white text-xs font-mono focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t('receiveCurrency')}
                </label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
                  className="w-full h-11 px-2.5 rounded-xl bg-surface-input border border-surface-border text-white text-sm font-semibold focus:outline-none focus:border-brand"
                >
                  <option value="PKR">PKR</option>
                  <option value="AFN">AFN</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#34d399] mb-1">
                  {t('transferInAmount')}
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={toAmount}
                  onChange={(e) => setToAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-11 px-2.5 rounded-xl bg-surface-input border border-[#34d399]/30 focus:border-[#34d399] text-white text-xs font-mono focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Date & Serial */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t('date')}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-input border border-surface-border text-white text-xs focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                {t('serialVoucher')}
              </label>
              <input
                type="text"
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-input border border-surface-border text-white text-xs font-mono focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Memo / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              {t('memo')}
            </label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={`${fromCustomer} ➔ ${toCustomer} wallet transfer & conversion`}
              className="w-full h-11 px-3.5 rounded-xl bg-surface-input border border-surface-border text-white text-sm focus:outline-none focus:border-brand"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="w-1/2 h-11 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-slate-300 font-semibold text-sm transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="w-1/2 h-11 rounded-xl bg-[#38bdf8] hover:bg-[#0ea5e9] text-black font-bold text-sm transition-all shadow-glow-brand cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>⇄</span>
              <span>{t('confirmTransfer')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
