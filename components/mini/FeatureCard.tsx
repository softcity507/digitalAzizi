'use client';

import React from 'react';

interface FeatureCardProps {
  badge: React.ReactNode;
  title: string;
  subtitle: string;
  className?: string;
}

export default function FeatureCard({
  badge,
  title,
  subtitle,
  className = '',
}: FeatureCardProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-surface border border-surface-border shadow-md hover:border-brand/40 transition-all duration-200 group text-center ${className}`}
    >
      <div className="mb-2 transition-transform duration-200 group-hover:scale-110">
        {badge}
      </div>
      <h5 className="text-xs sm:text-sm font-bold text-content-primary tracking-tight">
        {title}
      </h5>
      <p className="text-[10px] sm:text-[11px] font-medium text-content-secondary mt-0.5">
        {subtitle}
      </p>
    </div>
  );
}
