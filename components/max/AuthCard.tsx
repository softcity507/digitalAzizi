'use client';

import GoogleLogin from '@/components/mini/GoogleLogin';
import NoticeCard from '@/components/mini/NoticeCard';
import { useTranslations } from 'next-intl';

interface AuthCardProps {
  className?: string;
}

export default function AuthCard({ className = '' }: AuthCardProps) {
  const t = useTranslations('Landing');

  return (
    <div
      className={`w-full max-w-xl mx-auto rounded bg-surface border border-surface-border p-5 sm:p-7 shadow-xl shadow-black/20 space-y-5 transition-all duration-200 ${className}`}
    >
      {/* Title and Subtitle */}
      <div className="text-center space-y-1">
        <h2 className="text-lg sm:text-xl font-bold text-content-primary tracking-tight">
          {t('signInTitle') || 'Sign In to Exchange Portal'}
        </h2>
        <p className="text-xs sm:text-sm text-content-secondary">
          {t('signInSubtitle') || 'Single Sign-On enabled via Google Workspace'}
        </p>
      </div>

      {/* Google Login CTA */}
      <div className="w-full pt-1">
        <GoogleLogin
          label={t('signInGoogle') || 'Sign In with Google (Gmail)'}
          redirectTo="/cash-book"
        />
      </div>

      {/* Trial and subscription notice */}
      <NoticeCard
        title="7-day free trial"
        description="Your trial starts when your account is created. When it ends, contact the administrator to request more subscription days."
      />
    </div>
  );
}
