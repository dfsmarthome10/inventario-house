create index if not exists purchase_receipt_items_subcategoria_idx
  on public.purchase_receipt_items (subcategoria);

create index if not exists purchase_receipt_items_item_nombre_idx
  on public.purchase_receipt_items (item_nombre);
