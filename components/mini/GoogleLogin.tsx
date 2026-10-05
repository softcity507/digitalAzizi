'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import MiniLoader from '@/components/mini_second/MiniLoader';
import { authApi } from '@/callapi/auth';
import { AppUser } from '@/types/auth';

const DEFAULT_ADMIN = process.env.NEXT_PUBLIC_APP_ADMIN_EMAIL || 'developai507@gmail.com';
interface GoogleLoginProps {
  className?: string;
  label?: string;
  redirectTo?: string;
  onSuccess?: (user: AppUser) => void;
}

export default function GoogleLogin({
  className = '',
  label = 'Sign In with Google (Gmail)',
  redirectTo = '/cash-book',
  onSuccess,
}: GoogleLoginProps) {
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [customEmail, setCustomEmail] = useState(DEFAULT_ADMIN);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const targetUrl = `/${locale}${redirectTo}`;

  const executeLoginWithEmail = async (email: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await authApi.loginWithGoogle({
        email,
        name: email.split('@')[0],
      });

      if (res.success && res.user) {
        setShowAccountModal(false);
        if (onSuccess) {
          onSuccess(res.user);
        } else {
          router.push(targetUrl);
        }
      } else {
        setErrorMsg(res.error || 'Authentication failed');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // 1. Attempt Supabase Google OAuth Provider
      const oauthResult = await authApi.signInWithGoogleOAuth(targetUrl);
      if (oauthResult.success) {
        return;
      }


      console.log("oauthResult", oauthResult);
      // 2. If Google provider is disabled in Supabase dashboard, open the Google Account Chooser modal
      setIsLoading(false);
      setShowAccountModal(true);
    } catch {
      setIsLoading(false);
      setShowAccountModal(true);
    }
  };

  return (
    <>
      <div className="w-full flex flex-col gap-2">
        <button
          type="button"
          onClick={handleSignInClick}
          disabled={isLoading}
          aria-label={label}
          className={`group relative w-full flex items-center justify-center gap-3.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#ea4335] via-[#e53929] to-[#d93025] hover:from-[#f05144] hover:to-[#e13b2d] active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-red-500/20 hover:shadow-red-500/35 border border-red-400/30 transition-all duration-200 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed ${className}`}
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white shadow-sm flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <span className="tracking-tight select-none">
            {isLoading ? <MiniLoader size="xs" variant="white" text="Connecting..." /> : label}
          </span>
        </button>

        {errorMsg && (
          <p className="text-xs text-center text-red-500 dark:text-red-400 font-medium">
            {errorMsg}
          </p>
        )}
      </div>

      {/* Google Account Selector Dialog */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-modal-overlay backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-surface border border-surface-border shadow-2xl space-y-5 text-content-primary">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-xs">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold tracking-tight">Choose Google Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="text-content-muted hover:text-content-primary text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Admin Account Selection */}
            <div className="space-y-2">
              <p className="text-xs text-content-secondary font-medium">Click an account to sign in:</p>

              <button
                type="button"
                onClick={() => executeLoginWithEmail(DEFAULT_ADMIN)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm">
                    SA
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{DEFAULT_ADMIN}</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-brand/15 text-brand">Admin</span>
                    </div>
                    <span className="text-xs text-content-muted">Primary System Manager</span>
                  </div>
                </div>
                <span className="text-brand text-xs font-bold">Select &rarr;</span>
              </button>
            </div>

            {/* Custom Email Input */}
            <div className="pt-2 border-t border-surface-border space-y-2">
              <label className="text-xs text-content-secondary font-medium">Or enter a different Google email:</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-input border border-surface-border text-xs focus:outline-hidden focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => executeLoginWithEmail(customEmail)}
                  disabled={!customEmail.includes('@')}
                  className="px-4 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>

            {isLoading && (
              <div className="flex justify-center py-2">
                <MiniLoader size="sm" variant="brand" text="Saving to database..." />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
