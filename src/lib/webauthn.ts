import { isoBase64URL } from '@simplewebauthn/server/helpers';
import { supabase as adminSupabase } from '@/lib/supabase';

export type TransportType = 'ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb';

export interface StoredCredential {
  id: string; // Base64URL credential ID
  publicKey: string; // Base64URL string of Uint8Array
  counter: number;
  transports?: TransportType[];
  deviceType?: string;
  backedUp?: boolean;
  createdAt: string;
}

// In-memory challenge store (expires in 5 minutes)
const challengeStore = new Map<string, { challenge: string; timestamp: number }>();

// In-memory fallback credential store
const memoryCredentialStore = new Map<string, StoredCredential[]>();

// In-memory fallback pin store
const memoryPinStore = new Map<string, string>();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves a given identifier (email, custom id, or uuid) to a valid users.id UUID in Supabase
 */
export async function resolveUserUUID(userIdOrEmail: string): Promise<string | null> {
  const cleanId = (userIdOrEmail || '').trim();
  if (!cleanId) return null;

  // 1. If it's already a valid UUID, verify or return
  if (UUID_REGEX.test(cleanId)) {
    try {
      const { data } = await adminSupabase
        .from('users')
        .select('id')
        .eq('id', cleanId)
        .maybeSingle();

      if (data?.id) return data.id;
    } catch {
      // ignore
    }
    return cleanId;
  }

  // 2. Query users table by email
  try {
    const { data: userByEmail } = await adminSupabase
      .from('users')
      .select('id')
      .ilike('email', cleanId.toLowerCase())
      .maybeSingle();

    if (userByEmail?.id) return userByEmail.id;
  } catch {
    // ignore
  }

  // 3. Fallback: try finding first user if single user setup or create
  try {
    const { data: anyUser } = await adminSupabase
      .from('users')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (anyUser?.id) return anyUser.id;
  } catch {
    // ignore
  }

  return null;
}

export function getWebAuthnConfig(req?: Request) {
  let origin = process.env.WEBAUTHN_ORIGIN;
  let rpID = process.env.WEBAUTHN_RP_ID;
  const rpName = process.env.WEBAUTHN_RP_NAME || 'Digital Azizi';

  if (req) {
    const host = req.headers.get('host') || 'localhost:3000';
    const hostname = host.split(':')[0];
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    if (!rpID) rpID = hostname;
    if (!origin) origin = `${proto}://${host}`;
  }

  return {
    rpName,
    rpID: rpID || 'localhost',
    origin: origin || 'http://localhost:3000',
  };
}

export function saveChallenge(userId: string, challenge: string) {
  challengeStore.set(userId, { challenge, timestamp: Date.now() });
}

export function getChallenge(userId: string): string | null {
  const item = challengeStore.get(userId);
  if (!item) return null;
  // Expire after 5 minutes
  if (Date.now() - item.timestamp > 5 * 60 * 1000) {
    challengeStore.delete(userId);
    return null;
  }
  return item.challenge;
}

export function deleteChallenge(userId: string) {
  challengeStore.delete(userId);
}

/**
 * Retrieve credentials from `public.user_credentials`
 */
export async function getUserCredentials(userIdOrEmail: string): Promise<StoredCredential[]> {
  const list: StoredCredential[] = [];
  const resolvedUuid = await resolveUserUUID(userIdOrEmail);

  // 1. Query public.user_credentials in Supabase
  if (resolvedUuid) {
    try {
      const { data, error } = await adminSupabase
        .from('user_credentials')
        .select('*')
        .eq('user_id', resolvedUuid);

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          // Convert PostgreSQL bytea to base64url public key
          let pubKeyBase64Url = '';
          if (row.public_key) {
            if (typeof row.public_key === 'string' && row.public_key.startsWith('\\x')) {
              const hex = row.public_key.slice(2);
              pubKeyBase64Url = isoBase64URL.fromBuffer(Buffer.from(hex, 'hex'));
            } else if (Buffer.isBuffer(row.public_key) || row.public_key instanceof Uint8Array) {
              pubKeyBase64Url = isoBase64URL.fromBuffer(row.public_key);
            } else {
              pubKeyBase64Url = String(row.public_key);
            }
          }

          list.push({
            id: row.credential_id,
            publicKey: pubKeyBase64Url,
            counter: Number(row.counter) || 0,
            deviceType: row.device_type || 'singleDevice',
            createdAt: row.created_at,
          });
        }
      }
    } catch (err) {
      console.warn('Error reading user_credentials table:', err);
    }
  }

  // 2. Include in-memory credentials if any
  const memList = memoryCredentialStore.get(userIdOrEmail) || (resolvedUuid ? memoryCredentialStore.get(resolvedUuid) : []) || [];
  for (const m of memList) {
    if (!list.some((existing) => existing.id === m.id)) {
      list.push(m);
    }
  }

  return list;
}

/**
 * Save new credential into `public.user_credentials`
 */
export async function saveUserCredential(userIdOrEmail: string, credential: StoredCredential): Promise<void> {
  const resolvedUuid = await resolveUserUUID(userIdOrEmail);

  // Keep in memory
  const existing = memoryCredentialStore.get(userIdOrEmail) || [];
  const updated = existing.filter((c) => c.id !== credential.id);
  updated.push(credential);
  memoryCredentialStore.set(userIdOrEmail, updated);
  if (resolvedUuid && resolvedUuid !== userIdOrEmail) {
    memoryCredentialStore.set(resolvedUuid, updated);
  }

  // Save to public.user_credentials
  if (resolvedUuid) {
    try {
      const pubKeyBytes = isoBase64URL.toBuffer(credential.publicKey);
      const byteaHex = '\\x' + Buffer.from(pubKeyBytes).toString('hex');

      const { error } = await adminSupabase.from('user_credentials').upsert(
        {
          user_id: resolvedUuid,
          credential_id: credential.id,
          public_key: byteaHex,
          counter: credential.counter,
          device_type: credential.deviceType || 'singleDevice',
        },
        { onConflict: 'credential_id' }
      );

      if (error) {
        console.error('Failed to save to user_credentials in Supabase:', error.message);
      }
    } catch (err) {
      console.warn('Exception saving user_credential:', err);
    }
  }
}

/**
 * Updates credential sign-in counter in `public.user_credentials`
 */
export async function updateUserCredentialCounter(userIdOrEmail: string, credentialId: string, newCounter: number): Promise<void> {
  // Update in memory
  const memList = memoryCredentialStore.get(userIdOrEmail) || [];
  const found = memList.find((c) => c.id === credentialId);
  if (found) {
    found.counter = newCounter;
  }

  // Update in Supabase
  try {
    await adminSupabase
      .from('user_credentials')
      .update({ counter: newCounter })
      .eq('credential_id', credentialId);
  } catch (err) {
    console.warn('Failed to update counter:', err);
  }
}

/**
 * Set user 4-digit PIN code in `public.users.pin_code`
 */
export async function setUserPin(userIdOrEmail: string, pin: string): Promise<boolean> {
  const cleanPin = (pin || '').trim();
  const resolvedUuid = await resolveUserUUID(userIdOrEmail);

  memoryPinStore.set(userIdOrEmail, cleanPin);
  if (resolvedUuid) {
    memoryPinStore.set(resolvedUuid, cleanPin);
  }

  if (resolvedUuid) {
    try {
      const { error } = await adminSupabase
        .from('users')
        .update({ pin_code: cleanPin, updated_at: new Date().toISOString() })
        .eq('id', resolvedUuid);

      if (!error) return true;
      console.warn('Supabase pin_code update error:', error.message);
    } catch (err) {
      console.warn('Exception updating pin_code:', err);
    }
  }

  return true;
}

/**
 * Verify user PIN code against `public.users.pin_code`
 */
export async function verifyUserPin(userIdOrEmail: string, pin: string): Promise<boolean> {
  const cleanPin = (pin || '').trim();
  if (!cleanPin) return false;

  const resolvedUuid = await resolveUserUUID(userIdOrEmail);

  // 1. Check in database
  if (resolvedUuid) {
    try {
      const { data } = await adminSupabase
        .from('users')
        .select('pin_code')
        .eq('id', resolvedUuid)
        .maybeSingle();

      if (data && data.pin_code) {
        return data.pin_code.trim() === cleanPin;
      }
    } catch {
      // ignore
    }
  }

  // 2. Check memory store
  const storedMemPin = memoryPinStore.get(userIdOrEmail) || (resolvedUuid ? memoryPinStore.get(resolvedUuid) : null);
  if (storedMemPin) {
    return storedMemPin.trim() === cleanPin;
  }

  return false;
}

/**
 * Check security status (whether PIN is set and whether biometric credentials exist)
 */
export async function getUserSecurityStatus(userIdOrEmail: string) {
  const resolvedUuid = await resolveUserUUID(userIdOrEmail);
  let hasPin = false;

  if (resolvedUuid) {
    try {
      const { data } = await adminSupabase
        .from('users')
        .select('pin_code')
        .eq('id', resolvedUuid)
        .maybeSingle();

      if (data && Boolean(data.pin_code?.trim())) {
        hasPin = true;
      }
    } catch {
      // ignore
    }
  }

  if (!hasPin) {
    hasPin = memoryPinStore.has(userIdOrEmail) || (resolvedUuid ? memoryPinStore.has(resolvedUuid) : false);
  }

  const credentials = await getUserCredentials(userIdOrEmail);

  return {
    hasPin,
    hasCredentials: credentials.length > 0,
    credentialCount: credentials.length,
    resolvedUserId: resolvedUuid || userIdOrEmail,
  };
}
