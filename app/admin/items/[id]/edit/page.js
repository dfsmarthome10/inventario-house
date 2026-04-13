import Link from "next/link";
import { notFound } from "next/navigation";
import InventoryItemForm from "@/components/admin/InventoryItemForm";
import { getCategoryOptionsFromItems } from "@/lib/inventoryFilters";
import { getAllItems, getItemById } from "@/lib/inventoryRepository";
import { updateItemAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function EditInventoryItemPage({ params }) {
  const item = await getItemById(params.id);
  const allItems = await getAllItems();
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  if (!item) {
    notFound();
  }

  const action = updateItemAction.bind(null, item.id);
  const options = getCategoryOptionsFromItems(allItems);

  return (
    <main className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Editar item</h1>
            <p className="mt-1 text-sm text-slate-600">Actualiza metadatos y niveles de inventario.</p>
          </div>
          <Link href="/admin" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Volver
          </Link>
        </div>
      </section>

      <InventoryItemForm
        action={action}
        submitLabel="Guardar cambios"
        initialValues={item}
        appBaseUrl={appBaseUrl}
        readOnlyId
        mainCategoryOptions={options.mainCategories}
        foodSubcategoryOptions={options.foodSubcategories}
      />
    </main>
  );
}
