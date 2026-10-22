create table public.authz_pin_attempts (
  user_id uuid not null,
  attempt_count integer not null default 0,
  window_started_at timestamp with time zone not null default now(),
  locked_until timestamp with time zone null,
  updated_at timestamp with time zone not null default now(),
  constraint authz_pin_attempts_pkey primary key (user_id),
  constraint authz_pin_attempts_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint authz_pin_attempts_attempt_count_check check ((attempt_count >= 0))
) TABLESPACE pg_default;