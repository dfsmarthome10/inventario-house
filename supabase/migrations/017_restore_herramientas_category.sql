-- Restore logical category assignment for tools.
-- Keep physical location in `ubicacion` (e.g. Cueva), preserve grouping metadata.
update public.inventory_items
set
  categoria_principal = 'herramientas',
  categoria = 'herramientas',
  subcategoria = null,
  updated_at = now()
where id in (
  'GB-G1-KIT-RYOBI-90-001',
  'GB-G1-MARTILLO-001',
  'GB-G1-KIT-ROUTER-EXT-001',
  'GB-G2-NIVEL-1PIE-001',
  'GB-G2-HERRAMIENTA-CONCRETO-001',
  'GB-G3-CARGADOR-RYOBI-001',
  'GB-GP-BOX-HERR-ELECT-CUEVA-001',
  'GB-CV-TALADRO-IMPACTO-RYOBI-001',
  'GB-CV-TALADRO-MARTILLO-RYOBI-001',
  'GB-CV-SIERRA-ANGULAR-001',
  'GB-CV-ROUTER-RYOBI-001',
  'GB-CV-TRACK-SAW-001',
  'GB-CV-SYS-RYOBI-18V-001',
  'GB-CV-BATERIA-RYOBI-15AH-001',
  'GB-CV-BATERIA-RYOBI-2AH-001',
  'GB-CV-BATERIA-RYOBI-4AH-001'
);
