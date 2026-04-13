"use client";

import { useFormState, useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-xl bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">
      {pending ? "Guardando..." : "Guardar"}
    </button>
  );
}

export default function ZoneTargetForm({ zone, action, writeUrl }) {
  const [state, formAction] = useFormState(action, { error: "", success: "" });

  return (
    <form action={formAction} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <input type="hidden" name="zone_key" value={zone.zone_key} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{zone.zone_key}</h3>
          <p className="text-xs text-slate-500">Target: {zone.nfc_target_path}</p>
          <p className="mt-1 break-all text-xs text-slate-600">URL final: {writeUrl}</p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">NFC Tag UID</span>
          <input
            name="nfc_tag_uid"
            defaultValue={zone.nfc_tag_uid || ""}
            placeholder="UID opcional"
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Target path</span>
          <input
            name="nfc_target_path"
            defaultValue={zone.nfc_target_path || ""}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900"
          />
        </label>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <SubmitButton />
        {state?.error ? <p className="text-xs text-rose-600">{state.error}</p> : null}
        {state?.success ? <p className="text-xs text-emerald-700">{state.success}</p> : null}
      </div>
    </form>
  );
}

