'use client';

import { useTranslations } from 'next-intl';
import { CashBookEntry } from '@/types/cashbook';
import { useCashBookStore } from '@/store/useCashBookStore';

interface CashBookTransactionItemProps {
  transaction: CashBookEntry;
}

export default function CashBookTransactionItem({
  transaction,
}: CashBookTransactionItemProps) {
  const t = useTranslations('CashBook');
  const { openModal } = useCashBookStore();

  const isCashIn = transaction.type === 'cash_in';
  const isExchange = transaction.type === 'exchange';

  const formatAmount = () => {
    const formatted = transaction.amount.toLocaleString('en-US');
    if (isCashIn) return `+${formatted}`;
    if (isExchange) return `⇄ ${formatted}`;
    return `-${formatted}`;
  };

  // Get initials from customer name
  const initials = transaction.customerName
    ? transaction.customerName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'CB';

  return (
    <div className="w-full bg-surface/90 hover:bg-surface border border-surface-border hover:border-surface-border-subtle rounded-2xl p-3.5 sm:p-4 transition-all duration-150 shadow-sm group">
      {/* Top Main Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Avatar, Customer Name & Type Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Avatar / Initials */}
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 border ${
              isCashIn
                ? 'bg-[#34d399]/15 text-[#34d399] border-[#34d399]/30'
                : isExchange
                ? 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/30'
                : 'bg-[#fda4af]/15 text-[#fda4af] border-[#fda4af]/30'
            }`}
          >
            {initials}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {/* If exchange has fromCustomer and toCustomer or combined name with arrow */}
              {isExchange && (transaction.fromCustomer || transaction.customerName.includes('➔')) ? (
                <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-white tracking-tight">
                  <span className="text-[#38bdf8] truncate max-w-[100px] sm:max-w-[130px]">
                    {transaction.fromCustomer || transaction.customerName.split('➔')[0].trim()}
                  </span>
                  <span className="text-slate-400 text-xs">➔</span>
                  <span className="text-[#34d399] truncate max-w-[100px] sm:max-w-[130px]">
                    {transaction.toCustomer || transaction.customerName.split('➔')[1]?.trim()}
                  </span>
                </div>
              ) : (
                <span className="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-[130px] sm:max-w-xs">
                  {transaction.customerName}
                </span>
              )}

              {/* Type Badge */}
              {isCashIn && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30 shrink-0">
                  {t('cashIn')}
                </span>
              )}
              {!isCashIn && !isExchange && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold bg-[#fda4af]/15 text-[#fda4af] border border-[#fda4af]/30 shrink-0">
                  {t('cashOut')}
                </span>
              )}
              {isExchange && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30 shrink-0">
                  {t('exchange')}
                </span>
              )}
            </div>

            {/* Sub-row: Time & Voucher Serial */}
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 mt-0.5">
              <span>{transaction.time}</span>
              {transaction.serialNo && (
                <>
                  <span>•</span>
                  <span className="font-mono text-slate-400">{transaction.serialNo}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Amount, Currency & Action Icons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Amount Display */}
          <div className="text-right rtl:text-left">
            <div
              className={`font-mono font-bold text-sm sm:text-base md:text-lg tracking-tight ${
                isCashIn
                  ? 'text-[#34d399]'
                  : isExchange
                  ? 'text-[#38bdf8]'
                  : 'text-[#fda4af]'
              }`}
            >
              {formatAmount()}
            </div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {transaction.currency}
            </div>
          </div>

          {/* Action Buttons: Edit and Delete */}
          <div className="flex items-center gap-1 pl-1 rtl:pl-0 rtl:pr-1 border-l rtl:border-l-0 rtl:border-r border-surface-border/60">
            {/* Edit Button */}
            <button
              type="button"
              onClick={() => openModal('edit', transaction)}
              aria-label={t('editTransaction')}
              title={t('editTransaction')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#38bdf8] hover:bg-surface-hover transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => openModal('delete', null, transaction.id)}
              aria-label={t('deleteTransaction')}
              title={t('deleteTransaction')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-[#f87171] hover:bg-surface-hover transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Memo snippet if present */}
      {transaction.memo && (
        <div className="mt-2 pt-2 border-t border-surface-border/40 flex items-center gap-1.5 text-xs text-slate-400">
          <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <span className="truncate text-slate-300 font-normal">
            {transaction.memo}
          </span>
        </div>
      )}
    </div>
  );
}
