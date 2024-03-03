import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./public/manifest.json";

const root = resolve(__dirname, "src");
const assetsDir = resolve(root, "assets");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      "@src": root,
      "@assets": assetsDir,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: "inline",
    },
  },
});
