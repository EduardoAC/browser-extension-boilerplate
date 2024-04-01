import { defineConfig } from "vitest/config"
import { resolve } from "path"
import react from "@vitejs/plugin-react"
import { crx } from "@crxjs/vite-plugin"
import css from "rollup-plugin-css-only"
import manifest from "./public/manifest.json"

const root = resolve(__dirname, "src")
const assetsDir = resolve(root, "assets")

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), crx({ manifest }), css({ output: "bundle.css" })],
    resolve: {
        alias: {
            "@src": root,
            "@assets": assetsDir,
        },
    },
    test: {
        // some paths to the files that are test files
        include: ["./**/*.test.ts", "./**/*.test.tsx"],
        globals: true,
        environment: "jsdom",
        setupFiles: ["./setupTests.ts"],
    },
    optimizeDeps: {
        esbuildOptions: {
            sourcemap: "inline",
        },
    },
})
