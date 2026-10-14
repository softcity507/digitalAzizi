import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { getWebAuthnConfig, saveChallenge, getUserCredentials } from '@/lib/webauthn';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const { rpID } = getWebAuthnConfig(req);
    const userCredentials = await getUserCredentials(userId);

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userCredentials.map((c) => ({
        id: c.id,
        transports: c.transports,
      })),
      userVerification: 'preferred',
    });

    saveChallenge(userId, options.challenge);

    return NextResponse.json(options);
  } catch (error) {
    console.error('Error generating auth options:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate authentication options';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
