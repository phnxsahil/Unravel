import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { defineConfig, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  define: {
    __UNRAVEL_VERSION__: JSON.stringify(
      readFileSync(new URL("../pyproject.toml", import.meta.url), "utf8").match(
        /^version\s*=\s*"([^"]+)"/m,
      )?.[1] ?? "development",
    ),
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        photo: fileURLToPath(new URL("./photo.html", import.meta.url)),
        search: fileURLToPath(new URL("./search.html", import.meta.url)),
      },
    },
  },
  server: {
    fs: {
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        fileURLToPath(new URL("../docs/ravel/guides", import.meta.url)),
      ],
    },
    proxy: { "/api": { target: "http://127.0.0.1:8000", changeOrigin: true } },
  },
});
