import type { AppUser, AuthResponse } from '@/types/auth';
import { invokeAuthz } from '@/callapi/authz';
import { supabaseClient } from '@/lib/supabaseClient';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

export const NATIVE_AUTH_CALLBACK = 'com.digitalazizi.app://callback';
const WEB_AUTH_ORIGIN = 'https://www.digitalazizi.com';
const OAUTH_REDIRECT_STORAGE_KEY = 'digitalazizi_oauth_redirect';

export const authApi = {
  /** Start Supabase-managed Google OAuth and return to a frontend route. */
  async signInWithGoogleOAuth(redirectTo = '/en/cash-book'): Promise<{ success: boolean; error?: string }> {
    try {
      const isNative = Capacitor.isNativePlatform();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      // Keep production web auth on the canonical site. Capacitor uses its own
      // registered deep link and must never be redirected to the web domain.
      const webOrigin = origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000'
        ? origin
        : WEB_AUTH_ORIGIN;
      const target = isNative ? NATIVE_AUTH_CALLBACK : new URL(redirectTo, webOrigin).toString();
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: target,
          skipBrowserRedirect: isNative,
          queryParams: { access_type: 'offline', prompt: 'select_account' },
        },
      });
      if (error) return { success: false, error: error.message };

      if (isNative) {
        if (!data.url) return { success: false, error: 'Supabase did not return a Google sign-in URL.' };
        const safeRedirect = redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/en/cash-book';
        window.localStorage.setItem(OAUTH_REDIRECT_STORAGE_KEY, safeRedirect);
        await Browser.open({ url: data.url, presentationStyle: 'popover' });
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Could not start Google sign-in.' };
    }
  },

  /** Validate the Supabase session; create the app profile only on first sign-in. */
  async getSession(): Promise<AuthResponse> {
    try {
      const { data, error } = await supabaseClient.auth.getUser();
      if (error || !data.user) return { success: false, error: error?.message || 'You are not signed in.' };

      const session = await invokeAuthz<AuthResponse>({ action: 'session' });
      if (session.success || !session.error?.includes('Account profile not found')) return session;

      const provisioned = await invokeAuthz<AuthResponse>({ action: 'provision-user' });
      if (!provisioned.success) return provisioned;
      return await invokeAuthz<AuthResponse>({ action: 'session' });
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Could not validate your session.' };
    }
  },

  async logout(): Promise<{ success: boolean; message?: string }> {
    const { error } = await supabaseClient.auth.signOut();
    return error
      ? { success: false, message: error.message }
      : { success: true, message: 'Logged out successfully.' };
  },
};

export type { AppUser };
