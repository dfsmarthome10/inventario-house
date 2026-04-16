import Link from "next/link";
import ThumbnailImage from "@/components/common/ThumbnailImage";
import DeleteItemControl from "@/components/admin/DeleteItemControl";
import { getStockPriority, isLowStock } from "@/lib/inventoryFilters";
import { getItemsByCategory } from "@/lib/inventoryRepository";
import { buildFullNfcUrl } from "@/lib/nfc";
import { getSoonExpirationInfo } from "@/lib/expiration";
import { decrementQuantityAction, deleteItemAction, disableLowStockAlertAction, incrementQuantityAction, setLowStockThresholdAction } from "./actions";

export const dynamic = "force-dynamic";

const MAIN_CATEGORY_META = {
  cajas: { title: "Cajas", accent: "bg-amber-100 text-amber-700" },
  herramientas: { title: "Herramientas", accent: "bg-slate-200 text-slate-700" },
  comida: { title: "Comida", accent: "bg-emerald-100 text-emerald-700" },
  casa: { title: "Casa", accent: "bg-cyan-100 text-cyan-700" },
  gabinete: { title: "Gabinete", accent: "bg-violet-100 text-violet-700" },
  otros: { title: "Otros", accent: "bg-indigo-100 text-indigo-700" },
};

const FOOD_SUBCATEGORY_META = {
  lacena: "Lacena",
  nevera: "Nevera",
  congelador: "Congelador",
};

const HOUSE_SUBCATEGORY_META = {
  aseo_casa: "Aseo Casa",
  aseo_personal: "Aseo Personal",
  mejoras_casa: "Mejoras Casa",
};

const GABINETE_SUBCATEGORY_META = {
  gavetero_principal: "Gavetero Principal",
  gavetero_1: "Gavetero 1",
  gavetero_2: "Gavetero 2",
  gavetero_3: "Gavetero 3",
  gavetero_4: "Gavetero 4",
};

const PRIORITY_META = {
  critical: "bg-rose-600 text-white",
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  normal: "bg-emerald-100 text-emerald-700",
};

const SUBCATEGORY_LABELS = {
  ...FOOD_SUBCATEGORY_META,
  ...HOUSE_SUBCATEGORY_META,
  ...GABINETE_SUBCATEGORY_META,
};

const PRIORITY_OPTIONS = ["critical", "high", "medium", "normal"];

function getQueryParam(searchParams, key) {
  const raw = searchParams?.[key];
  if (Array.isArray(raw)) {
    return raw[0] || "";
  }
  return typeof raw === "string" ? raw : "";
}

function buildFilters(searchParams) {
  return {
    search: getQueryParam(searchParams, "search").trim().toLowerCase(),
    categoria_principal: getQueryParam(searchParams, "categoria_principal").trim().toLowerCase(),
    subcategoria: getQueryParam(searchParams, "subcategoria").trim().toLowerCase(),
    priority: getQueryParam(searchParams, "priority").trim().toLowerCase(),
    low_stock: getQueryParam(searchParams, "low_stock") === "1",
  };
}

function itemMatchesFilters(item, filters) {
  if (filters.search) {
    const haystack = `${item.id} ${item.alias} ${item.nombre} ${item.ubicacion || ""}`.toLowerCase();
    if (!haystack.includes(filters.search)) {
      return false;
    }
  }

  if (filters.categoria_principal && item.categoria_principal !== filters.categoria_principal) {
    return false;
  }

  if (filters.subcategoria && (item.subcategoria || "") !== filters.subcategoria) {
    return false;
  }

  const priority = getStockPriority(item);
  if (filters.priority && priority !== filters.priority) {
    return false;
  }

  if (filters.low_stock && !isLowStock(item)) {
    return false;
  }

  return true;
}

function getAvailableSubcategories(grouped) {
  const set = new Set();
  Object.values(grouped).forEach((block) => {
    const subs = block?.subcategorias || {};
    Object.keys(subs).forEach((key) => {
      if (subs[key]?.length) {
        set.add(key);
      }
    });
    (block?.items || []).forEach((item) => {
      if (item.subcategoria) {
        set.add(item.subcategoria);
      }
    });
  });
  return Array.from(set).sort((a, b) => (SUBCATEGORY_LABELS[a] || a).localeCompare(SUBCATEGORY_LABELS[b] || b, "es"));
}

function AdminFilterBar({ filters, subcategoryOptions }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <label className="flex flex-col gap-1 lg:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Buscar item</span>
          <input
            name="search"
            defaultValue={filters.search}
            placeholder="Nombre, alias o ID"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categoria</span>
          <select name="categoria_principal" defaultValue={filters.categoria_principal} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">
            <option value="">Todas</option>
            {Object.entries(MAIN_CATEGORY_META).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.title}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subcategoria</span>
          <select name="subcategoria" defaultValue={filters.subcategoria} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">
            <option value="">Todas</option>
            {subcategoryOptions.map((sub) => (
              <option key={sub} value={sub}>
                {SUBCATEGORY_LABELS[sub] || sub}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Prioridad</span>
          <select name="priority" defaultValue={filters.priority} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">
            <option value="">Todas</option>
            {PRIORITY_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 lg:self-end">
          <input type="checkbox" name="low_stock" value="1" defaultChecked={filters.low_stock} className="h-4 w-4 rounded border-slate-300" />
          <span className="text-sm text-slate-700">Solo bajo stock</span>
        </label>

        <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
          <button type="submit" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Aplicar</button>
          <Link href="/admin" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Limpiar
          </Link>
        </div>
      </form>
    </section>
  );
}

function QuantityActions({ itemId }) {
  return (
    <div className="flex items-center gap-2">
      <form action={decrementQuantityAction}>
        <input type="hidden" name="itemId" value={itemId} />
        <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50" type="submit">
          Cantidad -1
        </button>
      </form>
      <form action={incrementQuantityAction}>
        <input type="hidden" name="itemId" value={itemId} />
        <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50" type="submit">
          Cantidad +1
        </button>
      </form>
    </div>
  );
}

function LowStockAlertControls({ item }) {
  const hasAlert = typeof item.cantidad_minima === "number";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Alerta de stock bajo</p>
        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${hasAlert ? "bg-rose-100 text-rose-700" : "bg-slate-200 text-slate-700"}`}>
          {hasAlert ? `Activa en <= ${item.cantidad_minima}` : "Desactivada"}
        </span>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <form action={setLowStockThresholdAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="itemId" value={item.id} />
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">Activar en cantidad</span>
            <input
              type="number"
              name="cantidadMinima"
              min="0"
              defaultValue={hasAlert ? item.cantidad_minima : 1}
              className="w-24 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-900"
            />
          </label>
          <button className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100" type="submit">
            Guardar alerta
          </button>
        </form>

        {hasAlert ? (
          <form action={disableLowStockAlertAction}>
            <input type="hidden" name="itemId" value={item.id} />
            <button className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100" type="submit">
              Eliminar alerta
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function ItemAdminCard({ item }) {
  const quantity = typeof item.cantidad_actual === "number" ? item.cantidad_actual : "N/A";
  const quantityMeta = item.unidad && typeof item.cantidad_actual === "number" ? ` ${item.unidad}` : "";
  const nfcLabel = item.nfc_mode === "item" ? "Item NFC" : item.nfc_mode === "zone" ? "Zona NFC" : "Sin NFC";
  const nfcUrl = item.nfc_target_path ? buildFullNfcUrl(item.nfc_target_path) : "";
  const priority = getStockPriority(item);
  const soonExpiration = getSoonExpirationInfo(item);

  return (
    <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <ThumbnailImage
            src={item.thumbnail_url}
            label={item.nombre}
            alt={`Thumbnail de ${item.nombre}`}
          />
          <p className="text-base font-semibold text-slate-900">{item.nombre}</p>
          <p className="text-sm text-slate-500">{item.alias}</p>
          <p className="mt-2 text-sm text-slate-600">Ubicacion: {item.ubicacion}</p>
          <p className="text-sm text-slate-600">
            Cantidad: <span className="font-semibold">{quantity}{quantityMeta}</span>
          </p>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {item.categoria_principal}{item.subcategoria ? ` / ${item.subcategoria}` : ""}
          </p>
          {item.categoria_principal === "comida" ? (
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${item.expiration_enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                {item.expiration_enabled ? `Expira: ${Array.isArray(item.expiration_dates) ? item.expiration_dates.length : 0} lote(s)` : "Sin expiracion"}
              </span>
              {soonExpiration ? (
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                    soonExpiration.tone === "danger" ? "bg-rose-600 text-white" : "bg-amber-100 text-amber-800"
                  }`}
                  title={`Lote mas cercano: ${soonExpiration.expiresOn}`}
                >
                  {soonExpiration.label}
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="mt-1 flex flex-wrap gap-1.5">
            <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${PRIORITY_META[priority] || PRIORITY_META.normal}`}>
              {priority}
            </span>
            {isLowStock(item) && (item.categoria_principal === "comida" || item.categoria_principal === "casa") ? (
              <Link href={`/shopping/${item.categoria_principal}?search=${encodeURIComponent(item.nombre)}&low_stock=1`} className="rounded-full border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">
                Reponer
              </Link>
            ) : null}
          </div>
          <p className="mt-1 text-xs font-medium text-slate-600">NFC: {nfcLabel}</p>
          {nfcUrl ? <p className="mt-1 break-all text-xs text-slate-500">{nfcUrl}</p> : null}
        </div>

        <Link
          href={`/item/${encodeURIComponent(item.id)}`}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Ver
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/admin/items/${encodeURIComponent(item.id)}/edit`}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          Editar item
        </Link>
        <DeleteItemControl itemId={item.id} deleteAction={deleteItemAction} />
        <QuantityActions itemId={item.id} />
      </div>

      <div className="mt-3">
        <LowStockAlertControls item={item} />
      </div>
    </article>
  );
}

function StatusBanner({ status, id }) {
  if (!status || !id) {
    return null;
  }

  const message = status === "created"
    ? `Item ${id} creado correctamente.`
    : status === "updated"
      ? `Item ${id} actualizado correctamente.`
      : status === "deleted"
        ? `Item ${id} eliminado correctamente.`
        : status === "delete_error"
          ? `No se pudo eliminar ${id}. Si estaba en carrito, ya se limpio referencia; intenta de nuevo.`
        : "";

  if (!message) {
    return null;
  }

  if (status === "delete_error") {
    return <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{message}</p>;
  }

  return <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>;
}

export default async function AdminPage({ searchParams }) {
  const groupedRaw = await getItemsByCategory();
  const filters = buildFilters(searchParams || {});
  const subcategoryOptions = getAvailableSubcategories(groupedRaw);

  const grouped = Object.fromEntries(
    Object.entries(groupedRaw).map(([mainCategory, block]) => {
      const filteredSubcategorias = Object.fromEntries(
        Object.entries(block?.subcategorias || {}).map(([subKey, list]) => [
          subKey,
          (list || []).filter((item) => itemMatchesFilters(item, filters)),
        ])
      );

      const filteredItems = (block?.items || []).filter((item) => itemMatchesFilters(item, filters));

      return [
        mainCategory,
        {
          ...block,
          subcategorias: filteredSubcategorias,
          items: filteredItems,
        },
      ];
    })
  );

  const filteredAllItems = Object.values(grouped).flatMap((block) => [
    ...(block?.items || []),
    ...Object.values(block?.subcategorias || {}).flatMap((list) => list || []),
  ]);
  const lowStockFilteredCount = filteredAllItems.filter((item) => isLowStock(item)).length;

  return (
    <main className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard de inventario</h1>
            <p className="mt-1 text-sm text-slate-600">Panel administrativo para gestionar estructura, cantidades y operaciones de mantenimiento.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/items/new" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Crear item</Link>
            <Link href="/admin/nfc" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50">Gestion NFC</Link>
            <Link href="/shopping/comida" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50">Compra comida</Link>
            <Link href="/shopping/casa" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50">Compra casa</Link>
            <Link href="/inventory" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50">Ver inventario</Link>
          </div>
        </div>
      </section>

      <StatusBanner status={searchParams?.status} id={searchParams?.id} />

      <AdminFilterBar filters={filters} subcategoryOptions={subcategoryOptions} />

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Resultados</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">{filteredAllItems.length}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-rose-600">Bajo stock (resultado)</p>
            <p className="mt-1 text-lg font-semibold text-rose-700">{lowStockFilteredCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Filtro activo</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {filters.search || filters.categoria_principal || filters.subcategoria || filters.priority || filters.low_stock ? "Si" : "No"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Items por categoria</h2>
          <Link href="/" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">
            Ir a inicio
          </Link>
        </div>

        <div className="space-y-5">
          {Object.entries(MAIN_CATEGORY_META).map(([mainCategory, meta]) => {
            const block = grouped[mainCategory];

            return (
              <div key={mainCategory} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{meta.title}</h3>
                  <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${meta.accent}`}>categoria principal</span>
                </div>

                {mainCategory === "comida" || mainCategory === "casa" || mainCategory === "gabinete" ? (
                  <div className="space-y-4">
                    {Object.entries(mainCategory === "comida" ? FOOD_SUBCATEGORY_META : mainCategory === "casa" ? HOUSE_SUBCATEGORY_META : GABINETE_SUBCATEGORY_META).map(([subKey, subLabel]) => {
                      const subItems = block?.subcategorias?.[subKey] || [];

                      return (
                        <div key={subKey} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">{subLabel}</h4>
                          {subItems.length === 0 ? (
                            <p className="text-sm text-slate-500">Sin items en esta zona.</p>
                          ) : (
                            <div className="grid gap-3">{subItems.map((item) => <ItemAdminCard key={item.id} item={item} />)}</div>
                          )}
                        </div>
                      );
                    })}

                    {(block?.items?.length || 0) > 0 ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-600">
                          {mainCategory === "comida" ? "Comida sin zona" : mainCategory === "casa" ? "Casa sin subcategoria" : "Gabinete sin gavetero"}
                        </h4>
                        <div className="grid gap-3">{block.items.map((item) => <ItemAdminCard key={item.id} item={item} />)}</div>
                      </div>
                    ) : null}
                  </div>
                ) : (block?.items?.length || 0) === 0 ? (
                  <p className="text-sm text-slate-500">No hay items en esta categoria.</p>
                ) : (
                  <div className="grid gap-3">{block.items.map((item) => <ItemAdminCard key={item.id} item={item} />)}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
