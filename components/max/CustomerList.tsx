'use client';

import { useTranslations } from 'next-intl';
import { CustomerAccount } from '@/types/customer';
import CustomerCard, { type CustomerCardLayout } from '@/components/mini/CustomerCard';

interface CustomerListProps {
  customers: CustomerAccount[];
  className?: string;
  layout?: CustomerCardLayout;
}

export default function CustomerList({
  customers,
  className = '',
  layout = 'default',
}: CustomerListProps) {
  const t = useTranslations('CustomerBook');

  if (customers.length === 0) {
    return (
      <div className="p-8 text-center rounded bg-surface border border-surface-border text-content-muted text-sm">
        {t('noAccountsFound')}
      </div>
    );
  }

  return (
    <section className={`flex flex-col gap-2.5 sm:gap-3 w-full ${className}`}>
      {customers.map(customer => (
        <CustomerCard key={customer.id} customer={customer} layout={layout} />
      ))}
    </section>
  );
}
