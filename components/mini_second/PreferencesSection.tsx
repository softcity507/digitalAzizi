'use client';

import { useState, useEffect, useSyncExternalStore, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { LANGUAGES, SupportedLocale } from '@/i18n/languages';
import { Fingerprint, KeyRound, ShieldCheck, X, Loader2, Check } from 'lucide-react';
import { APP_LOCK_KEY } from '@/components/max_second/AppLockGuard';

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

export default function PreferencesSection() {
  const t = useTranslations('Settings');
  const currentLocale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => true);

  // App Lock & Biometrics State
  const [isAppLock, setIsAppLock] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(APP_LOCK_KEY) === 'true';
    }
    return false;
  });
  const [hasPin, setHasPin] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinModalError, setPinModalError] = useState('');
  const [savingPin, setSavingPin] = useState(false);

  useEffect(() => {
    // Fetch user security status
    fetch('/api/auth/security/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'status' }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.status) {
          setHasPin(Boolean(data.status.hasPin));
          setHasCredentials(Boolean(data.status.hasCredentials));
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
      // Either a fallback PIN or a registered device authenticator is sufficient.
      if (!hasPin && !hasCredentials) {
        router.push(`/${currentLocale}/settings/biometrics`);
        return;
      }
      localStorage.setItem(APP_LOCK_KEY, 'true');
      setIsAppLock(true);
      window.dispatchEvent(new Event('app_lock_setting_changed'));
    } else {
      // Turning OFF
      localStorage.setItem(APP_LOCK_KEY, 'false');
      setIsAppLock(false);
      window.dispatchEvent(new Event('app_lock_setting_changed'));
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
      const res = await fetch('/api/auth/security/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', pin: newPin }),
      });

      const data = await res.json();
      if (data.success) {
        setHasPin(true);
        localStorage.setItem(APP_LOCK_KEY, 'true');
        setIsAppLock(true);
        window.dispatchEvent(new Event('app_lock_setting_changed'));
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

      <div className="bg-surface border border-surface-border rounded-2xl divide-y divide-surface-border overflow-hidden shadow-sm">
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
              isDark ? 'bg-sky-400' : 'bg-slate-600'
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
            className="px-3.5 py-2 rounded-xl bg-surface-subtle border border-surface-border text-xs sm:text-sm font-semibold text-content-primary focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>

        {/* Biometric & PIN App Lock Toggle */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-content-primary">
                {t('appLock')}
              </h4>
              {isAppLock && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> {t('active')}
                </span>
              )}
            </div>
            <p className="text-xs text-content-muted">
              {t('appLockSubtitle')}
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isAppLock}
            onClick={toggleAppLock}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isAppLock ? 'bg-sky-500' : 'bg-slate-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isAppLock ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Biometric & PIN Management Links */}
        <div className="p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap bg-surface-subtle/50">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-semibold text-content-primary flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-sky-500" />
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-border text-content-primary text-xs font-semibold transition-colors border border-surface-border cursor-pointer shadow-sm"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {hasPin ? t('changePin') : t('setPin')}
            </button>

            <a
              href={`/${currentLocale}/settings/biometrics`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold transition-colors border border-sky-500/20"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              {t('configureSensors')} →
            </a>
          </div>
        </div>
      </div>

      {/* Set PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-surface border border-surface-border rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-content-primary font-bold text-base">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3>{hasPin ? t('changePinTitle') : t('setPinTitle')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="p-1 rounded-lg hover:bg-surface-subtle text-content-muted cursor-pointer"
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
                  className="w-full tracking-widest text-center text-xl font-bold py-2.5 px-3 rounded-xl bg-surface-subtle border border-surface-border text-content-primary focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                  className="w-full tracking-widest text-center text-xl font-bold py-2.5 px-3 rounded-xl bg-surface-subtle border border-surface-border text-content-primary focus:outline-none focus:ring-2 focus:ring-sky-500"
                  required
                />
              </div>

              {pinModalError && (
                <p className="text-xs text-rose-500 font-semibold">{pinModalError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-content-muted hover:bg-surface-subtle"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={savingPin || newPin.length < 4}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer"
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
