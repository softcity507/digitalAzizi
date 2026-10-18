'use client';

import { useTranslations } from 'next-intl';
import { Mail } from 'lucide-react';

export default function DeveloperProfileCard() {
  const t = useTranslations('about');
  const owner = t('owner');
  const email = t('email');

  // Works for any script: first character of the first two words.
  const initials = owner
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(word => Array.from(word)[0])
    .join('');

  return (
    <section
      aria-labelledby="developer-name"
      className="bg-surface border border-surface-border rounded shadow-sm overflow-hidden"
    >
      <div className="p-5 sm:p-6 space-y-5">
        {/* Identity */}
        <div className="flex items-center gap-4">
          <div
            aria-hidden="true"
            className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded bg-brand-subtle border border-brand/20 text-brand flex items-center justify-center text-lg sm:text-xl font-black tracking-tight"
          >
            {initials}
          </div>
          <div className="min-w-0 space-y-0.5">
            <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-content-muted dark:text-content-secondary">
              {t('developerLabel')}
            </span>
            <h2 id="developer-name" className="text-lg sm:text-xl font-extrabold text-content-primary tracking-tight truncate">
              {owner}
            </h2>
            <p className="text-xs font-semibold text-brand">{t('appName')}</p>
          </div>
        </div>

        <p className="text-sm text-content-secondary leading-relaxed">
          {t('descriptionPashto')}
        </p>

        {/* Contact */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-brand hover:bg-brand-hover active:bg-brand-active text-brand-foreground text-xs sm:text-sm font-bold shadow-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            {t('contactDeveloper')}
          </a>
          <span dir="ltr" className="text-xs font-medium text-content-muted dark:text-content-secondary break-all select-all">
            {email}
          </span>
        </div>
      </div>

      <div className="px-5 sm:px-6 py-3.5 bg-surface-subtle border-t border-surface-border">
        <p className="text-[11px] sm:text-xs text-content-muted dark:text-content-secondary">{t('copyright')}</p>
      </div>
    </section>
  );
}
