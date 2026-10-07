import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { resolve } from "node:path";

test("real Search proposes its own controls and preserves the selected feature", async ({ page, request }) => {
  test.setTimeout(60000);
  const fixture = process.env.RAVEL_FIXTURE_PATH, reference = process.env.RAVEL_REFERENCE_URL;
  test.skip(!fixture || !reference, "Run isolated browser verification.");
  const response = await request.post("/api/projects", { headers: { "X-Ravel-Client": "workshop" }, data: { root: resolve(fixture!, "../search-flow") } });
  expect(response.ok()).toBeTruthy(); const project = await response.json();
  await page.goto(`/projects/${project.id}/explore`);
  await expect(page.getByRole("button", { name: /Search Search.tsx/ })).toBeVisible({ timeout: 15000 });
  await page.getByRole("button", { name: /Search Search.tsx/ }).click();
  await expect(page.locator(".feature-map")).toContainText("GET /api/search");
  await page.getByRole("button", { name: "Follow this feature", exact: true }).click();
  await expect(page.getByRole("button", { name: "Following this feature" })).toBeDisabled();
  await page.getByRole("link", { name: "Experiments", exact: true }).click();
  await expect(page.getByLabel("Local app URL")).toHaveValue("");
  await page.getByLabel("Local app URL").fill(`${reference}/search.html`);
  await expect(page.getByLabel("Target request path")).toHaveValue("/api/search");
  await expect(page.getByLabel("Accessible name / expected text").first()).toHaveValue("Search query");
  await expect(page.getByLabel("Accessible name / expected text").nth(1)).toHaveValue("Search");
  await page.getByRole("combobox", { name: "Scenario", exact: true }).selectOption("ordinary");
  await page.getByRole("button", { name: "Add step", exact: true }).click();
  await page.getByRole("combobox", { name: "Action", exact: true }).last().selectOption("assert");
  await page.getByLabel("Accessible name / expected text").last().fill("Results loaded");
  await page.getByRole("button", { name: "Save experiment recipe" }).click();
  await page.getByLabel(/I approve the recipe/).check(); await page.getByLabel(/I am using disposable/).check();
  await page.getByRole("button", { name: "Run this experiment" }).click();
  await expect(page.locator(".run-result h3")).toHaveText("expectation met", { timeout: 20000 });
  await page.reload(); await expect(page.locator(".run-result h3")).toHaveText("expectation met");
  await page.getByRole("link", { name: "Explore", exact: true }).click();
  await expect(page.getByRole("button", { name: "Following this feature" })).toBeDisabled();
});

test("Search demo completes through source, experiment, comparison and export", async ({
  page,
}) => {
  await page.goto("/projects/demo");
  await page
    .getByRole("tab", { name: "200 OK, broken UI", exact: true })
    .click();
  await page.getByRole("button", { name: "Try Search", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "200 OK · Search unavailable",
  );
  await page.getByRole("link", { name: "Explore", exact: true }).click();
  await expect(page.locator(".source-inspector")).toContainText("data.results");
  await page.getByRole("link", { name: "Experiments", exact: true }).click();
  await expect(
    page.getByRole("tab", { name: "200 OK, broken UI", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("button", { name: "Run prepared scenario" }).click();
  await page
    .getByRole("link", { name: "Compare the response contract" })
    .click();
  await expect(page.locator(".change-entry")).toContainText('"items"');
  await page.getByRole("link", { name: "Notebook", exact: true }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Export sample walkthrough" }).click();
  expect((await download).suggestedFilename()).toBe(
    "unravel-search-walkthrough.md",
  );
});

for (const theme of ["light", "dark"])
  for (const width of [1440, 1024, 390]) {
    test(`Search presentation remains usable ${width} ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.addInitScript(
        (theme) => localStorage.setItem("ravel-theme-paper-v1", theme),
        theme,
      );
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBeTruthy();
      const hero = page.locator(".hero-product");
      await hero
        .getByRole("tab", { name: "200 OK, broken UI", exact: true })
        .click();
      await hero
        .getByRole("button", { name: "Try Search", exact: true })
        .click();
      await expect(hero.getByRole("status")).toContainText(
        "200 OK · Search unavailable",
      );
      await hero
        .getByRole("button", { name: "API returns results or items" })
        .click();
      await expect(hero.locator("pre")).toContainText("items");
      const audit = await new AxeBuilder({ page })
        .exclude(".footer-watermark")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        audit.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
