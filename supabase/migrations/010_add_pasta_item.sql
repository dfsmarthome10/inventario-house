-- Add/update Pasta item requested as available stock

insert into public.inventory_items (
  id, alias, nombre, ubicacion, categoria, categoria_principal, subcategoria,
  contenido, notas, cantidad_actual, cantidad_minima, unidad, thumbnail_url, updated_at
)
values (
  'PN-PASTA-001',
  'PN-0035',
  'Pasta',
  'Lacena',
  'lacena',
  'comida',
  'lacena',
  '[]'::jsonb,
  null,
  1,
  1,
  'paquete',
  'https://upload.wikimedia.org/wikipedia/commons/3/3f/%28Pasta%29_by_David_Adam_Kess_%28pic.2%29.jpg',
  now()
)
on conflict (id) do update
set
  alias = excluded.alias,
  nombre = excluded.nombre,
  ubicacion = excluded.ubicacion,
  categoria = excluded.categoria,
  categoria_principal = excluded.categoria_principal,
  subcategoria = excluded.subcategoria,
  contenido = excluded.contenido,
  notas = excluded.notas,
  cantidad_actual = excluded.cantidad_actual,
  cantidad_minima = excluded.cantidad_minima,
  unidad = excluded.unidad,
  thumbnail_url = excluded.thumbnail_url,
  updated_at = now();
