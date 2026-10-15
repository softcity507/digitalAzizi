import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { supabase as adminDb } from '@/lib/supabase';
import { ensureDefaultBusiness } from '@/lib/ensureDefaultBusiness';
import { UserRole } from '@/types/auth';
import { getSubscriptionExpiry } from '@/lib/subscription';

const ADMIN_EMAIL = (
  process.env.APP_ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_APP_ADMIN_EMAIL ||
  'developai507@gmail.com'
).trim().toLowerCase();

// Deduplication cache to prevent React StrictMode / double-firing from failing on single-use OAuth codes
const exchangedCodes = new Map<string, { email: string; role: string; timestamp: number }>();

// Periodic cleanup of codes older than 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of exchangedCodes.entries()) {
    if (now - entry.timestamp > 120000) {
      exchangedCodes.delete(code);
    }
  }
}, 60000);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') || '/en/cash-book';

  if (error) {
    console.error('Supabase OAuth callback error:', { error, errorDescription });
    return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (code) {
    // 1. Check if this code was already processed during double-firing
    if (exchangedCodes.has(code)) {
      const cached = exchangedCodes.get(code)!;
      const response = NextResponse.redirect(`${origin}${next}`);
      response.cookies.set('auth_user_email', cached.email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      response.cookies.set('auth_user_role', cached.role, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    try {
      const serverSupabase = await createSupabaseServerClient();
      const { data, error: exchangeError } = await serverSupabase.auth.exchangeCodeForSession(code);

      if (!exchangeError && data?.user) {
        const user = data.user;
        const email = (user.email || '').trim().toLowerCase();
        const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0] || 'User';
        const avatarUrl = user.user_metadata?.avatar_url || '';
        const role: UserRole = email === ADMIN_EMAIL ? 'admin' : 'user';

        const now = new Date().toISOString();
        const { data: existingUser, error: lookupError } = await adminDb
          .from('users').select('*').ilike('email', email).maybeSingle();

        if (lookupError) {
          return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent('Could not verify subscription. Please try again.')}`);
        }

        const subscriptionExpiry = existingUser
          ? getSubscriptionExpiry(existingUser.created_at, existingUser.subscription_days, existingUser.subscription_expires_at)
          : null;
        if (existingUser && role !== 'admin' && (!subscriptionExpiry || new Date(subscriptionExpiry).getTime() <= Date.now())) {
          const response = NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent('Your 7-day free trial has ended. Please contact the administrator to renew your subscription.')}&expired_email=${encodeURIComponent(email)}`);
          response.cookies.delete('auth_user_email');
          response.cookies.delete('auth_user_role');
          return response;
        }

        if (existingUser) {
          await adminDb.from('users').update({ name, avatar_url: avatarUrl, updated_at: now }).eq('id', existingUser.id);
        } else {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 7);
          const { error: createError } = await adminDb.from('users').insert({
            email, name, avatar_url: avatarUrl, role, subscription_days: '7',
            subscription_expires_at: expiryDate.toISOString(), updated_at: now,
          });
          if (createError) {
            return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent('Could not create your account. Please try again.')}`);
          }
        }

        // Cache code to guard against React StrictMode / duplicate callback requests.
        exchangedCodes.set(code, { email, role, timestamp: Date.now() });

        try {
          await ensureDefaultBusiness(email, name, user.id);
        } catch (businessError) {
          console.error('Default business creation error:', businessError);
        }

        const response = NextResponse.redirect(`${origin}${next}`);
        response.cookies.set('auth_user_email', email, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });
        response.cookies.set('auth_user_role', role, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        });

        return response;
      } else if (exchangeError) {
        console.error('PKCE exchange error:', exchangeError);
      }
    } catch (err) {
      console.error('OAuth exchange exception:', err);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
