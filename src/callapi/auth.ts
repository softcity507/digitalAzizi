import { AuthResponse, GoogleLoginPayload } from '@/types/auth';
import { supabaseClient } from '@/lib/supabaseClient';

export const authApi = {
  /**
   * Opens authentic Google Account Login / Consent screen via Supabase OAuth
   */
  async signInWithGoogleOAuth(redirectTo = '/en/cash-book'): Promise<{ success: boolean; error?: string }> {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const callbackUrl = `${origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`;

      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) {
        // If Google provider not yet enabled in Supabase dashboard, fallback to direct API
        return { success: false, error: error.message };
      }

      if (data?.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to launch Google authentication',
      };
    }
  },

  /**
   * Direct backend login endpoint
   */
  async loginWithGoogle(payload?: GoogleLoginPayload): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload || {}),
      });
      return await res.json();
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error during Google sign-in',
      };
    }
  },

  async getSession(): Promise<AuthResponse> {
    try {
      const res = await fetch('/api/auth/me', { method: 'GET' });
      return await res.json();
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error fetching session',
      };
    }
  },

  async logout(): Promise<{ success: boolean; message?: string }> {
    try {
      await supabaseClient.auth.signOut();
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      return await res.json();
    } catch {
      return { success: false };
    }
  },
};
