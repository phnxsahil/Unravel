import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const headers = { "X-Ravel-Client": "workshop" };
test("search demonstration, source map and honest missing AI state", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Understand the app you built.",
      exact: true,
    }),
  ).toBeVisible();
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
  await page
    .getByRole("link", { name: "Explore the demo", exact: true })
    .first()
    .click();
  await page.getByRole("link", { name: "Explore", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "How it connects" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /2 GET/ }).click();
  await expect(page.locator(".source-inspector")).toContainText(
    "examples/search-flow/api.py",
  );
  await page.getByRole("button", { name: "What happens if it fails?" }).click();
  await expect(page.locator(".rule-suggestion")).toContainText("rule based");
  await expect(page.locator(".understand-panel")).toContainText(
    "does not call an AI provider",
  );
});
test("legacy demo explanations, notebook, export and reload remain compatible", async ({
  page,
}) => {
  await page.goto("/projects/demo/legacy");
  await page
    .getByRole("button", { name: /Where does a saved draft go/ })
    .click();
  await page
    .getByRole("button", { name: "What happens if saving fails?" })
    .click();
  await page.getByRole("button", { name: "Open prepared explanation" }).click();
  await expect(page.locator(".answer-summary")).toContainText("React state");
  await page.getByRole("tab", { name: "Your notebook" }).click();
  await page
    .getByLabel("What did you discover?")
    .fill("State and storage differ");
  await page
    .getByLabel("The idea, in your own words")
    .fill(
      "Source explains a relationship; only a configured run establishes an observation.",
    );
  await page
    .getByRole("button", { name: "Save discovery", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "State and storage differ" }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Markdown", exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/\.md$/);
});
test("real project connects, explores, stores notes, compares and exports", async ({
  page,
  request,
}) => {
  const root = process.env.RAVEL_FIXTURE_PATH;
  test.skip(!root, "Run the isolated browser verification.");
  await page.goto("/projects");
  await page
    .getByRole("button", { name: "Connect a project", exact: true })
    .click();
  await page.getByLabel("Project folder").fill(root!);
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await page.getByRole("button", { name: /request-flow/ }).click();
  await expect(page.locator(".feature-map")).toBeVisible({ timeout: 15000 });
  await expect(page.locator(".understand-panel")).toContainText(
    "No AI key connected",
  );
  await page.getByRole("link", { name: "Notebook", exact: true }).click();
  await page
    .getByLabel(/A discovery about/)
    .fill(
      "The route delegates to save_draft. No database persistence is established.",
    );
  await page
    .getByRole("button", { name: "Save a discovery", exact: true })
    .click();
  await expect(page.locator(".change-entry")).toContainText(
    "No database persistence",
  );
  await page.reload();
  await expect(page.locator(".change-entry")).toContainText(
    "No database persistence",
  );
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Export project walkthrough" }).click();
  expect((await download).suggestedFilename()).toBe("unravel-walkthrough.md");
  await page.getByRole("button", { name: "Check for changes" }).click();
  await expect(page.locator(".job-progress")).toContainText("Finished", {
    timeout: 15000,
  });
  await page.getByRole("link", { name: "Changes", exact: true }).click();
  await expect(
    page.getByText(
      "Capture another version to compare. Your first snapshot is preserved.",
    ),
  ).toBeVisible();
  const projects = await (await request.get("/api/projects")).json();
  const p = projects.find((p: any) => p.root === root);
  const invs = await (
    await request.get(`/api/projects/${p.id}/investigations`)
  ).json();
  await page.goto(`/projects/${p.id}/explore/${invs[0].id}`);
  await page.getByRole("tab", { name: "Compare & check" }).click();
  await page.getByRole("button", { name: "I trust this project" }).click();
  await page
    .getByLabel("Check profile")
    .selectOption({ label: ". · npm run test" });
  await page.getByRole("button", { name: "Run check" }).click();
  await expect(page.locator(".check-result .pill")).toHaveText("passed", {
    timeout: 15000,
  });
});
test("invalid folders and partial support offer recovery", async ({ page }) => {
  const root = process.env.RAVEL_UNSUPPORTED_PATH;
  test.skip(!root, "Run the isolated browser verification.");
  await page.goto("/projects");
  await page
    .getByRole("button", { name: "Connect a project", exact: true })
    .click();
  await page
    .getByText("How do I copy my folder path?", { exact: true })
    .click();
  await expect(page.locator(".folder-path-help")).toContainText("Windows:");
  await page.getByLabel("Project folder").fill(root! + "/missing");
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("could not be found");
  await page.getByLabel("Project folder").fill(root!);
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await page.getByRole("button", { name: /unsupported-source/ }).click();
  await expect(page.locator(".capture-details")).toBeVisible({
    timeout: 15000,
  });
  await page.locator(".capture-details summary").click();
  await expect(page.locator(".capture-details")).toContainText(
    "partial static map",
  );
});
test("experiment editor requires explicit approvals and exposes prerequisites", async ({
  page,
  request,
}) => {
  const root = process.env.RAVEL_FIXTURE_PATH;
  test.skip(!root, "Run the isolated browser verification.");
  const projects = await (await request.get("/api/projects")).json();
  const p = projects.find((p: any) => p.root === root);
  await page.goto(`/projects/${p.id}/experiments`);
  await expect(
    page.getByText(/A fresh browser isolates browser state/),
  ).toBeVisible();
  await page.getByLabel("Local app URL").fill("https://example.com");
  await expect(page.getByText("No supported named controls were found. Add the action steps yourself.")).toBeVisible();
  await page.getByLabel("Target request path").fill("/api/search");
  await page.getByRole("button", { name: "Add step", exact: true }).click();
  await page.getByRole("combobox", { name: "Action", exact: true }).selectOption("assert");
  await page
    .getByLabel("Accessible name / expected text")
    .fill("Search unavailable");
  await page.getByLabel("Local app URL").fill("https://example.com");
  await page.getByRole("button", { name: "Save experiment recipe" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByLabel("Local app URL").fill("http://127.0.0.1:8017");
  await page.getByRole("button", { name: "Save experiment recipe" }).click();
  await expect(page.locator(".saved-recipe")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Run this experiment" }),
  ).toBeDisabled();
  await page.getByLabel(/I approve the recipe/).check();
  await expect(
    page.getByRole("button", { name: "Run this experiment" }),
  ).toBeDisabled();
  await page.getByLabel(/I am using disposable/).check();
  await expect(page.locator(".saved-recipe")).toContainText(
    "Search unavailable",
  );
  await expect(page.locator(".saved-recipe")).toContainText("/api/search");
});
for (const size of [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
])
  test(`compact walkthrough fits ${size.width}x${size.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(size);
    await page.goto("/#features");
    await expect(page.locator(".scroll-story")).not.toHaveClass(/is-reduced/);
    for (let i = 0; i < 4; i++) {
      await page.locator(`#story-tab-${i}`).click();
      await expect(page.locator(".story-stage")).toBeInViewport({ ratio: 1 });
      expect(
        await page
          .locator(".story-scene")
          .evaluate((el) => el.scrollHeight <= el.clientHeight + 1),
      ).toBeTruthy();
    }
    expect(
      await page
        .locator(".site-header .ravel-mark")
        .evaluate((el) => el.getBoundingClientRect().width),
    ).toBe(22);
  });

test("complete real photo journey through the product interface", async ({
  page,
  request,
}) => {
  test.setTimeout(90000);
  const root = process.env.RAVEL_PHOTO_PATH;
  const url = process.env.RAVEL_REFERENCE_URL;
  test.skip(
    !root || !url,
    "Run isolated verification with the disposable reference app.",
  );
  await page.goto("/projects");
  await page
    .getByRole("button", { name: "Connect a project", exact: true })
    .click();
  await page.getByLabel("Project folder").fill(root!);
  await page.getByRole("button", { name: "Explore", exact: true }).click();
  await page.getByRole("button", { name: /profile-photo/ }).click();
  await expect(
    page.getByRole("button", { name: /Upload photo web/ }),
  ).toBeVisible({ timeout: 15000 });
  await page.getByRole("link", { name: "Explore", exact: true }).click();
  await page.getByRole("button", { name: /3 POST/ }).click();
  await expect(page.locator(".source-inspector")).toContainText(
    "api/routes.py",
  );
  await page.getByRole("link", { name: "Experiments", exact: true }).click();
  await page.getByLabel("Local app URL").fill(url!);
  await expect(page.getByLabel("Target request path")).toHaveValue(
    "/api/photo",
  );
  await page.getByRole("button", { name: "Add step", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Action", exact: true })
    .last()
    .selectOption("assert");
  await page
    .getByLabel("Accessible name / expected text")
    .last()
    .fill("Upload failed. Try again.");
  await page.getByRole("button", { name: "Save experiment recipe" }).click();
  await page.getByLabel(/I approve the recipe/).check();
  await page.getByLabel(/I am using disposable/).check();
  await page.getByRole("button", { name: "Run this experiment" }).click();
  await expect(page.locator(".run-result h3")).toHaveText("expectation met", {
    timeout: 25000,
  });
  await expect(page.locator(".run-result img")).toBeVisible();
  await page.reload();
  await expect(page.locator(".run-result h3")).toHaveText("expectation met");
  await page.locator(".run-result summary").click();
  await expect(page.locator(".run-result")).toContainText("503");
  await expect(page.locator(".run-result")).toContainText(
    "Observed in this run",
  );
  await page.getByRole("button", { name: "Delete local screenshots" }).click();
  await expect(page.locator(".run-result img")).toHaveCount(0);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    audit.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
});
