'use client';

import { useLocale } from 'next-intl';
import { useTransition, useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LANGUAGES, SupportedLocale } from '@/i18n/languages';

interface LanguageSelectorProps {
  compact?: boolean;
}

export default function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const currentLocale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [activeLocale, setActiveLocale] = useState(() => currentLocale);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang =
    LANGUAGES.find(l => l.code === activeLocale) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeLocale === currentLocale) return;

    const langInfo = LANGUAGES.find(l => l.code === activeLocale);
    if (langInfo) {
      document.documentElement.dir = langInfo.dir;
      document.documentElement.lang = langInfo.code;
    }

    startTransition(() => {
      const pathWithoutLocale = pathname.replace(/^\/[^/]+/, '') || '/';
      router.push(`/${activeLocale}${pathWithoutLocale}`);
    });
  }, [activeLocale, currentLocale, pathname, router, startTransition]);

  const handleSelect = (localeCode: SupportedLocale) => {
    setIsOpen(false);
    setActiveLocale(localeCode);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        disabled={isPending}
        className={`flex items-center gap-2 rounded-full md:rounded-xl bg-surface-subtle hover:bg-surface-hover text-content-primary border border-surface-border transition-all duration-200 active:scale-95 shadow-sm ${
          compact
            ? 'w-10 h-10 md:w-auto md:px-3 md:py-2 justify-center'
            : 'px-3 py-2 text-xs md:text-sm font-medium'
        }`}
      >
        <span className="text-base">{currentLang.flag}</span>
        {!compact && (
          <span className="hidden sm:inline font-semibold">{currentLang.nativeName}</span>
        )}
        <span className="text-[10px] uppercase font-mono px-1 py-0.5 rounded bg-surface border border-surface-border text-content-secondary">
          {currentLang.code}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-content-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute ltr:right-0 rtl:left-0 mt-3 w-56 sm:w-64 max-h-80 overflow-y-auto rounded-2xl bg-surface border border-surface-border shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-content-muted border-b border-surface-border mb-1">
            Select Language ({LANGUAGES.length})
          </div>
          <div className="space-y-1">
            {LANGUAGES.map(lang => {
              const isSelected = lang.code === activeLocale;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-brand text-black font-bold shadow-sm'
                      : 'text-content-primary hover:bg-surface-hover hover:text-brand'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-content-muted opacity-80">({lang.name})</span>
                  </div>
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono ${
                      isSelected
                        ? 'bg-black/20 text-black'
                        : 'bg-surface-subtle text-content-secondary'
                    }`}
                  >
                    {lang.dir}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
