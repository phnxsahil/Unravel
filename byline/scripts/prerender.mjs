import { build } from "vite";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const output = resolve("node_modules/.cache/ravel-prerender");
await build({
  build: {
    ssr: "src/ravel/prerender.tsx",
    outDir: output,
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: "prerender.mjs" } },
  },
});
const { pages, render } = await import(
  pathToFileURL(join(output, "prerender.mjs"))
);
const shell = await readFile("dist/index.html", "utf8");
const css = (await readdir("dist/assets")).filter(
  (name) => name.startsWith("Docs-") && name.endsWith(".css"),
);
const font = (await readdir("dist/assets")).find(name => /^geist-latin-wght-normal-.*\.woff2$/.test(name));
for (const page of pages) {
  const document = shell
    .replace(/<title>.*?<\/title>/, `<title>${page.title}</title>`)
    .replace(
      "</head>",
      (page.path.startsWith("/docs") ? css : [])
        .map((name) => `<link rel="stylesheet" href="/assets/${name}" />`)
        .join("\n") + (font ? `<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/${font}" />` : "") + "</head>",
    )
    .replace(
      '<div id="root"></div>',
      `<div id="root" data-prerendered="${page.path}">${render(page.path)}</div>`,
    );
  const target = join("dist", page.path.slice(1), "index.html");
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, document);
}
console.log(
  `Generated ${pages.length} readable public pages from React and Markdown.`,
);
