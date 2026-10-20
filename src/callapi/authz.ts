import { supabaseClient } from '@/lib/supabaseClient';

export type AuthzAction = 'provision-user' | 'session' | 'security' | 'webauthn';

export interface AuthzRequest {
  action: AuthzAction;
  operation?: string;
  [key: string]: unknown;
}

export async function invokeAuthz<T = Record<string, unknown>>(body: AuthzRequest): Promise<T> {
  const { data, error } = await supabaseClient.functions.invoke('authz-api', { body });
  if (!error) return data as T;

  const context = error.context;
  if (context instanceof Response) {
    try {
      return await context.clone().json() as T;
    } catch {
      // Fall through to a readable SDK error.
    }
  }
  throw new Error(error.message || 'The authorization service is unavailable.');
}
