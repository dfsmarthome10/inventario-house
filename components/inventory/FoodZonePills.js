import Link from "next/link";

const FOOD_ZONE_META = {
  lacena: {
    label: "Lacena",
    href: "/inventory/comida/lacena",
    accent: "border-amber-200 bg-amber-50 text-amber-800",
  },
  nevera: {
    label: "Nevera",
    href: "/inventory/comida/nevera",
    accent: "border-sky-200 bg-sky-50 text-sky-800",
  },
  congelador: {
    label: "Congelador",
    href: "/inventory/comida/congelador",
    accent: "border-indigo-200 bg-indigo-50 text-indigo-800",
  },
};

export default function FoodZonePills({ activeZone = "" }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(FOOD_ZONE_META).map(([zoneKey, meta]) => {
        const active = zoneKey === activeZone;

        return (
          <Link
            key={zoneKey}
            href={meta.href}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
              active ? "border-slate-900 bg-slate-900 text-white" : meta.accent
            }`}
          >
            {meta.label}
          </Link>
        );
      })}
    </div>
  );
}
