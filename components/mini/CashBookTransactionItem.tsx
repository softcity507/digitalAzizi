'use client';

import { CashBookEntry } from '@/types/cashbook';
import { useCashBookStore } from '@/store/useCashBookStore';

interface CashBookTransactionItemProps {
  transaction: CashBookEntry;
}

export default function CashBookTransactionItem({
  transaction,
}: CashBookTransactionItemProps) {
  const { openModal } = useCashBookStore();

  const isCashIn = transaction.type === 'cash_in';
  const isExchange = transaction.type === 'exchange';

  const formatAmount = () => {
    const formatted = transaction.amount.toLocaleString('en-US');
    if (isCashIn) return `+${formatted}`;
    if (isExchange) return `⇄ ${formatted}`;
    return `-${formatted}`;
  };

  return (
    <div className="w-full bg-surface/90 hover:bg-surface border border-surface-border hover:border-surface-border-subtle rounded-2xl p-4 transition-all duration-150 shadow-sm group">
      {/* Top Main Row */}
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Customer Name & Type Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-sm sm:text-base font-bold text-white tracking-tight truncate max-w-[140px] sm:max-w-xs">
            {transaction.customerName}
          </span>

          {/* Type Badge */}
          {isCashIn && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30">
              Cash In
            </span>
          )}
          {!isCashIn && !isExchange && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-[#fda4af]/15 text-[#fda4af] border border-[#fda4af]/30">
              Cash Out
            </span>
          )}
          {isExchange && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30">
              Exchange
            </span>
          )}
        </div>

        {/* Right Side: Amount, Currency & Action Icons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Amount Display */}
          <div className="text-right">
            <div
              className={`font-mono font-bold text-sm sm:text-base tracking-tight ${
                isCashIn
                  ? 'text-[#34d399]'
                  : isExchange
                  ? 'text-[#38bdf8]'
                  : 'text-[#fda4af]'
              }`}
            >
              {formatAmount()}
            </div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {transaction.currency}
            </div>
          </div>

          {/* Action Buttons: Edit and Delete */}
          <div className="flex items-center gap-1 pl-1 border-l border-surface-border/60">
            {/* Edit Button */}
            <button
              type="button"
              onClick={() => openModal('edit', transaction)}
              aria-label="Edit Transaction"
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
              aria-label="Delete Transaction"
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

      {/* Bottom Sub-Row: Time, Serial & Memo */}
      <div className="mt-1.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 truncate">
          <span>{transaction.time}</span>
          {transaction.serialNo && (
            <>
              <span>•</span>
              <span className="font-mono text-slate-400">{transaction.serialNo}</span>
            </>
          )}
          {transaction.memo && (
            <>
              <span>•</span>
              <span className="truncate text-slate-400 max-w-[200px]">
                {transaction.memo}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
