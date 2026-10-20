import { invokeAuthz } from '@/callapi/authz';

export interface UserSecurityStatus {
  hasPin: boolean;
  hasCredentials: boolean;
  credentialCount: number;
  resolvedUserId: string;
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
