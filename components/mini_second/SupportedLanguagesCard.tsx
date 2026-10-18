'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Check, Languages } from 'lucide-react';
import { LANGUAGES, SupportedLocale } from '@/i18n/languages';

export default function SupportedLanguagesCard() {
  const t = useTranslations('about');
  const currentLocale = useLocale() as SupportedLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (newLocale: SupportedLocale) => {
    if (newLocale === currentLocale) return;
    const langInfo = LANGUAGES.find(l => l.code === newLocale);
    if (langInfo) {
      document.documentElement.setAttribute('dir', langInfo.dir);
      document.documentElement.setAttribute('lang', langInfo.code);
    }
    startTransition(() => {
      const pathWithoutLocale = pathname.replace(/^\/[^/]+/, '') || '/about';
      router.push(`/${newLocale}${pathWithoutLocale}`);
    });
  };

  return (
    <section
      aria-labelledby="languages-title"
      className="bg-surface border border-surface-border rounded shadow-sm overflow-hidden"
    >
      <div className="p-4 sm:p-5 flex items-start gap-3 border-b border-surface-border">
        <div className="p-2 rounded bg-brand-subtle text-brand shrink-0">
          <Languages className="w-4 h-4" aria-hidden="true" />
        </div>
        <div className="space-y-0.5">
          <h3 id="languages-title" className="text-xs sm:text-sm font-bold text-content-primary">
            {t('languagesTitle', { count: LANGUAGES.length })}
          </h3>
          <p className="text-xs text-content-muted dark:text-content-secondary leading-relaxed">{t('languagesSubtitle')}</p>
        </div>
      </div>

      <ul className="divide-y divide-surface-border" aria-busy={isPending}>
        {LANGUAGES.map(lang => {
          const active = lang.code === currentLocale;
          return (
            <li key={lang.code}>
              <button
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                disabled={isPending}
                aria-current={active ? 'true' : undefined}
                className={`w-full flex items-center gap-3 px-4 sm:px-5 py-3 text-start transition-colors duration-150 cursor-pointer disabled:cursor-wait focus:outline-none focus-visible:bg-surface-hover ${
                  active ? 'bg-brand-subtle/60' : 'hover:bg-surface-hover/60'
                }`}
              >
                <span
                  className={`w-9 h-9 shrink-0 rounded flex items-center justify-center text-[11px] font-black uppercase tracking-wider border ${
                    active
                      ? 'bg-brand text-brand-foreground border-brand'
                      : 'bg-surface-subtle text-content-secondary border-surface-border'
                  }`}
                >
                  {lang.code}
                </span>

                <span className="flex-1 min-w-0">
                  <span className={`block text-sm font-bold truncate ${active ? 'text-brand' : 'text-content-primary'}`}>
                    <bdi lang={lang.code} dir={lang.dir}>
                      {lang.nativeName}
                    </bdi>
                  </span>
                  <span className="block text-[11px] text-content-muted dark:text-content-secondary truncate">
                    {lang.name} · {lang.region}
                  </span>
                </span>

                {active ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-subtle text-brand border border-brand/20 shrink-0">
                    <Check className="w-3 h-3" aria-hidden="true" />
                    {t('currentLanguage')}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider text-content-muted dark:text-content-secondary border border-surface-border shrink-0">
                    {lang.dir.toUpperCase()}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
