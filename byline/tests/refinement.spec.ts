import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("public typography and responsive layouts stay readable in both themes", async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const width of [390, 768, 1024, 1280, 1440])
    for (const theme of ["light", "dark"]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      for (const route of ["/", "/docs", "/docs/troubleshooting"]) {
        await page.goto(route);
        const toggle = page.getByRole("button", {
          name: /Use (light|dark) theme/,
        });
        await expect(toggle).toBeEnabled();
        if ((await page.locator("html").getAttribute("data-theme")) !== theme)
          await toggle.click();
        await page.evaluate(() => document.fonts.ready);
        const small = await page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>("main *, footer *")]
            .filter(
              (e) =>
                e.checkVisibility() &&
                [...e.childNodes].some(
                  (n) => n.nodeType === 3 && n.textContent?.trim(),
                ) &&
                parseFloat(getComputedStyle(e).fontSize) < 13,
            )
            .map((e) => ({
              cls: e.className,
              text: e.textContent?.slice(0, 60),
              size: getComputedStyle(e).fontSize,
            })),
        );
        expect(small, `${route} ${width} ${theme}`).toEqual([]);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
        ).toBeLessThanOrEqual(width + 1);
        if (route === "/docs/troubleshooting" && width >= 1280) {
          const bounds = await page
            .locator(".docs-navigation")
            .evaluate((rail) => {
              const item = rail
                .querySelector('a[aria-current="page"]')!
                .getBoundingClientRect();
              const frame = rail.getBoundingClientRect();
              return {
                top: item.top,
                bottom: item.bottom,
                railTop: frame.top,
                railBottom: frame.bottom,
              };
            });
          expect(bounds.top).toBeGreaterThanOrEqual(bounds.railTop);
          expect(bounds.bottom).toBeLessThanOrEqual(bounds.railBottom - 20);
        }
        if (route === "/docs" && width === 1024) {
          const nav = await page.locator(".docs-navigation").boundingBox();
          const article = await page.locator(".docs-article").boundingBox();
          expect(article!.y).toBeGreaterThanOrEqual(nav!.y + nav!.height);
          expect(article!.width).toBeGreaterThanOrEqual(700);
        }
        if (route === "/" && width === 390) {
          const finding = await page
            .locator(".hero-product .photo-takeaway")
            .boundingBox();
          expect(finding!.y + finding!.height).toBeLessThan(844);
          const watermark = await page
            .locator(".footer-watermark")
            .boundingBox();
          const bar = await page.locator(".footer-bottom").boundingBox();
          expect(watermark!.y).toBeGreaterThanOrEqual(bar!.y + bar!.height);
        }
      }
    }
});

test("hero scenarios, source path and change question connect to evidence", async ({
  page,
}) => {
  await page.goto("/");
  const hero = page.locator(".hero-product");
  const failure = hero.getByRole("tab", {
    name: "Failed request",
    exact: true,
  });
  await failure.click();
  await hero.getByRole("button", { name: "Try Search", exact: true }).click();
  await expect(hero.locator("[role=status]")).toHaveText(
    "Simulated: 503 · Search unavailable",
  );
  const panel = await failure.getAttribute("aria-controls");
  await expect(page.locator(`[id="${panel}"]`)).toHaveAttribute(
    "role",
    "tabpanel",
  );
  await failure.focus();
  await page.keyboard.press("Home");
  await expect(
    hero.getByRole("tab", { name: "Before the change", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("End");
  await expect(failure).toBeFocused();
  await hero
    .getByRole("button", { name: "API returns results or items" })
    .click();
  await expect(hero.locator("pre")).toContainText("items");
  const audit = await new AxeBuilder({ page })
    .exclude(".footer-watermark") // Decorative brand treatment, intentionally faint.
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
});

test("FAQ answers remain available without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: process.env.RAVEL_TEST_URL || "http://127.0.0.1:8000" });
  const page = await context.newPage();
  await page.goto("/");
  for (const item of await page.locator(".faq-item").all()) {
    if ((await item.getAttribute("open")) === null)
      await item.locator("summary").click();
    await expect(item.locator(".faq-panel")).toBeVisible();
  }
  await context.close();
});

test("all walkthrough scenes fit and source lines stay intact", async ({
  page,
}) => {
  test.setTimeout(90000);
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1280, height: 800 },
    { width: 1024, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    for (let index = 0; index < 4; index++) {
      await page.locator(`#story-tab-${index}`).click();
      await expect(page.locator(`#story-tab-${index}`)).toHaveAttribute(
        "aria-selected",
        "true",
      );
      const fit = await page.locator(".story-scene").evaluate((scene) => {
        const frame = scene.getBoundingClientRect();
        const narration = scene
          .querySelector(".story-narration")!
          .getBoundingClientRect();
        return { bottom: narration.bottom, frameBottom: frame.bottom };
      });
      expect(
        fit.bottom,
        `${viewport.width} scene ${index}`,
      ).toBeLessThanOrEqual(fit.frameBottom + 1);
      const whitespace = await page
        .locator(".story-scene .excerpt-line > span:last-child")
        .first()
        .evaluate((e) => getComputedStyle(e).whiteSpace);
      expect(whitespace).toBe("pre");
    }
  }
  expect(consoleErrors).toEqual([]);
});
