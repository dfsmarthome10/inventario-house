create table if not exists public.shopping_recommendation_runs (
  id text primary key,
  mode text not null check (mode in ('compra_completa', 'compra_budget', 'compra_encargos')),
  inventory_snapshot jsonb not null default '[]'::jsonb,
  generated_list jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists shopping_recommendation_runs_created_at_idx
  on public.shopping_recommendation_runs (created_at desc);

create index if not exists shopping_recommendation_runs_mode_idx
  on public.shopping_recommendation_runs (mode);
