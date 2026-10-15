-- Recycle bin state is stored only on businesses and customers.
-- Run in the Supabase SQL Editor; no recycle_bin table is required.
alter table public.businesses add column if not exists recycle_bin_time timestamptz;
alter table public.customers add column if not exists recycle_bin_time timestamptz;

create index if not exists businesses_recycle_bin_time_idx
  on public.businesses (recycle_bin_time) where recycle_bin_time is not null;
create index if not exists customers_recycle_bin_time_idx
  on public.customers (recycle_bin_time) where recycle_bin_time is not null;

create or replace function public.purge_expired_recycle_bin_items()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.customers
  where recycle_bin_time < now() - interval '15 days';

  delete from public.businesses
  where recycle_bin_time < now() - interval '15 days';
end;
$$;

-- Schedule permanent deletion once per day when Supabase pg_cron is available.
create extension if not exists pg_cron;
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if exists (select 1 from cron.job where jobname = 'purge-expired-recycle-bin-items') then
      perform cron.unschedule('purge-expired-recycle-bin-items');
    end if;
    perform cron.schedule(
      'purge-expired-recycle-bin-items',
      '17 2 * * *',
      'select public.purge_expired_recycle_bin_items()'
    );
  end if;
exception when undefined_table or undefined_function then
  raise notice 'pg_cron is unavailable; schedule public.purge_expired_recycle_bin_items() externally.';
end $$;
