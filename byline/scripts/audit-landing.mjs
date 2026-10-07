import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve("../audit", process.argv[2] || "before");
const origin = process.env.RAVEL_TEST_URL || "http://127.0.0.1:5173";
const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
];
const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.RAVEL_CHROME ||
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
await mkdir(output, { recursive: true });
const reports = [];
try {
  for (const viewport of viewports)
    for (const theme of ["light", "dark"]) {
      const name = `${viewport.width}x${viewport.height}-${theme}`;
      const directory = resolve(output, name);
      await mkdir(directory, { recursive: true });
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 1,
      });
      await context.addInitScript((theme) => {
        localStorage.setItem("ravel-theme-paper-v1", theme);
      }, theme);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (message) => {
        if (["error", "warning"].includes(message.type()))
          errors.push(message.text());
      });
      await page.goto(origin);
      await page.locator("html[data-theme=" + theme + "]").waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(450);
      const frames = [];
      const inspect = async () =>
        page.evaluate(() => {
          const rect = (e) => {
            const r = e.getBoundingClientRect();
            return {
              x: r.x,
              y: r.y,
              width: r.width,
              height: r.height,
              right: r.right,
              bottom: r.bottom,
            };
          };
          const visible = (e) => {
            const r = e.getBoundingClientRect();
            return (
              e.checkVisibility() &&
              r.width > 0 &&
              r.height > 0 &&
              r.bottom > (e.closest(".site-header") ? 0 : 65) &&
              r.top < innerHeight
            );
          };
          const label = (e) => ({
            selector:
              e.tagName.toLowerCase() +
              "." +
              String(e.className).replaceAll(" ", "."),
            text: e.textContent?.trim().slice(0, 100),
          });
          const rgb = (s) => {
            const n = s.match(/[\d.]+/g)?.map(Number) || [];
            return [n[0] || 0, n[1] || 0, n[2] || 0, n.length > 3 ? n[3] : 1];
          };
          const blend = (fg, bg) =>
            [0, 1, 2].map((i) => fg[i] * fg[3] + bg[i] * (1 - fg[3]));
          const background = (e) => {
            const chain = [];
            for (let p = e; p; p = p.parentElement) chain.unshift(p);
            let c = [255, 255, 255];
            for (const p of chain)
              c = blend(rgb(getComputedStyle(p).backgroundColor), c);
            return c;
          };
          const lum = (c) =>
            c
              .map((v) => v / 255)
              .map((v) =>
                v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
              )
              .reduce(
                (total, v, i) => total + v * [0.2126, 0.7152, 0.0722][i],
                0,
              );
          const ratio = (a, b) => {
            const x = lum(a),
              y = lum(b);
            return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
          };
          const texts = [
            ...document.querySelectorAll("header *,main *,footer *"),
          ].filter(
            (e) =>
              visible(e) &&
              !e.closest('[aria-hidden="true"],.no-script-story') &&
              [...e.childNodes].some(
                (n) => n.nodeType === 3 && n.textContent.trim(),
              ),
          );
          const text = texts.map((e) => {
            const s = getComputedStyle(e),
              bg = background(e),
              fg = blend(rgb(s.color), bg);
            return {
              ...label(e),
              ...rect(e),
              size: parseFloat(s.fontSize),
              lineHeight: s.lineHeight,
              font: s.fontFamily,
              weight: s.fontWeight,
              spacing: s.letterSpacing,
              color: s.color,
              background: bg,
              ratio: +ratio(fg, bg).toFixed(2),
            };
          });
          const controls = [
            ...document.querySelectorAll("a,button,summary,input,select"),
          ]
            .filter(visible)
            .map((e) => ({
              ...label(e),
              ...rect(e),
              role: e.getAttribute("role"),
              selected: e.getAttribute("aria-selected"),
              expanded: e.getAttribute("aria-expanded"),
              disabled: e.disabled || false,
            }));
          const overflowing = texts
            .filter(
              (e) =>
                !e.closest("pre,code") &&
                getComputedStyle(e).overflowX === "visible" &&
                e.scrollWidth > e.clientWidth + 2,
            )
            .map((e) => ({
              ...label(e),
              clientWidth: e.clientWidth,
              scrollWidth: e.scrollWidth,
            }));
          const clipped = texts
            .filter((e) => {
              if (e.closest("pre,code")) return false;
              const r = e.getBoundingClientRect();
              for (
                let p = e.parentElement;
                p && !p.matches("body,html");
                p = p.parentElement
              ) {
                const s = getComputedStyle(p),
                  b = p.getBoundingClientRect();
                if (
                  ["hidden", "clip"].includes(s.overflowY) &&
                  r.bottom > b.bottom + 2
                )
                  return true;
                if (
                  ["hidden", "clip"].includes(s.overflowX) &&
                  (r.right > b.right + 2 || r.left < b.left - 2)
                )
                  return true;
              }
              return false;
            })
            .map(label);
          const sections = [
            ...document.querySelectorAll(
              "main>section,.hero-product,.story-pin,.story-stage,.story-extras,.site-footer-inner,.footer-top,.footer-bottom,.footer-watermark",
            ),
          ].map((e) => ({
            ...label(e),
            ...rect(e),
            clientHeight: e.clientHeight,
            scrollHeight: e.scrollHeight,
            padding: getComputedStyle(e).padding,
            position: getComputedStyle(e).position,
          }));
          return {
            scrollY,
            viewport: { width: innerWidth, height: innerHeight },
            pageWidth: document.documentElement.scrollWidth,
            pageHeight: document.documentElement.scrollHeight,
            text,
            controls,
            overflowing,
            clipped,
            sections,
            activeStory: document.querySelector(
              '.feature-tabs [aria-selected="true"]',
            )?.textContent,
          };
        });
      const max = await page.evaluate(
        () => document.documentElement.scrollHeight - innerHeight,
      );
      const step = Math.min(320, Math.round(viewport.height * 0.4));
      for (let y = 0, index = 0; y <= max + step; y += step, index++) {
        await page.evaluate(
          (y) => scrollTo({ top: y, behavior: "instant" }),
          Math.min(y, max),
        );
        await page.waitForTimeout(100);
        const metrics = await inspect();
        const file = `scroll-${String(index).padStart(2, "0")}.png`;
        await page.screenshot({
          path: resolve(directory, file),
          animations: "disabled",
        });
        frames.push({ file, ...metrics });
        if (y >= max) break;
      }
      const state = [];
      for (let index = 0; index < 4; index++) {
        await page.locator(`#story-tab-${index}`).click();
        await page.waitForTimeout(450);
        const file = `story-${index + 1}.png`;
        await page.screenshot({
          path: resolve(directory, file),
          animations: "disabled",
        });
        state.push({ file, ...(await inspect()) });
      }
      for (const scenario of ["slow", "failure"]) {
        await page
          .locator(
            ".hero-product .photo-scenario [data-scenario=" + scenario + "]",
          )
          .click();
        await page.evaluate(() =>
          scrollTo({
            top:
              document.querySelector(".hero-product").getBoundingClientRect()
                .top +
              scrollY -
              81,
            behavior: "instant",
          }),
        );
        await page.waitForTimeout(180);
        const file = `hero-${scenario}.png`;
        await page.screenshot({
          path: resolve(directory, file),
          animations: "disabled",
        });
        state.push({ file, ...(await inspect()) });
      }
      await page.locator(".hero-product .photo-change-question").click();
      await page.waitForTimeout(180);
      await page.screenshot({
        path: resolve(directory, "hero-change.png"),
        animations: "disabled",
      });
      state.push({ file: "hero-change.png", ...(await inspect()) });
      for (let i = 0; i < 4; i++) {
        const panel = page.locator(".example-expand").nth(i);
        await panel.locator("summary").click();
        await page.evaluate(
          (i) =>
            scrollTo({
              top:
                document
                  .querySelectorAll(".example-expand")
                  [i].getBoundingClientRect().top +
                scrollY -
                81,
              behavior: "instant",
            }),
          i,
        );
        await page.waitForTimeout(180);
        const file = `expanded-${i + 1}.png`;
        await page.screenshot({
          path: resolve(directory, file),
          animations: "disabled",
        });
        state.push({ file, ...(await inspect()) });
        await panel.locator("summary").click();
      }
      for (const faq of await page.locator(".faq-item").all())
        if ((await faq.getAttribute("open")) === null)
          await faq.locator("summary").click();
      await page.evaluate(() =>
        scrollTo({
          top:
            document.querySelector(".unravel-faq").getBoundingClientRect().top +
            scrollY -
            81,
          behavior: "instant",
        }),
      );
      await page.screenshot({
        path: resolve(directory, "faq-open.png"),
        animations: "disabled",
      });
      state.push({ file: "faq-open.png", ...(await inspect()) });
      if (viewport.width <= 800) {
        await page.getByRole("button", { name: "Open navigation" }).click();
        await page.screenshot({
          path: resolve(directory, "menu-open.png"),
          animations: "disabled",
        });
        state.push({ file: "menu-open.png", ...(await inspect()) });
        await page.keyboard.press("Escape");
      }
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      const a11y = await new AxeBuilder({ page })
        .exclude(".footer-watermark")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      const report = {
        name,
        viewport,
        theme,
        origin,
        deviceScaleFactor: 1,
        frames,
        state,
        errors,
        axe: a11y.violations.map(({ id, impact, nodes }) => ({
          id,
          impact,
          nodes: nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      };
      await writeFile(
        resolve(directory, "measurements.json"),
        JSON.stringify(report, null, 2),
      );
      const all = [...frames, ...state];
      const dedupe = (items) => [
        ...new Map(items.map((item) => [JSON.stringify(item), item])).values(),
      ];
      reports.push({
        name,
        screenshots: all.length,
        renders: all.map((f) => f.file),
        decorativeContrastException:
          "The requested aria-hidden brand watermark is deliberately low contrast in dark mode; it is excluded from the content contrast audit.",
        errors,
        axe: report.axe,
        overflow: dedupe(all.flatMap((f) => f.overflowing)),
        clipped: dedupe(all.flatMap((f) => f.clipped)),
        smallText: dedupe(
          all.flatMap((f) =>
            f.text
              .filter((t) => t.size < 13)
              .map(({ selector, text, size }) => ({ selector, text, size })),
          ),
        ),
        lowContrast: dedupe(
          all.flatMap((f) =>
            f.text
              .filter((t) => t.ratio < 4.5)
              .map(({ selector, text, color, background, ratio }) => ({
                selector,
                text,
                color,
                background,
                ratio,
              })),
          ),
        ),
        smallTargets: dedupe(
          all.flatMap((f) =>
            f.controls
              .filter((c) => c.width < 44 || c.height < 44)
              .map(({ selector, text, width, height }) => ({
                selector,
                text,
                width,
                height,
              })),
          ),
        ),
        pageOverflow: all
          .filter((f) => f.pageWidth > viewport.width)
          .map((f) => ({ file: f.file, pageWidth: f.pageWidth })),
        links: await page
          .locator("a")
          .evaluateAll((elements) =>
            elements.map((e) => ({
              text: e.textContent.trim(),
              href: e.getAttribute("href"),
            })),
          ),
      });
      console.log(
        name,
        frames.length + " scroll frames",
        report.axe.length + " accessibility findings",
      );
      await context.close();
    }
} finally {
  await browser.close();
}
await writeFile(
  resolve(output, "summary.json"),
  JSON.stringify(reports, null, 2),
);
