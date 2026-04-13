import Link from "next/link";
import { getAllItems, getAllZoneTargets } from "@/lib/inventoryRepository";

export const dynamic = "force-dynamic";

export default async function AdminNfcHomePage() {
  const [items, zones] = await Promise.all([getAllItems(), getAllZoneTargets()]);
  const itemNfcCount = items.filter((item) => item.nfc_mode === "item").length;
  const noNfcCount = items.filter((item) => item.nfc_mode === "none").length;
  const zoneTagConfigured = zones.filter((zone) => zone.nfc_tag_uid).length;

  return (
    <main className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Centro NFC</h1>
        <p className="mt-1 text-sm text-slate-600">Administra asignaciones NFC para zonas compartidas e items individuales.</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Items con tag individual</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{itemNfcCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Zonas con UID configurado</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{zoneTagConfigured}/{zones.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Items sin NFC</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{noNfcCount}</p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/admin/nfc/zones" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-px hover:border-slate-300">
          <p className="text-base font-semibold text-slate-900">NFC por zonas</p>
          <p className="mt-1 text-sm text-slate-600">Configura `lacena`, `nevera` y `congelador` con tag compartido.</p>
        </Link>
        <Link href="/admin/nfc/items" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-px hover:border-slate-300">
          <p className="text-base font-semibold text-slate-900">NFC por items</p>
          <p className="mt-1 text-sm text-slate-600">Revisa items con `none`, `item` y `zone`, y su URL final.</p>
        </Link>
      </section>
    </main>
  );
}

