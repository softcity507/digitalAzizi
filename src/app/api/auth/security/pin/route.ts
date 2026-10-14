import { NextRequest, NextResponse } from 'next/server';
import { setUserPin, verifyUserPin, getUserSecurityStatus } from '@/lib/webauthn';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action = 'verify', pin, userId: bodyUserId } = body;

    const cookieStore = await cookies();
    const sessionEmail = cookieStore.get('auth_user_email')?.value;

    const userIdentifier = bodyUserId || sessionEmail;
    if (!userIdentifier) {
      return NextResponse.json({ success: false, error: 'Unauthorized: User identifier not provided' }, { status: 401 });
    }

    if (action === 'status') {
      const status = await getUserSecurityStatus(userIdentifier);
      return NextResponse.json({ success: true, status });
    }

    if (action === 'set') {
      if (!pin || pin.length < 4) {
        return NextResponse.json({ success: false, error: 'PIN must be at least 4 digits' }, { status: 400 });
      }
      const ok = await setUserPin(userIdentifier, pin);
      return NextResponse.json({ success: ok, message: 'PIN updated successfully' });
    }

    if (action === 'verify') {
      if (!pin) {
        return NextResponse.json({ verified: false, error: 'PIN is required' }, { status: 400 });
      }
      const verified = await verifyUserPin(userIdentifier, pin);
      return NextResponse.json({ verified });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Security PIN route error:', error);
    const msg = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
