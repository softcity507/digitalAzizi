'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { CustomerAccount } from '@/types/customer';

interface CustomerCardProps {
  customer: CustomerAccount;
  className?: string;
}

export default function CustomerCard({
  customer,
  className = '',
}: CustomerCardProps) {
  const locale = useLocale();

  return (
    <Link
      href={`/${locale}/details?id=${customer.id}`}
      className={`group flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-surface border border-surface-border shadow-sm hover:border-brand/40 hover:bg-surface-hover/50 transition-all duration-200 cursor-pointer ${className}`}
    >
      {/* Left Column: Customer Details */}
      <div className="flex flex-col items-start gap-1 pr-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm sm:text-base font-bold text-content-primary group-hover:text-brand transition-colors">
            {customer.name}
          </h3>
          {customer.badge && (
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-brand/15 text-brand border border-brand/30">
              {customer.badge}
            </span>
          )}
        </div>

        {customer.subtitle && (
          <span className="text-xs text-content-secondary font-medium">
            {customer.subtitle}
          </span>
        )}

        {customer.phone && (
          <span className="text-[11px] font-mono text-content-muted">
            {customer.phone}
          </span>
        )}
      </div>

      {/* Right Column: Currency Balances (Mapped using .map) */}
      <div className="flex flex-col items-end gap-0.5 text-right font-mono flex-shrink-0">
        {customer.balances.map((bal, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-xs sm:text-sm font-bold">
            <span className="text-[10px] text-content-muted font-normal uppercase">
              {bal.currency}
            </span>
            <span className={bal.isCredit ? 'text-credit' : 'text-debit'}>
              {bal.amount}
            </span>
          </div>
        ))}
      </div>
    </Link>
  );
}
