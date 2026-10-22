import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";
import { defineConfig, loadEnv, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const envDirectory = fileURLToPath(new URL("..", import.meta.url));
  const siteUrl = (
    loadEnv(mode, envDirectory, "VITE_").VITE_SITE_URL ||
    "https://your-unravel-domain.vercel.app"
  ).replace(/\/+$/, "");

  return {
    envDir: envDirectory,
    define: {
      "import.meta.env.VITE_SITE_URL": JSON.stringify(siteUrl),
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
          fileURLToPath(new URL("../docs/unravel/guides", import.meta.url)),
        ],
      },
      proxy: { "/api": { target: "http://127.0.0.1:8000", changeOrigin: true } },
    },
  };
});
