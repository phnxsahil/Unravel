import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
const capture = process.env.RAVEL_CAPTURE === "1";
const directory = resolve(
  process.env.RAVEL_SCREENSHOT_DIR || "../.local/screenshots/unravel-release",
);
const chapters = [
  "Recognize the action",
  "Follow its connections",
  "Try a scenario",
  "Understand the result",
];
for (const width of [1556, 1280, 1024, 768, 390])
  for (const theme of ["dark", "light"])
    test(`public and app at ${width}px ${theme}`, async ({ page }) => {
      test.setTimeout(120000);
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setViewportSize({ width, height: 1020 });
      const folder = join(directory, `${width}-${theme}`);
      if (capture) await mkdir(folder, { recursive: true });
      const receipts: unknown[] = [];
      for (const route of [
        "/",
        "/docs/quick-start",
        "/docs/experiments",
        "/projects/demo/explore",
        "/projects/demo/experiments",
      ]) {
        await page.goto(route);
        await expect(page.locator("h1")).toBeVisible();
        const toggle = page.getByRole("button", {
          name: /Use (light|dark) theme/,
        });
        await expect(toggle).toBeEnabled();
        if ((await page.locator("html").getAttribute("data-theme")) !== theme)
          await toggle.click();
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await page.evaluate(() => document.fonts.ready);
        const measure = await page.evaluate(() => ({
          width: innerWidth,
          height: innerHeight,
          scrollWidth: document.documentElement.scrollWidth,
          theme: document.documentElement.dataset.theme,
        }));
        expect(measure.width).toBe(width);
        expect(measure.scrollWidth).toBeLessThanOrEqual(width + 1);
        receipts.push({ route, ...measure });
        const audit = await new AxeBuilder({ page })
          .exclude(".footer-watermark") // Requested decorative brand watermark.
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        expect(
          audit.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.map((n) => n.target),
          })),
        ).toEqual([]);
        const name =
          route === "/" ? "landing" : route.slice(1).replaceAll("/", "-");
        if (capture) {
          await page.screenshot({
            path: join(folder, `${name}-full.png`),
            fullPage: true,
            animations: "disabled",
          });
          await page.screenshot({
            path: join(folder, `${name}-viewport.png`),
            animations: "disabled",
          });
        }
        if (route === "/") {
          if (width === 1556) {
            expect((await page.locator(".hero-inner").boundingBox())!.x).toBe(
              186,
            );
            const workspace = (await page
              .locator(".hero-product")
              .boundingBox())!;
            expect(workspace.x).toBe(234);
            expect(workspace.width).toBe(1088);
            expect(
              (await page.locator(".hero-message").boundingBox())!.x +
                (await page.locator(".hero-message").boundingBox())!.width / 2,
            ).toBe(width / 2);
          }
          for (const [index, label] of chapters.entries()) {
            await page.getByRole("tab", { name: label, exact: true }).click();
            await expect(
              page.getByRole("tab", { name: label, exact: true }),
            ).toHaveAttribute("aria-selected", "true");
            if (capture)
              await page.locator(".story-stage").screenshot({
                path: join(folder, `story-${index + 1}.png`),
                animations: "disabled",
              });
          }
          if (capture)
            for (const [section, selector] of Object.entries({
              hero: ".product-hero",
              introduction: ".unravel-intro",
              examples: ".story-extras",
              changes: ".return-section",
              setup: ".setup-section",
              faq: ".unravel-faq",
              closing: ".unravel-closing",
              footer: ".site-footer",
            }))
              await page.locator(selector).screenshot({
                path: join(folder, `landing-${section}.png`),
                animations: "disabled",
              });
        }
        if (capture && route.startsWith("/docs")) {
          const sections = page.locator(".docs-prose h2");
          for (let i = 0; i < (await sections.count()); i++) {
            await sections.nth(i).scrollIntoViewIfNeeded();
            await page.screenshot({
              path: join(folder, `${name}-section-${i + 1}.png`),
              animations: "disabled",
            });
          }
        }
      }
      expect(errors).toEqual([]);
      if (capture)
        await writeFile(
          join(folder, "metadata.json"),
          JSON.stringify(
            {
              generatedAt: new Date().toISOString(),
              viewport: { width, height: 1020 },
              deviceScaleFactor: 1,
              theme,
              receipts,
              notes:
                "Pinned full-page image shows one state. Four separate story-state captures are included.",
            },
            null,
            2,
          ),
        );
    });
test("scroll registers all four chapters forwards and backwards", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1020 });
  await page.goto("/");
  await expect(page.locator(".scroll-story")).not.toHaveClass(/is-reduced/);
  const geometry = await page.locator(".scroll-story").evaluate((el) => ({
    top: el.getBoundingClientRect().top + scrollY,
    range: el.clientHeight - innerHeight,
  }));
  for (const i of [0, 1, 2, 3, 2, 1, 0]) {
    await page.evaluate(
      ({ top, range, i }) =>
        window.scrollTo({
          top: top + range * ((i + 0.35) / 4),
          behavior: "instant",
        }),
      { ...geometry, i },
    );
    await expect(
      page.getByRole("tab", { name: chapters[i], exact: true }),
    ).toHaveAttribute("aria-selected", "true");
  }
});
test("keyboard, sound, short screens and reduced motion", async ({ page }) => {
  await page.goto("/");
  const first = page.getByRole("tab", { name: chapters[0], exact: true });
  await first.focus();
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: chapters[3], exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Home");
  await expect(first).toBeFocused();
  await page.getByRole("button", { name: "Enable sound effects" }).click();
  await expect(
    page.getByRole("button", { name: "Mute sound effects" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".scroll-story")).toHaveClass(/is-reduced/);
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await expect(page.locator(".scroll-story")).toHaveClass(/is-reduced/);
});
test("FAQ controls expose expanded state and keyboard activation", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page
    .locator("summary.faq-trigger")
    .filter({ hasText: "Do I need an AI key?" });
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await page.keyboard.press(" ");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
});
test("OS selection persists, commands copy, navigation works", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/docs/quick-start");
  await page.getByRole("tab", { name: "macOS / Linux", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("tab", { name: "macOS / Linux", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: /Copy/ }).first().click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "python3",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Docs", exact: true }).click();
  await expect(page.locator("h1")).toBeVisible();
});
test("landing and every guide remain readable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const route of [
    "/",
    "/docs",
    "/docs/quick-start",
    "/docs/experiments",
    "/docs/product-tour",
    "/docs/exploring",
    "/docs/explanations",
    "/docs/snapshots",
    "/docs/notebook",
    "/docs/privacy",
    "/docs/architecture",
    "/docs/checks",
    "/docs/troubleshooting",
  ]) {
    await page.goto(
      (process.env.RAVEL_TEST_URL || "http://127.0.0.1:8000") + route,
    );
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.locator("main").innerText()).not.toEqual("");
  }
  await context.close();
});
