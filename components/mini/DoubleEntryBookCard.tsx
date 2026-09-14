'use client';

import { BookEntry } from '@/types/customer';

interface DoubleEntryBookCardProps {
  book: BookEntry;
  className?: string;
}

export default function DoubleEntryBookCard({
  book,
  className = '',
}: DoubleEntryBookCardProps) {
  return (
    <div
      className={`p-3 sm:p-3.5 rounded-xl bg-surface-subtle border border-surface-border/60 space-y-1.5 ${className}`}
    >
      {/* Book Title */}
      <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-content-muted">
        {book.currency} BOOK
      </div>

      {/* Credit & Debit Values */}
      <div className="space-y-0.5 text-xs sm:text-sm font-mono font-semibold">
        <div className="text-credit">
          Cr: <span>{book.cr}</span>
        </div>
        <div className="text-debit">
          Dr: <span>{book.dr}</span>
        </div>
      </div>

      {/* Net Balance Status */}
      <div className="text-[10px] sm:text-[11px] font-mono text-content-muted pt-0.5 border-t border-surface-border/40">
        Net: {book.net} ({book.status})
      </div>
    </div>
  );
}
