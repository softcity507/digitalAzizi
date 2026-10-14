-- 1. Add pin_code to your existing users table
alter table public.users 
add column if not exists pin_code text;

-- 2. Create table for WebAuthn (Fingerprint / Phone Scanner) credentials
create table if not exists public.user_credentials (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  credential_id text unique not null,
  public_key bytea not null,
  counter bigint not null,
  device_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for security
alter table public.user_credentials enable row level security;

-- Index for high-performance lookup
create index if not exists idx_user_credentials_user_id on public.user_credentials(user_id);
create index if not exists idx_user_credentials_cred_id on public.user_credentials(credential_id);

-- RLS Policy: Authenticated users can read their own credentials
create policy user_credentials_select_own
  on public.user_credentials for select to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.user_credentials to authenticated;
grant all on public.user_credentials to service_role;

notify pgrst, 'reload schema';
