'use client';

import { useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function RecycleBinSection() {
  const { businesses, recycledBusinesses, recycledCustomers, restoreBusiness, restoreCustomer } = useSettingsStore();
  const visibleRecycledCustomers = recycledCustomers.filter((customer) =>
    businesses.some((business) => business.id === customer.businessId)
  );
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const restore = async (kind: 'business' | 'customer', id: string) => {
    setError(null);
    setRestoringId(`${kind}:${id}`);
    try {
      if (kind === 'business') await restoreBusiness(id);
      else await restoreCustomer(id);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to restore item.');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <section className="w-full space-y-2.5 rounded-2xl border border-surface-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-content-muted" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-content-primary">Recycle bin</h3>
        </div>
        <span className="rounded-full border border-surface-border bg-surface-subtle px-2 py-0.5 text-[10px] font-mono text-content-muted">
          {visibleRecycledCustomers.length} customers · {recycledBusinesses.length} businesses
        </span>
      </div>

      {error && <p role="alert" className="text-[11px] text-red-500">{error}</p>}
      {recycledBusinesses.length === 0 && visibleRecycledCustomers.length === 0 ? (
        <p className="text-xs text-content-muted">Deleted customers and businesses will appear here for 15 days.</p>
      ) : (
        <div className="max-h-44 space-y-2 overflow-y-auto">
          {recycledBusinesses.map((business) => (
            <div key={`business:${business.id}`} className="rounded-2xl border border-surface-border bg-surface p-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <h4 className="truncate text-sm font-bold text-content-primary">{business.name}</h4>
                  <span className="shrink-0 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-semibold text-amber-500">Deleted</span>
                </div>
                <button type="button" onClick={() => void restore('business', business.id)} disabled={restoringId !== null} className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-sky-500 hover:bg-sky-500/10 disabled:opacity-50">
                  <RotateCcw className="h-3 w-3" /> Restore
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-surface-border/60 pt-2">
                <span className="rounded-md border border-sky-400/20 bg-sky-400/10 px-2 py-0.5 text-[10px] font-bold text-sky-400">
                  {business.customerCount ?? 0} customers
                </span>
                <div className="flex items-center gap-1.5">
                  {business.supportedCurrencies.slice(0, 3).map((currency) => (
                    <span key={currency} className="rounded-md border border-surface-border bg-surface-subtle px-2 py-0.5 text-[10px] font-mono font-bold text-content-secondary">{currency}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {visibleRecycledCustomers.map((customer) => (
            <div key={`customer:${customer.id}`} className="flex items-center justify-between gap-2 rounded-xl bg-surface-subtle px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-content-primary">{customer.name} <span className="font-normal text-content-muted">· Customer · {businesses.find((business) => business.id === customer.businessId)?.name ?? 'Unknown business'}</span></p>
                <div className="mt-1 flex flex-wrap gap-1">{customer.balances.slice(0, 3).map((balance) => <span key={balance.currency} className="rounded border border-surface-border px-1.5 py-0.5 text-[9px] font-mono text-content-muted">{balance.currency}: {balance.amount}</span>)}</div>
              </div>
              <button type="button" onClick={() => void restore('customer', customer.id)} disabled={restoringId !== null} className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-sky-500 hover:bg-sky-500/10 disabled:opacity-50">
                <RotateCcw className="h-3 w-3" /> Restore
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
