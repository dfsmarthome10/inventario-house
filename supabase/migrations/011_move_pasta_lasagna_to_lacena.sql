-- Move Pasta Lasagna from nevera to lacena

update public.inventory_items
set
  subcategoria = 'lacena',
  categoria = 'lacena',
  ubicacion = 'Lacena',
  updated_at = now()
where id = 'FR-PASTA-LASAGNA-001';
