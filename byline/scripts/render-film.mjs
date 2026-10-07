import { bundle } from "@remotion/bundler";
import {
  renderMedia,
  renderStill,
  selectComposition,
} from "@remotion/renderer";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";
const root = fileURLToPath(new URL("../", import.meta.url));
const serveUrl = await bundle({
  entryPoint: root + "motion/RavelFilm.tsx",
  outDir: root + "../.local/film-bundle",
});
const browserExecutable =
  process.env.RAVEL_CHROME ||
  (process.platform === "win32"
    ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
    : undefined);
await mkdir(root + "public/media", { recursive: true });
for (const [id, name] of [
  ["RavelFilm", "ravel-film"],
  ["RavelPhoneFilm", "ravel-film-phone"],
]) {
  const composition = await selectComposition({
    serveUrl,
    id,
    browserExecutable,
  });
  await renderStill({
    serveUrl,
    composition,
    browserExecutable,
    frame: 80,
    output: root + `public/media/${name}-poster.jpg`,
    imageFormat: "jpeg",
  });
  let last = -1;
  await renderMedia({
    serveUrl,
    composition,
    browserExecutable,
    codec: "h264",
    crf: 24,
    pixelFormat: "yuv420p",
    concurrency: 2,
    outputLocation: root + `public/media/${name}.mp4`,
    onProgress: ({ progress }) => {
      const percent = Math.floor(progress * 10) * 10;
      if (percent !== last) {
        console.log(`${name} ${percent}%`);
        last = percent;
      }
    },
  });
}
console.log("Rendered 20-second film and poster.");
