'use client';

import { useTranslations } from 'next-intl';

export default function SettingsHeader() {
  const t = useTranslations('Settings');

  return (
    <div className="space-y-1">
      <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-content-muted">
        {t('configuration')}
      </span>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-content-primary tracking-tight">
        {t('title')}
      </h1>
    </div>
  );
}
