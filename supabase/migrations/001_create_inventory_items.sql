create table if not exists public.inventory_items (
  id text primary key,
  alias text not null,
  nombre text not null,
  ubicacion text not null,
  categoria text not null,
  contenido jsonb not null default '[]'::jsonb,
  notas text,
  cantidad_actual integer,
  cantidad_minima integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists inventory_items_categoria_idx on public.inventory_items (categoria);
create index if not exists inventory_items_nombre_idx on public.inventory_items (nombre);