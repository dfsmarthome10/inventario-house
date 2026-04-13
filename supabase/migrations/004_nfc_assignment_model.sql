alter table if exists public.inventory_items
  add column if not exists nfc_mode text,
  add column if not exists nfc_tag_uid text,
  add column if not exists nfc_target_type text,
  add column if not exists nfc_target_path text,
  add column if not exists zone_key text;

update public.inventory_items
set nfc_mode = case
  when categoria_principal = 'cajas' then 'item'
  when categoria_principal = 'comida' then 'zone'
  else 'none'
end
where nfc_mode is null;

update public.inventory_items
set nfc_target_type = case
  when nfc_mode = 'item' then 'item'
  when nfc_mode = 'zone' then 'zone'
  else null
end
where nfc_target_type is null;

update public.inventory_items
set zone_key = coalesce(zone_key, subcategoria)
where nfc_mode = 'zone'
  and zone_key is null;

update public.inventory_items
set nfc_target_path = case
  when nfc_mode = 'item' then '/item/' || id
  when nfc_mode = 'zone' and zone_key is not null then '/inventory/comida/' || zone_key
  else null
end
where nfc_target_path is null;

update public.inventory_items
set nfc_tag_uid = null
where nfc_mode = 'none';

alter table public.inventory_items
  alter column nfc_mode set default 'none';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'inventory_items_nfc_mode_check'
  ) then
    alter table public.inventory_items
      add constraint inventory_items_nfc_mode_check check (nfc_mode in ('none', 'item', 'zone'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'inventory_items_nfc_target_type_check'
  ) then
    alter table public.inventory_items
      add constraint inventory_items_nfc_target_type_check check (nfc_target_type is null or nfc_target_type in ('item', 'zone'));
  end if;
end
$$;

create index if not exists inventory_items_nfc_mode_idx
  on public.inventory_items (nfc_mode);

create index if not exists inventory_items_zone_key_idx
  on public.inventory_items (zone_key);

create unique index if not exists inventory_items_nfc_tag_uid_uq
  on public.inventory_items (nfc_tag_uid)
  where nfc_tag_uid is not null;

create table if not exists public.nfc_zone_targets (
  zone_key text primary key,
  nfc_mode text not null default 'zone',
  nfc_tag_uid text,
  nfc_target_type text not null default 'zone',
  nfc_target_path text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'nfc_zone_targets_mode_check'
  ) then
    alter table public.nfc_zone_targets
      add constraint nfc_zone_targets_mode_check check (nfc_mode = 'zone');
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'nfc_zone_targets_type_check'
  ) then
    alter table public.nfc_zone_targets
      add constraint nfc_zone_targets_type_check check (nfc_target_type = 'zone');
  end if;
end
$$;

insert into public.nfc_zone_targets (zone_key, nfc_mode, nfc_tag_uid, nfc_target_type, nfc_target_path)
values
  ('lacena', 'zone', null, 'zone', '/inventory/comida/lacena'),
  ('nevera', 'zone', null, 'zone', '/inventory/comida/nevera'),
  ('congelador', 'zone', null, 'zone', '/inventory/comida/congelador')
on conflict (zone_key) do update
set
  nfc_mode = excluded.nfc_mode,
  nfc_target_type = excluded.nfc_target_type,
  nfc_target_path = excluded.nfc_target_path,
  updated_at = now();

create unique index if not exists nfc_zone_targets_uid_uq
  on public.nfc_zone_targets (nfc_tag_uid)
  where nfc_tag_uid is not null;

