'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { authApi } from '@/callapi/auth';

export default function AppInitializer() {
  const fetchBusinesses = useSettingsStore((state) => state.fetchBusinesses);

  useEffect(() => {
    let isCurrent = true;
    authApi.getSession().then((session) => {
      if (!isCurrent || !session.success) return;
      return fetchBusinesses();
    }).catch((error: unknown) => {
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
