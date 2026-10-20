'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { NATIVE_AUTH_CALLBACK } from '@/callapi/auth';
import { supabaseClient } from '@/lib/supabaseClient';

const REDIRECT_STORAGE_KEY = 'digitalazizi_oauth_redirect';

export default function NativeAuthCallback() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let disposed = false;
    let handledUrl = '';

    const handleCallback = async (url: string) => {
      if (disposed || handledUrl === url || !url.startsWith(NATIVE_AUTH_CALLBACK)) return;
      handledUrl = url;

      try {
        const callback = new URL(url);
        const fragment = new URLSearchParams(callback.hash.replace(/^#/, ''));
        const error = callback.searchParams.get('error_description') ||
          callback.searchParams.get('error') ||
          fragment.get('error_description') ||
          fragment.get('error');
        if (error) throw new Error(error);

        const code = callback.searchParams.get('code');
        let session: { access_token: string } | null = null;

        if (code) {
          const { data, error: exchangeError } = await supabaseClient.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          session = data.session;
        } else {
          // Also accept implicit-flow callbacks in case the Supabase auth flow
          // configuration changes. PKCE code exchange remains the default.
          const accessToken = fragment.get('access_token');
          const refreshToken = fragment.get('refresh_token');
          if (accessToken && refreshToken) {
            const { data, error: sessionError } = await supabaseClient.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (sessionError) throw sessionError;
            session = data.session;
          }
        }

        if (!session?.access_token) throw new Error('Google sign-in returned without a valid Supabase session. Please try again.');

        await Browser.close().catch(() => undefined);
        const redirectTo = window.localStorage.getItem(REDIRECT_STORAGE_KEY) || '/en/cash-book';
        window.localStorage.removeItem(REDIRECT_STORAGE_KEY);
        window.location.replace(redirectTo);
      } catch (error) {
        await Browser.close().catch(() => undefined);
        window.localStorage.removeItem(REDIRECT_STORAGE_KEY);
        const message = error instanceof Error ? error.message : 'Google sign-in could not be completed.';
        console.error('Native Google OAuth callback failed:', message);
        window.location.replace(`/?auth_error=${encodeURIComponent(message)}`);
      }
    };

    const listener = App.addListener('appUrlOpen', ({ url }) => {
      void handleCallback(url);
    });

    void App.getLaunchUrl().then((launch) => {
      if (launch?.url) return handleCallback(launch.url);
    }).catch(() => undefined);

    return () => {
      disposed = true;
      void listener.then((handle) => handle.remove());
    };
  }, []);

  return null;
}
