'use client';

import React, { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CircleCheck, CircleX, Copyright, FileText, Info, Scale, SearchX, ShieldCheck, TriangleAlert } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { LANGUAGES, SupportedLocale } from '@/i18n/languages';
import AboutHeader from '@/components/mini_second/AboutHeader';
import DeveloperProfileCard from '@/components/mini_second/DeveloperProfileCard';
import SupportedLanguagesCard from '@/components/mini_second/SupportedLanguagesCard';
import LegalSearchBar from '@/components/mini_second/LegalSearchBar';
import LegalSectionCard, { LegalSectionTone } from '@/components/mini_second/LegalSectionCard';
import WhatsAppSupportSection from "@/components/mini_second/WhatsAppContact";
type SectionKey = 'aboutUs' | 'copyrightNotice' | 'privacyPolicy' | 'termsOfService' | 'eula';

interface SectionConfig {
  key: SectionKey;
  icon: LucideIcon;
  tone: LegalSectionTone;
}

const SECTIONS: SectionConfig[] = [
  { key: 'aboutUs', icon: Info, tone: 'brand' },
  { key: 'copyrightNotice', icon: Copyright, tone: 'debit' },
  { key: 'privacyPolicy', icon: ShieldCheck, tone: 'credit' },
  { key: 'termsOfService', icon: Scale, tone: 'exchange' },
  { key: 'eula', icon: FileText, tone: 'brand' },
];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default function AboutContainer() {
  const t = useTranslations('about');
  const locale = useLocale() as SupportedLocale;
  const langInfo = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  const [query, setQuery] = useState('');
  const [openKeys, setOpenKeys] = useState<Set<SectionKey>>(() => new Set(['aboutUs']));
  const trimmedQuery = query.trim();

  // Plain-text content of every section, used for search matching.
  const sectionText: Record<SectionKey, string[]> = useMemo(() => {
    const s = (key: string) => t(`sections.${key}`);
    return {
      aboutUs: [s('aboutUs.title'), s('aboutUs.subtitle'), t('description')],
      copyrightNotice: ['title', 'subtitle', 'text', 'restriction', 'violation', 'allRightsReserved'].map(k => s(`copyrightNotice.${k}`)),
      privacyPolicy: ['title', 'subtitle', 'intro', 'dataCollectionTitle', 'point1', 'point2', 'point3'].map(k => s(`privacyPolicy.${k}`)),
      termsOfService: ['title', 'subtitle', 'agreement', 'prohibitedActionsTitle', 'action1', 'action2', 'action3', 'disclaimerTitle', 'disclaimerText'].map(k => s(`termsOfService.${k}`)),
      eula: ['title', 'subtitle', 'intro', 'grantOfLicense', 'ownership', 'termination'].map(k => s(`eula.${k}`)),
    };
  }, [t]);

  const visibleSections = useMemo(() => {
    if (!trimmedQuery) return SECTIONS;
    const needle = trimmedQuery.toLocaleLowerCase(locale);
    return SECTIONS.filter(section =>
      sectionText[section.key].some(text => text.toLocaleLowerCase(locale).includes(needle))
    );
  }, [trimmedQuery, sectionText, locale]);

  const highlightRegex = useMemo(
    () => (trimmedQuery ? new RegExp(`(${escapeRegExp(trimmedQuery)})`, 'gi') : null),
    [trimmedQuery]
  );

  const hl = (text: string): React.ReactNode => {
    if (!highlightRegex) return text;
    return text.split(highlightRegex).map((part, i) =>
      i % 2 === 1 ? (
        <mark key={i} className="bg-exchange-subtle text-content-primary rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const s = (key: string) => hl(t(`sections.${key}`));

  const toggleSection = (key: SectionKey) => {
    setOpenKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const renderList = (items: string[], icon: LucideIcon, iconClass: string) => {
    const Icon = icon;
    return (
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item} className="flex items-start gap-2.5">
            <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${iconClass}`} aria-hidden="true" />
            <span>{s(item)}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderBody = (key: SectionKey) => {
    switch (key) {
      case 'aboutUs':
        return <p>{hl(t('description'))}</p>;
      case 'copyrightNotice':
        return (
          <>
            <p>{s('copyrightNotice.text')}</p>
            <p>{s('copyrightNotice.restriction')}</p>
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-debit-subtle border border-debit/20">
              <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0 text-debit-text" aria-hidden="true" />
              <p className="text-content-primary font-medium">{s('copyrightNotice.violation')}</p>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-content-primary">
              {s('copyrightNotice.allRightsReserved')}
            </p>
          </>
        );
      case 'privacyPolicy':
        return (
          <>
            <p>{s('privacyPolicy.intro')}</p>
            <h3 className="text-xs sm:text-sm font-bold text-content-primary">{s('privacyPolicy.dataCollectionTitle')}</h3>
            {renderList(['privacyPolicy.point1', 'privacyPolicy.point2', 'privacyPolicy.point3'], CircleCheck, 'text-credit-text')}
          </>
        );
      case 'termsOfService':
        return (
          <>
            <p>{s('termsOfService.agreement')}</p>
            <h3 className="text-xs sm:text-sm font-bold text-content-primary">{s('termsOfService.prohibitedActionsTitle')}</h3>
            {renderList(['termsOfService.action1', 'termsOfService.action2', 'termsOfService.action3'], CircleX, 'text-debit-text')}
            <div className="p-3.5 rounded-xl bg-exchange-subtle border border-exchange/25 space-y-1">
              <h3 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-content-primary">
                <TriangleAlert className="w-4 h-4 text-exchange shrink-0" aria-hidden="true" />
                {s('termsOfService.disclaimerTitle')}
              </h3>
              <p>{s('termsOfService.disclaimerText')}</p>
            </div>
          </>
        );
      case 'eula':
        return (
          <>
            <p>{s('eula.intro')}</p>
            {renderList(['eula.grantOfLicense', 'eula.ownership', 'eula.termination'], CircleCheck, 'text-brand')}
          </>
        );
    }
  };

  return (
    <div
      dir={langInfo.dir}
      lang={langInfo.code}
      className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8 pb-28 sm:pb-20 transition-colors duration-200"
    >
      {/* 1. Title & Trust Panel */}
      <AboutHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        {/* Left Column: Developer & Languages (Sticky on Desktop) */}
        <aside className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          {/* 2. Developer Profile */}
          <DeveloperProfileCard />
                    <WhatsAppSupportSection />

          {/* 3. Supported Languages (from i18n/languages.ts) */}
          <SupportedLanguagesCard />
        </aside>
        
        {/* Right Column: Searchable Legal Sections */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* 4. Search */}
          <LegalSearchBar value={query} onChange={setQuery} />
           
          {/* 5. Legal Sections */}
          {visibleSections.map(section => (
            <LegalSectionCard
              key={section.key}
              id={section.key}
              icon={section.icon}
              tone={section.tone}
              title={s(`${section.key}.title`)}
              subtitle={s(`${section.key}.subtitle`)}
              open={Boolean(trimmedQuery) || openKeys.has(section.key)}
              onToggle={() => toggleSection(section.key)}
            >
              {renderBody(section.key)}
            </LegalSectionCard>
          ))}

          {visibleSections.length === 0 && (
            <div className="flex flex-col items-center text-center gap-3 px-6 py-12 rounded-2xl border border-dashed border-surface-border bg-surface-subtle">
              <div className="p-3 rounded-xl bg-surface text-content-muted dark:text-content-secondary border border-surface-border">
                <SearchX className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-content-primary">
                {t('noResults', { query: trimmedQuery })}
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-brand hover:bg-brand-subtle transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {t('clearSearch')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
