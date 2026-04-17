-- Idempotent import/update batch (2026-04-17).
-- This migration runs only once by checking a marker item id.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.inventory_items WHERE id = 'PN-CHEF-BOYARDEE-RAVIOLI-001'
  ) THEN
    -- expected match updates
    UPDATE public.inventory_items SET cantidad_actual = COALESCE(cantidad_actual, 0) + 1, updated_at = now() WHERE id = 'PN-ADOBO-001';
    UPDATE public.inventory_items SET cantidad_actual = COALESCE(cantidad_actual, 0) + 1, updated_at = now() WHERE id = 'PN-AGUA-EMBOTELLADA-001';
    UPDATE public.inventory_items SET cantidad_actual = COALESCE(cantidad_actual, 0) + 1, updated_at = now() WHERE id = 'FR-KETCHUP-001';
    UPDATE public.inventory_items SET cantidad_actual = COALESCE(cantidad_actual, 0) + 1, updated_at = now() WHERE id = 'CC-FABULOSO-CITRUS-001';
    UPDATE public.inventory_items SET cantidad_actual = COALESCE(cantidad_actual, 0) + 1, updated_at = now() WHERE id = 'CP-DESODORANTE-001';
    UPDATE public.inventory_items SET cantidad_actual = COALESCE(cantidad_actual, 0) + 3, updated_at = now() WHERE id = 'CC-DAWN-PEQUENO-001';
    UPDATE public.inventory_items SET cantidad_actual = COALESCE(cantidad_actual, 0) + 4, updated_at = now() WHERE id = 'CP-PAPEL-HIGIENICO-001';
    UPDATE public.inventory_items SET cantidad_actual = COALESCE(cantidad_actual, 0) + 2, updated_at = now() WHERE id = 'PN-ATUN-LATA-001';

    INSERT INTO public.inventory_items (
      id, alias, nombre, ubicacion, categoria, categoria_principal, subcategoria,
      contenido, notas, cantidad_actual, cantidad_minima, unidad,
      nfc_mode, nfc_target_type, nfc_target_path, zone_key,
      thumbnail_url, created_at, updated_at
    ) VALUES
      ('PN-CHEF-BOYARDEE-RAVIOLI-001','PN-0020','Chef Boyardee Ravioli','Lacena','lacena','comida','lacena','[]'::jsonb,NULL,2,1,'pote','zone','zone','/inventory/comida/lacena','lacena','https://images.unsplash.com/photo-1615485925873-9f7a7f0f764a?auto=format&fit=crop&w=1200&q=80',now(),now()),
      ('PN-SALCHICHAS-CARMELA-001','PN-0021','Salchichas Carmela','Lacena','lacena','comida','lacena','[]'::jsonb,NULL,2,1,'lata','zone','zone','/inventory/comida/lacena','lacena','https://images.unsplash.com/photo-1599599810694-b5b37304c041?auto=format&fit=crop&w=1200&q=80',now(),now()),
      ('PN-MAIZ-LATA-001','PN-0022','Maiz','Lacena','lacena','comida','lacena','[]'::jsonb,NULL,2,1,'lata','zone','zone','/inventory/comida/lacena','lacena','https://images.unsplash.com/photo-1601593768799-76d95a9f47f8?auto=format&fit=crop&w=1200&q=80',now(),now()),
      ('PN-JAMONILLA-001','PN-0023','Jamonilla','Lacena','lacena','comida','lacena','[]'::jsonb,NULL,1,1,'lata','zone','zone','/inventory/comida/lacena','lacena','https://images.unsplash.com/photo-1606850246025-cf31efea6f22?auto=format&fit=crop&w=1200&q=80',now(),now()),
      ('PN-COLGATE-MAX-FRESH-001','PN-0024','Pasta Colgate Max Fresh','Lacena','lacena','comida','lacena','[]'::jsonb,NULL,1,1,'unidad','zone','zone','/inventory/comida/lacena','lacena','https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=1200&q=80',now(),now()),
      ('PN-VASOS-DESECHABLES-001','PN-0025','Vasos desechables','Lacena','lacena','comida','lacena','[]'::jsonb,NULL,1,1,'paquete','zone','zone','/inventory/comida/lacena','lacena','https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=1200&q=80',now(),now()),
      ('PN-PAN-CLUB-INTEGRAL-HOLSUM-001','PN-0026','Pan club integral blanco Holsum','Lacena','lacena','comida','lacena','[]'::jsonb,NULL,1,1,'paquete','zone','zone','/inventory/comida/lacena','lacena','https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',now(),now()),
      ('PN-MANTEQUILLA-MANI-001','PN-0027','Mantequilla de mani','Lacena','lacena','comida','lacena','[]'::jsonb,NULL,1,1,'unidad','zone','zone','/inventory/comida/lacena','lacena','https://images.unsplash.com/photo-1622484212850-9c3f5f2d7b73?auto=format&fit=crop&w=1200&q=80',now(),now()),
      ('FR-WELCH-UVA-BLANCA-001','FR-0035','Jugo Welch de uvas blancas (64 oz)','Nevera','nevera','comida','nevera','[]'::jsonb,NULL,1,1,'unidad','zone','zone','/inventory/comida/nevera','nevera','https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=1200&q=80',now(),now()),
      ('FR-CHOCOLATINAS-001','FR-0036','Chocolatinas','Nevera','nevera','comida','nevera','[]'::jsonb,NULL,1,1,'paquete','zone','zone','/inventory/comida/nevera','nevera','https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1200&q=80',now(),now()),
      ('FR-SALSA-RAGU-MARINARA-001','FR-0037','Salsa Ragu Marinara','Nevera','nevera','comida','nevera','[]'::jsonb,NULL,1,1,'unidad','zone','zone','/inventory/comida/nevera','nevera','https://images.unsplash.com/photo-1572441713132-51c75654db73?auto=format&fit=crop&w=1200&q=80',now(),now()),
      ('FR-SALSA-RAGU-ALFREDO-4Q-001','FR-0038','Salsa Ragu Alfredo 4 Quesos','Nevera','nevera','comida','nevera','[]'::jsonb,NULL,1,1,'unidad','zone','zone','/inventory/comida/nevera','nevera','https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80',now(),now()),
      ('FR-MAYOKETCHUP-GOYA-001','FR-0039','Mayo Ketchup Goya','Nevera','nevera','comida','nevera','[]'::jsonb,NULL,1,1,'unidad','zone','zone','/inventory/comida/nevera','nevera','https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=1200&q=80',now(),now()),
      ('FR-TANG-CHINA-001','FR-0040','Tang sabor china','Nevera','nevera','comida','nevera','[]'::jsonb,NULL,1,1,'unidad','zone','zone','/inventory/comida/nevera','nevera','https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=1200&q=80',now(),now()),
      ('CC-LISTERINE-001','CC-0031','Listerine','Bano','aseo_personal','casa','aseo_personal','[]'::jsonb,NULL,1,1,'unidad','none',NULL,NULL,NULL,'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',now(),now()),
      ('CC-VEL-DISH-SOAP-001','CC-0032','Vel dish soap','Cocina','aseo_casa','casa','aseo_casa','[]'::jsonb,NULL,1,1,'unidad','none',NULL,NULL,NULL,'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1200&q=80',now(),now()),
      ('CC-PAPEL-ALUMINIO-001','CC-0033','Papel de aluminio','Cocina','desechables','casa','desechables','[]'::jsonb,NULL,1,1,'rollo','none',NULL,NULL,NULL,'https://images.unsplash.com/photo-1615485291234-9b6843b2bb5f?auto=format&fit=crop&w=1200&q=80',now(),now())
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
