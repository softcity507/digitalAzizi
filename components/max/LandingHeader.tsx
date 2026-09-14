'use client';

import Logo from '@/components/mini/Logo';
import StatusBadge from '@/components/mini/StatusBadge';
import ThemeToggle from '@/components/mini/ThemeToggle';
import LanguageSelector from '@/components/mini/LanguageSelector';
import { useTranslations } from 'next-intl';

interface LandingHeaderProps {
  className?: string;
  showControls?: boolean;
}

export default function LandingHeader({
  className = '',
  showControls = true,
}: LandingHeaderProps) {
  const t = useTranslations('Landing');

  return (
    <header
      className={`w-full max-w-xl mx-auto flex items-center justify-between gap-3 px-4 py-4 sm:py-6 select-none ${className}`}
    >
      {/* Brand Logo with Shield Icon */}
      <Logo
        variant="shield"
        subtitle={t('subtitle')}
        size="md"
      />

      {/* Right side: Status Badge + Theme/Language Controls */}
      <div className="flex items-center gap-2">
        <StatusBadge label={t('cloudSyncActive')} />
        {showControls && (
          <div className="hidden sm:flex items-center gap-1.5 ml-1">
            <LanguageSelector compact />
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  );
}
