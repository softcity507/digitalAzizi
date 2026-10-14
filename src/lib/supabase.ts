import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lvhpysbseoojxothltxy.supabase.co';

// Server-side database operations use Secret/Service key to reliably read/write
const supabaseKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

let client: SupabaseClient | undefined;

function getSupabaseClient(): SupabaseClient {
  if (!client) {
    if (!supabaseKey) {
      throw new Error('Supabase server key is missing. Set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.');
    }
    client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return client;
}

// Defer client creation until a server operation runs. Next.js imports route
// modules during build, when server-only environment secrets may be absent.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const value = Reflect.get(getSupabaseClient(), property);
    return typeof value === 'function' ? value.bind(getSupabaseClient()) : value;
  },
});
