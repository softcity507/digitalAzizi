'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';
import type { CurrencyCode } from '@/types/customer';

type CashType = 'cash_in' | 'cash_out';

export default function CustomerCashTransactionActions() {
  const t = useTranslations('CashBook');
  const searchParams = useSearchParams();
  const customerId = searchParams.get('id') || '';
  const { customers, businesses } = useSettingsStore();
  const saveTransaction = useCustomerDetailsStore((state) => state.addCustomerCashTransaction);
  const [type, setType] = useState<CashType | null>(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode | ''>('');
  const [date, setDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const customer = customers.find((item) => item.id === customerId);
  const business = businesses.find((item) => item.id === customer?.businessId)
    || businesses.find((item) => item.isActive);
  const currencies = (business?.supportedCurrencies ?? []).slice(0, 3) as CurrencyCode[];

  const open = (nextType: CashType) => {
    setType(nextType);
    setCurrency(currencies[0] ?? '');
    setError('');
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!type || !customer || !business || !currency || Number(amount) <= 0) return;
    setSaving(true);
    setError('');
    try {
      await saveTransaction({
        customerId: customer.id,
        type,
        amount: Number(amount),
        currency,
        date,
        memo: memo.trim() || undefined,
      });
      setType(null);
      setAmount('');
      setMemo('');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap justify-between gap-2">
        <button type="button" onClick={() => open('cash_in')} className="rounded-xl bg-credit-btn px-4 py-2.5 text-sm font-bold text-credit-foreground shadow-sm hover:bg-credit-hover">
          {t('cashInBtn')}
        </button>
        <button type="button" onClick={() => open('cash_out')} className="rounded-xl bg-debit-btn px-4 py-2.5 text-sm font-bold text-debit-foreground shadow-sm hover:bg-debit-hover">
          {t('cashOutBtn')}
        </button>
      </div>

      {type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-modal-overlay p-4 backdrop-blur-sm" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="customer-cash-title" className="w-full max-w-md space-y-5 rounded-3xl border border-surface-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 id="customer-cash-title" className="text-lg font-bold text-content-primary">{type === 'cash_in' ? t('recordCashIn') : t('recordCashOut')} · {customer?.name}</h2>
              <button type="button" onClick={() => setType(null)} aria-label={t('cancel')} className="rounded-lg p-2 text-content-muted hover:bg-surface-hover">×</button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <label className="col-span-2 block text-xs font-semibold text-content-muted">{t('amount')}
                  <input autoFocus required min="0.000001" step="any" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-surface-border bg-surface-input px-3 text-sm text-content-primary" />
                </label>
                <label className="block text-xs font-semibold text-content-muted">{t('currency')}
                  <select required value={currency} onChange={(event) => setCurrency(event.target.value as CurrencyCode)} className="mt-1 h-11 w-full rounded-xl border border-surface-border bg-surface-input px-2 text-sm text-content-primary">
                    {currencies.map((code) => <option key={code} value={code}>{code}</option>)}
                  </select>
                </label>
              </div>
              <label className="block text-xs font-semibold text-content-muted">{t('date')}
                <input required type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-surface-border bg-surface-input px-3 text-sm text-content-primary" />
              </label>
              <label className="block text-xs font-semibold text-content-muted">{t('memo')}
                <input value={memo} onChange={(event) => setMemo(event.target.value)} className="mt-1 h-11 w-full rounded-xl border border-surface-border bg-surface-input px-3 text-sm text-content-primary" />
              </label>
              {error && <p role="alert" className="text-sm text-debit">Unable to save: {error}</p>}
              {currencies.length === 0 && <p role="alert" className="text-sm text-debit">No currencies are configured for this business.</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setType(null)} className="h-11 w-1/2 rounded-xl border border-surface-border bg-surface-hover text-sm font-semibold text-content-secondary">{t('cancel')}</button>
                <button type="submit" disabled={saving || currencies.length === 0} className={`h-11 w-1/2 rounded-xl text-sm font-bold text-white disabled:opacity-50 ${type === 'cash_in' ? 'bg-credit-btn' : 'bg-debit-btn'}`}>
                  {saving ? 'Saving…' : type === 'cash_in' ? t('confirmCashIn') : t('confirmCashOut')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
