import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const __dirname = typeof import.meta.dirname === "string"
  ? import.meta.dirname
  : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(__dirname),
  root: path.resolve(__dirname, "client"),
  publicDir: path.resolve(__dirname, "client", "public"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    // ── Code Splitting ────────────────────────────────────────────────────────
    // Splits 1.1MB monolith into cacheable chunks.
    // Most pages are lazy-loaded in App.tsx so only the chunk for the current
    // route is downloaded on first visit.
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — changes rarely, highly cacheable
          "vendor-react": ["react", "react-dom"],
          // tRPC + React Query — changes rarely
          "vendor-trpc": [
            "@trpc/client",
            "@trpc/react-query",
            "@trpc/server",
            "@tanstack/react-query",
          ],
          // Radix UI primitives (only list packages that are actually installed)
          "vendor-radix": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-accordion",
            "@radix-ui/react-label",
            "@radix-ui/react-checkbox",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-avatar",
            "@radix-ui/react-popover",
          ],
          // Stripe.js (heavy, lazy load)
          "vendor-stripe": ["@stripe/stripe-js"],
          // Charts & motion (heavy, only used on specific pages)
          "vendor-motion": ["framer-motion"],
          // Lucide icons (large)
          "vendor-icons": ["lucide-react"],
          // Routing
          "vendor-router": ["wouter"],
          // Misc utilities
          "vendor-utils": ["zod", "clsx", "tailwind-merge", "date-fns"],
        },
      },
    },
    // Raise chunk warning to 600kB to stop false positives after splitting
    chunkSizeWarningLimit: 600,
    // Source maps off in production for smaller output
    sourcemap: false,
    // esbuild minification is the default — fast, strips console + debugger
    minify: "esbuild" as const,
  },
  server: {
    host: true,
    allowedHosts: ["localhost", "127.0.0.1", ".railway.app", ".up.railway.app", ".manus.computer"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
