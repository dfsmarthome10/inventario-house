import Link from "next/link";

const DEFAULT_VISUAL = {
  header: "border-slate-200 bg-slate-50",
  chipActive: "border-slate-900 bg-slate-900 text-white",
  chipIdle: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  badge: "border-slate-200 bg-white text-slate-700",
  iconWrap: "border-slate-200 bg-white text-slate-700",
};

const LANE_VISUALS = {
  limpieza_general: {
    header: "border-cyan-200 bg-cyan-50",
    chipActive: "border-cyan-700 bg-cyan-700 text-white",
    chipIdle: "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
    badge: "border-cyan-200 bg-white text-cyan-700",
    iconWrap: "border-cyan-200 bg-white text-cyan-700",
  },
  lavanderia_materiales: {
    header: "border-emerald-200 bg-emerald-50",
    chipActive: "border-emerald-700 bg-emerald-700 text-white",
    chipIdle: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    badge: "border-emerald-200 bg-white text-emerald-700",
    iconWrap: "border-emerald-200 bg-white text-emerald-700",
  },
  pisos_profesional: {
    header: "border-amber-200 bg-amber-50",
    chipActive: "border-amber-700 bg-amber-700 text-white",
    chipIdle: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
    badge: "border-amber-200 bg-white text-amber-700",
    iconWrap: "border-amber-200 bg-white text-amber-700",
  },
  desechables: {
    header: "border-indigo-200 bg-indigo-50",
    chipActive: "border-indigo-700 bg-indigo-700 text-white",
    chipIdle: "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
    badge: "border-indigo-200 bg-white text-indigo-700",
    iconWrap: "border-indigo-200 bg-white text-indigo-700",
  },
  mantenimiento_hogar: {
    header: "border-violet-200 bg-violet-50",
    chipActive: "border-violet-700 bg-violet-700 text-white",
    chipIdle: "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
    badge: "border-violet-200 bg-white text-violet-700",
    iconWrap: "border-violet-200 bg-white text-violet-700",
  },
  cuidado_personal: {
    header: "border-rose-200 bg-rose-50",
    chipActive: "border-rose-700 bg-rose-700 text-white",
    chipIdle: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
    badge: "border-rose-200 bg-white text-rose-700",
    iconWrap: "border-rose-200 bg-white text-rose-700",
  },
  otros_hogar: DEFAULT_VISUAL,
};

export function getHouseLaneVisuals(laneKey) {
  return LANE_VISUALS[laneKey] || DEFAULT_VISUAL;
}

export function HouseLaneIcon({ laneKey, className = "h-4 w-4" }) {
  if (laneKey === "limpieza_general") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="M8 4h8l-1 4H9L8 4Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 10h10l-1.5 10h-7L7 10Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (laneKey === "lavanderia_materiales") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (laneKey === "pisos_profesional") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6 7v11m6-11v11m6-11v11" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 18h16" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (laneKey === "desechables") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="M8 6h8l-1 13H9L8 6Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (laneKey === "mantenimiento_hogar") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="M4 15l7-7 3 3-7 7H4v-3Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M14 6l2-2 4 4-2 2-4-4Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }
  if (laneKey === "cuidado_personal") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="M8 4h8v4H8V4Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 8h10v12H7V8Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function HouseLaneChip({ laneKey, label, count, href, active = false }) {
  const visual = getHouseLaneVisuals(laneKey);

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active ? visual.chipActive : visual.chipIdle
      }`}
    >
      <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${visual.iconWrap}`}>
        <HouseLaneIcon laneKey={laneKey} className="h-3.5 w-3.5" />
      </span>
      <span>{label}</span>
      {typeof count === "number" ? (
        <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${visual.badge}`}>{count}</span>
      ) : null}
    </Link>
  );
}

export function HouseLaneSectionHeader({ laneKey, title, description, count }) {
  const visual = getHouseLaneVisuals(laneKey);

  return (
    <div className={`mb-3 flex flex-wrap items-start justify-between gap-2 rounded-2xl border p-3 ${visual.header}`}>
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border ${visual.iconWrap}`}>
          <HouseLaneIcon laneKey={laneKey} className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">{title}</h3>
          <p className="text-xs text-slate-600">{description}</p>
        </div>
      </div>
      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${visual.badge}`}>
        {count}
      </span>
    </div>
  );
}
