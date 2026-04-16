insert into public.inventory_items (
  id, alias, nombre, ubicacion, categoria, categoria_principal, subcategoria,
  contenido, notas, cantidad_actual, cantidad_minima, unidad, thumbnail_url,
  container_type, parent_container_name, sistema_logico,
  nfc_mode, nfc_target_type, nfc_target_path, zone_key,
  expiration_enabled, expiration_dates, updated_at
)
values
  ('CM-BOX-CONSTRUCCION-LAUNDRY-001','CM-0201','Caja Materiales de Construccion (Laundry)','Area de lavado / almacen','casa','casa','mejoras_casa',
   '["Cemento para empanetar/mezcla","Arena de Playa","Arena de Rio","Tierra para sembrar"]'::jsonb,
   'Contenedor tematico de materiales para tareas de construccion y lavanderia.',null,null,null,
   'https://source.unsplash.com/1200x800/?construction-materials',
   'thematic_box',null,false,
   'none',null,null,null,
   false,'[]'::jsonb,now()),

  ('CM-CEMENTO-MEZCLA-001','CM-0202','Cemento (mezcla)','Area de lavado / almacen','casa','casa','mejoras_casa',
   '[]'::jsonb,'Parte de caja materiales de construccion.',1,1,'saco','https://source.unsplash.com/1200x800/?cement-bag',
   'direct_item','Caja Materiales de Construccion (Laundry)',false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CM-ARENA-PLAYA-001','CM-0203','Arena de Playa','Area de lavado / almacen','casa','casa','mejoras_casa',
   '[]'::jsonb,'Parte de caja materiales de construccion.',1,1,'saco','https://source.unsplash.com/1200x800/?sand',
   'direct_item','Caja Materiales de Construccion (Laundry)',false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CM-ARENA-RIO-001','CM-0204','Arena de Rio','Area de lavado / almacen','casa','casa','mejoras_casa',
   '[]'::jsonb,'Parte de caja materiales de construccion.',2,1,'saco','https://source.unsplash.com/1200x800/?river-sand',
   'direct_item','Caja Materiales de Construccion (Laundry)',false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CM-TIERRA-SEMBRAR-001','CM-0205','Tierra para sembrar','Area de lavado / almacen','casa','casa','mejoras_casa',
   '[]'::jsonb,'Parte de caja materiales de construccion.',1,1,'bolsa','https://source.unsplash.com/1200x800/?potting-soil',
   'direct_item','Caja Materiales de Construccion (Laundry)',false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-OXICLEAN-LIQ-21-001','CC-0201','OxiClean Odor Blasters Liquido (21 Loads)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,3,1,'botella','https://source.unsplash.com/1200x800/?laundry-detergent',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-OXICLEAN-PODS-14-001','CC-0202','OxiClean Odor Blasters Pods (14 Packs)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,3,1,'paquete','https://source.unsplash.com/1200x800/?laundry-pods',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-CLOROX-GALON-001','CC-0203','Clorox (Galon)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,2,1,'galon','https://source.unsplash.com/1200x800/?bleach',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-LYSOL-GEL-INODORO-001','CC-0204','Lysol Gel para Inodoro','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,1,1,'unidad','https://source.unsplash.com/1200x800/?toilet-cleaner',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-WINDEX-SPRAY-001','CC-0205','Windex (Spray)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,1,1,'botella','https://source.unsplash.com/1200x800/?glass-cleaner',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-CLOROX-SPRAY-001','CC-0206','Clorox (Spray)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,1,1,'botella','https://source.unsplash.com/1200x800/?disinfectant-spray',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-FABULOSO-CITRUS-001','CC-0207','Fabuloso Multipurpose Cleaner (Citrus + Baking Soda)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,1,1,'botella','https://source.unsplash.com/1200x800/?multipurpose-cleaner',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-PINK-STUFF-LIQ-001','CC-0208','The Pink Stuff All-Purpose Cleaner (Liquido)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,1,1,'botella','https://source.unsplash.com/1200x800/?cleaning-bottle',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-PINK-STUFF-SPRAY-001','CC-0209','The Pink Stuff All-Purpose Cleaner (Spray)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,1,1,'botella','https://source.unsplash.com/1200x800/?cleaning-spray',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-ALCOHOL-SPRAY-001','CC-0210','Alcohol (Spray)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,2,1,'botella','https://source.unsplash.com/1200x800/?alcohol-spray',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-MRCLEAN-LAVANDA-001','CC-0211','Mr. Clean Lavanda (para mapear)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,1,1,'botella','https://source.unsplash.com/1200x800/?floor-cleaner',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-ZOTE-BARRA-MED-001','CC-0212','Zote (Barra Mediana)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,1,1,'barra','https://source.unsplash.com/1200x800/?laundry-soap-bar',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-ZOTE-BARRA-GRA-001','CC-0213','Zote (Barra Grande)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,1,1,'barra','https://source.unsplash.com/1200x800/?soap-bar',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-DAWN-PEQUENO-001','CC-0214','Dawn Dish Soap (Pequeno)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,3,1,'botella','https://source.unsplash.com/1200x800/?dish-soap',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CM-CRC-656-MARINE-001','CM-0206','CRC Industries 6-56 Marine Lubricant','Gabinete de repuestos','casa','casa','mejoras_casa',
   '[]'::jsonb,null,1,1,'unidad','https://source.unsplash.com/1200x800/?lubricant-spray',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-VINAGRE-LIMPIEZA-001','CC-0215','Vinagre de Limpieza (64 oz)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,1,1,'botella','https://source.unsplash.com/1200x800/?cleaning-vinegar',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-TOALLITAS-LYSOL-001','CC-0216','Toallitas Desinfectantes Lysol','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,2,1,'paquete','https://source.unsplash.com/1200x800/?disinfecting-wipes',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CM-CROSCO-WAX-2500-001','CM-0207','Crosco Floor Wax 2500 (Galon)','Gabinete de repuestos','casa','casa','mejoras_casa',
   '[]'::jsonb,'Tratamiento de pisos (nivel profesional).',1,1,'galon','https://source.unsplash.com/1200x800/?floor-wax',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CM-CROSCO-SEALER-001','CM-0208','Crosco Floor Sealer (Galon)','Gabinete de repuestos','casa','casa','mejoras_casa',
   '[]'::jsonb,'Tratamiento de pisos (nivel profesional).',1,1,'galon','https://source.unsplash.com/1200x800/?floor-sealer',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CM-CROSCO-WAX-2000-001','CM-0209','Crosco Floor Wax 2000 (Galon)','Gabinete de repuestos','casa','casa','mejoras_casa',
   '[]'::jsonb,'Tratamiento de pisos (nivel profesional).',1,1,'galon','https://source.unsplash.com/1200x800/?wax-floor',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-PLATOS-DESECHABLES-330-001','CC-0217','Platos Desechables (330 unidades)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,1,1,'paquete','https://source.unsplash.com/1200x800/?disposable-plates',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-BOLSAS-GLAD-13GAL-001','CC-0218','Bolsas de Basura Glad (13 galones)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,160,25,'bolsa','https://source.unsplash.com/1200x800/?trash-bags',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now()),

  ('CC-BOLSAS-GRANDES-50GAL-001','CC-0219','Bolsas de Basura Grandes (50 galones)','Area de limpieza','casa','casa','aseo_casa',
   '[]'::jsonb,null,25,10,'bolsa','https://source.unsplash.com/1200x800/?garbage-bag',
   'direct_item',null,false,
   'none',null,null,null,false,'[]'::jsonb,now())

on conflict (id) do update set
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
  container_type = excluded.container_type,
  parent_container_name = excluded.parent_container_name,
  sistema_logico = excluded.sistema_logico,
  nfc_mode = excluded.nfc_mode,
  nfc_target_type = excluded.nfc_target_type,
  nfc_target_path = excluded.nfc_target_path,
  zone_key = excluded.zone_key,
  expiration_enabled = excluded.expiration_enabled,
  expiration_dates = excluded.expiration_dates,
  updated_at = now();
