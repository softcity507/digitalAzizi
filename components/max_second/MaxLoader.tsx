'use client';

import React from 'react';

export interface MaxLoaderProps {
  show?: boolean;
  title?: string;
  subtitle?: string;
  blur?: boolean;
  fullscreen?: boolean;
  className?: string;
}

export default function MaxLoader({
  show = true,
  title = 'Loading...',
  subtitle = 'Please wait while we update your ledger and balances',
  blur = true,
  fullscreen = true,
  className = '',
}: MaxLoaderProps) {
  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={title}
      className={`${
        fullscreen ? 'fixed inset-0 z-50' : 'absolute inset-0 z-40'
      } flex items-center justify-center p-4 transition-all duration-300 ${
        blur ? 'backdrop-blur-md' : ''
      } bg-modal-overlay ${className}`}
    >
      <div className="relative flex flex-col items-center max-w-sm w-full p-6 text-center rounded-2xl bg-surface border border-surface-border shadow-2xl dark:bg-[#0b1e33] dark:border-[#1e3a5f]">
        {/* Animated Brand Glow and Concentric Dual Spinners */}
        <div className="relative flex items-center justify-center w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full bg-brand/20 dark:bg-brand/10 animate-ping opacity-60" />
          <div className="w-14 h-14 rounded-full border-2 border-surface-border dark:border-[#1e3a5f] border-t-brand dark:border-t-brand animate-spin" />
          <div className="absolute w-8 h-8 rounded-full border-2 border-surface-border dark:border-[#1e3a5f] border-b-credit dark:border-b-credit animate-spin [animation-direction:reverse] [animation-duration:1.5s]" />
          <div className="absolute w-3 h-3 rounded-full bg-brand shadow-glow-brand" />
        </div>

        {/* Status Text Details */}
        <h3 className="text-base font-semibold tracking-tight text-content-primary dark:text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1.5 text-xs font-normal text-content-muted dark:text-[#94a3b8] leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Indeterminate Shimmer Progress Bar */}
        <div className="w-full h-1 mt-5 overflow-hidden rounded-full bg-surface-hover dark:bg-[#081a2d]">
          <div className="h-full rounded-full bg-gradient-to-r from-brand via-credit to-brand animate-pulse w-full" />
        </div>
      </div>
    </div>
  );
}
