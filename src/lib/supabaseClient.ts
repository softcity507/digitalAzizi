'use client';

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lvhpysbseoojxothltxy.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient>;
let client: BrowserSupabaseClient | undefined;

function getSupabaseClient(): BrowserSupabaseClient {
  if (!client) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase browser configuration is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).');
    }
    client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

// Client Components are prerendered by Next.js. Defer browser-client creation
// until an auth action runs so builds do not require public env values at import time.
export const supabaseClient = new Proxy({} as BrowserSupabaseClient, {
  get(_target, property) {
    const activeClient = getSupabaseClient();
    const value = Reflect.get(activeClient, property);
    return typeof value === 'function' ? value.bind(activeClient) : value;
  },
});
