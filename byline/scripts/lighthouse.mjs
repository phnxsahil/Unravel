// Repeatable mobile audits against the production build served by the local app.
import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";
import { mkdir, writeFile } from "node:fs/promises";

const origin = process.env.RAVEL_TEST_URL || "http://127.0.0.1:8000";
const port = 9223;
const browser = await chromium.launch({
  executablePath:
    process.env.RAVEL_CHROME ||
    (process.platform === "win32"
      ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
      : undefined),
  headless: true,
  args: [`--remote-debugging-port=${port}`],
});
const output = new URL(process.env.RAVEL_AUDIT_DIR || "../../.local/lighthouse/design-revision/", import.meta.url);
await mkdir(output, { recursive: true });
try {
  const targets =
    process.argv[2] === "landing"
      ? [["landing", "/"]]
      : process.argv[2] === "demo"
      ? [["demo", "/projects/demo"]]
      : process.argv[2] === "docs"
        ? [["quick-start", "/docs/quick-start"]]
      : [
          ["landing", "/"],
          ["demo", "/projects/demo"],
          ["quick-start", "/docs/quick-start"],
        ];
  for (const [name, path] of targets) {
    for (let i = 1; i <= 3; i++) {
      const result = await lighthouse(origin + path, {
        port,
        logLevel: "error",
        output: "json",
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
      });
      await writeFile(new URL(`${name}-${i}.json`, output), result.report);
      console.log(
        name,
        i,
        Object.fromEntries(
          Object.entries(result.lhr.categories).map(([key, category]) => [
            key,
            Math.round(category.score * 100),
          ]),
        ),
      );
    }
  }
} finally {
  await browser.close();
}
