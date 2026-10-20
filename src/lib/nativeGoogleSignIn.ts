import { registerPlugin } from '@capacitor/core';

interface NativeGoogleSignInPlugin {
  getIdToken(options: { serverClientId: string; nonce: string }): Promise<{ idToken: string }>;
}

export const NativeGoogleSignIn = registerPlugin<NativeGoogleSignInPlugin>('NativeGoogleSignIn');
