'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Logo from '@/components/mini/Logo';
import { NAV_ITEMS_CONFIG } from '@/data/navigation';

interface FooterProps {
  className?: string;
  activeHref?: string;
}

export default function Footer({ className = '', activeHref }: FooterProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('Navigation');
  const currentYear = new Date().getFullYear();

  const isLandingPage = /^\/[a-z]{2,3}\/?$/.test(pathname);
  if (isLandingPage) {
    return null;
  }

  const localizedHref = (href: string) => `/${locale}${href}`;
  const routePath = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), '') || '/';

  const isCurrentActive = (itemHref: string) => {
    if (activeHref) return activeHref === itemHref;
    if (itemHref === '/customers') return routePath === '/customers' || routePath === '/';
    return routePath.startsWith(itemHref);
  };

  return (
    <footer
      className={`w-full bg-surface/95 backdrop-blur-md border-t border-surface-border transition-colors duration-200 pb-20 lg:pb-8 pt-8 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        {/* Main Footer Bar: Left (Logo), Center (Page Links), Right (System/Status or Info) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 1. Left: DigitalAzizi Logo */}
          <div className="flex-shrink-0">
            <Logo size="md" />
          </div>

          {/* 2. Center: All Page Navigation Links */}
          <nav className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1.5 bg-surface-subtle/80 backdrop-blur rounded-2xl border border-surface-border">
            {NAV_ITEMS_CONFIG.map((item) => {
              const active = isCurrentActive(item.href);
              return (
                <Link
                  key={item.key}
                  href={localizedHref(item.href)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 select-none ${
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

          {/* 3. Right: Copyright with Dynamic Year */}
          <div className="text-center md:text-right select-none">
            <p className="text-xs font-semibold text-content-primary">
              © {currentYear} DigitalAzizi
            </p>
            <p className="text-[10px] text-content-muted mt-0.5">
              All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

