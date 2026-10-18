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
  const exchangeDetails = transaction.exchangeDetails;
  const customerReceivesFromCurrency = exchangeDetails?.exchangeType === 'BUY';
  const creditAmount = exchangeDetails
    ? customerReceivesFromCurrency ? exchangeDetails.fromAmount : exchangeDetails.toAmount
    : 0;
  const creditCurrency = exchangeDetails
    ? customerReceivesFromCurrency ? exchangeDetails.fromCurrency : exchangeDetails.toCurrency
    : '';
  const debitAmount = exchangeDetails
    ? customerReceivesFromCurrency ? exchangeDetails.toAmount : exchangeDetails.fromAmount
    : 0;
  const debitCurrency = exchangeDetails
    ? customerReceivesFromCurrency ? exchangeDetails.toCurrency : exchangeDetails.fromCurrency
    : '';

  const formatAmount = () => {
    const formatted = transaction.amount.toLocaleString('en-US');
    if (isCashIn) return `+${formatted}`;
    if (isExchange) return `⇄ ${formatted}`;
    return `-${formatted}`;
  };

  return (
    <div className="w-full bg-surface/90 hover:bg-surface border border-surface-border hover:border-surface-border-subtle rounded p-3.5 sm:p-4 transition-all duration-150 shadow-sm group">
      {/* Top Header Row: Customer Name Badge & Amount (Left & Right) */}
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Auto-adjusting Customer Name Box */}
        <div className="flex items-center min-w-0">
          <div
            className={`px-3 py-1.5 rounded flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 border ${isCashIn
                ? 'bg-credit-subtle text-credit border-credit/30'
                : isExchange
                  ? 'bg-surface-active text-content-primary border-surface-border'
                  : 'bg-debit-subtle text-debit border-debit/30'
              }`}
          >
            <span className="truncate max-w-[140px] sm:max-w-[220px]">
              {transaction.customerName}
            </span>
          </div>
        </div>

        {/* Right Side: Amount & Currency */}
        {isExchange && exchangeDetails ? (
          <div className="shrink-0 flex flex-col items-end rtl:items-start gap-0.5 text-right rtl:text-left font-mono">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold" title="Customer credit">
              <span className="text-[10px] text-content-muted font-normal uppercase">{creditCurrency}</span>
              <span className="text-credit">+{creditAmount.toLocaleString('en-US')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold" title="Customer debit">
              <span className="text-[10px] text-content-muted font-normal uppercase">{debitCurrency}</span>
              <span className="text-debit">−{debitAmount.toLocaleString('en-US')}</span>
            </div>
          </div>
        ) : (
          <div className="text-right rtl:text-left shrink-0">
            <div
              className={`font-mono font-bold text-sm sm:text-base md:text-lg tracking-tight ${isCashIn
                  ? 'text-credit-text'
                  : isExchange
                    ? 'text-content-primary'
                    : 'text-debit-text'
                }`}
            >
              {formatAmount()}
            </div>
            <div className="text-[10px] sm:text-[11px] font-semibold text-content-tertiary uppercase tracking-wider">
              {transaction.currency}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Manner Row: Type Badge, Time/Serial, and Action Buttons */}
      <div className="mt-2.5 pt-2.5 border-t border-surface-border/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* Type Badge */}
          {isCashIn && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-credit-subtle text-credit border border-credit/30 shrink-0">
              {t('cashIn')}
            </span>
          )}
          {!isCashIn && !isExchange && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-debit-subtle text-debit border border-debit/30 shrink-0">
              {t('cashOut')}
            </span>
          )}
          {isExchange && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-surface-active text-content-primary border border-surface-border shrink-0">
              {t('exchange')}
            </span>
          )}

          {/* Time & Voucher Serial */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-content-muted">
            <span>{transaction.time}</span>
            {transaction.serialNo && (
              <>
                <span>•</span>
                <span className="font-mono text-content-tertiary">{transaction.serialNo}</span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons: Edit and Delete */}
        <div className="flex items-center gap-1 pl-1 rtl:pl-0 rtl:pr-1 border-l rtl:border-l-0 rtl:border-r border-surface-border/60 shrink-0">
          {/* Edit Button */}
          <button
            type="button"
            onClick={() => openModal('edit', transaction)}
            aria-label={t('editTransaction')}
            title={t('editTransaction')}
            className="p-1.5 rounded text-content-tertiary hover:text-content-primary hover:bg-surface-hover transition-colors"
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
            className="p-1.5 rounded text-content-tertiary hover:text-debit hover:bg-surface-hover transition-colors"
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

      {/* Bottom Row: Memo snippet if present */}
      {transaction.memo && (
        <div className="mt-2 pt-2 border-t border-surface-border/40 flex items-center gap-1.5 text-xs text-content-muted">
          <svg
            className="w-3.5 h-3.5 text-content-tertiary shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <span className="truncate text-content-secondary font-normal ">
            {transaction.memo}
          </span>
        </div>
      )}
    </div>
  );
}
