'use client';

import { useTranslations } from 'next-intl';
import { BookEntry } from '@/types/customer';
import DoubleEntryBookCard from '@/components/mini/DoubleEntryBookCard';

interface DeskMirrorSectionProps {
  books: BookEntry[];
  className?: string;
}

export default function DeskMirrorSection({
  books,
  className = '',
}: DeskMirrorSectionProps) {
  const t = useTranslations('CustomerBook');

  return (
    <section
      className={`p-4 sm:p-5 rounded-2xl bg-surface border border-surface-border shadow-sm space-y-3.5 w-full ${className}`}
    >
      {/* Header Row: Title, Formula & Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <h2 className="text-sm sm:text-base font-bold text-content-primary">
            {t('deskMirrorTitle')}
          </h2>
          <p className="text-[11px] sm:text-xs font-mono text-content-muted">
            {t('deskMirrorFormula')}
          </p>
        </div>

        <div className="self-start sm:self-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-credit text-black shadow-sm">
            {t('ledgerBalanced')}
          </span>
        </div>
      </div>

      {/* 3 Double-Entry Currency Books Grid (Mapped using .map) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
        {books.map(book => (
          <DoubleEntryBookCard key={book.currency} book={book} />
        ))}
      </div>
    </section>
  );
}
