import Link from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { getPurchaseHistoryCalendar } from "@/lib/shoppingRepository";

export const dynamic = "force-dynamic";

function parseMonth(value) {
  const valid = /^\d{4}-\d{2}$/.test(value || "");
  if (!valid) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
  return value;
}

function monthStartDate(month) {
  return new Date(`${month}-01T00:00:00`);
}

function dateKeyFromIso(iso) {
  if (!iso) {
    return "";
  }
  return iso.slice(0, 10);
}

function buildCalendarCells(month) {
  const start = monthStartDate(month);
  const year = start.getFullYear();
  const monthIndex = start.getMonth();
  const firstWeekday = (start.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ empty: true, key: `empty-${i}` });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ empty: false, key, day });
  }
  return cells;
}

function monthLabel(month) {
  const date = monthStartDate(month);
  return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

export default async function ShoppingHistoryCalendarPage({ searchParams }) {
  const month = parseMonth(typeof searchParams?.month === "string" ? searchParams.month : "");
  const selectedDate = typeof searchParams?.date === "string" ? searchParams.date : "";
  let calendarData = { receipts: [], days: [] };
  let setupError = "";

  try {
    calendarData = await getPurchaseHistoryCalendar(month);
  } catch (error) {
    setupError = error instanceof Error ? error.message : "Calendar history is not ready.";
  }

  if (setupError) {
    return (
      <main className="space-y-5">
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Historial calendario</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Configuracion pendiente</h1>
          <p className="mt-2 text-sm text-slate-700">No se pudo cargar la vista calendario en este entorno.</p>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-amber-200 bg-white p-3 text-xs text-slate-700">{setupError}</pre>
          <div className="mt-4">
            <Link href="/shopping/history" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Volver a historial
            </Link>
          </div>
        </section>
      </main>
    );
  }
  const calendarCells = buildCalendarCells(month);
  const receiptsByDate = new Map();
  (calendarData.receipts || []).forEach((receipt) => {
    const key = dateKeyFromIso(receipt.created_at);
    const list = receiptsByDate.get(key) || [];
    list.push(receipt);
    receiptsByDate.set(key, list);
  });
  const daySummaryByDate = new Map((calendarData.days || []).map((day) => [day.date_key, day]));

  const receiptsForDay = selectedDate ? receiptsByDate.get(selectedDate) || [] : [];
  const selectedDaySummary = selectedDate ? daySummaryByDate.get(selectedDate) || null : null;
  const prevMonthDate = monthStartDate(month);
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const nextMonthDate = monthStartDate(month);
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const nextMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}`;

  return (
    <main className="space-y-5">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Historial calendario</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">Compras por fecha</h1>
            <p className="mt-1 text-sm text-slate-600">Selecciona un día para ver recibos de compra.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/shopping/history" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Volver a lista
            </Link>
            <Link href="/shopping/comida" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Nueva compra
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <Link href={`/shopping/history/calendar?month=${prevMonth}`} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Mes anterior
          </Link>
          <h2 className="text-lg font-semibold capitalize text-slate-900">{monthLabel(month)}</h2>
          <Link href={`/shopping/history/calendar?month=${nextMonth}`} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Mes siguiente
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map((weekday) => (
            <div key={weekday}>{weekday}</div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">
          {calendarCells.map((cell) => {
            if (cell.empty) {
              return <div key={cell.key} className="h-14 rounded-xl bg-transparent" />;
            }

            const dateKey = cell.key;
            const dayReceipts = receiptsByDate.get(dateKey) || [];
            const dayTotal = dayReceipts.reduce((sum, receipt) => sum + (receipt.grand_total || receipt.total_amount || 0), 0);
            const active = selectedDate === dateKey;

            return (
              <Link
                key={dateKey}
                href={`/shopping/history/calendar?month=${month}&date=${dateKey}`}
                className={`h-14 rounded-xl border px-2 py-1 text-left transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : dayReceipts.length > 0
                      ? "border-emerald-200 bg-emerald-50 hover:border-emerald-300"
                      : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <p className="text-xs font-semibold">{cell.day}</p>
                {dayReceipts.length > 0 ? (
                  <>
                    <p className={`mt-0.5 text-[10px] ${active ? "text-emerald-100" : "text-emerald-700"}`}>{dayReceipts.length} recibo(s)</p>
                    <p className={`text-[10px] ${active ? "text-emerald-100" : "text-emerald-700"}`}>{formatCurrency(dayTotal)}</p>
                  </>
                ) : null}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{selectedDate ? `Compras del ${selectedDate}` : "Selecciona un dia"}</h3>
          {selectedDate ? <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{receiptsForDay.length}</span> : null}
        </div>

        {!selectedDate ? (
          <p className="text-sm text-slate-500">Toca un día del calendario para ver los recibos.</p>
        ) : receiptsForDay.length === 0 ? (
          <p className="text-sm text-slate-500">No hay compras en esta fecha.</p>
        ) : (
          <div className="space-y-4">
            {selectedDaySummary ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Resumen diario</p>
                <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
                  <div className="rounded-xl border border-white bg-white px-3 py-2">
                    <p className="text-xs text-slate-500">Recibos</p>
                    <p className="font-semibold text-slate-900">{selectedDaySummary.receipt_count}</p>
                  </div>
                  <div className="rounded-xl border border-white bg-white px-3 py-2">
                    <p className="text-xs text-slate-500">Unidades</p>
                    <p className="font-semibold text-slate-900">{selectedDaySummary.total_units}</p>
                  </div>
                  <div className="rounded-xl border border-white bg-white px-3 py-2">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="font-semibold text-slate-900">{formatCurrency(selectedDaySummary.total_amount)}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(selectedDaySummary.zone_summary || {}).map(([zoneKey, zone]) => (
                    <span key={zoneKey} className="rounded-full border border-white bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                      {zoneKey}: {zone.units} u · {formatCurrency(zone.amount)}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
            {receiptsForDay.map((receipt) => (
              <Link
                key={receipt.id}
                href={`/shopping/receipt/${encodeURIComponent(receipt.id)}`}
                className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-px hover:border-slate-300 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{receipt.id}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(receipt.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
                    <p className="text-lg font-semibold tracking-tight text-slate-900">{formatCurrency(receipt.grand_total || receipt.total_amount)}</p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {Object.entries(receipt.zone_summary || {}).map(([zoneKey, zone]) => (
                    <span key={zoneKey} className="rounded-full border border-white bg-white px-2.5 py-1 font-medium text-slate-700">
                      {zoneKey}: {zone.units} u
                    </span>
                  ))}
                </div>
              </Link>
            ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
