'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export default function ThemeToggle() {
  const t = useTranslations('Header');
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

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

    setIsDark(isDarkMode);

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
        setIsDark(e.matches);
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

    setIsDark(newDark);

    // 1. Update DOM classes & attributes immediately
    if (newDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // 2. Persist in LocalStorage & Cookies for instant SSR / refresh persistence
    try {
      localStorage.setItem('theme', themeValue);
      document.cookie = `theme=${themeValue}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      console.warn('Unable to persist theme to localStorage/cookie:', e);
    }

    // 3. Connect & sync to DB endpoint
    try {
      await fetch('/api/user/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeValue }),
      });
    } catch (e) {
      // Graceful fallback if backend API/DB is offline or not configured yet
      console.debug('Theme DB sync skipped:', e);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? t('lightMode') : t('darkMode')}
      title={isDark ? t('lightMode') : t('darkMode')}
      className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-surface-subtle hover:bg-surface-hover text-content-primary border border-surface-border transition-all duration-200 active:scale-95 shadow-sm"
    >
      {mounted && !isDark ? (
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

