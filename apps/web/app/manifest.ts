import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PixelSquire",
    short_name: "PixelSquire",
    description: "Pixel-art şövalye mascotlu motivasyon uygulaması",
    start_url: "/",
    display: "standalone",
    background_color: "#2e2419", // senin taverna koyu ahşap
    theme_color: "#e0a458", // altın/candlelight
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
