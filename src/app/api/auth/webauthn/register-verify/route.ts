import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import {
  getWebAuthnConfig,
  getChallenge,
  deleteChallenge,
  saveUserCredential,
  TransportType,
} from '@/lib/webauthn';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, attResp } = body;

    if (!userId || !attResp) {
      return NextResponse.json({ verified: false, error: 'Missing userId or attResp' }, { status: 400 });
    }

    const expectedChallenge = getChallenge(userId);
    if (!expectedChallenge) {
      return NextResponse.json({ verified: false, error: 'Challenge expired or not found. Please try again.' }, { status: 400 });
    }

    const { origin, rpID } = getWebAuthnConfig(req);

    // Support both http and https on localhost
    const expectedOrigins = [origin];
    if (origin.startsWith('http://localhost')) {
      expectedOrigins.push(origin.replace('http://', 'https://'));
    }

    const verification = await verifyRegistrationResponse({
      response: attResp,
      expectedChallenge,
      expectedOrigin: expectedOrigins,
      expectedRPID: rpID,
      requireUserVerification: false, // allow user presence (touch/fingerprint/PIN)
    });

    if (verification.verified && verification.registrationInfo) {
      const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

      await saveUserCredential(userId, {
        id: credential.id,
        publicKey: isoBase64URL.fromBuffer(credential.publicKey),
        counter: credential.counter,
        transports: credential.transports as TransportType[],
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        createdAt: new Date().toISOString(),
      });

      deleteChallenge(userId);
      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false, error: 'Verification was not successful' }, { status: 400 });
  } catch (error) {
    console.error('Error verifying registration:', error);
    const message = error instanceof Error ? error.message : 'Registration verification failed';
    return NextResponse.json({ verified: false, error: message }, { status: 500 });
  }
}
