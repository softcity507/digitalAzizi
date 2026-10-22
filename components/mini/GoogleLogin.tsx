'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import MiniLoader from '@/components/mini_second/MiniLoader';
import { authApi } from '@/callapi/auth';

interface GoogleLoginProps {
  className?: string;
  label?: string;
  redirectTo?: string;
}

export default function GoogleLogin({ className = '', label, redirectTo = '/cash-book' }: GoogleLoginProps) {
  const locale = useLocale();
  const t = useTranslations('Landing');
  const buttonLabel = label || t('signInGoogle');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('auth_error'),
  );

  useEffect(() => {
    // The native OAuth browser can be dismissed or left in the background.
    // Clear the button's pending state when the app becomes active again.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') setIsLoading(false);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  const handleSignIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);
    const requestedPath = new URLSearchParams(window.location.search).get('redirect');
    const safeRequestedPath = requestedPath?.startsWith('/') && !requestedPath.startsWith('//')
      ? requestedPath
      : `/${locale}${redirectTo}`;
    const result = await authApi.signInWithGoogleOAuth(safeRequestedPath);
    if (!result.success) {
      setErrorMsg(result.error || 'Google sign-in could not be started.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isLoading}
        aria-label={buttonLabel}
        className={`group relative w-full flex items-center justify-center gap-3.5 px-6 py-3.5 rounded bg-gradient-to-r from-[#ea4335] via-[#e53929] to-[#d93025] hover:from-[#f05144] hover:to-[#e13b2d] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-red-500/20 hover:shadow-red-500/35 border border-red-400/30 transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${className}`}
      >
        <span className="flex items-center justify-center w-7 h-7 rounded bg-white shadow-sm flex-shrink-0">
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
        </span>
        <span className="tracking-tight select-none">
          {isLoading ? <MiniLoader size="xs" variant="white" text="Connecting..." /> : buttonLabel}
        </span>
      </button>
      {errorMsg && <p className="text-xs text-center text-red-500 dark:text-red-400 font-medium">{errorMsg}</p>}
    </div>
  );
}
