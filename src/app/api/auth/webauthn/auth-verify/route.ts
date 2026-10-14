import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import {
  getWebAuthnConfig,
  getChallenge,
  deleteChallenge,
  getUserCredentials,
  updateUserCredentialCounter,
} from '@/lib/webauthn';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, authResp } = body;

    if (!userId || !authResp) {
      return NextResponse.json({ verified: false, error: 'Missing userId or authResp' }, { status: 400 });
    }

    const expectedChallenge = getChallenge(userId);
    if (!expectedChallenge) {
      return NextResponse.json({ verified: false, error: 'Challenge expired or not found. Please try again.' }, { status: 400 });
    }

    const credentials = await getUserCredentials(userId);
    const matchedCredential = credentials.find((c) => c.id === authResp.id);

    if (!matchedCredential) {
      return NextResponse.json(
        { verified: false, error: 'No matching biometric credential found for this device.' },
        { status: 400 }
      );
    }

    const { origin, rpID } = getWebAuthnConfig(req);
    const expectedOrigins = [origin];
    if (origin.startsWith('http://localhost')) {
      expectedOrigins.push(origin.replace('http://', 'https://'));
    }

    const verification = await verifyAuthenticationResponse({
      response: authResp,
      expectedChallenge,
      expectedOrigin: expectedOrigins,
      expectedRPID: rpID,
      credential: {
        id: matchedCredential.id,
        publicKey: isoBase64URL.toBuffer(matchedCredential.publicKey),
        counter: matchedCredential.counter,
        transports: matchedCredential.transports,
      },
      requireUserVerification: false,
    });

    if (verification.verified && verification.authenticationInfo) {
      await updateUserCredentialCounter(userId, matchedCredential.id, verification.authenticationInfo.newCounter);
      deleteChallenge(userId);
      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false, error: 'Biometric authentication failed.' }, { status: 400 });
  } catch (error) {
    console.error('Error verifying authentication:', error);
    const message = error instanceof Error ? error.message : 'Authentication verification failed';
    return NextResponse.json({ verified: false, error: message }, { status: 500 });
  }
}
