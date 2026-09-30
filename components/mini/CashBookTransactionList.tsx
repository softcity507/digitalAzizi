'use client';

import { useTranslations } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import CashBookTransactionItem from './CashBookTransactionItem';
import { User, X, Plus } from 'lucide-react';

export default function CashBookTransactionList() {
  const t = useTranslations('CashBook');
  const { getFilteredTransactions, selectedCustomerId, setSelectedCustomerId, selectedDate, openModal } = useCashBookStore();
  const allCustomers = useSettingsStore((state) => state.customers);
  const activeCustomer = selectedCustomerId ? allCustomers.find((c) => c.id === selectedCustomerId) : null;

  const transactions = getFilteredTransactions();

  return (
    <div className="w-full space-y-2.5">
      {/* Active Customer Filter Banner (if a customer is selected) */}
      {activeCustomer && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-sky-400/10 border border-sky-400/25 text-xs text-sky-400">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-sky-400" />
            <span>
              Showing transactions for: <strong className="font-bold text-content-primary">{activeCustomer.name}</strong>
              {activeCustomer.subtitle && <span className="text-content-muted ml-1">({activeCustomer.subtitle})</span>}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedCustomerId(null)}
            className="flex items-center gap-1 text-[11px] font-semibold text-content-muted hover:text-content-primary p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filter</span>
          </button>
        </div>
      )}

      {/* Transactions List or Empty State */}
      {transactions.length === 0 ? (
        <div className="w-full bg-surface/60 rounded-3xl border border-dashed border-surface-border p-8 sm:p-12 text-center space-y-3.5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-surface/90 border border-surface-border flex items-center justify-center text-2xl text-slate-400 shadow-sm">
            🔍
          </div>
          <div className="space-y-1">
            <div className="text-sm sm:text-base font-bold text-slate-200">
              {activeCustomer
                ? `No transactions on ${selectedDate} for ${activeCustomer.name}`
                : t('noTransactions')}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
              {activeCustomer
                ? 'Try picking another date from the date bar or record a new cash entry.'
                : t('noTransactionsDesc')}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            {activeCustomer && (
              <button
                type="button"
                onClick={() => setSelectedCustomerId(null)}
                className="px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-xs font-semibold text-content-primary transition-colors cursor-pointer"
              >
                View All Customers
              </button>
            )}
            <button
              type="button"
              onClick={() => openModal('cash_in')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#34d399] hover:bg-[#10b981] text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Cash In</span>
            </button>
          </div>
        </div>
      ) : (
        transactions.map((tx) => (
          <CashBookTransactionItem key={tx.id} transaction={tx} />
        ))
      )}
    </div>
  );
}
