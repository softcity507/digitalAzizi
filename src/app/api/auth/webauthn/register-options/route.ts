import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { getWebAuthnConfig, saveChallenge, getUserCredentials } from '@/lib/webauthn';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, email } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const { rpName, rpID } = getWebAuthnConfig(req);
    const existingCredentials = await getUserCredentials(userId);

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(userId),
      userName: email || `user_${userId}`,
      userDisplayName: email ? email.split('@')[0] : 'Authorized User',
      attestationType: 'none',
      excludeCredentials: existingCredentials.map((c) => ({
        id: c.id,
        transports: c.transports,
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    saveChallenge(userId, options.challenge);

    return NextResponse.json(options);
  } catch (error) {
    console.error('Error generating registration options:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate registration options';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
