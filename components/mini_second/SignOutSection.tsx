'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export default function SignOutSection() {
  const t = useTranslations('Settings');
  const locale = useLocale();
  const router = useRouter();

  const handleSignOut = () => {
    if (confirm(t('confirmSignOut'))) {
      router.push(`/${locale}`);
    }
  };

  return (
    <div className="w-full space-y-3 pt-2">
      <button
        type="button"
        onClick={handleSignOut}
        className="w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md active:scale-[0.99] cursor-pointer text-center"
      >
        {t('signOutButton')}
      </button>

      <p className="text-center text-[10px] sm:text-[11px] font-mono text-content-muted">
        {t('encryptionProtocolNotice')}
      </p>
    </div>
  );
}
