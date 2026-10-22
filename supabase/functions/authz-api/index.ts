import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from 'npm:@simplewebauthn/server@14.0.3';
import { isoBase64URL } from 'npm:@simplewebauthn/server@14.0.3/helpers';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

type JsonRecord = Record<string, unknown>;
type Transport = 'ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb';

function json(body: JsonRecord, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function getSecretKey(): string {
  const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys) as Record<string, string>;
      if (parsed.default) return parsed.default;
      const firstKey = Object.values(parsed)[0];
      if (firstKey) return firstKey;
    } catch {
      // Fall through to legacy secret name used by older Supabase projects.
    }
  }
  const legacyKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SECRET_KEY');
  if (!legacyKey) throw new Error('Supabase server secret is not available to this function.');
  return legacyKey;
}

function getAdminClient(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL')!, getSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getPublishableKey(): string {
  const publishableKeys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
  if (publishableKeys) {
    try {
      const parsed = JSON.parse(publishableKeys) as Record<string, string>;
      if (parsed.default) return parsed.default;
      const firstKey = Object.values(parsed)[0];
      if (firstKey) return firstKey;
    } catch {
      // Use the legacy key variables below when this project predates key maps.
    }
  }
  const key = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  if (!key) throw new Error('Supabase publishable key is not available to this function.');
  return key;
}

async function getAuthenticatedUser(req: Request): Promise<User> {
  const authorization = req.headers.get('authorization') || '';
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) throw Object.assign(new Error('A signed-in session is required.'), { status: 401 });

  const authClient = createClient(Deno.env.get('SUPABASE_URL')!, getPublishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user?.email) {
    throw Object.assign(new Error('The supplied session is invalid or expired.'), { status: 401 });
  }
  return data.user;
}

function getExpiry(createdAt: string | null, daysValue: unknown, savedExpiry: string | null): string {
  if (savedExpiry && Number.isFinite(Date.parse(savedExpiry))) return savedExpiry;
  const days = Math.max(1, Number.parseInt(String(daysValue || '7'), 10) || 7);
  const base = createdAt && Number.isFinite(Date.parse(createdAt)) ? Date.parse(createdAt) : Date.now();
  return new Date(base + days * 24 * 60 * 60 * 1000).toISOString();
}

async function getProfile(db: SupabaseClient, email: string) {
  const { data, error } = await db.from('users').select('*').ilike('email', email).maybeSingle();
  if (error) throw error;
  return data;
}

async function provisionUser(db: SupabaseClient, authUser: User) {
  const email = authUser.email!.trim().toLowerCase();
  const name = String(authUser.user_metadata?.full_name || authUser.user_metadata?.name || email.split('@')[0]);
  const avatarUrl = String(authUser.user_metadata?.avatar_url || '');
  const adminEmail = (Deno.env.get('APP_ADMIN_EMAIL') || '').trim().toLowerCase();
  const existing = await getProfile(db, email);
  const isNewUser = !existing;
  const now = new Date().toISOString();

  let row = existing;
  if (existing) {
    const { data, error } = await db.from('users').update({
      name,
      avatar_url: existing.avatar_url || avatarUrl,
      updated_at: now,
    }).eq('id', existing.id).select('*').single();
    if (error) throw error;
    row = data;
  } else {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await db.from('users').insert({
      email,
      name,
      avatar_url: avatarUrl,
      role: adminEmail && email === adminEmail ? 'admin' : 'user',
      subscription_days: '7',
      subscription_expires_at: expiresAt,
      updated_at: now,
    }).select('*').single();
    if (error) throw error;
    row = data;
  }

  const { data: business, error: businessLookupError } = await db
    .from('businesses').select('id').eq('user_id', authUser.id).limit(1).maybeSingle();
  if (businessLookupError) throw businessLookupError;
  if (!business) {
    const { error } = await db.from('businesses').insert({
      user_id: authUser.id,
      owner_email: email,
      name: `${name.trim() || email.split('@')[0]}'s Business`,
      subtitle: 'Default business created by the system',
      is_active: true,
      supported_currencies: 'AFN, USD, PKR',
    });
    if (error && error.code !== '23505') throw error;
  }

  if (!row) throw new Error('Could not load the account profile.');
  const user = {
    id: String(row.id),
    email: row.email,
    name: row.name || name,
    avatar_url: row.avatar_url || avatarUrl,
    role: row.role || 'user',
    subscription_days: String(row.subscription_days || '7'),
    subscription_expires_at: getExpiry(row.created_at, row.subscription_days, row.subscription_expires_at),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  if (user.role !== 'admin' && Date.parse(user.subscription_expires_at) <= Date.now()) {
    return { success: false, user, error: 'Your trial has ended. Contact the administrator to renew your subscription.' };
  }

  if (isNewUser && user.role !== 'admin') await sendTrialEmail(user);
  return { success: true, user };
}

async function sendTrialEmail(user: { email: string; name: string; subscription_expires_at: string }) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return;
  const sender = Deno.env.get('RESEND_FROM_EMAIL') || 'Digital Azizi <support@digitalazizi.com>';
  const expires = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(user.subscription_expires_at));
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: sender,
      to: [user.email],
      reply_to: 'digitalazizi10@gmail.com',
      subject: 'Your 7-day DigitalAzizi free trial has started',
      text: `Hello ${user.name},\n\nYour 7-day DigitalAzizi free trial has started and is scheduled to end on ${expires}.\n\nThank you,\nDigitalAzizi`,
    }),
  });
  if (!response.ok) console.error('Trial welcome email send failed:', response.status);
}

async function resolveProfile(db: SupabaseClient, email: string) {
  const profile = await getProfile(db, email.trim().toLowerCase());
  if (!profile) throw Object.assign(new Error('Account profile not found. Sign out and sign in again.'), { status: 403 });
  return profile;
}

const encoder = new TextEncoder();
const toBase64Url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
const fromBase64Url = (value: string) => Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4)), c => c.charCodeAt(0));

async function hashPin(pin: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', encoder.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 210_000, hash: 'SHA-256' }, key, 256);
  return `pbkdf2$210000$${toBase64Url(salt)}$${toBase64Url(new Uint8Array(bits))}`;
}

async function verifyPinHash(pin: string, saved: string) {
  const [scheme, iterationText, saltText, hashText] = saved.split('$');
  if (scheme !== 'pbkdf2' || !iterationText || !saltText || !hashText) return false;
  const iterations = Number(iterationText);
  if (!Number.isInteger(iterations) || iterations < 100_000 || iterations > 1_000_000) return false;
  const key = await crypto.subtle.importKey('raw', encoder.encode(pin), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: fromBase64Url(saltText), iterations, hash: 'SHA-256' }, key, 256);
  const actual = new Uint8Array(bits);
  const expected = fromBase64Url(hashText);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual[index] ^ expected[index];
  return difference === 0;
}

const DEFAULT_WEBAUTHN_RP_IDS = new Map<string, string>([
  ['http://localhost:3000', 'localhost'],
  ['https://localhost', 'localhost'],
  ['https://www.digitalazizi.com', 'digitalazizi.com'],
  ['https://digitalazizi.com', 'digitalazizi.com'],
]);

function webAuthnConfig(requestOrigin: string | null) {
  const rpIDSetting = Deno.env.get('WEBAUTHN_RP_ID')?.trim();
  const originsSetting = (Deno.env.get('WEBAUTHN_ORIGINS') || Deno.env.get('WEBAUTHN_ORIGIN') || '').trim();
  const origins = (originsSetting || [...DEFAULT_WEBAUTHN_RP_IDS.keys()].join(','))
    .split(',').map(value => value.trim()).filter(Boolean);
  if (!requestOrigin || !origins.includes(requestOrigin)) {
    throw new Error(`App origin "${requestOrigin || '(missing)'}" is not listed in WEBAUTHN_ORIGINS or the built-in origin allowlist.`);
  }

  // Safe built-in defaults support web and Capacitor Android without putting
  // deploy-specific secrets in frontend code. Explicit Edge Function secrets
  // override these values when the deployment uses different domains.
  if (!rpIDSetting && !originsSetting) {
    const rpID = DEFAULT_WEBAUTHN_RP_IDS.get(requestOrigin);
    if (!rpID) throw new Error(`No WebAuthn RP ID is configured for ${requestOrigin}.`);
    return { rpID, origins: [requestOrigin] };
  }

  if (!rpIDSetting) {
    throw new Error('WEBAUTHN_RP_ID must be configured when WEBAUTHN_ORIGINS is overridden.');
  }

  // For multiple sites, set WEBAUTHN_RP_ID as origin=RP-ID pairs, for example:
  // http://localhost:3000=localhost,https://app.example.com=app.example.com
  const rpIDEntries = rpIDSetting.split(',').map(value => value.trim()).filter(Boolean);
  const mappedEntries = rpIDEntries.filter(value => value.includes('='));
  if (mappedEntries.length > 0) {
    if (mappedEntries.length !== rpIDEntries.length) {
      throw new Error('WEBAUTHN_RP_ID must contain either one RP ID or only origin=RP-ID pairs.');
    }
    const mapping = new Map<string, string>();
    for (const entry of mappedEntries) {
      const separator = entry.indexOf('=');
      const origin = entry.slice(0, separator).trim();
      const rpID = entry.slice(separator + 1).trim();
      if (!origin || !rpID || !origins.includes(origin)) {
        throw new Error(`Invalid WEBAUTHN_RP_ID mapping for origin: ${origin || '(empty)'}`);
      }
      mapping.set(origin, rpID);
    }
    const rpID = mapping.get(requestOrigin);
    if (!rpID) throw new Error(`No WEBAUTHN_RP_ID mapping is configured for ${requestOrigin}.`);
    return { rpID, origins: [requestOrigin] };
  }

  if (rpIDEntries.length !== 1) {
    throw new Error('Use origin=RP-ID pairs in WEBAUTHN_RP_ID when configuring multiple RP IDs.');
  }
  return { rpID: rpIDEntries[0], origins: [requestOrigin] };
}

async function readCredentials(db: SupabaseClient, profileId: string) {
  const { data, error } = await db.from('user_credentials').select('*').eq('user_id', profileId);
  if (error) throw error;
  return (data || []).map((row: JsonRecord) => {
    const rawKey = row.public_key;
    const publicKey = rawKey instanceof Uint8Array
      ? isoBase64URL.fromBuffer(rawKey)
      : typeof rawKey === 'string' && rawKey.startsWith('\\x')
        ? isoBase64URL.fromBuffer(Uint8Array.from(rawKey.slice(2).match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []))
        : String(rawKey || '');
    return {
      id: String(row.credential_id),
      publicKey,
      counter: Number(row.counter) || 0,
      transports: undefined as Transport[] | undefined,
    };
  });
}

async function saveChallenge(db: SupabaseClient, profileId: string, type: string, challenge: string) {
  const { error } = await db.from('authz_webauthn_challenges').upsert({
    user_id: profileId,
    challenge,
    challenge_type: type,
    expires_at: new Date(Date.now() + 5 * 60_000).toISOString(),
  }, { onConflict: 'user_id' });
  if (error) throw error;
}

async function takeChallenge(db: SupabaseClient, profileId: string, type: string) {
  const { data, error } = await db.from('authz_webauthn_challenges').select('challenge, expires_at, challenge_type').eq('user_id', profileId).maybeSingle();
  if (error) throw error;
  await db.from('authz_webauthn_challenges').delete().eq('user_id', profileId);
  if (!data || data.challenge_type !== type || Date.parse(data.expires_at) < Date.now()) return null;
  return String(data.challenge);
}

async function handleAction(action: string, body: JsonRecord, db: SupabaseClient, authUser: User, requestOrigin: string | null) {
  const email = authUser.email!.trim().toLowerCase();
  if (action === 'provision-user') return await provisionUser(db, authUser);

  const profile = await resolveProfile(db, email);
  if (action === 'session') {
    const user = {
      id: String(profile.id), email: profile.email, name: profile.name || email.split('@')[0],
      avatar_url: profile.avatar_url, role: profile.role || 'user',
      subscription_days: String(profile.subscription_days || '7'),
      subscription_expires_at: getExpiry(profile.created_at, profile.subscription_days, profile.subscription_expires_at),
      created_at: profile.created_at, updated_at: profile.updated_at,
    };
    const active = user.role === 'admin' || Date.parse(user.subscription_expires_at) > Date.now();
    return active ? { success: true, user } : { success: false, user, error: 'Your trial has ended. Contact the administrator to renew your subscription.' };
  }

  if (action === 'security') {
    const operation = String(body.operation || 'verify');
    if (operation === 'status') {
      const [{ data: credentialRows, error: credentialError }, { data: userRow, error: userError }] = await Promise.all([
        db.from('user_credentials').select('id').eq('user_id', profile.id),
        db.from('users').select('pin_code').eq('id', profile.id).single(),
      ]);
      if (credentialError) throw credentialError;
      if (userError) throw userError;
      return { success: true, status: { hasPin: Boolean(userRow?.pin_code), hasCredentials: Boolean(credentialRows?.length), credentialCount: credentialRows?.length || 0, resolvedUserId: String(profile.id) } };
    }
    if (operation === 'set') {
      const pin = String(body.pin || '').trim();
      if (!/^\d{4,8}$/.test(pin)) return { success: false, error: 'PIN must contain 4 to 8 digits.' };
      const pinCode = await hashPin(pin);
      const { error } = await db.from('users').update({ pin_code: pinCode, updated_at: new Date().toISOString() }).eq('id', profile.id);
      if (error) throw error;
      return { success: true, message: 'PIN updated successfully.' };
    }
    if (operation === 'verify') {
      const pin = String(body.pin || '').trim();
      const { data, error } = await db.from('users').select('pin_code').eq('id', profile.id).single();
      if (error) throw error;
      const { data: attempts, error: attemptsError } = await db.from('authz_pin_attempts').select('*').eq('user_id', profile.id).maybeSingle();
      if (attemptsError) throw attemptsError;
      if (attempts?.locked_until && Date.parse(attempts.locked_until) > Date.now()) {
        return { verified: false, error: 'Too many incorrect PIN attempts. Try again later.' };
      }
      const saved = String(data?.pin_code || '');
      const verified = saved.startsWith('pbkdf2$')
        ? await verifyPinHash(pin, saved)
        : Boolean(saved) && saved === pin;
      if (verified && saved && !saved.startsWith('pbkdf2$')) {
        const upgraded = await hashPin(pin);
        await db.from('users').update({ pin_code: upgraded, updated_at: new Date().toISOString() }).eq('id', profile.id);
      }
      if (verified) {
        await db.from('authz_pin_attempts').delete().eq('user_id', profile.id);
      } else {
        const withinWindow = attempts?.window_started_at && Date.now() - Date.parse(attempts.window_started_at) < 15 * 60_000;
        const failedAttempts = withinWindow ? Number(attempts.attempt_count || 0) + 1 : 1;
        await db.from('authz_pin_attempts').upsert({
          user_id: profile.id,
          attempt_count: failedAttempts,
          window_started_at: withinWindow ? attempts.window_started_at : new Date().toISOString(),
          locked_until: failedAttempts >= 5 ? new Date(Date.now() + 15 * 60_000).toISOString() : null,
        }, { onConflict: 'user_id' });
      }
      return { verified };
    }
    return { success: false, error: 'Unknown security operation.' };
  }

  if (action === 'webauthn') {
    const operation = String(body.operation || '');
    const { rpID, origins } = webAuthnConfig(requestOrigin);
    if (operation === 'register-options') {
      const credentials = await readCredentials(db, String(profile.id));
      const options = await generateRegistrationOptions({
        rpName: Deno.env.get('WEBAUTHN_RP_NAME') || 'Digital Azizi',
        rpID,
        userID: encoder.encode(String(profile.id)),
        userName: email,
        userDisplayName: String(profile.name || email.split('@')[0]),
        attestationType: 'none',
        excludeCredentials: credentials.map(item => ({ id: item.id, transports: item.transports })),
        authenticatorSelection: { residentKey: 'preferred', userVerification: 'preferred' },
      });
      await saveChallenge(db, String(profile.id), 'registration', options.challenge);
      return options as unknown as JsonRecord;
    }
    if (operation === 'register-verify') {
      const attResp = body.attResp as Parameters<typeof verifyRegistrationResponse>[0]['response'] | undefined;
      if (!attResp) return { verified: false, error: 'Missing authenticator response.' };
      const expectedChallenge = await takeChallenge(db, String(profile.id), 'registration');
      if (!expectedChallenge) return { verified: false, error: 'Challenge expired. Try again.' };
      const verification = await verifyRegistrationResponse({ response: attResp, expectedChallenge, expectedOrigin: origins, expectedRPID: rpID, requireUserVerification: false });
      if (!verification.verified || !verification.registrationInfo) return { verified: false, error: 'Registration verification failed.' };
      const credential = verification.registrationInfo.credential;
      const bytea = `\\x${Array.from(credential.publicKey, value => value.toString(16).padStart(2, '0')).join('')}`;
      const { error } = await db.from('user_credentials').upsert({
        user_id: profile.id,
        credential_id: credential.id,
        public_key: bytea,
        counter: credential.counter,
        device_type: verification.registrationInfo.credentialDeviceType,
      }, { onConflict: 'credential_id' });
      if (error) throw error;
      return { verified: true };
    }
    if (operation === 'auth-options') {
      const credentials = await readCredentials(db, String(profile.id));
      const options = await generateAuthenticationOptions({
        rpID,
        allowCredentials: credentials.map(item => ({ id: item.id, transports: item.transports })),
        userVerification: 'preferred',
      });
      await saveChallenge(db, String(profile.id), 'authentication', options.challenge);
      return options as unknown as JsonRecord;
    }
    if (operation === 'auth-verify') {
      const authResp = body.authResp as Parameters<typeof verifyAuthenticationResponse>[0]['response'] | undefined;
      if (!authResp) return { verified: false, error: 'Missing authenticator response.' };
      const expectedChallenge = await takeChallenge(db, String(profile.id), 'authentication');
      if (!expectedChallenge) return { verified: false, error: 'Challenge expired. Try again.' };
      const credentials = await readCredentials(db, String(profile.id));
      const matched = credentials.find(item => item.id === authResp.id);
      if (!matched) return { verified: false, error: 'No matching passkey is registered.' };
      const verification = await verifyAuthenticationResponse({
        response: authResp,
        expectedChallenge,
        expectedOrigin: origins,
        expectedRPID: rpID,
        credential: { id: matched.id, publicKey: isoBase64URL.toBuffer(matched.publicKey), counter: matched.counter },
        requireUserVerification: false,
      });
      if (!verification.verified || !verification.authenticationInfo) return { verified: false, error: 'Passkey verification failed.' };
      const { error } = await db.from('user_credentials').update({ counter: verification.authenticationInfo.newCounter }).eq('user_id', profile.id).eq('credential_id', matched.id);
      if (error) throw error;
      return { verified: true };
    }
    return { success: false, error: 'Unknown passkey operation.' };
  }

  return { success: false, error: 'Unknown action.' };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed.' }, 405);
  try {
    const authUser = await getAuthenticatedUser(req);
    const body = await req.json().catch(() => ({})) as JsonRecord;
    const action = String(body.action || '');
    if (!action) return json({ error: 'An action is required.' }, 400);
    const result = await handleAction(action, body, getAdminClient(), authUser, req.headers.get('origin'));
    const status = result && typeof result === 'object' && 'success' in result && result.success === false && 'user' in result ? 403 : 200;
    return json(result as JsonRecord, status);
  } catch (error) {
    const status = Number((error as { status?: number })?.status) || 500;
    const message = error instanceof Error ? error.message : 'Authorization request failed.';
    if (status >= 500) console.error('authz-api:', message);
    return json({ success: false, error: message }, status);
  }
});
