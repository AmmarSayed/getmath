// Repeats the speed measurement on the production build and prints how each measure varies.
// Usage: pnpm measure [runs]   (builds first; stop other servers on port 4321)
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import { measures, measureOnce, middle, thresholds, type Result } from "../tests/speed/measure.ts";

const runs = Number(process.argv[2] ?? 20);
const url = process.env.SITE_URL ?? "http://127.0.0.1:4321/getmath/";

const answers = () => fetch(url).then((r) => r.ok, () => false);
if (!process.env.SITE_URL && (await answers())) throw new Error(`${url} already answers, so it may be another build. Stop that server first.`);
const server = process.env.SITE_URL ? undefined : spawn("node_modules/.bin/astro", ["preview", "--ignore-lock"], { stdio: "ignore" });
let exited = false;
server?.on("exit", () => (exited = true));
try {
  for (let i = 0; !(await answers()); i++) {
    if (exited) throw new Error("The preview server exited before it answered. Is the site built, and is port 4321 free?");
    if (i >= 100) throw new Error(`${url} did not answer in 10 seconds`);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (exited) throw new Error("The preview server exited, so the answer came from another server");
  const browser = await chromium.launch();
  const all: Result[] = [];
  for (let i = 0; i < runs; i++) {
    all.push(await measureOnce(browser, url));
    process.stderr.write(`run ${i + 1}/${runs}\r`);
  }
  await browser.close();

  console.log(`${runs} cold runs of ${url}\n${thresholds.environment.description}\n`);
  console.log("measure".padEnd(34), ["min", "median", "max", "ceiling"].map((h) => h.padStart(12)).join(""));
  for (const m of measures) {
    const values = all.map((r) => r[m]);
    const { label, unit, ceiling } = thresholds.measures[m];
    const cells = [Math.min(...values), middle(values), Math.max(...values), ceiling].map((v) => String(+v.toFixed(3)).padStart(12));
    console.log(`${label} (${unit})`.padEnd(34), cells.join(""));
  }
  if (process.env.MEASURE_JSON) console.log(JSON.stringify(all));
} finally {
  server?.kill();
}
