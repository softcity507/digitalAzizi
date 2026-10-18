'use client';

import { useTranslations } from 'next-intl';
import { useCashBookStore } from '@/store/useCashBookStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import CashBookTransactionItem from './CashBookTransactionItem';
import { User, X } from 'lucide-react';

export default function CashBookTransactionList() {
  const t = useTranslations('CashBook');
  const {
    transactions: loadedTransactions,
    getFilteredTransactions,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedDate,
    setSelectedDate,
    setFilterCurrency,
    setSearchQuery,
   } = useCashBookStore();
  const allCustomers = useSettingsStore((state) => state.customers);
  const activeCustomer = selectedCustomerId ? allCustomers.find((c) => c.id === selectedCustomerId) : null;

  const transactions = getFilteredTransactions();

  return (
    <div className="w-full space-y-2.5">
      {/* Active Customer Filter Banner (if a customer is selected) */}
      {activeCustomer && (
        <div className="flex items-center justify-between px-3.5 py-2 rounded bg-surface-active border border-surface-border text-xs text-content-primary">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-content-primary" />
            <span>
              {t('showingFor')} <strong className="font-bold text-content-primary">{activeCustomer.name}</strong>
              {activeCustomer.subtitle && <span className="text-content-muted ml-1">({activeCustomer.subtitle})</span>}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedCustomerId(null)}
            className="flex items-center gap-1 text-[11px] font-semibold text-content-muted hover:text-content-primary p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>{t('clearFilter')}</span>
          </button>
        </div>
      )}

      {/* Transactions List or Empty State */}
      {transactions.length === 0 ? (
        <div className="w-full bg-surface/60 rounded border border-dashed border-surface-border p-8 sm:p-12 text-center space-y-3.5">

          <div className="space-y-1">
            <div className="text-sm sm:text-base font-bold text-content-primary">
              {loadedTransactions.length === 0
                ? t('noTransactionsAll')
                : activeCustomer
                  ? `${activeCustomer.name} (${selectedDate})`
                  : t('noTransactions')}
            </div>
            <p className="text-xs sm:text-sm text-content-muted max-w-sm mx-auto">
              {loadedTransactions.length === 0
                ? t('noTransactionsDesc')
                : activeCustomer
                  ? t('noTransactionsDesc')
                  : t('noTransactionsDesc')}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            {loadedTransactions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomerId(null);
                  setFilterCurrency('ALL');
                  setSearchQuery('');
                  setSelectedDate(loadedTransactions[0].date);
                }}
                className="px-3 py-1.5 rounded bg-surface-subtle hover:bg-surface-hover border border-surface-border text-xs font-semibold text-content-primary transition-colors cursor-pointer"
              >
                {t('showAllDates')}
              </button>
            )}
            {activeCustomer && (
              <button
                type="button"
                onClick={() => setSelectedCustomerId(null)}
                className="px-3 py-1.5 rounded bg-surface-subtle hover:bg-surface-hover border border-surface-border text-xs font-semibold text-content-primary transition-colors cursor-pointer"
              >
                {t('allCustomers')}
              </button>
            )}

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
