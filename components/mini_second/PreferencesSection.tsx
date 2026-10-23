'use client';

import { useState, useEffect, useSyncExternalStore, useTransition } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { getSecurityStatus, setSecurityPin } from '@/callapi/security';
import { LANGUAGES, SupportedLocale } from '@/i18n/languages';
import { Fingerprint, KeyRound, ShieldCheck, X, Loader2, Check } from 'lucide-react';
import { getAppLockEnabled, setAppLockEnabled } from '@/components/max_second/AppLockGuard';

const getThemeSnapshot = () => {
  if (typeof window === 'undefined') return true;
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') return true;
  if (savedTheme === 'light') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ?? document.documentElement.classList.contains('dark');
};

const subscribeToTheme = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('themechange', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('themechange', callback);
  };
};

const subscribeToAppLock = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('app_lock_setting_changed', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('app_lock_setting_changed', callback);
    window.removeEventListener('storage', callback);
  };
};
const getAppLockSnapshot = () => getAppLockEnabled();

export default function PreferencesSection() {
  const t = useTranslations('Settings');
  const currentLocale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => true);

  // App Lock & Biometrics State
  const isAppLock = useSyncExternalStore(subscribeToAppLock, getAppLockSnapshot, () => false);
  const [hasPin, setHasPin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinModalError, setPinModalError] = useState('');
  const [savingPin, setSavingPin] = useState(false);

  useEffect(() => {
    // Fetch user security status
    getSecurityStatus()
      .then((data) => {
        if (data.success && data.status) {
          setHasPin(Boolean(data.status.hasPin));
        }
      })
      .catch(() => {});
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
    window.dispatchEvent(new Event('themechange'));
  };

  const toggleAppLock = () => {
    if (!isAppLock) {
      if (!hasPin) {
        router.push(`/${currentLocale}/settings/biometrics`);
        return;
      }
      setAppLockEnabled(true);
    } else {
      // Turning OFF
      setAppLockEnabled(false);
    }
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinModalError('');

    if (newPin.length < 4) {
      setPinModalError(t('pinMinLength'));
      return;
    }
    if (newPin !== confirmPin) {
      setPinModalError(t('pinsDoNotMatch'));
      return;
    }

    setSavingPin(true);
    try {
      const data = await setSecurityPin(newPin);
      if (data.success) {
        setHasPin(true);
        setShowPinModal(false);
        setNewPin('');
        setConfirmPin('');
      } else {
        setPinModalError(data.error || t('pinSaveFailed'));
      }
    } catch {
      setPinModalError(t('pinNetworkError'));
    } finally {
      setSavingPin(false);
    }
  };

  const handleLanguageChange = (newLocale: string) => {
    const langInfo = LANGUAGES.find((l) => l.code === newLocale);
    if (langInfo) {
      document.documentElement.dir = langInfo.dir;
      document.documentElement.lang = langInfo.code;
    }
    startTransition(() => {
      const pathWithoutLocale = pathname.replace(/^\/[^/]+/, '') || '/settings';
      router.push(`/${newLocale}${pathWithoutLocale}`);
    });
  };

  return (
    <div className="w-full space-y-3">
      <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-content-primary px-1">
        {t('preferences')}
      </h3>

      <div className="bg-surface border border-surface-border rounded divide-y divide-surface-border overflow-hidden shadow-sm">
        {/* Dark Mode Toggle */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-content-primary">{t('darkMode')}</h4>
            <p className="text-xs text-content-muted">{t('darkModeSubtitle')}</p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            onClick={toggleDarkMode}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isDark ? 'bg-brand' : 'bg-surface-active'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isDark ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* App Language Selector */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-content-primary">{t('appLanguage')}</h4>
            <p className="text-xs text-content-muted">{t('appLanguageSubtitle')}</p>
          </div>

          <select
            value={currentLocale}
            disabled={isPending}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3.5 py-2 rounded bg-surface-subtle border border-surface-border text-xs sm:text-sm font-semibold text-content-primary focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>

        {/* Before the first PIN, offer PIN setup in place of the App Lock switch. */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-content-primary">
                {hasPin ? t('appLock') : t('setPin')}
              </h4>
              {hasPin && isAppLock && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-credit-subtle text-credit-text border border-credit/20">
                  <ShieldCheck className="w-3 h-3" /> {t('active')}
                </span>
              )}
            </div>
            <p className="text-xs text-content-muted">
              {hasPin ? t('appLockSubtitle') : t('pinNotConfigured')}
            </p>
          </div>

          {hasPin ? (
            <button
              type="button"
              role="switch"
              aria-checked={isAppLock}
              onClick={toggleAppLock}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isAppLock ? 'bg-brand' : 'bg-surface-active'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isAppLock ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowPinModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface hover:bg-surface-border text-content-primary text-xs font-semibold transition-colors border border-surface-border cursor-pointer shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {t('setPin')}
            </button>
          )}
        </div>

        {/* Biometric & PIN Management Links */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap bg-surface-subtle/50">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-semibold text-content-primary flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-brand" />
              {t('fingerprintSecurityKeys')}
            </h4>
            <p className="text-xs text-content-muted">
              {hasPin ? t('pinConfigured') : t('pinNotConfigured')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPinModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface hover:bg-surface-border text-content-primary text-xs font-semibold transition-colors border border-surface-border cursor-pointer shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {hasPin ? t('changePin') : t('setPin')}
            </button>

            <Link
              href={`/${currentLocale}/settings/biometrics`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-brand/10 hover:bg-brand-hover/20 text-brand text-xs font-semibold transition-colors border border-brand/20"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              {t('configureSensors')} →
            </Link>
          </div>
        </div>
      </div>

      {/* Set PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-surface border border-surface-border rounded p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-content-primary font-bold text-base">
                <div className="p-2 rounded bg-brand/10 text-brand">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3>{hasPin ? t('changePinTitle') : t('setPinTitle')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="p-1 rounded hover:bg-surface-subtle text-content-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-content-muted">
              {t('pinDescription')}
            </p>

            <form onSubmit={handleSavePin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-content-primary">{t('newPin')}</label>
                <input
                  type="password"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full tracking-widest text-center text-xl font-bold py-2.5 px-3 rounded bg-surface-subtle border border-surface-border text-content-primary focus:outline-none focus:ring-2 focus:ring-brand"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-content-primary">{t('confirmPin')}</label>
                <input
                  type="password"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full tracking-widest text-center text-xl font-bold py-2.5 px-3 rounded bg-surface-subtle border border-surface-border text-content-primary focus:outline-none focus:ring-2 focus:ring-brand"
                  required
                />
              </div>

              {pinModalError && (
                <p className="text-xs text-debit-text font-semibold">{pinModalError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-4 py-2 rounded text-xs font-bold text-content-muted hover:bg-surface-subtle"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={savingPin || newPin.length < 4}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-brand hover:bg-brand-hover disabled:opacity-50 text-brand-foreground text-xs font-bold shadow-md cursor-pointer"
                >
                  {savingPin ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {t('saveEnableLock')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
