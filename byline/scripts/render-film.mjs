import { bundle } from "@remotion/bundler";
import {
  getVideoMetadata,
  openBrowser,
  renderMedia,
  renderStill,
  selectComposition,
} from "@remotion/renderer";
import { fileURLToPath } from "node:url";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
const { FILM_FPS, FILM_SECONDS, FILM_TIMELINE } = JSON.parse(
  await readFile(join(root, "motion/unravel-timeline.json"), "utf8"),
);
const stillsOnly = process.argv.includes("--stills-only");
const reviewDirectory = join(root, "../.local/unravel-film-review");
const outputDirectory = join(root, "public/media");
await mkdir(reviewDirectory, { recursive: true });
await mkdir(outputDirectory, { recursive: true });
// A source-only bundle avoids recursively copying earlier video deliveries.
const serveUrl = await bundle({
  entryPoint: join(root, "motion/UnravelFilm.tsx"),
  outDir: join(root, "../.local/unravel-film-bundle"),
  publicDir: null,
  webpackOverride: (config) => ({
    ...config,
    module: {
      ...config.module,
      rules: [
        {
          oneOf: [
            { resourceQuery: /raw/, type: "asset/source" },
            ...(config.module?.rules ?? []),
          ],
        },
      ],
    },
  }),
});
const browserExecutable =
  process.env.UNRAVEL_CHROME ||
  process.env.RAVEL_CHROME ||
  (process.platform === "win32"
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : undefined);
const browser = await openBrowser("chrome", { browserExecutable });
const receipt = {
  fps: FILM_FPS,
  seconds: FILM_SECONDS,
  simulation: true,
  sourceHashes: {},
  frameChecks: [],
  deliveries: [],
};
for (const file of [
  "motion/UnravelFilm.tsx",
  "motion/unravel-film.css",
  "motion/unravel-timeline.json",
  "../examples/search-flow/Search.tsx",
  "../examples/search-flow/api.py",
]) {
  receipt.sourceHashes[file] = createHash("sha256")
    .update(await readFile(join(root, file)))
    .digest("hex");
}
const reviewTimes = FILM_TIMELINE.flatMap((scene) => scene.review);
// Resume only deliveries whose source and output hashes still match.
let previous;
if (process.argv.includes("--resume") && !stillsOnly) {
  try {
    previous = JSON.parse(
      await readFile(join(reviewDirectory, "render-receipt.json"), "utf8"),
    );
    if (
      JSON.stringify(previous.sourceHashes) !==
      JSON.stringify(receipt.sourceHashes)
    )
      previous = undefined;
  } catch {
    previous = undefined;
  }
}
try {
  for (const [id, name] of [
    ["UnravelFilm", "unravel-film"],
    ["UnravelVerticalFilm", "unravel-film-vertical"],
  ]) {
    const completed = previous?.deliveries.find(
      (delivery) => delivery.id === id,
    );
    if (
      completed &&
      createHash("sha256")
        .update(await readFile(completed.output))
        .digest("hex") === completed.sha256
    ) {
      receipt.deliveries.push(completed);
      receipt.frameChecks.push(
        ...previous.frameChecks.filter((check) => check.id === id),
      );
      console.log(`${name}: reusing hash-verified completed delivery`);
      continue;
    }
    const composition = await selectComposition({
      serveUrl,
      id,
      puppeteerInstance: browser,
    });
    if (composition.fps !== 60 || composition.durationInFrames !== 2880)
      throw new Error("Unexpected film timing");
    for (const time of reviewTimes) {
      const frame = Math.round(time * FILM_FPS);
      let check;
      await renderStill({
        serveUrl,
        composition: {
          ...composition,
          props: { ...composition.props, audit: true },
        },
        puppeteerInstance: browser,
        frame,
        inputProps: { audit: true },
        output: join(reviewDirectory, `${name}-${time}s.png`),
        imageFormat: "png",
        onBrowserLog: (log) => {
          if (log.text.startsWith("FILM_QA ")) {
            const result = JSON.parse(log.text.slice(8));
            if (result.frame === frame) check = result;
          }
        },
      });
      if (
        !check ||
        !check.fonts ||
        check.clipped.length ||
        check.scene !==
          FILM_TIMELINE.find((scene) => time >= scene.start && time < scene.end)
            .id
      )
        throw new Error(
          `Frame check failed (${name} ${time}s): ${JSON.stringify(check)}`,
        );
      receipt.frameChecks.push({ id, time, ...check });
    }
    await renderStill({
      serveUrl,
      composition,
      puppeteerInstance: browser,
      frame: 6 * FILM_FPS,
      output: join(outputDirectory, `${name}-poster.jpg`),
      imageFormat: "jpeg",
    });
    console.log(`${name}: ${reviewTimes.length} timeline stills rendered`);
    if (stillsOnly) continue;
    const output = join(outputDirectory, `${name}.mp4`);
    let last = -1;
    await renderMedia({
      serveUrl,
      composition,
      puppeteerInstance: browser,
      codec: "h264",
      crf: 18,
      pixelFormat: "yuv420p",
      imageFormat: "jpeg",
      jpegQuality: 95,
      concurrency: Number(process.env.FILM_CONCURRENCY || 4),
      outputLocation: output,
      onProgress: ({ progress }) => {
        const percent = Math.floor(progress * 20) * 5;
        if (percent !== last) {
          console.log(`${name}: ${percent}%`);
          last = percent;
        }
      },
    });
    const metadata = await getVideoMetadata(output);
    if (
      metadata.width !== composition.width ||
      metadata.height !== composition.height ||
      metadata.fps !== FILM_FPS ||
      Math.abs(metadata.durationInSeconds - FILM_SECONDS) > 0.02
    )
      throw new Error(`Delivery metadata mismatch: ${output}`);
    // Inspect decoded MP4 frames, not just the composition's source stills.
    const ffmpeg =
      process.env.FILM_FFMPEG ||
      (process.platform === "win32"
        ? join(
            dirname(
              require.resolve("@remotion/compositor-win32-x64-msvc/package.json"),
            ),
            "ffmpeg.exe",
          )
        : "ffmpeg");
    const decoded = [];
    for (const time of reviewTimes) {
      const framePath = join(reviewDirectory, `${name}-decoded-${time}s.png`);
      const extraction = spawnSync(
        ffmpeg,
        [
          "-hide_banner",
          "-loglevel",
          "error",
          "-y",
          "-ss",
          String(time),
          "-i",
          output,
          "-frames:v",
          "1",
          framePath,
        ],
        { encoding: "utf8", windowsHide: true },
      );
      if (extraction.error || extraction.status !== 0)
        throw new Error(extraction.error?.message || extraction.stderr);
      decoded.push({
        time,
        frame: Math.round(time * FILM_FPS),
        scene: FILM_TIMELINE.find(
          (scene) => time >= scene.start && time < scene.end,
        ).id,
        path: framePath,
      });
    }
    receipt.deliveries.push({
      id,
      output,
      bytes: (await stat(output)).size,
      sha256: createHash("sha256")
        .update(await readFile(output))
        .digest("hex"),
      metadata,
      decoded,
    });
    await writeFile(
      join(reviewDirectory, "render-receipt.json"),
      JSON.stringify(receipt, null, 2) + "\n",
    );
  }
} finally {
  await browser.close({ silent: true });
}
const vttTime = (seconds) =>
  `00:${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}.000`;
await writeFile(
  join(
    reviewDirectory,
    stillsOnly ? "stills-receipt.json" : "render-receipt.json",
  ),
  JSON.stringify(receipt, null, 2) + "\n",
);
await writeFile(
  join(outputDirectory, "unravel-film.vtt"),
  "WEBVTT\n\n" +
    FILM_TIMELINE.map(
      (scene) =>
        `${vttTime(scene.start)} --> ${vttTime(scene.end)}\n${scene.message}\n`,
    ).join("\n"),
);
console.log(
  stillsOnly
    ? `Review stills: ${reviewDirectory}`
    : `Rendered and decoded-checked both 48-second / 60fps films. Receipt: ${reviewDirectory}`,
);
