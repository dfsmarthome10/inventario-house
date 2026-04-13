create table if not exists public.purchase_sessions (
  id text primary key,
  scope text not null,
  status text not null check (status in ('open', 'confirmed', 'cancelled')) default 'open',
  receipt_id text unique,
  total_amount numeric(12, 2),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create unique index if not exists purchase_sessions_open_scope_idx
  on public.purchase_sessions (scope)
  where status = 'open';

create index if not exists purchase_sessions_created_at_idx
  on public.purchase_sessions (created_at desc);

create table if not exists public.purchase_session_items (
  id text primary key,
  session_id text not null references public.purchase_sessions(id) on delete cascade,
  inventory_item_id text not null references public.inventory_items(id) on delete restrict,
  quantity_to_buy integer not null check (quantity_to_buy > 0),
  purchase_price numeric(12, 2) not null check (purchase_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, inventory_item_id)
);

create index if not exists purchase_session_items_session_idx
  on public.purchase_session_items (session_id);

create table if not exists public.purchase_receipts (
  id text primary key,
  session_id text references public.purchase_sessions(id) on delete set null,
  total_amount numeric(12, 2) not null default 0,
  line_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists purchase_receipts_created_at_idx
  on public.purchase_receipts (created_at desc);

create table if not exists public.purchase_receipt_items (
  id text primary key,
  receipt_id text not null references public.purchase_receipts(id) on delete cascade,
  inventory_item_id text not null,
  item_nombre text not null,
  item_alias text not null,
  subcategoria text,
  quantity_purchased integer not null check (quantity_purchased > 0),
  purchase_price numeric(12, 2) not null check (purchase_price >= 0),
  line_subtotal numeric(12, 2) not null check (line_subtotal >= 0),
  created_at timestamptz not null default now()
);

create index if not exists purchase_receipt_items_receipt_idx
  on public.purchase_receipt_items (receipt_id);
