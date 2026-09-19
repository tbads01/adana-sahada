import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Adana Open Sahada",
    short_name: "Sahada",
    description: "Adana Open saha uygulaması: maç, etkinlik, duyuru ve canlı yayın.",
    start_url: "/",
    display: "standalone",
    background_color: "#0c1638",
    theme_color: "#1a2751",
    lang: "tr",
    icons: [
      { src: "/favicon.png", sizes: "64x64", type: "image/png" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcuts: [
      { name: "Maçlar", short_name: "Maçlar", url: "/maclar" },
      { name: "Etkinlikler", short_name: "Etkinlikler", url: "/etkinlikler" },
      { name: "Canlı", short_name: "Canlı", url: "/canli" },
    ],
  };
}
