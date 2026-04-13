"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const ZONES = ["lacena", "nevera", "congelador"];

export default function FoodHubQuickControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const availableOnly = searchParams.get("available_only") === "1";
  const zoneFilter = searchParams.get("subcategoria") || "";

  function updateFilters(patch) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(patch).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const qs = params.toString();
    const target = `${pathname}${qs ? `?${qs}` : ""}`;

    startTransition(() => {
      router.replace(target, { scroll: false });
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Vista</span>
      <button
        type="button"
        onClick={() => updateFilters({ available_only: null })}
        disabled={pending}
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
          !availableOnly
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        Ver todo
      </button>
      <button
        type="button"
        onClick={() => updateFilters({ available_only: "1" })}
        disabled={pending}
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
          availableOnly
            ? "border-emerald-700 bg-emerald-700 text-white"
            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        }`}
      >
        Ver solo disponibles
      </button>

      <span className="ml-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Zona</span>
      <button
        type="button"
        onClick={() => updateFilters({ subcategoria: null })}
        disabled={pending}
        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
          !zoneFilter
            ? "border-cyan-700 bg-cyan-700 text-white"
            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        Todas
      </button>
      {ZONES.map((zone) => (
        <button
          key={zone}
          type="button"
          onClick={() => updateFilters({ subcategoria: zone })}
          disabled={pending}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
            zoneFilter === zone
              ? "border-cyan-700 bg-cyan-700 text-white"
              : "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
          }`}
        >
          {zone}
        </button>
      ))}
    </div>
  );
}

