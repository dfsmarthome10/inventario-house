alter table if exists public.inventory_items
  add column if not exists categoria_principal text,
  add column if not exists subcategoria text,
  add column if not exists unidad text;

update public.inventory_items
set
  categoria_principal = coalesce(
    categoria_principal,
    case
      when categoria = 'cajas' then 'cajas'
      when categoria = 'herramientas' then 'herramientas'
      when categoria in ('nevera', 'pantry', 'lacena', 'congelador') then 'comida'
      else 'otros'
    end
  ),
  subcategoria = coalesce(
    subcategoria,
    case
      when categoria in ('pantry', 'lacena') then 'lacena'
      when categoria = 'nevera' then 'nevera'
      when categoria = 'congelador' then 'congelador'
      else null
    end
  );

update public.inventory_items
set categoria = case
  when categoria_principal = 'comida' then coalesce(subcategoria, 'comida')
  else categoria_principal
end;

update public.inventory_items
set categoria_principal = 'otros'
where categoria_principal is null;

alter table public.inventory_items
  alter column categoria_principal set not null;

create index if not exists inventory_items_categoria_principal_idx
  on public.inventory_items (categoria_principal);

create index if not exists inventory_items_subcategoria_idx
  on public.inventory_items (subcategoria);

create index if not exists inventory_items_categoria_idx
  on public.inventory_items (categoria);

create index if not exists inventory_items_nombre_idx
  on public.inventory_items (nombre);