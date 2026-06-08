import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import dotenv from "dotenv";

// carregar env global
dotenv.config({ path: "/mnt/hd1tb/projetos/.env" });

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon.ico",
        "canguess-logo-192.png",
        "canguess-logo-512.png"
      ],

      manifest: {
        name: "CanGuess",
        short_name: "CanGuess",
        description: "CanGuess - Já deu seu palpite hoje?",

        theme_color: "#0F4C5C",
        background_color: "#FFFFFF",

        display: "standalone",
        orientation: "portrait",

        start_url: "/",
        scope: "/",

        icons: [
          {
            src: "canguess-logo-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "canguess-logo-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "canguess-logo-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    })
  ]
});
