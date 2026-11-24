import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { openPage } from "./open-page";

type Pair = [number, number];

const arrow = (page: Page, name: "a" | "b") => page.getByRole("group", { name: `Arrow ${name}` });
const prediction = (page: Page) => page.getByRole("group", { name: "Predict where the sum ends" });
const view = (page: Page, name: string) => page.locator(`.interaction [data-view="${name}"]`);

async function predict(page: Page, x: string, y: string) {
  await prediction(page).getByLabel("x", { exact: true }).fill(x);
  await prediction(page).getByLabel("y", { exact: true }).fill(y);
  await page.getByRole("button", { name: "Submit prediction" }).click();
}

/** Types into a field and leaves it with Tab. */
async function enter(field: Locator, text: string) {
  await field.fill(text);
  await field.press("Tab");
}

/** Notes what a screen reader speaks from now on: texts in live regions, and new values of the control with the focus. */
async function listen(page: Page) {
  await page.evaluate(() => {
    const spoken: string[] = [];
    Object.assign(window, { spoken });
    for (const region of document.querySelectorAll("[role=status], [role=alert], [role=log], output, [aria-live]")) {
      new MutationObserver(() => {
        if (region.textContent) spoken.push(region.textContent);
      }).observe(region, { childList: true, subtree: true, characterData: true });
    }
    for (const slider of document.querySelectorAll("[role=slider]")) {
      new MutationObserver(() => {
        if (slider === document.activeElement) spoken.push(slider.ariaValueText!);
      }).observe(slider, { attributeFilter: ["aria-valuetext", "aria-valuenow"] });
    }
  });
  return () => page.evaluate(() => (window as unknown as { spoken: string[] }).spoken);
}

const minus = (value: number) => String(value).replace("-", "−");

/** Where an arrow's tip is drawn, or undefined if the arrow is not drawn. */
async function tip(page: Page, name: "a" | "b" | "sum"): Promise<Pair | undefined> {
  const drawn = page.locator(`.interaction [data-arrow="${name}"]`);
  if (!(await drawn.count())) return undefined;
  const shape = drawn.locator("polygon");
  if (!(await shape.count())) return [0, 0];
  const [x, y] = (await shape.getAttribute("points"))!.split(" ")[0].split(",").map(Number);
  return [x, 0 - y];
}

function words([x, y]: Pair) {
  const parts = [x && `${Math.abs(x)} ${x > 0 ? "right" : "left"}`, y && `${Math.abs(y)} ${y > 0 ? "up" : "down"}`];
  return parts.filter(Boolean).join(" and ") || "nowhere";
}

/** The numbers in each column of the formula, row by row. */
async function columns(page: Page) {
  const tables = view(page, "formula").locator("mtable");
  return tables.evaluateAll((all) =>
    all.map((table) => [...table.querySelectorAll("mtd")].map((cell) => cell.textContent!.replace(/\s|​/g, ""))),
  );
}

/** Checks that every view shows these arrows, and this sum or none. */
async function expectViews(page: Page, a: Pair, b: Pair, sum?: Pair) {
  for (const [name, [x, y]] of [["a", a], ["b", b]] as const) {
    await expect(arrow(page, name).getByLabel("x", { exact: true })).toHaveValue(minus(x));
    await expect(arrow(page, name).getByLabel("y", { exact: true })).toHaveValue(minus(y));
    expect(await tip(page, name)).toEqual([x, y]);
    await expect(view(page, "words")).toContainText(`Arrow ${name} goes ${words([x, y])}.`);
  }
  expect(await tip(page, "sum")).toEqual(sum);
  await expect(view(page, "numbers")).toHaveText(`Sum a + b: ${sum ? `x = ${minus(sum[0])}, y = ${minus(sum[1])}` : "x = ?, y = ?"}`);
  await expect(view(page, "words")).toContainText(sum ? `The sum, a + b, goes ${words(sum)}.` : "The sum is hidden until");
  const added = (i: number) => `${minus(a[i])}+${b[i] < 0 ? `(${minus(b[i])})` : b[i]}`;
  const result = sum ? [[added(0), added(1)], sum.map(minus)] : [["?", "?"]];
  expect(await columns(page)).toEqual([a.map(minus), b.map(minus), ...result]);
}

test.beforeEach(({ page, javaScriptEnabled }) => openPage(page, "", javaScriptEnabled));

test("the sum is hidden everywhere until a prediction is submitted", async ({ page }) => {
  await expectViews(page, [3, 2], [-1, 2]);
  // The answer is nowhere in the page, not even where only a screen reader would find it.
  const markup = () => page.locator(".interaction").evaluate((element) => element.outerHTML);
  for (const answer of ["(2, 4)", "2 right and 4 up", "x = 2, y = 4"]) {
    expect(await markup()).not.toContain(answer);
    await expect(page.locator("body")).not.toContainText(answer);
  }
  await expect(page.locator('[data-arrow="copy"]')).toHaveCount(0);
  await expect(page.locator(".still")).toHaveCount(0);

  // Changing arrows first does not reveal it.
  await arrow(page, "a").getByRole("button", { name: "Decrease x" }).click();
  await expectViews(page, [2, 2], [-1, 2]);
  await expect(page.getByRole("status")).toHaveText("Arrow a is (2, 2).");

  await predict(page, "1", "4");
  await expectViews(page, [2, 2], [-1, 2], [1, 4]);
});

test("picture, numbers, words and formula agree after every change", async ({ page }) => {
  await predict(page, "2", "4");
  await expectViews(page, [3, 2], [-1, 2], [2, 4]);
  await arrow(page, "a").getByRole("button", { name: "Increase x" }).click();
  await expectViews(page, [4, 2], [-1, 2], [3, 4]);
  await enter(arrow(page, "a").getByLabel("y", { exact: true }), "-4");
  await expectViews(page, [4, -4], [-1, 2], [3, -2]);
  await expect(view(page, "words")).toContainText("Arrow a goes 4 right and 4 down. Arrow b goes 1 left and 2 up.");
  await enter(arrow(page, "b").getByLabel("x", { exact: true }), "4");
  await expectViews(page, [4, -4], [4, 2], [8, -2]);
  await arrow(page, "b").getByRole("button", { name: "Decrease y" }).click();
  await expectViews(page, [4, -4], [4, 1], [8, -3]);
  // An arrow without length, and a sum without length.
  await enter(arrow(page, "b").getByLabel("x", { exact: true }), "0");
  await enter(arrow(page, "b").getByLabel("y", { exact: true }), "0");
  await expectViews(page, [4, -4], [0, 0], [4, -4]);
  await enter(arrow(page, "b").getByLabel("x", { exact: true }), "−4");
  await enter(arrow(page, "b").getByLabel("y", { exact: true }), "4");
  await expectViews(page, [4, -4], [-4, 4], [0, 0]);
});

const handle = (page: Page, name: "a" | "b") => page.getByRole("slider", { name: `Tip of arrow ${name}` });

/** Where a point of the grid is on the screen. The axes are drawn from −8 to 8. */
async function onScreen(page: Page, [x, y]: Pair): Promise<Pair> {
  const axes = await page.locator(".interaction .axes").evaluate((path) => {
    const { left, top, width, height } = path.getBoundingClientRect();
    return { left, top, width, height };
  });
  return [axes.left + ((x + 8) / 16) * axes.width, axes.top + ((8 - y) / 16) * axes.height];
}

/** Presses the mouse at the first point, and takes it through the others. */
async function drag(page: Page, from: Pair, ...through: Pair[]) {
  await page.locator(".interaction svg").scrollIntoViewIfNeeded();
  await page.mouse.move(...(await onScreen(page, from)));
  await page.mouse.down();
  for (const point of through) await page.mouse.move(...(await onScreen(page, point)), { steps: 5 });
}

/** Touches the drawing with fingers, as a touch screen would. Only Chromium can. */
async function touch(page: Page) {
  await page.locator(".interaction svg").scrollIntoViewIfNeeded();
  const session = await page.context().newCDPSession(page);
  // Where the drawing is now, which a scroll by the finger must not change for the rest of its way.
  const [left, top] = await onScreen(page, [0, 0]);
  const unit = (await onScreen(page, [1, 0]))[0] - left;
  const at = (points: Pair[]) => points.map(([x, y], id) => ({ x: left + x * unit, y: top - y * unit, id }));
  let last: Pair[] = [];
  const send = async (type: "touchStart" | "touchMove" | "touchEnd", points: Pair[]) => {
    await session.send("Input.dispatchTouchEvent", { type, touchPoints: at(points) });
    last = points;
  };
  return {
    down: (point: Pair) => send("touchStart", [point]),
    alsoDown: (point: Pair) => send("touchStart", [...last, point]),
    move: (...points: Pair[]) => send("touchMove", points),
    up: () => send("touchEnd", []),
  };
}

test.describe("a tip can be moved", () => {
  // Arrow a from (3, 2) to (1, 3).
  const ways: Record<string, (page: Page) => Promise<void>> = {
    "with the mouse": async (page) => {
      await drag(page, [3, 2], [-4, -4], [1.4, 2.6]);
      await page.mouse.up();
    },
    "by touch": async (page) => {
      const finger = await touch(page);
      await finger.down([3, 2]);
      for (const point of [[2, 2], [0, 0], [1.4, 2.6]] as Pair[]) await finger.move(point);
      await finger.up();
    },
    "with the keyboard": async (page) => {
      await handle(page, "a").focus();
      for (const key of ["ArrowLeft", "ArrowDown", "ArrowLeft", "ArrowUp", "ArrowUp", "ArrowRight", "ArrowLeft"]) {
        await page.keyboard.press(key);
      }
    },
    "with the number fields": async (page) => {
      await enter(arrow(page, "a").getByLabel("x", { exact: true }), "1");
      await enter(arrow(page, "a").getByLabel("y", { exact: true }), "3");
    },
    "with the buttons": async (page) => {
      await arrow(page, "a").getByRole("button", { name: "Decrease x" }).click({ clickCount: 2 });
      await arrow(page, "a").getByRole("button", { name: "Increase y" }).click();
    },
  };
  for (const [way, move] of Object.entries(ways)) {
    for (const submitted of [false, true]) {
      test(`${way}, ${submitted ? "after" : "before"} the prediction, to the same result`, async ({ page, browserName }) => {
        test.skip(way === "by touch" && browserName !== "chromium", "Playwright can touch and move only in Chromium");
        if (submitted) await predict(page, "4", "4");
        await move(page);
        await expectViews(page, [1, 3], [-1, 2], submitted ? [0, 5] : undefined);
        await expect(handle(page, "a")).toHaveAttribute("aria-valuetext", "x = 1, y = 3");
        if (submitted) await expect(view(page, "feedback")).toContainText("You predicted (4, 4) for a = (3, 2) and b = (−1, 2).");
        // All ways go on from the same state.
        await arrow(page, "a").getByRole("button", { name: "Decrease y" }).click();
        await handle(page, "a").press("ArrowRight");
        await drag(page, [-1, 2], [0, -3]);
        await page.mouse.up();
        await expectViews(page, [2, 2], [0, -3], submitted ? [2, -1] : undefined);
      });
    }
  }
});

test.describe("dragging", () => {
  test("snaps to the grid, in every view, while the tip moves", async ({ page }) => {
    await predict(page, "2", "4");
    await drag(page, [3, 2], [1.4, -2.6]);
    await expectViews(page, [1, -3], [-1, 2], [0, -1]);
    const ring = (await handle(page, "a").boundingBox())!;
    const [x, y] = await onScreen(page, [1, -3]);
    expect(Math.abs(ring.x + ring.width / 2 - x)).toBeLessThan(2);
    expect(Math.abs(ring.y + ring.height / 2 - y)).toBeLessThan(2);
  });

  test("cannot take a tip out of the bounds, and goes on outside the drawing", async ({ page }) => {
    // Still in the window: Playwright's Firefox does not move the mouse out of it as a real one does.
    await drag(page, [3, 2], [14, -5], [14, -11]);
    await expectViews(page, [4, -4], [-1, 2]);
    await page.mouse.up();
    await drag(page, [-1, 2], [-4.6, 7]);
    await page.mouse.up();
    await expectViews(page, [4, -4], [-4, 4]);
    // The mouse no longer moves anything.
    await page.mouse.move(...(await onScreen(page, [0, 0])));
    await expectViews(page, [4, -4], [-4, 4]);
  });

  test("starts from where the tip is held, so a press alone changes nothing", async ({ page }) => {
    await drag(page, [3.5, 2.5]);
    await page.mouse.up();
    await expectViews(page, [3, 2], [-1, 2]);
    await drag(page, [3.45, 2.45], [2.45, 2.45]);
    await page.mouse.up();
    await expectViews(page, [2, 2], [-1, 2]);
  });

  test("takes the tip that is nearer, where targets overlap", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await enter(arrow(page, "a").getByLabel("x", { exact: true }), "0");
    await drag(page, [-1, 2], [-3, 2]);
    await expect(handle(page, "b")).toBeFocused();
    await page.mouse.up();
    await expectViews(page, [0, 2], [-3, 2]);
    await enter(arrow(page, "a").getByLabel("x", { exact: true }), "-2");
    await drag(page, [-2, 2], [0, 0]);
    await expect(handle(page, "a")).toBeFocused();
    await page.mouse.up();
    await expectViews(page, [0, 0], [-3, 2]);
  });

  test("can part two tips at the same place", async ({ page }) => {
    await enter(arrow(page, "b").getByLabel("x", { exact: true }), "3");
    await drag(page, [3, 2], [1, 1]);
    await page.mouse.up();
    await drag(page, [3, 2], [-2, 0]);
    await page.mouse.up();
    await expectViews(page, [1, 1], [-2, 0]);
  });

  test("uses the number just typed in a field", async ({ page }) => {
    const spoken = await listen(page);
    await arrow(page, "b").getByLabel("x", { exact: true }).fill("-3");
    await drag(page, [3, 2], [2, 2]);
    await page.mouse.up();
    await expectViews(page, [2, 2], [-3, 2]);
    expect(await spoken()).toContain("Arrow b is (−3, 2).");
    await arrow(page, "a").getByLabel("x", { exact: true }).fill("0");
    await drag(page, [2, 2], [3, 3]);
    await page.mouse.up();
    await expectViews(page, [1, 3], [-3, 2]);
  });

  test("takes away a message about the number that was refused", async ({ page }) => {
    await enter(arrow(page, "a").getByLabel("x", { exact: true }), "9");
    await drag(page, [3, 2], [2, 2]);
    await page.mouse.up();
    await expect(arrow(page, "a").getByText("must be")).toHaveCount(0);
  });

  test("needs the main button, and is not disturbed by the keyboard", async ({ page }) => {
    await page.locator(".interaction svg").scrollIntoViewIfNeeded();
    await page.mouse.move(...(await onScreen(page, [3, 2])));
    await page.mouse.down({ button: "middle" });
    await page.mouse.move(...(await onScreen(page, [0, 0])));
    await page.mouse.up({ button: "middle" });
    await expectViews(page, [3, 2], [-1, 2]);
    const spoken = await listen(page);
    await drag(page, [3, 2], [1, 1]);
    await page.keyboard.press("ArrowLeft");
    await expectViews(page, [1, 1], [-1, 2]);
    expect(await spoken()).toEqual([]);
  });

  test("is announced once, at the end", async ({ page }) => {
    const spoken = await listen(page);
    // Before the prediction, the sum is not announced.
    await drag(page, [3, 2], [1, 1]);
    expect(await spoken()).toEqual([]);
    await page.mouse.up();
    // The tip has the focus, so a screen reader reads its new value.
    await expect.poll(spoken).toEqual(["x = 1, y = 1"]);
    await expect(page.getByRole("status")).toHaveText("");

    await predict(page, "2", "4");
    await drag(page, [1, 1], [4, -4], [-4, -4], [2, -1]);
    expect(await spoken()).toHaveLength(1);
    await page.mouse.up();
    await expect.poll(spoken).toHaveLength(3);
    expect((await spoken()).slice(1).sort()).toEqual(["The sum is (1, 1).", "x = 2, y = −1"]);

    // A drag that ends where it began has no result.
    await drag(page, [2, -1], [0, 0], [2, -1]);
    await page.mouse.up();
    await expectViews(page, [2, -1], [-1, 2], [1, 1]);
    expect(await spoken()).toHaveLength(3);
  });
});

test.describe("touch", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "Playwright can touch and move only in Chromium");

  for (const width of [320, 1280]) {
    test(`on a tip moves it, and elsewhere scrolls the page, at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 600 });
      const finger = await touch(page);
      const scrolled = () => page.evaluate(() => window.scrollY);

      let before = await scrolled();
      await finger.down([3, 2]);
      for (const y of [3, 4, 5, 6, 7]) await finger.move([3, y]);
      await finger.up();
      await expectViews(page, [3, 4], [-1, 2]);
      expect(await scrolled()).toBe(before);

      // On the drawing between the tips, a finger that goes up scrolls down.
      await finger.down([-5, -6]);
      for (const y of [-4, -2, 0, 2, 4]) await finger.move([-5, y]);
      await finger.up();
      await expect.poll(scrolled).toBeGreaterThan(before + 20);
      await expectViews(page, [3, 4], [-1, 2]);
    });
  }

  test("a second finger does not disturb a drag", async ({ page }) => {
    const finger = await touch(page);
    await finger.down([3, 2]);
    await finger.move([2, 2]);
    await finger.alsoDown([-1, 2]);
    await finger.move([1, 1], [-4, -4]);
    // Now only the second finger moves.
    await finger.move([1, 1], [-3, -3]);
    await expectViews(page, [1, 1], [-1, 2]);
    await finger.up();
    await expectViews(page, [1, 1], [-1, 2]);
  });
});

test.describe("a tip for the keyboard and assistive technology", () => {
  test("has a name, a value, a description, and a large target", async ({ page }) => {
    for (const [name, value, now] of [["a", "x = 3, y = 2", "3"], ["b", "x = −1, y = 2", "-1"]] as const) {
      const tip = page.getByRole("slider", { name: `Tip of arrow ${name}`, exact: true });
      await expect(tip).toHaveAttribute("aria-valuetext", value);
      await expect(tip).toHaveAttribute("aria-valuenow", now);
      await expect(tip).toHaveAccessibleDescription(/press the arrow keys of your keyboard/);
      const { width, height } = (await tip.boundingBox())!;
      expect(Math.min(width, height)).toBeGreaterThanOrEqual(44);
    }
  });

  test("moves one step at a time, is announced once, and does not scroll the page", async ({ page }) => {
    await predict(page, "2", "4");
    await handle(page, "b").focus();
    const spoken = await listen(page);
    const said: string[] = [];
    for (const [key, b, sum] of [
      ["ArrowRight", [0, 2], [3, 4]],
      ["ArrowUp", [0, 3], [3, 5]],
      ["ArrowLeft", [-1, 3], [2, 5]],
      ["ArrowDown", [-1, 2], [2, 4]],
    ] as [string, Pair, Pair][]) {
      await page.keyboard.press(key);
      await expectViews(page, [3, 2], b, sum);
      said.push(`x = ${minus(b[0])}, y = ${minus(b[1])}`, `The sum is (${sum.join(", ")}).`);
      await expect.poll(async () => (await spoken()).toSorted()).toEqual(said.toSorted());
    }
    await expect(handle(page, "b")).toBeFocused();
    // Scrolling is what a browser does with these keys unless the page prevents it.
    const scrolls = await handle(page, "b").evaluate((tip) =>
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].filter((key) =>
        tip.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true })),
      ),
    );
    expect(scrolls).toEqual([]);
  });

  test("at the bound stays, and says why", async ({ page }) => {
    await handle(page, "a").focus();
    await page.keyboard.press("ArrowRight");
    const spoken = await listen(page);
    await page.keyboard.press("ArrowRight");
    const message = "x must be a whole number from −4 to 4. It is still 4.";
    await expect(arrow(page, "a").getByText(message)).toBeVisible();
    await expectViews(page, [4, 2], [-1, 2]);
    expect(await spoken()).toEqual([message]);
    await page.keyboard.press("ArrowLeft");
    await expect(arrow(page, "a").getByText(message)).toHaveCount(0);
  });

  test("leaves other keys to the browser", async ({ page }) => {
    await handle(page, "a").focus();
    const kept = await handle(page, "a").evaluate((tip) =>
      [
        { key: "ArrowLeft", altKey: true },
        { key: "ArrowLeft", ctrlKey: true },
        { key: "ArrowLeft", metaKey: true },
        { key: "Enter" },
        { key: "PageDown" },
      ].map((key) => tip.dispatchEvent(new KeyboardEvent("keydown", { ...key, bubbles: true, cancelable: true }))),
    );
    expect(kept).toEqual(Array(5).fill(true));
    await expectViews(page, [3, 2], [-1, 2]);
  });
});

test("nothing in the interaction moves by itself with reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await predict(page, "2", "4");
  await handle(page, "a").press("ArrowLeft");
  await drag(page, [-1, 2], [-4, 4]);
  await page.mouse.up();
  const moving = await page.locator(".interaction").evaluate((element) =>
    element.getAnimations({ subtree: true }).map((animation) => (animation.effect as KeyframeEffect).target?.outerHTML),
  );
  expect(moving).toEqual([]);
  const [x, y] = await onScreen(page, [-4, 4]);
  const ring = (await handle(page, "b").boundingBox())!;
  expect(Math.hypot(ring.x + ring.width / 2 - x, ring.y + ring.height / 2 - y)).toBeLessThan(2);
});

/** The parts of the drawing that reach outside it. */
function drawnOutside(page: Page) {
  return page.locator(".interaction svg").evaluate((svg) => {
    const box = svg.getBoundingClientRect();
    return [...svg.querySelectorAll("text, line, polygon, path, circle")]
      .filter((part) => {
        const { left, right, top, bottom } = part.getBoundingClientRect();
        return left < box.left || right > box.right || top < box.top || bottom > box.bottom;
      })
      .map((part) => part.outerHTML);
  });
}

for (const [x, y] of [["-8", "8"], ["8", "-8"]]) {
  test(`a prediction of (${x}, ${y}) is marked inside the drawing`, async ({ page }) => {
    await predict(page, x, y);
    await expect(page.locator(".interaction .prediction")).toBeVisible();
    expect(await drawnOutside(page)).toEqual([]);
  });
}

test("every drawn part stays inside the drawing at the bounds", async ({ page }) => {
  await predict(page, "-8", "8");
  for (const [x, y] of [[4, 4], [4, -4], [-4, 4], [-4, -4], [4, 0], [0, -4], [0, 0]]) {
    for (const name of ["a", "b"] as const) {
      await enter(arrow(page, name).getByLabel("x", { exact: true }), String(x));
      await enter(arrow(page, name).getByLabel("y", { exact: true }), String(y));
    }
    await expectViews(page, [x, y], [x, y], [2 * x, 2 * y]);
    expect(await drawnOutside(page)).toEqual([]);
  }
});

test.describe("feedback", () => {
  for (const [name, x, y, texts] of [
    ["a right prediction", "2", "4", ["Yes: (3, 2) + (−1, 2) = (2, 4)", "x: 3 + (−1) = 2. You had this right.", "y: 2 + 2 = 4. You had this right."]],
    ["a wrong number", "2", "-5", ["Not quite: (3, 2) + (−1, 2) = (2, 4)", "x: 3 + (−1) = 2. You had this right.", "y: 2 + 2 = 4. You predicted −5."]],
    ["the tip of a", "3", "2", ["Not quite", "This is the tip of a by itself."]],
    ["the tip of b", "-1", "2", ["Not quite", "This is the tip of b by itself."]],
    ["subtracting", "4", "0", ["Not quite", "Subtracting one arrow from the other gives this point."]],
    ["leaving out a minus sign", "4", "4", ["Not quite", "Leaving out the minus signs gives this point."]],
  ] as const) {
    test(`explains ${name} through the components`, async ({ page }) => {
      await predict(page, x, y);
      for (const text of texts) await expect(view(page, "feedback")).toContainText(text);
      await expect(view(page, "feedback")).toContainText("each component of the sum is that component of a plus that component of b");
      // Moving the focus to the result is its announcement.
      await expect(view(page, "feedback").getByRole("heading")).toBeFocused();
      await expect(page.getByRole("status")).toHaveText("");
    });
  }

  test("stays about the arrows that were predicted, and the mark is left out when they change", async ({ page }) => {
    const mark = page.locator(".interaction .prediction");
    await predict(page, "4", "-3");
    await expect(mark).toHaveAttribute("data-x", "4");
    await expect(mark).toHaveAttribute("data-y", "-3");
    await expect(view(page, "words")).toContainText("Your prediction, marked ×, ends at (4, −3).");
    await arrow(page, "b").getByRole("button", { name: "Increase x" }).click();
    await expect(view(page, "feedback")).toContainText("You predicted (4, −3) for a = (3, 2) and b = (−1, 2).");
    await expect(view(page, "feedback")).toContainText("(3, 2) + (−1, 2) = (2, 4)");
    await expect(mark).toHaveCount(0);
    await expect(view(page, "words")).not.toContainText("Your prediction");
  });
});

test.describe("invalid input", () => {
  for (const text of ["5", "-5", "1.5", "two", ""]) {
    test(`${JSON.stringify(text)} in an arrow shows a message and keeps the last valid value`, async ({ page }) => {
      const message = "x must be a whole number from −4 to 4. It is still 3.";
      const field = arrow(page, "a").getByLabel("x", { exact: true });
      await enter(field, text);
      await expect(arrow(page, "a").getByText(message)).toBeVisible();
      await expect(field).toHaveAccessibleDescription(new RegExp(message));
      await expect(page.getByRole("status")).toHaveText(message);
      await expectViews(page, [3, 2], [-1, 2]);
      await enter(field, "4");
      await expect(arrow(page, "a").getByText("must be")).toHaveCount(0);
      await expectViews(page, [4, 2], [-1, 2]);
    });
  }

  test("a button at the bound keeps the focus and says why nothing changed", async ({ page }) => {
    const button = arrow(page, "a").getByRole("button", { name: "Increase x" });
    await button.click();
    await expect(button).toHaveAttribute("aria-disabled", "true");
    await button.press("Enter");
    await expect(button).toBeFocused();
    await expect(page.getByRole("status")).toHaveText(/must be a whole number from −4 to 4. It is still 4/);
    await expectViews(page, [4, 2], [-1, 2]);
  });

  test("an incomplete prediction is not submitted", async ({ page }) => {
    await page.getByRole("button", { name: "Submit prediction" }).click();
    await expect(prediction(page).getByText("Enter both numbers of your prediction.")).toBeVisible();
    await expect(prediction(page).getByLabel("x", { exact: true })).toBeFocused();
    await enter(prediction(page).getByLabel("x", { exact: true }), "2");
    await expect(prediction(page).getByText("Enter both numbers of your prediction.")).toBeVisible();
    await page.getByRole("button", { name: "Submit prediction" }).click();
    await expect(prediction(page).getByLabel("y", { exact: true })).toBeFocused();
    await enter(prediction(page).getByLabel("y", { exact: true }), "5");
    await expect(prediction(page).getByText("Enter both numbers of your prediction.")).toHaveCount(0);
    await expectViews(page, [3, 2], [-1, 2]);
  });

  for (const text of ["9", "-9", "0.5", "two"]) {
    for (const way of ["Enter", "button"]) {
      test(`${text} as a prediction is not submitted as the one before it, with ${way}`, async ({ page }) => {
        const message = "y must be a whole number from −8 to 8. It is still 1.";
        const field = prediction(page).getByLabel("y", { exact: true });
        await enter(prediction(page).getByLabel("x", { exact: true }), "2");
        await enter(field, "1");
        const spoken = await listen(page);
        await field.fill(text);
        if (way === "Enter") await field.press("Enter");
        else await page.getByRole("button", { name: "Submit prediction" }).click();
        await expect(prediction(page).getByText(message)).toBeVisible();
        await expect(field).toHaveValue("1");
        await expectViews(page, [3, 2], [-1, 2]);
        expect(await spoken()).toEqual([message]);
        // Leaving the field, or changing something else, does not take the message away.
        await field.press("Tab");
        await enter(prediction(page).getByLabel("x", { exact: true }), "4");
        await arrow(page, "a").getByRole("button", { name: "Decrease x" }).click();
        await expect(prediction(page).getByText(message)).toBeVisible();
        // The learner has been told of the value that is kept, and can submit it.
        await page.getByRole("button", { name: "Submit prediction" }).click();
        await expect(view(page, "feedback")).toContainText("You predicted (4, 1)");
      });
    }
  }

  test("a refused first number is explained again when the prediction is incomplete", async ({ page }) => {
    const x = prediction(page).getByLabel("x", { exact: true });
    await enter(x, "9");
    await expect(prediction(page).getByText("x must be a whole number from −8 to 8. It is still empty.")).toBeVisible();
    await prediction(page).getByLabel("y", { exact: true }).fill("4");
    await prediction(page).getByLabel("y", { exact: true }).press("Enter");
    await expect(prediction(page).getByText("Enter both numbers of your prediction.")).toBeVisible();
    await expect(x).toBeFocused();
    await x.fill("2");
    await x.press("Enter");
    await expect(view(page, "feedback")).toContainText("You predicted (2, 4)");
  });

  test("an old announcement does not stay when the prediction is put right", async ({ page }) => {
    const x = prediction(page).getByLabel("x", { exact: true });
    await enter(x, "9");
    await enter(x, "2");
    await expect(page.getByRole("status")).toHaveText("");
    await expect(prediction(page).getByText("must be")).toHaveCount(0);
  });
});

// A field changes when it loses the focus, which a press on a button causes. If
// anything moved the button then, the click would miss it.
for (const width of [320, 1280]) {
  for (const text of ["9", "0"]) {
    test(`a click just after typing ${text} is not lost at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await arrow(page, "a").getByLabel("x", { exact: true }).fill(text);
      await arrow(page, "b").getByRole("button", { name: "Increase y" }).click();
      await expectViews(page, [text === "9" ? 3 : 0, 2], [-1, 3]);
      await predict(page, "8", "8");
      await expect(view(page, "feedback")).toBeVisible();
      await arrow(page, "b").getByLabel("y", { exact: true }).fill(text);
      await page.getByRole("button", { name: "Reset" }).click();
      await expectViews(page, [3, 2], [-1, 2]);
    });
  }
}

for (const width of [320, 1280]) {
  test(`controls stay where they are while the arrows change, at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const top = () =>
      page.getByRole("button", { name: "Reset" }).evaluate((button) => button.getBoundingClientRect().top + window.scrollY);
    for (const submitted of [false, true]) {
      if (submitted) await predict(page, "2", "4");
      const before = await top();
      for (const value of ["-4", "0"]) {
        for (const name of ["a", "b"] as const) {
          for (const axis of ["x", "y"]) {
            await enter(arrow(page, name).getByLabel(axis, { exact: true }), value);
            expect(await top(), `${axis} of ${name} is ${value}`).toBeCloseTo(before, 0);
          }
        }
      }
      await page.getByRole("button", { name: "Reset" }).click();
    }
  });
}

test("Reset restores the start and keeps the focus", async ({ page }) => {
  await predict(page, "2", "4");
  await enter(arrow(page, "a").getByLabel("x", { exact: true }), "-2");
  await enter(arrow(page, "b").getByLabel("y", { exact: true }), "x");
  await page.getByRole("button", { name: "Reset" }).click();
  await expectViews(page, [3, 2], [-1, 2]);
  await expect(view(page, "feedback")).toHaveCount(0);
  await expect(prediction(page).getByLabel("x", { exact: true })).toHaveValue("");
  await expect(page.getByText("must be")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reset" })).toBeFocused();
  await expect(page.getByRole("status")).toHaveText("Back at the start. The sum is hidden until you submit a prediction.");
});

test("a change is announced once and briefly", async ({ page }) => {
  await predict(page, "2", "4");
  const spoken = await listen(page);
  await arrow(page, "a").getByRole("button", { name: "Decrease y" }).click();
  await expect.poll(spoken).toEqual(["Arrow a is (3, 1). The sum is (2, 3)."]);
  await enter(arrow(page, "b").getByLabel("x", { exact: true }), "-3");
  await expect.poll(spoken).toHaveLength(2);
  // The same words twice are announced twice.
  await enter(arrow(page, "b").getByLabel("x", { exact: true }), "9");
  await enter(arrow(page, "b").getByLabel("x", { exact: true }), "9");
  await expect.poll(spoken).toHaveLength(4);
  expect((await spoken()).slice(1)).toEqual([
    "Arrow b is (−3, 2). The sum is (0, 3).",
    ...Array(2).fill("x must be a whole number from −4 to 4. It is still −3."),
  ]);
});

test("everything works from the keyboard, in order, with visible focus", async ({ page, browserName }) => {
  // Safari's own setting decides whether Tab reaches buttons; the Option key always does.
  const tab = browserName === "webkit" ? "Alt+Tab" : "Tab";
  const focused = () =>
    page.evaluate(() => {
      const element = document.activeElement as HTMLElement;
      const group = element.closest("fieldset")?.querySelector("legend")?.textContent ?? "";
      const name = element.ariaLabel ?? (element as HTMLInputElement).labels?.[0]?.textContent ?? "";
      const { outlineStyle, outlineWidth } = getComputedStyle(element);
      return { name: `${group}/${name || element.textContent}`, outline: outlineStyle !== "none" && parseFloat(outlineWidth) >= 2 };
    });
  const steps = async (count: number) => {
    const names = [];
    for (let i = 0; i < count; i++) {
      await page.keyboard.press(tab);
      const { name, outline } = await focused();
      expect(outline, name).toBe(true);
      names.push(name);
    }
    return names;
  };
  const arrowSteps = (name: string) =>
    ["x", "y"].flatMap((axis) => [`Arrow ${name}/Decrease ${axis}`, `Arrow ${name}/${axis}`, `Arrow ${name}/Increase ${axis}`]);

  await handle(page, "a").focus();
  expect((await focused()).outline).toBe(true);
  expect(await steps(2)).toEqual(["/Tip of arrow b", "1. Predict where the sum ends/x"]);
  await page.keyboard.type("4");
  expect(await steps(1)).toEqual(["1. Predict where the sum ends/y"]);
  await page.keyboard.type("4");
  await page.keyboard.press("Enter");
  await expect(view(page, "feedback").getByRole("heading")).toBeFocused();
  expect((await focused()).outline).toBe(true);
  expect(await steps(3)).toEqual(arrowSteps("a").slice(0, 3));
  await page.keyboard.press("Space");
  await expectViews(page, [4, 2], [-1, 2], [3, 4]);
  expect(await steps(9)).toEqual([...arrowSteps("a").slice(3), ...arrowSteps("b")]);
  expect(await steps(2)).toEqual(["/Formula", "/Reset"]);
  await page.keyboard.press("Enter");
  await expectViews(page, [3, 2], [-1, 2]);
});

for (const forcedColors of ["none", "active"] as const) {
  for (const colorScheme of ["light", "dark"] as const) {
    const look = forcedColors === "active" ? `forced ${colorScheme} colours` : `the ${colorScheme} theme`;

    test(`arrows can be seen and told apart in ${look}`, async ({ page, browserName }) => {
      test.skip(forcedColors === "active" && browserName === "webkit", "Playwright's WebKit has no forced colours");
      await page.emulateMedia({ colorScheme, forcedColors });
      await predict(page, "4", "0");
      const drawn = await page.locator(".interaction svg").evaluate((svg) => {
        const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
        const luminance = (colour: string) => {
          context.fillStyle = colour;
          context.fillRect(0, 0, 1, 1);
          const [red, green, blue] = [...context.getImageData(0, 0, 1, 1).data].map((byte) =>
            byte / 255 <= 0.04045 ? byte / 255 / 12.92 : ((byte / 255 + 0.055) / 1.055) ** 2.4,
          );
          return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        };
        const paper = luminance(getComputedStyle(document.documentElement).backgroundColor);
        const parts = { a: ".a line", b: ".b line", sum: ".sum line", copy: ".copy line", prediction: ".prediction", axes: ".axes" };
        const labels = { "label a": "text.a", "label b": "text.b", "label sum": "text.sum" };
        const contrast = (selector: string, property: "stroke" | "fill") => {
          const part = luminance(getComputedStyle(svg.querySelector(selector)!)[property]);
          return (Math.max(part, paper) + 0.05) / (Math.min(part, paper) + 0.05);
        };
        const rings = [...document.querySelectorAll("[role=slider] .ring")].map((ring) => {
          const { borderTopColor, borderTopStyle, borderTopWidth, width } = getComputedStyle(ring);
          const part = luminance(borderTopColor);
          return {
            contrast: (Math.max(part, paper) + 0.05) / (Math.min(part, paper) + 0.05),
            thickness: parseFloat(borderTopWidth),
            style: borderTopStyle,
            width,
          };
        });
        return {
          rings,
          contrasts: [
            ...Object.entries(parts).map(([name, selector]) => [name, contrast(selector, "stroke")] as const),
            ...Object.entries(labels).map(([name, selector]) => [name, contrast(selector, "fill")] as const),
          ],
          dashes: [parts.a, parts.b, parts.sum].map((selector) => getComputedStyle(svg.querySelector(selector)!).strokeDasharray),
          labels: [...svg.querySelectorAll("text:not(.tick)")].map((label) => label.textContent),
        };
      });
      for (const [name, contrast] of drawn.contrasts) expect(contrast, name).toBeGreaterThan(name.startsWith("label") ? 4.5 : 3);
      expect(new Set(drawn.dashes).size).toBe(3);
      for (const ring of drawn.rings) {
        expect(ring.contrast).toBeGreaterThan(3);
        expect(ring.thickness).toBeGreaterThanOrEqual(2);
      }
      // Told apart without colour, and both seen at the same place.
      expect(new Set(drawn.rings.map(({ style }) => style)).size).toBe(2);
      expect(new Set(drawn.rings.map(({ width }) => width)).size).toBe(2);
      expect(drawn.labels).toEqual(["a", "b", "a + b"]);
    });
  }
}

for (const colorScheme of ["light", "dark"] as const) {
  test(`has no axe-core violations after a wrong prediction, in the ${colorScheme} theme`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await predict(page, "4", "4");
    await enter(arrow(page, "a").getByLabel("x", { exact: true }), "9");
    const { violations } = await new AxeBuilder({ page }).analyze();
    expect(violations).toEqual([]);
  });
}

test("controls are large enough targets", async ({ page }) => {
  for (const control of await page.locator(".interaction :is(button, input)").all()) {
    const { width, height } = (await control.boundingBox())!;
    expect(Math.min(width, height)).toBeGreaterThanOrEqual(24);
  }
});

for (const width of [320, 1024, 1280]) {
  test(`nothing is lost or cut off after a prediction at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    // A click on the button just after typing must not miss it, because other views grew.
    await predict(page, "4", "4");
    await expect(view(page, "feedback")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const outside = await page.locator(".interaction, .interaction :is(p, li, h3, fieldset, button, input, svg)").evaluateAll(
      (elements) =>
        elements
          .filter((element) => {
            const { left, right } = element.getBoundingClientRect();
            return left < 0 || right > document.documentElement.clientWidth;
          })
          .map((element) => element.outerHTML.slice(0, 100)),
    );
    expect(outside).toEqual([]);
    // On a computer, the drawing and the numbers that change it are seen together.
    if (width >= 1024) {
      const drawing = (await page.locator(".interaction svg").boundingBox())!;
      const controls = (await page.locator(".interaction .controls").boundingBox())!;
      expect(controls.x).toBeGreaterThanOrEqual(drawing.x + drawing.width);
    }
  });
}

test("a button uses the number just typed in its own field", async ({ page }) => {
  await arrow(page, "a").getByLabel("x", { exact: true }).fill("-2");
  await arrow(page, "a").getByRole("button", { name: "Increase x" }).click();
  await expectViews(page, [-1, 2], [-1, 2]);
});

for (const width of [320, 1280]) {
  test(`everything fits with wider text spacing at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    // The spacing that WCAG 1.4.12 names.
    const spacing = "line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important;";
    await page.addStyleTag({ content: `.interaction * { ${spacing} } .interaction p { margin-bottom: 2em !important; }` });
    await enter(arrow(page, "a").getByLabel("x", { exact: true }), "9");
    await predict(page, "4", "4");
    await expect(view(page, "feedback")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    const cutOff = await page.locator(".interaction :is(p:not(.announcement), li, h3, legend, button, input):visible").evaluateAll((elements) =>
      elements.filter((element) => element.scrollWidth > element.clientWidth + 1 && element.clientWidth).map((element) => element.outerHTML),
    );
    expect(cutOff).toEqual([]);
  });
}

/** The still figure and its explanation, which replace the interaction. */
async function expectStillFigure(page: Page) {
  const still = page.locator(".still");
  await expect(still.getByRole("img", { name: "Arrows on a grid" })).toBeVisible();
  await expect(still.locator('[data-arrow="sum"]')).toBeVisible();
  await expect(still).toContainText("Arrow a goes 3 right and 2 up. Arrow b goes 1 left and 2 up. The sum, a + b, goes 2 right and 4 up.");
  await expect(still).toContainText("each component of the sum is that component of a plus that component of b");
  await expect(still.getByRole("math")).toHaveCount(1);
}

test("the link to the still figure does not flash while the page loads", async ({ page }) => {
  await page.route("**/*.js", (route) => route.abort());
  await page.goto("./");
  await expect(page.getByText("The controls are not working.")).toBeHidden();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("a still figure and its explanation replace the interaction", async ({ page }) => {
    await expectStillFigure(page);
    await expect(page.locator(".interaction")).toBeHidden();
  });
});

test("if the scripts fail to load, a link leads to the still figure", async ({ page }) => {
  await page.route("**/*.js", (route) => route.abort());
  await page.goto("./");
  await expect(page.locator(".still")).toBeHidden();
  await expect(page.getByRole("button", { name: "Reset" })).toBeDisabled();
  await page.getByRole("link", { name: "See a still figure" }).click({ timeout: 10_000 });
  await expectStillFigure(page);
});
