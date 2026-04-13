import Link from "next/link";
import { buildFullNfcUrl } from "@/lib/nfc";
import { getAllZoneTargets } from "@/lib/inventoryRepository";
import ZoneTargetForm from "./ZoneTargetForm";
import { saveZoneTargetAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminNfcZonesPage() {
  const zones = await getAllZoneTargets();

  return (
    <main className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">NFC compartido por zonas</h1>
            <p className="mt-1 text-sm text-slate-600">Asigna un UID por zona de comida y usa la URL final para escribir el tag.</p>
          </div>
          <Link href="/admin/nfc" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50">Volver</Link>
        </div>
      </section>

      <section className="space-y-3">
        {zones.map((zone) => (
          <ZoneTargetForm key={zone.zone_key} zone={zone} action={saveZoneTargetAction} writeUrl={buildFullNfcUrl(zone.nfc_target_path)} />
        ))}
      </section>
    </main>
  );
}

