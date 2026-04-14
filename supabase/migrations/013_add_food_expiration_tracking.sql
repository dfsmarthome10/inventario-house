alter table if exists public.inventory_items
  add column if not exists expiration_enabled boolean not null default false,
  add column if not exists expiration_dates jsonb not null default '[]'::jsonb;

update public.inventory_items
set expiration_enabled = coalesce(expiration_enabled, false),
    expiration_dates = case
      when expiration_dates is null then '[]'::jsonb
      when jsonb_typeof(expiration_dates) = 'array' then expiration_dates
      else '[]'::jsonb
    end
where true;