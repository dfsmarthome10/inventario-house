alter table if exists public.inventory_items
  add column if not exists thumbnail_url text;

