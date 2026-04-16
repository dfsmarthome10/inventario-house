# Checkpoint Current State

Last updated: 2026-04-16

## Active Top-Level Categories
- `comida`
- `casa`
- `gabinete`
- `herramientas`

These are the active product pillars in UX, navigation, and daily usage.

## Modeled Physical Structures (Important)

### Comida
- Zone-based structure:
  - `lacena`
  - `nevera`
  - `congelador`
- NFC for food is zone-first (not per-item by default).

### Casa
- Subcategory structure:
  - `aseo_casa`
  - `aseo_personal`
  - `mejoras_casa`
- Shopping lanes are already established and should be preserved.

### Gabinete
- Drawer structure:
  - `gavetero_principal`
  - `gavetero_1`
  - `gavetero_2`
  - `gavetero_3`
  - `gavetero_4` (reserved/pending)
- Supports direct items, thematic containers, sub-boxes, and logical systems.

### Herramientas
- Logical category for tools and related tool systems.
- Tools are categorized by **what they are**, not only by storage drawer.
- Physical placement is kept in `ubicacion` (example: `Cueva`).

## Established Modeling Rules (Do Not Break)
- `Cueva` is a **physical location** (`ubicacion`), not a top-level category.
- `Servidor Home Assistant` is modeled as one logical system item.
- `gavetero_2` is primarily precision/manual-fine-work oriented.
- Ryobi batteries are grouped under `Sistema Ryobi 18V` and linked by parent container.
- Keep `container_type`, `parent_container_name`, and `sistema_logico` semantics consistent.

## Retired/De-emphasized Hubs
- Do not recreate `cajas` or `otros` as active main hubs.
- If historical data appears under legacy categories, keep it queryable but not top-level UX focus.

## Current Stability Expectations
- Must remain stable:
  - inventory browsing (`/inventory`, category hubs, zone pages)
  - admin management
  - item detail pages
  - shopping flows (`comida` and `casa`)
  - receipt/history/calendar
  - stock alerts
  - GPT recommendations only for `comida`

## Guidance for Future Item Imports
- Reuse existing category/subcategory structures first.
- Prefer idempotent SQL imports (`ON CONFLICT (id) DO UPDATE`).
- Keep IDs and aliases predictable and readable.
- Preserve physical placement in `ubicacion`.
- Do not flatten meaningful structure when container/system modeling improves clarity.
- Validate after import:
  - `/inventory`
  - `/inventory/comida`
  - `/inventory/casa`
  - `/inventory/gabinete`
  - `/admin`
  - representative `/item/[id]` pages
