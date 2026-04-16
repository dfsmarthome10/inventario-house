"use client";

import { useEffect, useMemo, useState } from "react";

const DISMISS_KEY = "inventory_house_pwa_install_dismissed";

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return Boolean(window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator.standalone === true);
}

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(pointer: coarse)")?.matches || false;
}

function detectIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function PWAInstallCard() {
  const [hidden, setHidden] = useState(true);
  const [standalone, setStandalone] = useState(true);
  const [touch, setTouch] = useState(false);
  const [ios, setIos] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    setStandalone(isStandaloneMode());
    setTouch(isTouchDevice());
    setIos(detectIOS());
    setHidden(localStorage.getItem(DISMISS_KEY) === "1");

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const onInstalled = () => {
      setStandalone(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("focus", () => setStandalone(isStandaloneMode()));

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const canShow = useMemo(() => touch && !standalone && !hidden, [touch, standalone, hidden]);

  if (!canShow) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => {});
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
  }

  return (
    <section className="mb-4 rounded-3xl border border-cyan-200 bg-cyan-50/90 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">Modo app</p>
          <h2 className="mt-1 text-base font-semibold text-slate-900">Instalar Inventory House</h2>
          {ios ? (
            <p className="mt-1 text-sm text-slate-700">
              En Safari: toca <strong>Compartir</strong> y luego <strong>Añadir a pantalla de inicio</strong>.
            </p>
          ) : deferredPrompt ? (
            <p className="mt-1 text-sm text-slate-700">Instálala para abrirla sin tabs ni barra de búsqueda, como app nativa.</p>
          ) : (
            <p className="mt-1 text-sm text-slate-700">Desde el menú del navegador, usa “Instalar app” o “Añadir a pantalla de inicio”.</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="rounded-xl border border-cyan-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Cerrar
        </button>
      </div>

      {deferredPrompt ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Instalar ahora
          </button>
        </div>
      ) : null}
    </section>
  );
}

