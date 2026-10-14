import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ensureDefaultBusiness } from '@/lib/ensureDefaultBusiness';
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
    const role: UserRole = email === ADMIN_EMAIL ? 'admin' : 'user';
    const now = new Date().toISOString();
    const { data: existingUser, error: lookupError } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (lookupError) {
      return NextResponse.json({ success: false, error: 'Could not verify subscription. Please try again.' }, { status: 503 });
    }

    let userData: AppUser;
    if (existingUser) {
      userData = {
        id: String(existingUser.id),
        email: existingUser.email,
        name: existingUser.name || name,
        avatar_url: existingUser.avatar_url || avatarUrl,
        role: (existingUser.role as UserRole) || role,
        subscription_days: String(existingUser.subscription_days || '7'),
        subscription_expires_at: existingUser.subscription_expires_at,
        created_at: existingUser.created_at,
        updated_at: existingUser.updated_at,
      };
      if (userData.role !== 'admin' && new Date(userData.subscription_expires_at).getTime() <= Date.now()) {
        return NextResponse.json({ success: false, error: 'Your subscription has expired. Contact the administrator to renew it.' }, { status: 403 });
      }
      await supabase.from('users').update({ name, avatar_url: avatarUrl, updated_at: now }).eq('id', userData.id);
    } else {
      const subscriptionDays = '7';
      const subscriptionExpiresAt = calculateExpiryDate(subscriptionDays);
      const { data: createdUser, error: createError } = await supabase.from('users').insert({
        email, name, avatar_url: avatarUrl, role,
        subscription_days: subscriptionDays,
        subscription_expires_at: subscriptionExpiresAt,
        updated_at: now,
      }).select().single();
      if (createError || !createdUser) {
        return NextResponse.json({ success: false, error: 'Could not create your account. Please try again.' }, { status: 503 });
      }
      userData = {
        id: String(createdUser.id), email: createdUser.email, name: createdUser.name || name,
        avatar_url: createdUser.avatar_url || avatarUrl, role: (createdUser.role as UserRole) || role,
        subscription_days: String(createdUser.subscription_days || '7'),
        subscription_expires_at: createdUser.subscription_expires_at,
        created_at: createdUser.created_at, updated_at: createdUser.updated_at,
      };
    }

    try {
      await ensureDefaultBusiness(email, name);
    } catch (businessError) {
      console.error('Default business creation error:', businessError);
    }

    const response = NextResponse.json({
      success: true,
      user: userData,
      dbSaved: true,
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
