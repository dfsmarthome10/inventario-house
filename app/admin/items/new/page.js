import Link from "next/link";
import InventoryItemForm from "@/components/admin/InventoryItemForm";
import { getCategoryOptionsFromItems } from "@/lib/inventoryFilters";
import { getAllItems } from "@/lib/inventoryRepository";
import { createItemAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function NewInventoryItemPage() {
  const items = await getAllItems();
  const options = getCategoryOptionsFromItems(items);
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  return (
    <main className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Crear item</h1>
            <p className="mt-1 text-sm text-slate-600">Registra un nuevo item en el inventario del hogar.</p>
          </div>
          <Link href="/admin" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Volver
          </Link>
        </div>
      </section>

      <InventoryItemForm
        action={createItemAction}
        submitLabel="Guardar item"
        initialValues={{}}
        appBaseUrl={appBaseUrl}
        mainCategoryOptions={options.mainCategories}
        foodSubcategoryOptions={options.foodSubcategories}
      />
    </main>
  );
}
