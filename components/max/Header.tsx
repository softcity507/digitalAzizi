'use client';

import { usePathname } from 'next/navigation';
import Logo from '@/components/mini/Logo';
import Links from '@/components/mini/Links';
import Notification from '@/components/mini/Notification';
 
interface HeaderProps {
  className?: string;
  activeHref?: string;
}

export default function Header({ className = '', activeHref }: HeaderProps) {
  const pathname = usePathname();
  const isLandingPage = /^\/[a-z]{2,3}\/?$/.test(pathname);

  if (isLandingPage) {
    return null;
  }

  return (
    <>
      {/* Top Header Bar for Desktop & Mobile */}
      <header
        className={`sticky top-0 z-40 w-full bg-surface/95 backdrop-blur-md border-b border-surface-border transition-colors duration-200 ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
          {/* 1. Left: Sarafi Ledger Logo */}
          <div className="flex-shrink-0">
            <Logo variant="sarafi" />
          </div>

          {/* 2. Center: Desktop Pill Navigation (Hidden on Mobile) */}
          <div className="hidden lg:flex items-center justify-center flex-1 max-w-xl">
            <Links variant="desktop-header" activeHref={activeHref} />
          </div>

          {/* 3. Right: Utility Controls (Language, Theme, Notification) */}
          <div className="flex items-center gap-2 sm:gap-3">
           
            <Notification />
          </div>
        </div>
      </header>

      {/* 4. Mobile Bottom Navigation Bar (Visible only on mobile/tablet screens < lg) */}
      <Links variant="mobile-bottom" activeHref={activeHref} />
    </>
  );
}
