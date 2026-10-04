'use client';

import React from 'react';

export type MiniLoaderSize = 'xs' | 'sm' | 'md' | 'lg';
export type MiniLoaderVariant = 'default' | 'brand' | 'credit' | 'debit' | 'white' | 'currentColor';

export interface MiniLoaderProps {
  size?: MiniLoaderSize;
  variant?: MiniLoaderVariant;
  text?: string;
  className?: string;
}

const SIZE_MAP: Record<MiniLoaderSize, { spinner: string; text: string; stroke: number }> = {
  xs: { spinner: 'w-3 h-3', text: 'text-xs', stroke: 3 },
  sm: { spinner: 'w-4 h-4', text: 'text-xs', stroke: 3 },
  md: { spinner: 'w-5 h-5', text: 'text-sm', stroke: 2.5 },
  lg: { spinner: 'w-6 h-6', text: 'text-base', stroke: 2.5 },
};

const VARIANT_MAP: Record<MiniLoaderVariant, { track: string; ring: string; text: string }> = {
  default: {
    track: 'text-surface-hover dark:text-[#1e3a5f]',
    ring: 'text-brand',
    text: 'text-content-secondary dark:text-[#94a3b8]',
  },
  brand: {
    track: 'text-brand-subtle dark:text-[#082f49]',
    ring: 'text-brand',
    text: 'text-brand',
  },
  credit: {
    track: 'text-credit-subtle dark:text-[#022c22]',
    ring: 'text-credit',
    text: 'text-credit-text dark:text-credit',
  },
  debit: {
    track: 'text-debit-subtle dark:text-[#450a0a]',
    ring: 'text-debit',
    text: 'text-debit-text dark:text-debit',
  },
  white: {
    track: 'text-white/20',
    ring: 'text-white',
    text: 'text-white',
  },
  currentColor: {
    track: 'opacity-25 text-current',
    ring: 'text-current',
    text: 'text-current',
  },
};

export default function MiniLoader({
  size = 'sm',
  variant = 'default',
  text,
  className = '',
}: MiniLoaderProps) {
  const sizeConfig = SIZE_MAP[size];
  const variantConfig = VARIANT_MAP[variant];

  return (
    <div
      role="status"
      aria-label={text || 'Loading'}
      className={`inline-flex items-center justify-center gap-2 select-none ${className}`}
    >
      <svg
        className={`animate-spin shrink-0 ${sizeConfig.spinner}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className={variantConfig.track}
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth={sizeConfig.stroke}
        />
        <path
          className={variantConfig.ring}
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <span className={`font-medium leading-none ${sizeConfig.text} ${variantConfig.text}`}>
          {text}
        </span>
      )}
    </div>
  );
}
