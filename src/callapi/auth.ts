import type { AppUser, AuthResponse } from '@/types/auth';
import { invokeAuthz } from '@/callapi/authz';
import { supabaseClient } from '@/lib/supabaseClient';
import { Capacitor } from '@capacitor/core';
import { NativeGoogleSignIn } from '@/lib/nativeGoogleSignIn';

const WEB_AUTH_ORIGIN = 'https://www.digitalazizi.com';

export const authApi = {
  /** Use native Google sign-in on Android and hosted OAuth on the web. */
  async signInWithGoogleOAuth(redirectTo = '/en/cash-book'): Promise<{ success: boolean; error?: string }> {
    try {
      const isNative = Capacitor.isNativePlatform();
      if (isNative && Capacitor.getPlatform() === 'android') {

        const serverClientId = process.env.NEXT_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
        if (!serverClientId) {
          return {
            success: false,
            error: 'Native Google sign-in needs NEXT_PUBLIC_GOOGLE, the Web/server OAuth client ID configured for Google in Supabase. The Android OAuth client ID is not the token audience.',
          };
        }

        const nonceBytes = new Uint8Array(32);
        window.crypto.getRandomValues(nonceBytes);
        const nonce = Array.from(nonceBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
        const nonceHash = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(nonce));
        const googleNonce = Array.from(new Uint8Array(nonceHash), (byte) => byte.toString(16).padStart(2, '0')).join('');
        const { idToken } = await NativeGoogleSignIn.getIdToken({ serverClientId, nonce: googleNonce });
        const { data, error } = await supabaseClient.auth.signInWithIdToken({ provider: 'google', token: idToken, nonce });
        if (error) return { success: false, error: error.message };
        if (!data.session) return { success: false, error: 'Google sign-in did not return a session.' };

        return { success: true };
      }

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const webOrigin = origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000'
        ? origin
        : WEB_AUTH_ORIGIN;
      const target = new URL(redirectTo, webOrigin).toString();
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: target,
          queryParams: { access_type: 'offline', prompt: 'select_account' },
        },
      });
      if (error) return { success: false, error: error.message };

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
    try {
      const { error } = await supabaseClient.auth.signOut();
      return error
        ? { success: false, message: error.message }
        : { success: true, message: 'Logged out successfully.' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Could not sign out. Please try again.',
      };
    }
  },
};

export type { AppUser };
