'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { NAV_ITEMS_CONFIG } from '@/data/navigation';

interface LinksProps {
  variant?: 'desktop-header' | 'mobile-bottom' | 'mobile-drawer';
  activeHref?: string;
  onNavigate?: () => void;
}

export default function Links({
  variant = 'desktop-header',
  activeHref,
  onNavigate,
}: LinksProps) {
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  const isCurrentActive = (itemHref: string) => {
    if (activeHref) return activeHref === itemHref;
    if (itemHref === '/customers') return pathname === '/customers' || pathname === '/';
    return pathname.startsWith(itemHref);
  };

  if (variant === 'desktop-header') {
    return (
      <nav className="flex items-center gap-1.5 p-1 bg-surface-subtle/80 backdrop-blur rounded-2xl border border-surface-border">
        {NAV_ITEMS_CONFIG.map(item => {
          const active = isCurrentActive(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavigate}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 select-none ${
                active
                  ? 'bg-surface text-brand shadow-sm border border-surface-border'
                  : 'text-content-secondary hover:text-content-primary hover:bg-surface-hover/60'
              }`}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </nav>
    );
  }

  if (variant === 'mobile-bottom') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-lg border-t border-surface-border px-2 py-1.5 lg:hidden shadow-2xl">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {NAV_ITEMS_CONFIG.map(item => {
            const active = isCurrentActive(item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={onNavigate}
                className={`flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl text-[10px] font-semibold transition-all duration-200 ${
                  active ? 'text-brand scale-105' : 'text-content-muted hover:text-content-primary'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    active ? 'bg-brand/15 text-brand shadow-glow-brand' : 'text-content-muted'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.iconPath} />
                  </svg>
                </div>
                <span className="tracking-tight">{t(item.key)}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1 w-full">
      {NAV_ITEMS_CONFIG.map(item => {
        const active = isCurrentActive(item.href);
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              active
                ? 'bg-brand/15 text-brand border border-brand/30'
                : 'text-content-secondary hover:bg-surface-hover hover:text-content-primary'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.iconPath} />
            </svg>
            <span>{t(item.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
