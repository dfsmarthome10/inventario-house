"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateItem } from "@/lib/inventoryRepository";
import { validateInventoryForm } from "@/lib/inventoryValidation";
import { resolveItemNfcConfig } from "@/lib/nfc";

export async function updateItemAction(itemId, previousState, formData) {
  const parsed = validateInventoryForm(formData, { requireId: false });

  if (!parsed.isValid) {
    return {
      ...previousState,
      errors: parsed.errors,
      values: {
        ...parsed.values,
        id: itemId,
      },
      message: "Corrige los campos marcados antes de guardar.",
    };
  }

  try {
    const nfc = resolveItemNfcConfig({
      ...parsed.data,
      id: itemId,
    });

    const updated = await updateItem(itemId, {
      ...parsed.data,
      ...nfc,
    });

    if (!updated) {
      return {
        ...previousState,
        errors: {},
        values: {
          ...parsed.values,
          id: itemId,
        },
        message: "No se encontro el item para editar.",
      };
    }
  } catch (error) {
    return {
      ...previousState,
      errors: {},
      values: {
        ...parsed.values,
        id: itemId,
      },
      message: `No se pudo actualizar el item: ${error.message}`,
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
  revalidatePath("/inventory/cajas");
  revalidatePath("/inventory/herramientas");
  revalidatePath("/admin");
  revalidatePath("/shopping/casa");
  revalidatePath("/admin/nfc");
  revalidatePath("/admin/nfc/items");
  revalidatePath("/admin/nfc/zones");
  revalidatePath(`/item/${itemId}`);

  redirect(`/admin?status=updated&id=${encodeURIComponent(itemId)}`);
}
