'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';

const getThemeSnapshot = () => {
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'dark') {
    return true;
  }

  if (savedTheme === 'light') {
    return false;
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ?? document.documentElement.classList.contains('dark');
};

const subscribeToTheme = (onThemeChange: () => void) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', onThemeChange);
  window.addEventListener('storage', onThemeChange);
  window.addEventListener('themechange', onThemeChange);

  return () => {
    mediaQuery.removeEventListener('change', onThemeChange);
    window.removeEventListener('storage', onThemeChange);
    window.removeEventListener('themechange', onThemeChange);
  };
};

export default function ThemeToggle() {
  const t = useTranslations('Header');
  const isDark = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => true);

  useEffect(() => {
    // 1. Read theme from localStorage first, then fallback to matchMedia or document class
    const savedTheme = localStorage.getItem('theme');
    let isDarkMode = true;

    if (savedTheme === 'dark') {
      isDarkMode = true;
    } else if (savedTheme === 'light') {
      isDarkMode = false;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      isDarkMode = true;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      isDarkMode = false;
    } else {
      isDarkMode = document.documentElement.classList.contains('dark');
    }

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Listen for system theme changes if user hasn't explicitly set preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.setAttribute('data-theme', 'light');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const toggleTheme = async () => {
    const newDark = !isDark;
    const themeValue = newDark ? 'dark' : 'light';

    // 1. Update DOM classes & attributes immediately
    if (newDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Persist client-side because static exports do not have a request-time server.
    try {
      localStorage.setItem('theme', themeValue);
    } catch (e) {
      console.warn('Unable to persist theme to localStorage:', e);
    }
    window.dispatchEvent(new Event('themechange'));
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? t('lightMode') : t('darkMode')}
      title={isDark ? t('lightMode') : t('darkMode')}
      className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-surface-subtle hover:bg-surface-hover text-content-primary border border-surface-border transition-all duration-200 active:scale-95 shadow-sm"
    >
      {!isDark ? (
        // Moon Icon for switching to dark mode
        <svg
          className="w-5 h-5 text-brand hover:-rotate-12 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        // Sun Icon for switching to light mode
        <svg
          className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
    </button>
  );
}
