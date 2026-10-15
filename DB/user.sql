create table public.users (
  id uuid not null default gen_random_uuid (),
  email text not null,
  name text null,
  avatar_url text null,
  role text not null default 'user'::text,
  subscription_days text not null default '7'::text,
  subscription_expires_at timestamp with time zone not null default (now() + '7 days'::interval),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  pin_code text null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_role_check check ((role = any (array['admin'::text, 'user'::text])))
) TABLESPACE pg_default;