create table public.authz_webauthn_challenges (
  user_id uuid not null,
  challenge text not null,
  challenge_type text not null,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone not null default now(),
  constraint authz_webauthn_challenges_pkey primary key (user_id),
  constraint authz_webauthn_challenges_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE,
  constraint authz_webauthn_challenges_challenge_type_check check (
    (
      challenge_type = any (
        array['registration'::text, 'authentication'::text]
      )
    )
  )
) TABLESPACE pg_default;