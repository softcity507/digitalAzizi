create table if not exists public.authz_webauthn_challenges (
  user_id uuid primary key references public.users (id) on delete cascade,
  challenge text not null,
  challenge_type text not null check (challenge_type in ('registration', 'authentication')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.authz_webauthn_challenges enable row level security;
revoke all on table public.authz_webauthn_challenges from anon, authenticated;
grant all on table public.authz_webauthn_challenges to service_role;

create table if not exists public.authz_pin_attempts (
  user_id uuid primary key references public.users (id) on delete cascade,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  window_started_at timestamptz not null default now(),
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.authz_pin_attempts enable row level security;
revoke all on table public.authz_pin_attempts from anon, authenticated;
grant all on table public.authz_pin_attempts to service_role;
