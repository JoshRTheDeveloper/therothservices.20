import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        theme_color: "#0d1f17",
        background_color: "#0d1f17",
        display: "standalone",
        start_url: "/",
        scope: "/",
        name: "Roth House NFL Picks",
        short_name: "NFL Picks",
        description: "Family NFL straight-up picks with ESPN scoreboard data",
        icons: [
          {
            src: "pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/site\.api\.espn\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "espn-api",
              expiration: {
                maxEntries: 32,
                maxAgeSeconds: 60 * 30,
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    host: "127.0.0.1",
    port: 5174,
    watch: {
      ignored: [/node_modules\.broken/, "**/node_modules.broken.*/**"],
    },
  },
});
