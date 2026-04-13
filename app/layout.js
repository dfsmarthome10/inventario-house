import "./globals.css";
import Link from "next/link";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";

export const metadata = {
  title: "Inventory House NFC",
  description: "Sistema de inventario del hogar basado en NFC",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <div className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-28 pt-4 sm:px-6 md:pb-10 lg:px-8">
          <header className="mb-6 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href="/" className="inline-block rounded-2xl px-2 py-1 text-2xl font-semibold tracking-tight text-ink hover:bg-slate-100">
                  Inventory House
                </Link>
                <p className="mt-1 px-2 text-sm text-slate-600">Inventario NFC del hogar con estructura premium para despliegue.</p>
              </div>
              <nav className="hidden flex-wrap items-center gap-2 md:flex">
                <Link href="/" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Inicio</Link>
                <Link href="/inventory" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Inventario</Link>
                <Link href="/admin/nfc" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">NFC</Link>
                <Link href="/admin" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Admin</Link>
              </nav>
            </div>
          </header>
          {children}
        </div>
        <MobileBottomNav />
      </body>
    </html>
  );
}
