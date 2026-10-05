import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { AppUser, UserRole } from '@/types/auth';

const ADMIN_EMAIL = (process.env.APP_ADMIN_EMAIL || 'sadaqatali507bscs@gmail.com').trim().toLowerCase();

export async function GET(req: NextRequest) {
  try {
    const emailCookie = req.cookies.get('auth_user_email')?.value;
    if (!emailCookie) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const email = emailCookie.trim().toLowerCase();
    const role: UserRole = email === ADMIN_EMAIL ? 'admin' : 'user';

    let user: AppUser = {
      id: `usr_${Buffer.from(email).toString('hex').slice(0, 16)}`,
      email,
      name: email.split('@')[0],
      role,
      subscription_days: '7',
      subscription_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (data) {
        user = {
          id: String(data.id || user.id),
          email: data.email,
          name: data.name || user.name,
          avatar_url: data.avatar_url,
          role: (data.role as UserRole) || user.role,
          subscription_days: String(data.subscription_days || '7'),
          subscription_expires_at: data.subscription_expires_at || user.subscription_expires_at,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
      }
    } catch {
      // Use in-memory user fallback
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to fetch session';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
