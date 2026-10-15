create table public.user_credentials (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  credential_id text not null,
  public_key bytea not null,
  counter bigint not null,
  device_type text null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint user_credentials_pkey primary key (id),
  constraint user_credentials_credential_id_key unique (credential_id),
  constraint user_credentials_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;