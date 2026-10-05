'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { authApi } from '@/callapi/auth';
import MiniLoader from '@/components/mini_second/MiniLoader';

export default function SignOutSection() {
  const t = useTranslations('Settings');
  const locale = useLocale();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    if (!confirm(t('confirmSignOut'))) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } finally {
      router.push(`/${locale}`);
      router.refresh();
    }
  };

  return (
    <div className="w-full space-y-3 pt-2">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isLoggingOut}
        className="w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md active:scale-[0.99] cursor-pointer text-center disabled:opacity-50"
      >
        {isLoggingOut ? <MiniLoader size="xs" variant="white" text="Signing out..." /> : t('signOutButton')}
      </button>

      <p className="text-center text-[10px] sm:text-[11px] font-mono text-content-muted">
        {t('encryptionProtocolNotice')}
      </p>
    </div>
  );
}
