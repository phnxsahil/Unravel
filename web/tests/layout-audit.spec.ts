import { test, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

test("text containment and shared section alignment", async ({ page }) => {
  test.setTimeout(120000);
  const findings: unknown[] = [];
  for (const width of [320, 360, 390, 600, 768, 820, 1024, 1280, 1556]) {
    await page.setViewportSize({ width, height: 1020 });
    for (const route of ["/", "/docs/quick-start", "/projects/demo/explore"]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const result = await page.evaluate(() => {
        const overflow = [
          ...document.querySelectorAll<HTMLElement>(
            "h1,h2,h3,p,button,summary,.micro-label,.story-file,.story-source-reference,.panel-heading,.photo-topline",
          ),
        ]
          .filter(
            (e) =>
              e.getClientRects().length &&
              e.clientWidth > 0 &&
              !e.closest("pre,code,[aria-hidden=true]") &&
              getComputedStyle(e).overflowX === "visible" &&
              e.scrollWidth > e.clientWidth + 2,
          )
          .map((e) => ({
            selector: e.tagName.toLowerCase() + "." + e.className,
            text: e.textContent?.trim().slice(0, 100),
            width: e.clientWidth,
            contentWidth: e.scrollWidth,
          }));
        const sections = [
          ...document.querySelectorAll<HTMLElement>(
            ".unravel-intro,.return-section,.setup-section,.unravel-faq,.site-footer-inner",
          ),
        ].map((e) => {
          const r = e.getBoundingClientRect();
          const child = (
            e.classList.contains("site-footer-inner")
              ? e.querySelector(".footer-top nav")
              : e.lastElementChild
          )?.getBoundingClientRect();
          return {
            class: e.className,
            left: r.left,
            width: r.width,
            rightColumn: child?.left,
          };
        });
        return {
          overflow,
          sections,
          pageWidth: document.documentElement.scrollWidth,
          viewport: innerWidth,
        };
      });
      findings.push({ width, route, ...result });
      expect(result.overflow, `${width}px ${route}: uncontained text`).toEqual(
        [],
      );
      expect(result.pageWidth).toBeLessThanOrEqual(width + 1);
      if (route === "/") {
        // A wide container can fit the viewport while its children still hug the rails.
        for (const selector of [".story-pin", ".story-extras"]) {
          const inset = await page.locator(selector).evaluate((e) => {
            const style = getComputedStyle(e);
            return {
              left: parseFloat(style.paddingLeft),
              right: parseFloat(style.paddingRight),
            };
          });
          expect(
            inset.left,
            selector + " reading inset",
          ).toBeGreaterThanOrEqual(16);
          expect(inset.right).toBe(inset.left);
        }
        const reference = result.sections[0];
        for (const section of result.sections) {
          expect(
            Math.abs(section.left - reference.left),
            section.class,
          ).toBeLessThanOrEqual(1);
          expect(
            Math.abs(section.width - reference.width),
            section.class,
          ).toBeLessThanOrEqual(1);
          if (width > 800)
            expect(
              Math.abs(section.rightColumn! - width / 2),
              section.class,
            ).toBeLessThanOrEqual(1);
        }
      }
    }
  }
  const directory = resolve("../.local/audit/grid-polish");
  await mkdir(directory, { recursive: true });
  await writeFile(
    resolve(directory, "geometry.json"),
    JSON.stringify(findings, null, 2),
  );
});

test("long labels stay contained and subtle motion respects preferences", async ({
  page,
}) => {
  for (const width of [390, 768, 1556]) {
    await page.setViewportSize({ width, height: 1020 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => {
      document.querySelector(".photo-evidence > span")!.textContent =
        "web/features/account/profile/VeryLongProfilePhotoUploadComponentWithoutShortcuts.tsx";
      document.querySelector(".photo-preview h2")!.textContent =
        "UploadAPhotoWithAnUnusuallyLongUnbrokenActionName";
    });
    for (const selector of [".photo-evidence > span", ".photo-preview h2"])
      expect(
        await page
          .locator(selector)
          .evaluateAll((elements) =>
            elements.every((e) => e.scrollWidth <= e.clientWidth + 2),
          ),
      ).toBeTruthy();
  }
  await page.setViewportSize({ width: 1280, height: 1020 });
  await page.goto("/");
  const action = page.locator(".product-hero-actions .primary");
  await action.hover();
  await expect
    .poll(() =>
      action.locator("svg").evaluate((e) => getComputedStyle(e).transform),
    )
    .not.toBe("none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  expect(
    await page
      .locator(".hero-message h1")
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe("none");
  expect(
    await page
      .locator(".photo-evidence")
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe("none");
  await page.locator(".product-hero-actions .primary").hover();
  expect(
    await page
      .locator(".product-hero-actions .primary svg")
      .evaluate((e) => getComputedStyle(e).transform),
  ).toBe("none");
});

test("mobile navigation and demo controls remain usable on narrow and short screens", async ({
  page,
}) => {
  for (const size of [
    { width: 320, height: 740 },
    { width: 600, height: 900 },
    { width: 768, height: 900 },
    { width: 390, height: 320 },
  ]) {
    await page.setViewportSize(size);
    await page.goto("/");
    const menu = page.getByRole("button", {
      name: "Open navigation",
      exact: true,
    });
    await menu.click();
    const nav = page.getByRole("navigation", { name: "Main navigation" });
    await expect(nav).toBeVisible();
    const frame = await nav.boundingBox();
    expect(frame!.x).toBeGreaterThanOrEqual(0);
    expect(frame!.x + frame!.width).toBeLessThanOrEqual(size.width + 1);
    expect(frame!.y + frame!.height).toBeLessThanOrEqual(size.height);
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
    await expect(nav).toBeHidden();
    for (const selector of [
      ".hero-product .photo-scenario button",
      ".hero-product .photo-thread button",
      ".product-hero-actions .button",
    ]) {
      expect(
        await page
          .locator(selector)
          .evaluateAll((elements) =>
            elements.every(
              (e) =>
                e.getBoundingClientRect().height >= 44 &&
                e.scrollWidth <= e.clientWidth + 2,
            ),
          ),
      ).toBeTruthy();
    }
    await page
      .locator(".hero-product")
      .getByRole("tab", { name: "Failed request", exact: true })
      .click();
    await page
      .locator(".hero-product")
      .getByRole("button", { name: "Try Search", exact: true })
      .click();
    await expect(page.locator(".hero-product [role=status]")).toHaveText(
      "Simulated: 503 · Search unavailable",
    );
  }
});

test("docs rails and footer stay complete across themes and breakpoints", async ({
  page,
}) => {
  for (const width of [1280, 1024, 390]) {
    for (const theme of ["dark", "light"]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/docs/troubleshooting");
      const toggle = page.getByRole("button", {
        name: /Use (light|dark) theme/,
      });
      if ((await page.locator("html").getAttribute("data-theme")) !== theme)
        await toggle.click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      const rails = await page
        .locator(".docs-navigation, .docs-contents")
        .evaluateAll((elements) =>
          elements.map((element) => {
            const style = getComputedStyle(element);
            return {
              position: style.position,
              maxHeight: style.maxHeight,
              overflowY: style.overflowY,
            };
          }),
        );
      if (width > 1200) {
        expect(rails).toHaveLength(2);
        for (const rail of rails) {
          expect(rail.position).toBe("sticky");
          expect(rail.maxHeight).toBe("703px");
          expect(rail.overflowY).toBe("auto");
        }
      }
      const footer = await page.locator("footer").evaluate((element) => ({
        borderTop: getComputedStyle(element).borderTopColor,
        columns: getComputedStyle(element.querySelector("nav")!)
          .gridTemplateColumns,
      }));
      expect(footer.borderTop).not.toBe("rgb(49, 84, 220)");
      await expect(
        page.getByText("© 2026 Unravel", { exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Back to top/ }),
      ).toBeVisible();
    }
  }
});

test("landing hero keeps the demo visible and uses consistent CTA language", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const theme of ["dark", "light"]) {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: /Use (light|dark) theme/ });
    if ((await page.locator("html").getAttribute("data-theme")) !== theme)
      await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    expect(
      await page.locator("h1").evaluate((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return [...range.getClientRects()].filter((rect) => rect.width > 1)
          .length;
      }),
    ).toBe(2);
    const tabs = page.locator(".hero-product .photo-scenario");
    const tabBox = await tabs.boundingBox();
    expect(tabBox?.y).toBeLessThan(900);
    await expect(
      page.getByRole("link", { name: /Explore the demo/ }).first(),
    ).toHaveClass(/primary/);
    await expect(
      page.getByRole("link", { name: /Connect a project/ }).first(),
    ).toHaveClass(/secondary/);
    const header = await page.locator(".site-header").evaluate((element) => {
      const style = getComputedStyle(element);
      return { shadow: style.boxShadow, border: style.borderBottomStyle };
    });
    expect(header.shadow).toBe("none");
    expect(header.border).toBe("solid");
  }
});
