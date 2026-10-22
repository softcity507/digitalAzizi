import { invokeAuthz } from '@/callapi/authz';

export interface UserSecurityStatus {
  hasPin: boolean;
  hasCredentials: boolean;
  credentialCount: number;
  resolvedUserId: string;
}

const WEBAUTHN_CONFIG_ERROR = 'Configure WEBAUTHN_RP_ID and WEBAUTHN_ORIGINS in the Edge Function secrets before using passkeys.';

export function getWebAuthnErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes(WEBAUTHN_CONFIG_ERROR)) {
    return [
      'The deployed authz-api function is older than this app and still requires WebAuthn secrets.',
      'Redeploy supabase/functions/authz-api/index.ts, or configure WEBAUTHN_ORIGINS and WEBAUTHN_RP_ID in Supabase Edge Function secrets for https://www.digitalazizi.com.',
    ].join(' ');
  }
  return message || 'An unexpected error occurred during biometric setup.';
}

export async function getSecurityStatus() {
  return invokeAuthz<{ success: boolean; status?: UserSecurityStatus; error?: string }>({
    action: 'security', operation: 'status',
  });
}

export async function setSecurityPin(pin: string) {
  return invokeAuthz<{ success: boolean; message?: string; error?: string }>({
    action: 'security', operation: 'set', pin,
  });
}

export async function verifySecurityPin(pin: string) {
  return invokeAuthz<{ verified: boolean; error?: string }>({
    action: 'security', operation: 'verify', pin,
  });
}

export async function invokeWebAuthn<T extends Record<string, unknown>>(operation: string, payload: Record<string, unknown> = {}) {
  return invokeAuthz<T>({ action: 'webauthn', operation, ...payload });
}
