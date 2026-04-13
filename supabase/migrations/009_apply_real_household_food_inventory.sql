-- Real household baseline inventory update (food only)
-- Safe to re-run: sets all food quantities to 0, then upserts the provided real available items.

begin;

update public.inventory_items
set cantidad_actual = 0,
    updated_at = now()
where categoria_principal = 'comida';

with new_data as (
  select * from (values
    -- NEVERA
    ('FR-HUEVOS-001','FR-0010','Huevos','Nevera','nevera',36,1,'unidad','https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('FR-ACEITUNAS-001','FR-0020','Aceitunas','Nevera','nevera',1,1,'lata','https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('FR-SOFRITO-001','FR-0019','Sofrito','Nevera','nevera',1,1,'lata','https://images.pexels.com/photos/1435907/pexels-photo-1435907.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('FR-PASTA-001','FR-0021','Pasta','Nevera','nevera',1,1,'paquete','https://upload.wikimedia.org/wikipedia/commons/3/3f/%28Pasta%29_by_David_Adam_Kess_%28pic.2%29.jpg'),
    ('FR-PASTA-LASAGNA-001','FR-0022','Pasta Lasagna','Nevera','nevera',1,1,'paquete','https://images.pexels.com/photos/6287520/pexels-photo-6287520.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('FR-QUESO-PARMESANO-001','FR-0023','Queso parmesano','Nevera','nevera',1,1,'pote','https://upload.wikimedia.org/wikipedia/commons/a/a8/Cheese_platter.jpg'),
    ('FR-CHEESE-WHIZ-001','FR-0024','Cheese Whiz','Nevera','nevera',1,1,'envase','https://upload.wikimedia.org/wikipedia/commons/f/f7/Philly_cream_cheese.jpg'),
    ('FR-LECHUGA-001','FR-0025','Lechuga','Nevera','nevera',1,1,'paquete','https://images.pexels.com/photos/1656666/pexels-photo-1656666.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('PN-CEBOLLA-001','PN-0007','Cebollas','Nevera','nevera',5,1,'unidad','https://upload.wikimedia.org/wikipedia/commons/a/a2/Mixed_onions.jpg'),
    ('PN-AJO-001','PN-0008','Ajos','Nevera','nevera',6,1,'unidad','https://upload.wikimedia.org/wikipedia/commons/3/39/Allium_sativum_Woodwill_1793.jpg'),
    ('FR-ADEREZO-THOUSAND-ISLAND-001','FR-0026','Aderezo Thousand Island','Nevera','nevera',1,1,'botella','https://images.pexels.com/photos/4551832/pexels-photo-4551832.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('FR-ADEREZO-RANCH-001','FR-0027','Aderezo Ranch','Nevera','nevera',1,1,'botella','https://images.pexels.com/photos/616401/pexels-photo-616401.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('FR-MAYONESA-001','FR-0011','Mayonesa','Nevera','nevera',1,1,'envase','https://upload.wikimedia.org/wikipedia/commons/6/60/Mayonnaise_%281%29.jpg'),
    ('FR-COCA-COLA-ZERO-001','FR-0028','Coca-Cola Zero','Nevera','nevera',1,1,'paquete','https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('FR-MALTA-DIETA-001','FR-0029','Malta de dieta','Nevera','nevera',1,1,'paquete','https://images.pexels.com/photos/159291/beer-machine-alcohol-brewery-159291.jpeg?auto=compress&cs=tinysrgb&w=1200'),

    -- CONGELADOR
    ('FZ-CHICKEN-TENDERLOINS-001','FZ-0013','Chicken tenderloins','Congelador','congelador',1,1,'paquete','https://upload.wikimedia.org/wikipedia/commons/5/57/Chickens_in_market.jpg'),
    ('FZ-CARNE-MOLIDA-001','FZ-0002','Carne molida','Congelador','congelador',2,1,'paquete','https://upload.wikimedia.org/wikipedia/commons/d/d1/Hackfleisch-1.jpg'),
    ('FZ-YUCA-001','FZ-0006','Yuca','Congelador','congelador',1,1,'paquete','https://images.pexels.com/photos/4110252/pexels-photo-4110252.jpeg?auto=compress&cs=tinysrgb&w=1200'),

    -- LACENA
    ('PN-SAZON-001','PN-0021','Sazón','Lacena','lacena',1,1,'paquete','https://upload.wikimedia.org/wikipedia/commons/8/8e/Khmeli_suneli_%28Georgian_spice_mix%29_of_Leis_brand.jpg'),
    ('PN-ADOBO-001','PN-0020','Adobo','Lacena','lacena',1,1,'pote','https://images.pexels.com/photos/4197442/pexels-photo-4197442.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('PN-SAL-001','PN-0009','Sal','Lacena','lacena',1,1,'pote','https://upload.wikimedia.org/wikipedia/commons/7/7c/Rock_salt_%28halitite%29_%28Billianwala_Salt_Member%2C_Salt_Range_Formation%2C_Ediacaran_to_Lower_Cambrian%3B_Khewra_Salt_Mine%2C_Salt_Range%2C_Pakistan%29_14.jpg'),
    ('PN-CALDO-POLLO-001','PN-0028','Caldo de pollo','Lacena','lacena',1,1,'pote','https://images.pexels.com/photos/6287524/pexels-photo-6287524.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('PN-CAFE-MOLIDO-001','PN-0024','Café molido','Lacena','lacena',1,1,'paquete','https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('PN-GARLIC-HERB-SEASONING-001','PN-0029','Garlic & Herb seasoning','Lacena','lacena',1,1,'pote','https://images.pexels.com/photos/4197442/pexels-photo-4197442.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('PN-GALLETAS-001','PN-0013','Galletas Export Soda','Lacena','lacena',1,1,'paquete','https://upload.wikimedia.org/wikipedia/commons/b/b4/Choco_chip_cookie.png'),
    ('PN-PAN-HOT-DOG-001','PN-0030','Pan de hot dog','Lacena','lacena',1,1,'paquete','https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('PN-AZUCAR-001','PN-0025','Azúcar','Lacena','lacena',1,1,'pote','https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('PN-VAINILLA-001','PN-0031','Vainilla','Lacena','lacena',1,1,'pote','https://images.pexels.com/photos/5946968/pexels-photo-5946968.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('PN-CHIPOTLES-001','PN-0032','Chipotles','Lacena','lacena',2,1,'pote','https://images.pexels.com/photos/6941026/pexels-photo-6941026.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('PN-HABICHUELAS-COLORADAS-001','PN-0033','Habichuelas coloradas','Lacena','lacena',2,1,'lata','https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('PN-VINAGRE-001','PN-0011','Vinagre','Lacena','lacena',1,1,'envase','https://upload.wikimedia.org/wikipedia/commons/c/c3/Eguilles_20110828_14.jpg'),
    ('PN-ACEITE-VEGETAL-001','PN-0019','Aceite Mazola','Lacena','lacena',1,1,'envase','https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('PN-ATUN-LATA-001','PN-0027','Atún enlatado','Lacena','lacena',1,1,'lata','https://images.pexels.com/photos/3296279/pexels-photo-3296279.jpeg?auto=compress&cs=tinysrgb&w=1200'),
    ('PN-LECHE-CONDENSADA-001','PN-0034','Leche condensada','Lacena','lacena',2,1,'lata','https://upload.wikimedia.org/wikipedia/commons/c/cc/Condensed_and_evaporated_milk.jpg')
  ) as t(id, alias, nombre, ubicacion, subcategoria, cantidad_actual, cantidad_minima, unidad, thumbnail_url)
)
insert into public.inventory_items (
  id, alias, nombre, ubicacion, categoria, categoria_principal, subcategoria,
  contenido, notas, cantidad_actual, cantidad_minima, unidad, thumbnail_url, updated_at
)
select
  id,
  alias,
  nombre,
  ubicacion,
  subcategoria,
  'comida',
  subcategoria,
  '[]'::jsonb,
  null,
  cantidad_actual,
  cantidad_minima,
  unidad,
  thumbnail_url,
  now()
from new_data
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

commit;
