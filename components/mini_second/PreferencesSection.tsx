'use client';

import { useSyncExternalStore, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { LANGUAGES, SupportedLocale } from '@/i18n/languages';

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
      </div>
    </div>
  );
}
