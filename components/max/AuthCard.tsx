'use client';

import GoogleLogin from '@/components/mini/GoogleLogin';
import NoticeCard from '@/components/mini/NoticeCard';
import { useTranslations } from 'next-intl';

interface AuthCardProps {
  className?: string;
  onSuccess?: () => void;
}

export default function AuthCard({ className = '', onSuccess }: AuthCardProps) {
  const t = useTranslations('Landing');

  return (
    <div
      className={`w-full max-w-xl mx-auto rounded-3xl bg-surface border border-surface-border p-5 sm:p-7 shadow-xl shadow-black/20 space-y-5 transition-all duration-200 ${className}`}
    >
      {/* Title and Subtitle */}
      <div className="text-center space-y-1">
        <h2 className="text-lg sm:text-xl font-bold text-content-primary tracking-tight">
          {t('signInTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-content-secondary">
          {t('signInSubtitle')}
        </p>
      </div>

      {/* Google Login CTA */}
      <GoogleLogin
        label={t('signInGoogle')}
        onSuccess={onSuccess}
        redirectTo="/cash-book"
      />

      {/* Legacy Password Retirment Notice */}
      <NoticeCard
        title={t('legacyNoticeTitle')}
        description={t('legacyNoticeDesc')}
      />
    </div>
  );
}
