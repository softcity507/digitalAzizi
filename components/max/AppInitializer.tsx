'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function AppInitializer() {
  const fetchBusinesses = useSettingsStore((state) => state.fetchBusinesses);

  useEffect(() => {
    let isCurrent = true;
    fetchBusinesses().catch((error: unknown) => {
      if (isCurrent) {
        console.warn('AppInitializer fetchBusinesses:', error instanceof Error ? error.message : error);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [fetchBusinesses]);

  return null;
}
