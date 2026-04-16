import { notFound } from "next/navigation";
import Link from "next/link";
import InventoryItemCard from "@/components/inventory/InventoryItemCard";
import InventoryFilterBar from "@/components/inventory/InventoryFilterBar";
import FoodFilterBar from "@/components/inventory/FoodFilterBar";
import FoodZonePills from "@/components/inventory/FoodZonePills";
import FoodAvailabilitySection from "@/components/inventory/FoodAvailabilitySection";
import FoodHubQuickControls from "@/components/inventory/FoodHubQuickControls";
import { FOOD_SUBCATEGORIES, HOUSE_SUBCATEGORIES, applyInventoryFilters, getCategoryOptionsFromItems, getStockPriority, isLowStock } from "@/lib/inventoryFilters";
import { getAllItems } from "@/lib/inventoryRepository";
import { getHouseSubcategoryLabel, HOUSE_ZONE_KEY_TO_SLUG } from "@/lib/house";
import { groupHouseItemsByLane, sortHouseItemsForShopping } from "@/lib/houseShoppingLanes";
import { GABINETE_SUBCATEGORIES, GABINETE_ZONE_KEY_TO_SLUG, getGabineteSubcategoryLabel } from "@/lib/gabinete";

export const dynamic = "force-dynamic";

const TITLES = {
  cajas: "Hub de cajas",
  herramientas: "Hub de herramientas",
  comida: "Hub de comida",
  casa: "Hub de casa",
  gabinete: "Hub de gabinete",
  otros: "Hub de otros",
};

const HOUSE_META = {
  aseo_casa: {
    tone: "border-cyan-200 bg-cyan-50",
    description: "Limpieza general y mantenimiento diario del hogar.",
  },
  aseo_personal: {
    tone: "border-emerald-200 bg-emerald-50",
    description: "Higiene personal y esenciales de bano.",
  },
  mejoras_casa: {
    tone: "border-indigo-200 bg-indigo-50",
    description: "Repuestos, consumibles y mejoras para la casa.",
  },
};

const GABINETE_META = {
  gavetero_principal: {
    tone: "border-violet-200 bg-violet-50",
    description: "Zona hibrida: backlog de reparacion, recuerdos, coleccion y piezas voluminosas.",
  },
  gavetero_1: {
    tone: "border-slate-200 bg-slate-50",
    description: "Area de perforacion, tornilleria estructural y herramientas de mano.",
  },
  gavetero_2: {
    tone: "border-amber-200 bg-amber-50",
    description: "Trabajo fino de construccion, acabado y concreto en progreso.",
  },
  gavetero_3: {
    tone: "border-cyan-200 bg-cyan-50",
    description: "Hub tecnologico, energia, DIY y electronica.",
  },
  gavetero_4: {
    tone: "border-slate-200 bg-slate-50",
    description: "Reservado, pendiente de poblar.",
  },
};

function buildQuery(searchParams, extras = {}) {
  const p = new URLSearchParams();
  if (searchParams?.search) p.set("search", searchParams.search);
  if (searchParams?.low_stock === "1") p.set("low_stock", "1");
  if (searchParams?.available_only === "1") p.set("available_only", "1");
  Object.entries(extras).forEach(([key, value]) => {
    if (value === null || value === "") {
      p.delete(key);
    } else {
      p.set(key, value);
    }
  });
  const q = p.toString();
  return q ? `?${q}` : "";
}

function CasaQuickControls({ searchParams }) {
  const activeZone = searchParams?.subcategoria || "";
  const availableOnly = searchParams?.available_only === "1";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Vista</span>
      <Link
        href={`/inventory/casa${buildQuery(searchParams, { subcategoria: null, available_only: null })}`}
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
          !availableOnly ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        Ver todo
      </Link>
      <Link
        href={`/inventory/casa${buildQuery(searchParams, { subcategoria: activeZone || null, available_only: "1" })}`}
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
          availableOnly ? "border-emerald-700 bg-emerald-700 text-white" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        }`}
      >
        Ver solo disponibles
      </Link>

      <span className="ml-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Subcategoria</span>
      <Link
        href={`/inventory/casa${buildQuery(searchParams, { subcategoria: null })}`}
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
          !activeZone ? "border-cyan-700 bg-cyan-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        Todas
      </Link>
      {HOUSE_SUBCATEGORIES.map((sub) => (
        <Link
          key={sub}
          href={`/inventory/casa${buildQuery(searchParams, { subcategoria: sub })}`}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            activeZone === sub ? "border-cyan-700 bg-cyan-700 text-white" : "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
          }`}
        >
          {getHouseSubcategoryLabel(sub)}
        </Link>
      ))}
    </div>
  );
}

function GabineteQuickControls({ searchParams }) {
  const activeZone = searchParams?.subcategoria || "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Gavetero</span>
      <Link
        href={`/inventory/gabinete${buildQuery(searchParams, { subcategoria: null })}`}
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
          !activeZone ? "border-violet-700 bg-violet-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        Todos
      </Link>
      {GABINETE_SUBCATEGORIES.map((sub) => (
        <Link
          key={sub}
          href={`/inventory/gabinete${buildQuery(searchParams, { subcategoria: sub })}`}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            activeZone === sub ? "border-violet-700 bg-violet-700 text-white" : "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
          }`}
        >
          {getGabineteSubcategoryLabel(sub)}
        </Link>
      ))}
    </div>
  );
}

export default async function InventoryCategoryPage({ params, searchParams }) {
  const categoria = params.categoria;
  const items = await getAllItems();
  const options = getCategoryOptionsFromItems(items);
  const availableOnly = (searchParams?.available_only || "") === "1";
  const zoneFilter = searchParams?.subcategoria || "";

  if (!options.mainCategories.includes(categoria)) {
    notFound();
  }

  const filters = {
    ...(searchParams || {}),
    categoria_principal: categoria,
  };
  const filtered = applyInventoryFilters(items, filters);

  const foodFilteredBase = filtered.filter((item) => item.categoria_principal === "comida");
  const foodAll = items.filter((item) => item.categoria_principal === "comida");
  const foodFiltered = availableOnly
    ? foodFilteredBase.filter((item) => typeof item.cantidad_actual === "number" && item.cantidad_actual >= 1)
    : foodFilteredBase;
  const foodZonesToRender = FOOD_SUBCATEGORIES.includes(zoneFilter) ? [zoneFilter] : FOOD_SUBCATEGORIES;

  const houseFilteredBase = filtered.filter((item) => item.categoria_principal === "casa");
  const houseAll = items.filter((item) => item.categoria_principal === "casa");
  const houseFiltered = availableOnly
    ? houseFilteredBase.filter((item) => typeof item.cantidad_actual === "number" && item.cantidad_actual >= 1)
    : houseFilteredBase;
  const houseZonesToRender = HOUSE_SUBCATEGORIES.includes(zoneFilter) ? [zoneFilter] : HOUSE_SUBCATEGORIES;

  const gabineteFilteredBase = filtered.filter((item) => item.categoria_principal === "gabinete");
  const gabineteAll = items.filter((item) => item.categoria_principal === "gabinete");
  const gabineteFiltered = availableOnly
    ? gabineteFilteredBase.filter((item) => typeof item.cantidad_actual === "number" && item.cantidad_actual >= 1)
    : gabineteFilteredBase;
  const gabineteZonesToRender = GABINETE_SUBCATEGORIES.includes(zoneFilter) ? [zoneFilter] : GABINETE_SUBCATEGORIES;

  return (
    <main className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{TITLES[categoria]}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {categoria === "comida"
            ? "Gestiona lacena, nevera y congelador con filtros rapidos."
            : categoria === "casa"
              ? "Gestiona aseo casa, aseo personal y mejoras con flujo de reposicion premium."
              : categoria === "gabinete"
                ? "Explora el gabinete por gaveteros, con estructura fisica, contenedores y sistemas."
              : "Vista enfocada por categoria principal."}
        </p>
      </section>

      <InventoryFilterBar
        searchParams={searchParams || {}}
        fixedMainCategory={categoria}
        mainCategoryOptions={options.mainCategories}
        foodSubcategoryOptions={options.foodSubcategories}
      />

      {categoria === "comida" ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Food hub</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Navegacion rapida por zonas</h2>
                  <p className="mt-1 text-sm text-slate-600">Entradas directas para escaneo NFC y exploracion manual.</p>
                </div>
                <div className="grid min-w-[150px] grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-white/80 bg-white px-3 py-2">
                    <p className="font-semibold text-slate-900">{foodAll.length}</p>
                    <p className="text-slate-500">Total comida</p>
                  </div>
                  <div className="rounded-xl border border-white/80 bg-white px-3 py-2">
                    <p className="font-semibold text-rose-700">{foodAll.filter((item) => isLowStock(item)).length}</p>
                    <p className="text-slate-500">Stock bajo</p>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Link href="/shopping/comida" className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Entrar a modo compra
                </Link>
              </div>
              <div className="mt-4">
                <FoodZonePills />
              </div>
              <div className="mt-3 rounded-2xl border border-cyan-200 bg-white p-3">
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Nevera (arriba)</p>
                  <p className="mt-1 text-xs text-slate-600">Lacteos, embutidos y productos de uso frecuente.</p>
                </div>
                <div className="my-2 h-px bg-slate-200" />
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Congelador (abajo)</p>
                  <p className="mt-1 text-xs text-slate-600">Reservas congeladas y alimentos de largo plazo.</p>
                </div>
              </div>
            </div>

            <FoodAvailabilitySection items={foodAll} selectedZone={FOOD_SUBCATEGORIES.includes(zoneFilter) ? zoneFilter : null} />

            <FoodHubQuickControls />

            <FoodFilterBar searchParams={searchParams || {}} clearHref={availableOnly ? "/inventory/comida?available_only=1" : "/inventory/comida"} />

            {foodZonesToRender.map((zone) => {
              const zoneItems = foodFiltered.filter((item) => item.subcategoria === zone);
              const preview = zoneItems.slice(0, 4);
              const lowStock = zoneItems.filter((item) => isLowStock(item)).length;
              const critical = zoneItems.filter((item) => getStockPriority(item) === "critical").length;

              return (
                <div key={zone} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{zone}</h2>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{zoneItems.length}</span>
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">{lowStock} bajos</span>
                      {critical > 0 ? <span className="rounded-full bg-rose-600 px-2.5 py-1 text-xs font-medium text-white">{critical} criticos</span> : null}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/inventory/comida/${zone}${buildQuery(searchParams)}`}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Abrir zona
                      </Link>
                      <Link
                        href={`/shopping/comida?subcategoria=${encodeURIComponent(zone)}&low_stock=1`}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Reponer
                      </Link>
                    </div>
                  </div>
                  {zoneItems.length === 0 ? (
                    <p className="text-sm text-slate-500">Sin items en esta zona.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {preview.map((item) => <InventoryItemCard key={item.id} item={item} variant="showroom" />)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {categoria === "casa" ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Casa hub</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Navegacion rapida por subcategorias</h2>
                  <p className="mt-1 text-sm text-slate-600">Aseo, cuidado personal y mejoras del hogar en una sola vista premium.</p>
                </div>
                <div className="grid min-w-[150px] grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-white/80 bg-white px-3 py-2">
                    <p className="font-semibold text-slate-900">{houseAll.length}</p>
                    <p className="text-slate-500">Total casa</p>
                  </div>
                  <div className="rounded-xl border border-white/80 bg-white px-3 py-2">
                    <p className="font-semibold text-rose-700">{houseAll.filter((item) => isLowStock(item)).length}</p>
                    <p className="text-slate-500">Stock bajo</p>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <Link href="/shopping/casa" className="inline-flex rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Entrar a modo compra casa
                </Link>
              </div>
              <div className="mt-4">
                <CasaQuickControls searchParams={searchParams || {}} />
              </div>
            </div>

            <FoodFilterBar searchParams={searchParams || {}} clearHref={availableOnly ? "/inventory/casa?available_only=1" : "/inventory/casa"} />

            {houseZonesToRender.map((sub) => {
              const zoneItems = houseFiltered.filter((item) => item.subcategoria === sub);
              const sortedZoneItems = sortHouseItemsForShopping(zoneItems);
              const preview = sortedZoneItems.slice(0, 6);
              const laneSummary = groupHouseItemsByLane(zoneItems).map((lane) => ({
                label: lane.laneLabel,
                count: lane.items.length,
              }));
              const lowStock = zoneItems.filter((item) => isLowStock(item)).length;
              const critical = zoneItems.filter((item) => getStockPriority(item) === "critical").length;
              const slug = HOUSE_ZONE_KEY_TO_SLUG[sub];

              return (
                <div key={sub} className={`rounded-3xl border p-4 ${HOUSE_META[sub]?.tone || "border-slate-200 bg-slate-50"}`}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{getHouseSubcategoryLabel(sub)}</h2>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{zoneItems.length}</span>
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">{lowStock} bajos</span>
                      {critical > 0 ? <span className="rounded-full bg-rose-600 px-2.5 py-1 text-xs font-medium text-white">{critical} criticos</span> : null}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/inventory/casa/${slug}${buildQuery(searchParams)}`}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Abrir seccion
                      </Link>
                      <Link
                        href={`/shopping/casa?subcategoria=${encodeURIComponent(sub)}&low_stock=1`}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Reponer
                      </Link>
                    </div>
                  </div>
                  <p className="mb-3 text-xs text-slate-600">{HOUSE_META[sub]?.description}</p>
                  {laneSummary.length > 0 ? (
                    <div className="mb-3 flex flex-wrap items-center gap-1.5">
                      {laneSummary.map((lane) => (
                        <span key={`${sub}-${lane.label}`} className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600">
                          {lane.label}: {lane.count}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {zoneItems.length === 0 ? (
                    <p className="text-sm text-slate-500">Sin items en esta subcategoria.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {preview.map((item) => <InventoryItemCard key={item.id} item={item} variant="showroom" />)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {categoria === "gabinete" ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-4">
            <div className="rounded-3xl border border-violet-200 bg-violet-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">Gabinete total</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Estructura fisica por gaveteros</h2>
                  <p className="mt-1 text-sm text-slate-600">Contenedores tematicos, items directos y sistemas completos integrados en una vista clara.</p>
                </div>
                <div className="grid min-w-[150px] grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl border border-white/80 bg-white px-3 py-2">
                    <p className="font-semibold text-slate-900">{gabineteAll.length}</p>
                    <p className="text-slate-500">Total gabinete</p>
                  </div>
                  <div className="rounded-xl border border-white/80 bg-white px-3 py-2">
                    <p className="font-semibold text-rose-700">{gabineteAll.filter((item) => isLowStock(item)).length}</p>
                    <p className="text-slate-500">Stock bajo</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <GabineteQuickControls searchParams={searchParams || {}} />
              </div>
            </div>

            <FoodFilterBar searchParams={searchParams || {}} clearHref={availableOnly ? "/inventory/gabinete?available_only=1" : "/inventory/gabinete"} />

            {gabineteZonesToRender.map((sub) => {
              const zoneItems = gabineteFiltered.filter((item) => item.subcategoria === sub);
              const lowStock = zoneItems.filter((item) => isLowStock(item)).length;
              const slug = GABINETE_ZONE_KEY_TO_SLUG[sub];

              return (
                <div key={sub} className={`rounded-3xl border p-4 ${GABINETE_META[sub]?.tone || "border-slate-200 bg-slate-50"}`}>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{getGabineteSubcategoryLabel(sub)}</h2>
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-700">{zoneItems.length}</span>
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-700">{lowStock} bajos</span>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/inventory/gabinete/${slug}${buildQuery(searchParams)}`}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Abrir gavetero
                      </Link>
                    </div>
                  </div>
                  <p className="mb-3 text-xs text-slate-600">{GABINETE_META[sub]?.description}</p>
                  {zoneItems.length === 0 ? (
                    <p className="text-sm text-slate-500">Sin items en esta zona por ahora.</p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {zoneItems.slice(0, 6).map((item) => <InventoryItemCard key={item.id} item={item} variant="showroom" />)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {categoria !== "comida" && categoria !== "casa" && categoria !== "gabinete" ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500">No hay items para esta categoria con los filtros actuales.</p>
          ) : (
            <div className="grid gap-3">{filtered.map((item) => <InventoryItemCard key={item.id} item={item} />)}</div>
          )}
        </section>
      ) : null}
    </main>
  );
}
