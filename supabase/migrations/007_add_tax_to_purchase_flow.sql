alter table if exists public.purchase_session_items
  add column if not exists tax_applies boolean not null default false,
  add column if not exists tax_rate numeric(6, 4) not null default 0,
  add column if not exists line_subtotal numeric(12, 2) not null default 0,
  add column if not exists line_tax numeric(12, 2) not null default 0,
  add column if not exists line_total numeric(12, 2) not null default 0;

update public.purchase_session_items
set
  line_subtotal = round((coalesce(quantity_to_buy, 0) * coalesce(purchase_price, 0))::numeric, 2),
  line_tax = case
    when coalesce(tax_applies, false) then round((coalesce(quantity_to_buy, 0) * coalesce(purchase_price, 0) * coalesce(tax_rate, 0))::numeric, 2)
    else 0
  end,
  line_total = round(
    (
      coalesce(quantity_to_buy, 0) * coalesce(purchase_price, 0)
      + case
          when coalesce(tax_applies, false) then (coalesce(quantity_to_buy, 0) * coalesce(purchase_price, 0) * coalesce(tax_rate, 0))
          else 0
        end
    )::numeric,
    2
  )
where true;

alter table if exists public.purchase_receipt_items
  add column if not exists tax_applies boolean not null default false,
  add column if not exists tax_rate numeric(6, 4) not null default 0,
  add column if not exists line_tax numeric(12, 2) not null default 0,
  add column if not exists line_total numeric(12, 2) not null default 0;

update public.purchase_receipt_items
set
  line_tax = case
    when coalesce(tax_applies, false) then round((coalesce(line_subtotal, 0) * coalesce(tax_rate, 0))::numeric, 2)
    else 0
  end,
  line_total = round((coalesce(line_subtotal, 0) + coalesce(line_tax, 0))::numeric, 2)
where true;

alter table if exists public.purchase_receipts
  add column if not exists subtotal_amount numeric(12, 2) not null default 0,
  add column if not exists tax_total numeric(12, 2) not null default 0,
  add column if not exists grand_total numeric(12, 2) not null default 0;

update public.purchase_receipts r
set
  subtotal_amount = coalesce(t.subtotal_amount, 0),
  tax_total = coalesce(t.tax_total, 0),
  grand_total = coalesce(t.grand_total, coalesce(r.total_amount, 0)),
  total_amount = coalesce(t.grand_total, coalesce(r.total_amount, 0))
from (
  select
    receipt_id,
    round(sum(coalesce(line_subtotal, 0))::numeric, 2) as subtotal_amount,
    round(sum(coalesce(line_tax, 0))::numeric, 2) as tax_total,
    round(sum(coalesce(line_total, coalesce(line_subtotal, 0)))::numeric, 2) as grand_total
  from public.purchase_receipt_items
  group by receipt_id
) t
where r.id = t.receipt_id;
