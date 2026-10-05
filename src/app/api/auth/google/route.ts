import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AppUser, GoogleLoginPayload, UserRole } from '@/types/auth';

const ADMIN_EMAIL = (
  process.env.APP_ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_APP_ADMIN_EMAIL ||
  'developai507@gmail.com'
).trim().toLowerCase();

function calculateExpiryDate(daysStr: string): string {
  const days = parseInt(daysStr, 10) || 7;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return expiryDate.toISOString();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as GoogleLoginPayload;
    const email = (body.email || ADMIN_EMAIL).trim().toLowerCase();
    const name = body.name || email.split('@')[0] || 'User';
    const avatarUrl = body.avatar_url || '';
    const subscriptionDays = body.subscription_days || '7';

    const role: UserRole = email === ADMIN_EMAIL ? 'admin' : 'user';
    const subscriptionExpiresAt = calculateExpiryDate(subscriptionDays);
    const now = new Date().toISOString();

    const userData: AppUser = {
      id: `usr_${Buffer.from(email).toString('hex').slice(0, 16)}`,
      email,
      name,
      avatar_url: avatarUrl,
      role,
      subscription_days: subscriptionDays,
      subscription_expires_at: subscriptionExpiresAt,
      created_at: now,
      updated_at: now,
    };

    let dbSaved = false;
    let dbErrorMessage = '';

    // Direct Upsert into Supabase 'users' table
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(
          {
            email: userData.email,
            name: userData.name,
            avatar_url: userData.avatar_url,
            role: userData.role,
            subscription_days: userData.subscription_days,
            subscription_expires_at: userData.subscription_expires_at,
            updated_at: now,
          },
          { onConflict: 'email' }
        )
        .select()
        .single();

      if (error) {
        console.error('Supabase users insert error:', error);
        dbErrorMessage = error.message;
      } else if (data) {
        dbSaved = true;
        userData.id = String(data.id || userData.id);
        userData.role = (data.role as UserRole) || userData.role;
        userData.subscription_days = String(data.subscription_days || userData.subscription_days);
        userData.subscription_expires_at = data.subscription_expires_at || userData.subscription_expires_at;
      }
    } catch (dbError) {
      console.error('Supabase exception:', dbError);
      dbErrorMessage = dbError instanceof Error ? dbError.message : 'Database error';
    }

    const response = NextResponse.json({
      success: true,
      user: userData,
      dbSaved,
      dbError: dbErrorMessage || undefined,
      message: `Signed in successfully as ${role}`,
    });

    // Set secure session cookies
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
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Authentication failed';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
