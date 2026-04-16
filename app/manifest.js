export default function manifest() {
  return {
    name: "Inventory House",
    short_name: "Inventory",
    description: "Inventario del hogar con compras unificadas y hubs por categoria.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["fullscreen", "standalone", "minimal-ui", "browser"],
    background_color: "#f8fafc",
    theme_color: "#f1f5f9",
    lang: "es",
    orientation: "any",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
  };
}
