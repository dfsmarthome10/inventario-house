import { FOOD_SUBCATEGORIES, MAIN_CATEGORIES } from "@/lib/inventoryFilters";

const CATEGORY_LABELS = {
  cajas: "Cajas",
  herramientas: "Herramientas",
  comida: "Comida",
  casa: "Casa",
  gabinete: "Gabinete",
  otros: "Otros",
};

const SUBCATEGORY_LABELS = {
  lacena: "Lacena",
  nevera: "Nevera",
  congelador: "Congelador",
  aseo_casa: "Aseo Casa",
  aseo_personal: "Aseo Personal",
  mejoras_casa: "Mejoras Casa",
  gavetero_principal: "Gavetero Principal",
  gavetero_1: "Gavetero 1",
  gavetero_2: "Gavetero 2",
  gavetero_3: "Gavetero 3",
  gavetero_4: "Gavetero 4",
};

function buildClearHref(selectedCategory, selectedSubcategory) {
  if (!selectedSubcategory) {
    return selectedCategory ? `/inventory/${selectedCategory}` : "/inventory";
  }

  const foodSubs = new Set(["lacena", "nevera", "congelador"]);
  const houseSlugByKey = {
    aseo_casa: "aseo-casa",
    aseo_personal: "aseo-personal",
    mejoras_casa: "mejoras-casa",
  };
  const gabineteSlugByKey = {
    gavetero_principal: "gavetero-principal",
    gavetero_1: "gavetero-1",
    gavetero_2: "gavetero-2",
    gavetero_3: "gavetero-3",
    gavetero_4: "gavetero-4",
  };

  if (foodSubs.has(selectedSubcategory)) {
    return `/inventory/comida/${selectedSubcategory}`;
  }

  if (houseSlugByKey[selectedSubcategory]) {
    return `/inventory/casa/${houseSlugByKey[selectedSubcategory]}`;
  }

  if (gabineteSlugByKey[selectedSubcategory]) {
    return `/inventory/gabinete/${gabineteSlugByKey[selectedSubcategory]}`;
  }

  return selectedCategory ? `/inventory/${selectedCategory}` : "/inventory";
}

export default function InventoryFilterBar({
  searchParams,
  fixedMainCategory = "",
  fixedSubcategory = "",
  mainCategoryOptions = MAIN_CATEGORIES,
  foodSubcategoryOptions = FOOD_SUBCATEGORIES,
}) {
  const selectedCategory = fixedMainCategory || searchParams.categoria_principal || "";
  const selectedSubcategory = fixedSubcategory || searchParams.subcategoria || "";

  return (
    <form method="get" className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1.5 lg:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Buscar</span>
          <input
            name="search"
            defaultValue={searchParams.search || ""}
            placeholder="Nombre, alias o ID"
            className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
          />
        </label>

        {!fixedMainCategory ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categoria</span>
            <select name="categoria_principal" defaultValue={searchParams.categoria_principal || ""} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">
              <option value="">Todas</option>
              {mainCategoryOptions.map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</option>
              ))}
            </select>
          </label>
        ) : (
          <input type="hidden" name="categoria_principal" value={fixedMainCategory} />
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subcategoria</span>
          {fixedSubcategory ? (
            <>
              <input type="hidden" name="subcategoria" value={fixedSubcategory} />
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
                {SUBCATEGORY_LABELS[fixedSubcategory] || fixedSubcategory}
              </div>
            </>
          ) : (
            <select name="subcategoria" defaultValue={searchParams.subcategoria || ""} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900">
              <option value="">Todas</option>
              {foodSubcategoryOptions.map((sub) => (
                <option key={sub} value={sub}>{SUBCATEGORY_LABELS[sub] || sub}</option>
              ))}
            </select>
          )}
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 lg:self-end">
          <input type="checkbox" name="low_stock" value="1" defaultChecked={searchParams.low_stock === "1"} className="h-4 w-4 rounded border-slate-300" />
          <span className="text-sm text-slate-700">Solo stock bajo</span>
        </label>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button type="submit" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Aplicar</button>
        <a href={buildClearHref(selectedCategory, selectedSubcategory)} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Limpiar
        </a>
      </div>
    </form>
  );
}
