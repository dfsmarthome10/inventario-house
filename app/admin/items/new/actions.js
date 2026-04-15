"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createItem, getAllItems } from "@/lib/inventoryRepository";
import { generateNextItemId } from "@/lib/inventoryId";
import { validateInventoryForm } from "@/lib/inventoryValidation";
import { resolveItemNfcConfig } from "@/lib/nfc";

export async function createItemAction(previousState, formData) {
  const parsed = validateInventoryForm(formData, { requireId: false });

  if (!parsed.isValid) {
    return {
      ...previousState,
      errors: parsed.errors,
      values: parsed.values,
      message: "Corrige los campos marcados antes de guardar.",
    };
  }

  try {
    const existingItems = await getAllItems();
    const generatedId = generateNextItemId(existingItems, parsed.data.categoria_principal, parsed.data.subcategoria);
    const nfc = resolveItemNfcConfig({
      ...parsed.data,
      id: generatedId,
    });

    await createItem({
      ...parsed.data,
      id: generatedId,
      ...nfc,
    });

    parsed.data.id = generatedId;
  } catch (error) {
    return {
      ...previousState,
      errors: {},
      values: parsed.values,
      message: `No se pudo crear el item: ${error.message}`,
    };
  }

  revalidatePath("/");
  revalidatePath("/inventory");
  revalidatePath("/inventory/comida");
  revalidatePath("/inventory/comida/lacena");
  revalidatePath("/inventory/comida/nevera");
  revalidatePath("/inventory/comida/congelador");
  revalidatePath("/inventory/casa");
  revalidatePath("/inventory/casa/aseo-casa");
  revalidatePath("/inventory/casa/aseo-personal");
  revalidatePath("/inventory/casa/mejoras-casa");
  revalidatePath("/inventory/gabinete");
  revalidatePath("/inventory/gabinete/gavetero-principal");
  revalidatePath("/inventory/gabinete/gavetero-1");
  revalidatePath("/inventory/gabinete/gavetero-2");
  revalidatePath("/inventory/gabinete/gavetero-3");
  revalidatePath("/inventory/gabinete/gavetero-4");
  revalidatePath("/inventory/cajas");
  revalidatePath("/inventory/herramientas");
  revalidatePath("/admin");
  revalidatePath("/shopping/casa");
  revalidatePath("/admin/nfc");
  revalidatePath("/admin/nfc/items");
  revalidatePath("/admin/nfc/zones");

  redirect(`/admin?status=created&id=${encodeURIComponent(parsed.data.id)}`);
}
