'use client';

import { useState } from 'react';
import { useCashBookStore } from '@/store/useCashBookStore';
import { CurrencyCode } from '@/types/cashbook';
import { CUSTOMER_ACCOUNTS } from '@/data/customerData';

export default function ExchangeModal() {
  const { activeModal, closeModal, addTransaction, selectedDate } = useCashBookStore();

  const [customerName, setCustomerName] = useState('');
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [fromAmount, setFromAmount] = useState('');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('PKR');
  const [toAmount, setToAmount] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fAmt = parseFloat(fromAmount);
    const tAmt = parseFloat(toAmount);
    const rAmt = parseFloat(rate);

    if (!customerName.trim() || isNaN(fAmt) || isNaN(tAmt) || fAmt <= 0) {
      alert('Please fill all exchange fields with valid amounts.');
      return;
    }

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    addTransaction({
      customerName: customerName.trim(),
      type: 'exchange',
      amount: fAmt,
      currency: fromCurrency,
      date,
      time: timeStr,
      memo: memo.trim() || `Exchanged ${fAmt} ${fromCurrency} to ${tAmt} ${toCurrency} @ ${rAmt}`,
      serialNo: serialNo.trim() || undefined,
      exchangeDetails: {
        fromCurrency,
        fromAmount: fAmt,
        toCurrency,
        toAmount: tAmt,
        rate: rAmt,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-surface-border rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#38bdf8]/20 border border-[#38bdf8]/40 flex items-center justify-center text-[#38bdf8] font-bold">
              ⇄
            </div>
            <h2 className="text-lg font-bold text-white">Currency Exchange</h2>
          </div>
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Counterparty Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Customer / Counterparty
            </label>
            <input
              type="text"
              list="customers-list-ex"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Exchange Wahid"
              className="w-full h-11 px-3.5 rounded-xl bg-surface-input border border-surface-border text-white text-sm focus:outline-none focus:border-brand"
            />
            <datalist id="customers-list-ex">
              {CUSTOMER_ACCOUNTS.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>

          {/* From Currency & Amount */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Give (From Amount)
              </label>
              <input
                type="number"
                step="any"
                required
                value={fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full h-11 px-3.5 rounded-xl bg-surface-input border border-surface-border text-white text-sm font-mono focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Give Currency
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

          {/* Rate & To Currency */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Rate
              </label>
              <input
                type="number"
                step="any"
                required
                value={rate}
                onChange={(e) => handleRateChange(e.target.value)}
                placeholder="280.5"
                className="w-full h-11 px-3 rounded-xl bg-surface-input border border-surface-border text-white text-xs font-mono focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Receive Currency
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
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Get Amount
              </label>
              <input
                type="number"
                step="any"
                required
                value={toAmount}
                onChange={(e) => setToAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-11 px-2.5 rounded-xl bg-surface-input border border-surface-border text-white text-xs font-mono focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Date & Serial */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Date
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
                Serial Voucher
              </label>
              <input
                type="text"
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-input border border-surface-border text-white text-xs font-mono focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={closeModal}
              className="w-1/2 h-11 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-slate-300 font-semibold text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 h-11 rounded-xl bg-[#38bdf8] hover:bg-[#0ea5e9] text-black font-bold text-sm transition-all shadow-glow-brand cursor-pointer"
            >
              Confirm Exchange
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
