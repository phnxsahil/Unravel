import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
];
for (const viewport of viewports)
  for (const theme of ["light", "dark"]) {
    test(`complete landing controls ${viewport.width}x${viewport.height} ${theme}`, async ({
      page,
    }) => {
      test.setTimeout(120000);
      await page.setViewportSize(viewport);
      await page.addInitScript(() => {
        const values: number[] = [];
        (window as Window & { landingShifts?: number[] }).landingShifts =
          values;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const shift = entry as PerformanceEntry & {
              hadRecentInput: boolean;
              value: number;
            };
            if (!shift.hadRecentInput) values.push(shift.value);
          }
        }).observe({ type: "layout-shift", buffered: true });
      });
      await page.addInitScript(
        (theme) => localStorage.setItem("ravel-theme-paper-v1", theme),
        theme,
      );
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await page.evaluate(() => document.fonts.ready);
      const initialLayoutShift = await page.evaluate(
        () =>
          (
            window as Window & { landingShifts?: number[] }
          ).landingShifts?.reduce((sum, value) => sum + value, 0) || 0,
      );
      expect(initialLayoutShift).toBeLessThan(0.1);
      await expect(
        page.getByRole("heading", { name: "Start with what you recognize.", exact: true }),
      ).toHaveCount(1);
      expect(await page.locator(".change-specimen ol").evaluate((e) => getComputedStyle(e).listStyleType)).toBe("none");
      const brandEdges = await page.evaluate(() => ({
        header: document.querySelector(".site-header .wordmark")!.getBoundingClientRect().left,
        footer: document.querySelector(".footer-intro .wordmark")!.getBoundingClientRect().left,
        tagline: document.querySelector(".footer-intro p")!.getBoundingClientRect().left,
        rail: document.querySelector(".site-footer-inner")!.getBoundingClientRect().left,
      }));
      expect(Math.abs(brandEdges.header - brandEdges.footer)).toBeLessThanOrEqual(1);
      expect(brandEdges.tagline - brandEdges.rail).toBeGreaterThanOrEqual(16);
      await page.keyboard.press("Tab");
      await expect(
        page.getByRole("link", { name: "Skip to content" }),
      ).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.locator("#main-content")).toBeFocused();
      const states: unknown[] = [];
      // Stable controls are audited individually. The changing walkthrough is exercised below.
      for (const control of await page
        .locator(
          ".site-header a,.site-header button,.hero-product a,.hero-product button,.hero-product summary,.hero-product pre,.product-hero-actions a,.example-expand summary,.setup-section a,.faq-trigger,.unravel-closing a,.site-footer a,.site-footer button",
        )
        .all()) {
        if (!(await control.isVisible())) continue;
        await control.scrollIntoViewIfNeeded();
        const normal = await control.evaluate((e) => {
          const s = getComputedStyle(e), r = e.getBoundingClientRect();
          return {
            text: e.textContent?.trim(),
            role: e.getAttribute("role"),
            width: r.width,
            height: r.height,
            color: s.color,
            background: s.backgroundColor,
            border: s.borderColor,
            transform: s.transform,
          };
        });
        expect(normal.width, normal.text || "Icon control width").toBeGreaterThanOrEqual(44);
        expect(normal.height, normal.text || "Icon control height").toBeGreaterThanOrEqual(44);
        await control.hover();
        await page.waitForTimeout(180);
        const hover = await control.evaluate((e) => {
          const s = getComputedStyle(e);
          return {
            color: s.color,
            background: s.backgroundColor,
            border: s.borderColor,
            transform: s.transform,
          };
        });
        await control.focus();
        const focused = await control.evaluate((e) => {
          const s = getComputedStyle(e),
            r = e.getBoundingClientRect();
          return {
            style: s.outlineStyle,
            width: parseFloat(s.outlineWidth),
            color: s.outlineColor,
            active: document.activeElement === e,
            top: r.top,
            bottom: r.bottom,
          };
        });
        expect(focused.active).toBeTruthy();
        expect(
          focused.width,
          normal.text || normal.role || "control",
        ).toBeGreaterThanOrEqual(2);
        expect(focused.style).not.toBe("none");
        states.push({ normal, hover, focused });
      }
      for (let i = 0; i < 4; i++) {
        await page.locator(`#story-tab-${i}`).click();
        await expect(page.locator(`#story-tab-${i}`)).toHaveAttribute(
          "aria-selected",
          "true",
        );
        await expect(page.locator("#story-panel")).toHaveAttribute(
          "aria-labelledby",
          `story-tab-${i}`,
        );
        const bounds = await page.locator(".story-scene").evaluate((e) => {
          const frame = e.getBoundingClientRect(),
            content = e
              .querySelector(".story-evidence")!
              .getBoundingClientRect();
          return { bottom: content.bottom, frameBottom: frame.bottom };
        });
        expect(bounds.bottom).toBeLessThanOrEqual(bounds.frameBottom + 1);
      }
      await page.locator(".hero-product .photo-thread button").first().click();
      const source = page.locator(".hero-product pre");
      await source.focus();
      await page.keyboard.press("ArrowRight");
      await expect
        .poll(() => source.evaluate((e) => e.scrollLeft))
        .toBeGreaterThan(0);
      const faq = page.locator(".faq-trigger").first();
      await faq.focus();
      await page.keyboard.press("Enter");
      await expect(faq).toHaveAttribute("aria-expanded", "false");
      await page.keyboard.press(" ");
      await expect(faq).toHaveAttribute("aria-expanded", "true");
      const button = page.getByRole("button", { name: /Back to top/ });
      await button.focus();
      await page.keyboard.press("Enter");
      await expect(page.locator(".site-header .wordmark")).toBeFocused();
      await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);
      if (viewport.width > 800) {
        await page
          .getByRole("navigation", { name: "Main navigation" })
          .getByRole("link", { name: "Product", exact: true })
          .click();
        await expect
          .poll(() =>
            page
              .locator("#how-it-works")
              .evaluate((e) => Math.round(e.getBoundingClientRect().top)),
          )
          .toBe(81);
      }
      const footer = await page.locator(".footer-watermark").evaluate((e) => {
        const r = e.getBoundingClientRect(),
          bar = e.previousElementSibling!.getBoundingClientRect(),
          s = getComputedStyle(e);
        return {
          top: r.top,
          barBottom: bar.bottom,
          ariaHidden: e.getAttribute("aria-hidden"),
          pointer: s.pointerEvents,
          select: s.userSelect,
          width: r.width,
          spanSize: getComputedStyle(e.querySelector("span")!).fontSize,
        };
      });
      expect(footer.top).toBeGreaterThanOrEqual(footer.barBottom);
      expect(footer.ariaHidden).toBe("true");
      expect(footer.pointer).toBe("none");
      expect(footer.select).toBe("none");
      expect(footer.width).toBeLessThanOrEqual(viewport.width);
      const directory = resolve("../audit/interaction-checks");
      await mkdir(directory, { recursive: true });
      await writeFile(
        resolve(
          directory,
          `${viewport.width}x${viewport.height}-${theme}.json`,
        ),
        JSON.stringify(
          { viewport, theme, initialLayoutShift, states, footer },
          null,
          2,
        ),
      );
    });
  }
