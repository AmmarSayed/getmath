import { readFileSync } from "node:fs";
import type { Browser, Page } from "@playwright/test";

/** The one place that holds the environment, the ceilings and the measurements behind them. */
export const thresholds = JSON.parse(readFileSync(new URL("./thresholds.json", import.meta.url), "utf8")) as Thresholds;

type Stat = { runs: number; min: number; median: number; max: number };
type Spec = { label: string; unit: string; deterministic: boolean; ceiling: number; why: string; measured: Record<"developer" | "runner", Stat & { where: string }> };
export type Thresholds = {
  status: string;
  environment: {
    description: string;
    viewport: { width: number; height: number };
    latencyMs: number;
    downloadKbps: number;
    uploadKbps: number;
    cpuSlowdown: number;
    quietMs: number;
    keySteps: number;
    dragSteps: number;
    runsInTest: number;
  };
  measures: Record<Measure, Spec>;
};

export const measures = ["lcp", "cls", "bytes", "scriptBytes", "requests", "keyWorst", "keyMedian", "dragWorst", "dragMedian"] as const;
export type Measure = (typeof measures)[number];
export type Result = Record<Measure, number>;

/** Page changes that make a page slower on purpose, to show that the check fails. */
export type Tamper = (page: Page) => Promise<unknown>;

declare global {
  interface Window {
    probe: { lcp: number; shifts: [number, number][]; keys: number[]; drags: number[]; timed: number[] };
  }
}

// Runs before the page's own scripts. Every step is timed from the event to the first frame and the
// task after it, which is when the new picture is on the screen. Event Timing adds its own figure for
// the keyboard (rounded to 8 ms, and only for events over 16 ms); it does not cover pointermove.
// The startTime of a largest contentful paint is already its render time, or its load time.
const probe = () => {
  const p: Window["probe"] = (window.probe = { lcp: 0, shifts: [], keys: [], drags: [], timed: [] });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) p.lcp = entry.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean; startTime: number }[])
      if (!entry.hadRecentInput) p.shifts.push([entry.startTime, entry.value]);
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) if (entry.name === "keydown") p.timed.push(entry.duration);
  }).observe({ type: "event", durationThreshold: 16, buffered: true } as PerformanceObserverInit);
  const after = (kind: "keys" | "drags") => (event: Event) => {
    const start = event.timeStamp;
    requestAnimationFrame(() => setTimeout(() => p[kind].push(performance.now() - start)));
  };
  addEventListener("keydown", after("keys"), true);
  // Only moves with a button pressed are the drag.
  addEventListener("pointermove", (event) => event.buttons && after("drags")(event), true);
};

/** The largest burst of shifts, where shifts less than a second apart, and a burst of at most five seconds, belong together. */
function cumulativeShift(shifts: [number, number][]) {
  let worst = 0;
  let sum = 0;
  let first = -Infinity;
  let last = -Infinity;
  for (const [time, value] of shifts) {
    if (time - last > 1000 || time - first > 5000) [sum, first] = [0, time];
    sum += value;
    last = time;
    worst = Math.max(worst, sum);
  }
  return worst;
}

export const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const half = sorted.length >> 1;
  return sorted.length % 2 ? sorted[half] : (sorted[half - 1] + sorted[half]) / 2;
};

/** One cold run: a new browser context, a throttled network and processor, a load, then arrow steps. */
export async function measureOnce(browser: Browser, url: string, tamper?: Tamper): Promise<Result> {
  const { environment: env } = thresholds;
  const context = await browser.newContext({ viewport: env.viewport });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const types = new Map<string, string>();
  const sizes = new Map<string, number>();
  const pending = new Set<string>();
  const failed: string[] = [];
  let lastActivity = Date.now();
  cdp.on("Network.requestWillBeSent", (e) => {
    types.set(e.requestId, e.type ?? "Other");
    pending.add(e.requestId);
    lastActivity = Date.now();
  });
  cdp.on("Network.loadingFinished", (e) => {
    sizes.set(e.requestId, e.encodedDataLength);
    pending.delete(e.requestId);
    lastActivity = Date.now();
  });
  cdp.on("Network.loadingFailed", (e) => {
    failed.push(e.errorText);
    pending.delete(e.requestId);
    lastActivity = Date.now();
  });
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: env.latencyMs,
    downloadThroughput: (env.downloadKbps * 1000) / 8,
    uploadThroughput: (env.uploadKbps * 1000) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: env.cpuSlowdown });
  await page.addInitScript(probe);
  await tamper?.(page);

  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await page.waitForFunction(() => !document.querySelector("astro-island[ssr]"));
  // Until no request is in flight and none has started for a while: late files, late shifts and the last paint.
  const deadline = Date.now() + 60_000;
  while (pending.size || Date.now() - lastActivity < env.quietMs) {
    if (Date.now() > deadline) throw new Error(`${pending.size} requests did not finish in a minute`);
    await page.waitForTimeout(50);
  }
  if (failed.length) throw new Error(`Requests failed: ${failed.join(", ")}`);

  // With the sum shown, every view changes in every step: the picture, numbers, words and formula.
  const prediction = page.getByRole("group", { name: "Predict where the sum ends" });
  await prediction.getByLabel("x", { exact: true }).fill("2");
  await prediction.getByLabel("y", { exact: true }).fill("4");
  await page.getByRole("button", { name: "Submit prediction" }).click();
  await page.locator('.interaction [data-arrow="sum"]').waitFor();

  const handle = page.getByRole("slider", { name: "Tip of arrow a" });
  const value = () => handle.getAttribute("aria-valuetext");
  await handle.scrollIntoViewIfNeeded();
  await handle.focus();
  for (let i = 0; i < env.keySteps; i++) {
    const before = await value();
    await page.keyboard.press(i % 2 ? "ArrowLeft" : "ArrowRight");
    if ((await value()) === before) throw new Error(`Keyboard step ${i + 1} did not move the arrow, so it was not measured`);
    await page.waitForTimeout(20);
  }

  // The tip goes from the middle of one grid cell to the middle of another, one pointer move at a time, as a hand would.
  const axes = (await page.locator(".interaction:has(svg) .axes").boundingBox())!;
  const at = (x: number, y: number) => [axes.x + ((x + 8) / 16) * axes.width, axes.y + ((8 - y) / 16) * axes.height] as const;
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  for (let i = 0; i < env.dragSteps; i++) {
    const before = await value();
    // x goes to and fro from −4 to 4, y between 1 and 3, so that no step stays in its cell.
    await page.mouse.move(...at(Math.abs(((i + 2) % 16) - 8) - 4, i % 2 ? 1 : 3));
    await page.waitForTimeout(20);
    if ((await value()) === before) throw new Error(`Drag move ${i + 1} did not move the arrow, so it was not measured`);
  }
  await page.mouse.up();
  await page.waitForTimeout(300);

  const seen = await page.evaluate(() => window.probe);
  if (pending.size || failed.length) throw new Error("A request was still pending or failed during the steps");
  await cdp.send("Network.disable");
  await context.close();

  let bytes = 0;
  let scriptBytes = 0;
  for (const [id, size] of sizes) {
    bytes += size;
    if (types.get(id) === "Script") scriptBytes += size;
  }
  if (seen.keys.length !== env.keySteps) throw new Error(`${seen.keys.length} keyboard samples, not ${env.keySteps}`);
  if (seen.drags.length !== env.dragSteps) throw new Error(`${seen.drags.length} drag samples, not ${env.dragSteps}`);
  if (!(seen.lcp > 0)) throw new Error("No largest contentful paint was seen");
  if (!(scriptBytes > 0)) throw new Error("No script bytes were seen");
  return {
    lcp: seen.lcp,
    cls: cumulativeShift(seen.shifts),
    bytes,
    scriptBytes,
    requests: sizes.size,
    keyWorst: Math.max(...seen.keys, ...seen.timed),
    keyMedian: median(seen.keys),
    dragWorst: Math.max(...seen.drags),
    dragMedian: median(seen.drags),
  };
}
/** The median of repeated runs, so that one noisy run cannot fail a pull request. */
export function medians(runs: Result[]): Result {
  return Object.fromEntries(measures.map((m) => [m, median(runs.map((r) => r[m]))])) as Result;
}

/** The measures that are over their ceiling. */
export const over = (result: Result) => measures.filter((m) => result[m] > thresholds.measures[m].ceiling);

/** Says how far each of these measures is over its ceiling. */
export const describe = (result: Result, names: readonly Measure[]) =>
  names.map((m) => `${thresholds.measures[m].label} is ${+result[m].toFixed(3)} ${thresholds.measures[m].unit}, over the ceiling of ${thresholds.measures[m].ceiling}`);
