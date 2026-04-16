import "./globals.css";
import Link from "next/link";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import MobileTopMenu from "@/components/navigation/MobileTopMenu";
import PWAClientSetup from "@/components/pwa/PWAClientSetup";
import { getOpenCartBadgeCounts } from "@/lib/shoppingRepository";

export const metadata = {
  title: "Inventory House NFC",
  description: "Sistema de inventario del hogar basado en NFC",
  applicationName: "Inventory House",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Inventory House",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/icons/icon-512.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    apple: [{ url: "/icons/icon-192.svg", type: "image/svg+xml" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "format-detection": "telephone=no",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f1f5f9",
  interactiveWidget: "resizes-content",
};

export default async function RootLayout({ children }) {
  let cartBadgeCounts = {
    household_lines: 0,
    comida_lines: 0,
    casa_lines: 0,
    total_lines: 0,
  };

  try {
    cartBadgeCounts = await getOpenCartBadgeCounts();
  } catch (error) {
    cartBadgeCounts = { household_lines: 0, comida_lines: 0, casa_lines: 0, total_lines: 0 };
  }

  return (
    <html lang="es">
      <body>
        <PWAClientSetup />
        <div className="app-shell pb-app-shell mx-auto min-h-screen w-full px-4 pt-4 sm:px-6 lg:px-8">
          <header className="mb-6 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href="/" className="inline-block rounded-2xl px-2 py-1 text-2xl font-semibold tracking-tight text-ink hover:bg-slate-100">
                  Inventory House
                </Link>
                <p className="mt-1 px-2 text-sm text-slate-600">Inventario NFC del hogar con estructura premium para despliegue.</p>
              </div>
              <MobileTopMenu />
              <nav className="hidden flex-wrap items-center gap-2 xl:flex">
                <Link href="/" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Inicio</Link>
                <Link href="/inventory" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Inventario</Link>
                <Link href="/inventory/herramientas" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Herramientas</Link>
                <Link href="/inventory/comida/disponibles" className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2.5 text-sm font-medium text-cyan-800 hover:bg-cyan-100">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="6" y="3.5" width="12" height="17" rx="2.5" />
                    <path d="M6 11.5h12" />
                    <path d="M10 7.5h4" />
                    <path d="M10 15.5h4" />
                  </svg>
                  <span>Nuestra Comida</span>
                </Link>
                <Link href="/shopping" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Compras</Link>
                <Link href="/shopping/history" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Historial</Link>
                <Link href="/admin" className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800">Admin</Link>
              </nav>
            </div>
          </header>
          {children}
        </div>
        <MobileBottomNav cartBadgeCounts={cartBadgeCounts} />
      </body>
    </html>
  );
}
