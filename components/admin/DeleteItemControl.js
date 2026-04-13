"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

function ConfirmDeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl border border-rose-300 bg-rose-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:opacity-60"
    >
      {pending ? "Eliminando..." : "Confirmar eliminar"}
    </button>
  );
}

export default function DeleteItemControl({ itemId, deleteAction }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
      >
        Eliminar item
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-2">
      <p className="mb-2 text-xs font-medium text-rose-700">Esta accion no se puede deshacer.</p>
      <div className="flex items-center gap-2">
        <form action={deleteAction}>
          <input type="hidden" name="itemId" value={itemId} />
          <ConfirmDeleteButton />
        </form>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
