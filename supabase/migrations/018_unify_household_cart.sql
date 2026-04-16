alter table if exists public.purchase_receipt_items
  add column if not exists categoria_principal text;

update public.purchase_receipt_items pri
set categoria_principal = ii.categoria_principal
from public.inventory_items ii
where pri.inventory_item_id = ii.id
  and (pri.categoria_principal is null or pri.categoria_principal = '');

update public.purchase_receipt_items
set categoria_principal = case
  when lower(coalesce(subcategoria, '')) in ('lacena', 'nevera', 'congelador') then 'comida'
  when lower(coalesce(subcategoria, '')) in ('aseo_casa', 'aseo_personal', 'mejoras_casa') then 'casa'
  else categoria_principal
end
where categoria_principal is null or categoria_principal = '';

create index if not exists purchase_receipt_items_categoria_idx
  on public.purchase_receipt_items (categoria_principal);

create index if not exists purchase_receipt_items_subcategoria_idx
  on public.purchase_receipt_items (subcategoria);

create index if not exists purchase_session_items_inventory_idx
  on public.purchase_session_items (inventory_item_id);

do $$
declare
  household_session_id text;
  legacy_session record;
  legacy_line record;
  merged_quantity integer;
  merged_price numeric(12,2);
  merged_tax_applies boolean;
  merged_tax_rate numeric(6,4);
  merged_subtotal numeric(12,2);
  merged_tax numeric(12,2);
  merged_total numeric(12,2);
begin
  select id
  into household_session_id
  from public.purchase_sessions
  where status = 'open'
    and scope = 'household'
  order by created_at asc
  limit 1;

  if household_session_id is null then
    household_session_id := concat('SHOP-', floor(extract(epoch from now()))::bigint::text, '-UNI');
    insert into public.purchase_sessions (id, scope, status, created_at)
    values (household_session_id, 'household', 'open', now())
    on conflict (id) do nothing;
  end if;

  for legacy_session in
    select id
    from public.purchase_sessions
    where status = 'open'
      and scope in ('comida', 'casa')
      and id <> household_session_id
    order by created_at asc
  loop
    for legacy_line in
      select *
      from public.purchase_session_items
      where session_id = legacy_session.id
      order by created_at asc
    loop
      insert into public.purchase_session_items (
        id,
        session_id,
        inventory_item_id,
        quantity_to_buy,
        purchase_price,
        tax_applies,
        tax_rate,
        line_subtotal,
        line_tax,
        line_total,
        created_at,
        updated_at
      )
      values (
        concat('LINE-MIG-', substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
        household_session_id,
        legacy_line.inventory_item_id,
        legacy_line.quantity_to_buy,
        legacy_line.purchase_price,
        coalesce(legacy_line.tax_applies, false),
        coalesce(legacy_line.tax_rate, case when coalesce(legacy_line.tax_applies, false) then 0.115 else 0 end),
        coalesce(legacy_line.line_subtotal, round((legacy_line.quantity_to_buy * legacy_line.purchase_price)::numeric, 2)),
        coalesce(legacy_line.line_tax, 0),
        coalesce(legacy_line.line_total, coalesce(legacy_line.line_subtotal, round((legacy_line.quantity_to_buy * legacy_line.purchase_price)::numeric, 2))),
        coalesce(legacy_line.created_at, now()),
        now()
      )
      on conflict (session_id, inventory_item_id)
      do update set
        quantity_to_buy = greatest(1, public.purchase_session_items.quantity_to_buy + excluded.quantity_to_buy),
        purchase_price = excluded.purchase_price,
        tax_applies = (public.purchase_session_items.tax_applies or excluded.tax_applies),
        tax_rate = case
          when (public.purchase_session_items.tax_applies or excluded.tax_applies)
            then greatest(public.purchase_session_items.tax_rate, excluded.tax_rate, 0.115)
          else 0
        end,
        updated_at = now();

      select
        quantity_to_buy,
        purchase_price,
        tax_applies,
        tax_rate
      into
        merged_quantity,
        merged_price,
        merged_tax_applies,
        merged_tax_rate
      from public.purchase_session_items
      where session_id = household_session_id
        and inventory_item_id = legacy_line.inventory_item_id
      limit 1;

      merged_subtotal := round((coalesce(merged_quantity, 0) * coalesce(merged_price, 0))::numeric, 2);
      merged_tax := case
        when coalesce(merged_tax_applies, false)
          then round((merged_subtotal * greatest(coalesce(merged_tax_rate, 0), 0.115))::numeric, 2)
        else 0
      end;
      merged_total := round((merged_subtotal + merged_tax)::numeric, 2);

      update public.purchase_session_items
      set
        tax_rate = case when coalesce(merged_tax_applies, false) then greatest(coalesce(merged_tax_rate, 0), 0.115) else 0 end,
        line_subtotal = merged_subtotal,
        line_tax = merged_tax,
        line_total = merged_total,
        updated_at = now()
      where session_id = household_session_id
        and inventory_item_id = legacy_line.inventory_item_id;
    end loop;

    delete from public.purchase_session_items where session_id = legacy_session.id;

    update public.purchase_sessions
    set
      status = 'cancelled',
      confirmed_at = coalesce(confirmed_at, now())
    where id = legacy_session.id;
  end loop;
end
$$;

