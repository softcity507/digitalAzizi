'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';

export type LegalSectionTone = 'brand' | 'credit' | 'debit' | 'exchange';

interface LegalSectionCardProps {
  id: string;
  icon: LucideIcon;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  tone?: LegalSectionTone;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const TONE_CLASSES: Record<LegalSectionTone, string> = {
  brand: 'bg-brand-subtle text-brand',
  credit: 'bg-credit-subtle text-credit-text',
  debit: 'bg-debit-subtle text-debit-text',
  exchange: 'bg-exchange-subtle text-exchange',
};

export default function LegalSectionCard({
  id,
  icon: Icon,
  title,
  subtitle,
  tone = 'brand',
  open,
  onToggle,
  children,
}: LegalSectionCardProps) {
  const panelId = `${id}-panel`;

  return (
    <section
      id={id}
      className={`bg-surface border rounded shadow-sm overflow-hidden transition-colors duration-200 ${
        open ? 'border-brand/30' : 'border-surface-border hover:border-brand/30'
      }`}
    >
      <h2>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full flex items-center gap-3.5 p-4 sm:p-5 text-start cursor-pointer focus:outline-none focus-visible:bg-surface-hover/60"
        >
          <span className={`p-2.5 rounded shrink-0 ${TONE_CLASSES[tone]}`}>
            <Icon className="w-5 h-5" aria-hidden="true" />
          </span>
          <span className="flex-1 min-w-0 space-y-0.5">
            <span className="block text-sm sm:text-base font-bold text-content-primary tracking-tight">
              {title}
            </span>
            <span className="block text-xs text-content-muted dark:text-content-secondary">{subtitle}</span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`w-5 h-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
              open ? 'rotate-180 text-brand' : 'text-content-muted dark:text-content-secondary'
            }`}
          />
        </button>
      </h2>

      {/* Animated collapse: grid rows 0fr → 1fr */}
      <div
        id={panelId}
        role="region"
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 sm:px-5 pb-5 pt-1 sm:ps-18.5 space-y-3.5 text-sm text-content-secondary leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
