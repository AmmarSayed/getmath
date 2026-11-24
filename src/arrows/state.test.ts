import { describe, expect, test } from "vitest";
import {
  feedback,
  readNumber,
  shownPrediction,
  start,
  submit,
  sumLimit,
  visibleSum,
  withComponent,
  withPrediction,
  withTip,
  type Arrows,
  type State,
} from "./state";

/** A state with these arrows. */
function withArrows({ a, b }: Arrows): State {
  let state = withComponent(start, "a", "x", a.x)!;
  state = withComponent(state, "a", "y", a.y)!;
  state = withComponent(state, "b", "x", b.x)!;
  return withComponent(state, "b", "y", b.y)!;
}

/** The state after the learner predicts and submits. */
function predict(state: State, x: number, y: number): State {
  return submit(withPrediction(withPrediction(state, "x", x)!, "y", y)!)!;
}

describe("reading a number", () => {
  test.each([
    ["3", 3],
    [" -2 ", -2],
    ["−2", -2],
    ["+4", 4],
    ["007", 7],
    ["-0", 0],
  ])("%j is %d", (text, number) => {
    expect(readNumber(text)).toBe(number);
  });

  test.each(["", " ", "x", "1.5", "1e2", "0x1", "--1", "1 2", "Infinity", "½"])("%j is not a whole number", (text) => {
    expect(readNumber(text)).toBeNaN();
  });
});

describe("changing an arrow", () => {
  test("one component of one arrow changes, and the state before stays as it was", () => {
    const changed = withComponent(start, "b", "y", -4)!;
    expect(changed.a).toEqual({ x: 3, y: 2 });
    expect(changed.b).toEqual({ x: -1, y: -4 });
    expect(start.b).toEqual({ x: -1, y: 2 });
  });

  test.each([-4, 0, 4])("%d is accepted", (value) => {
    expect(withComponent(start, "a", "x", value)?.a).toEqual({ x: value, y: 2 });
  });

  test.each([-5, 5, 1.5, NaN, Infinity])("%d is refused", (value) => {
    expect(withComponent(start, "a", "x", value)).toBeUndefined();
  });
});

describe("moving a tip", () => {
  test.each([
    ["onto the grid", { x: 1.4, y: -2.6 }, { x: 1, y: -3 }],
    ["not beyond the bounds", { x: 4.6, y: -100 }, { x: 4, y: -4 }],
    ["to the start, with no negative zero", { x: -0.3, y: 0.3 }, { x: 0, y: 0 }],
  ])("it goes %s", (_, point, tip) => {
    const moved = withTip(start, "b", point);
    expect(moved.b).toEqual(tip);
    expect(moved.a).toEqual({ x: 3, y: 2 });
    expect(start.b).toEqual({ x: -1, y: 2 });
  });

  test("the state stays the same while the tip stays at its place", () => {
    expect(withTip(start, "a", { x: 3.4, y: 1.6 })).toBe(start);
  });

  test("the result is the same as with the components", () => {
    const submitted = predict(start, 2, 4);
    const components = withComponent(withComponent(submitted, "a", "x", -4)!, "a", "y", 1)!;
    expect(withTip(submitted, "a", { x: -4, y: 1 })).toEqual(components);
  });
});

test("the sum is hidden at the start", () => {
  expect(visibleSum(start)).toBeUndefined();
});

describe("predicting", () => {
  test.each([-8, 0, 8, undefined])("%s is accepted", (value) => {
    expect(withPrediction(start, "x", value)?.prediction).toEqual({ x: value });
  });

  test.each([-9, 9, 0.5, NaN])("%d is refused", (value) => {
    expect(withPrediction(start, "x", value)).toBeUndefined();
  });

  test("an incomplete prediction cannot be submitted", () => {
    expect(submit(start)).toBeUndefined();
    expect(submit(withPrediction(start, "x", 2)!)).toBeUndefined();
    expect(submit(withPrediction(start, "y", 4)!)).toBeUndefined();
  });

  test("the sum appears only when a prediction is submitted", () => {
    const predicted = withPrediction(withPrediction(start, "x", 0)!, "y", 0)!;
    expect(visibleSum(predicted)).toBeUndefined();
    expect(visibleSum(submit(predicted)!)).toEqual({ x: 2, y: 4 });
  });

  test("a submitted prediction cannot be changed or submitted again", () => {
    const submitted = predict(start, 2, 4);
    expect(withPrediction(submitted, "x", 3)).toBeUndefined();
    expect(submit(submitted)).toBeUndefined();
  });
});

describe("the sum", () => {
  test("follows the arrows after the prediction is submitted", () => {
    const changed = withComponent(predict(start, 2, 4), "b", "x", -4)!;
    expect(visibleSum(changed)).toEqual({ x: -1, y: 4 });
  });

  test.each([
    [{ a: { x: 4, y: 4 }, b: { x: 4, y: 4 } }, { x: 8, y: 8 }],
    [{ a: { x: -4, y: -4 }, b: { x: -4, y: -4 } }, { x: -8, y: -8 }],
    [{ a: { x: 4, y: -4 }, b: { x: -4, y: 4 } }, { x: 0, y: 0 }],
  ])("%j fits in the drawing at the bounds", (arrows, sum) => {
    expect(visibleSum(predict(withArrows(arrows), 0, 0))).toEqual(sum);
    expect(sumLimit).toBe(8);
  });
});

describe("feedback", () => {
  test("is empty until a prediction is submitted", () => {
    expect(feedback(start)).toBeUndefined();
  });

  test("a right prediction", () => {
    expect(feedback(predict(start, 2, 4))).toMatchObject({ sum: { x: 2, y: 4 }, right: { x: true, y: true }, mistakes: [] });
  });

  test("a prediction with one right component", () => {
    expect(feedback(predict(start, 2, 5))).toMatchObject({ right: { x: true, y: false }, mistakes: [] });
  });

  test.each([
    ["the tip of a", { x: 3, y: 2 }, "tip of a"],
    ["the tip of b", { x: -1, y: 2 }, "tip of b"],
    ["a minus b", { x: 4, y: 0 }, "difference"],
    ["b minus a", { x: -4, y: 0 }, "difference"],
    ["the components without their minus signs", { x: 4, y: 4 }, "signs"],
  ])("%s is recognised", (_, prediction, mistake) => {
    expect(feedback(predict(start, prediction.x, prediction.y))?.mistakes).toEqual([mistake]);
  });

  test("a right prediction is never called a mistake", () => {
    // Here the sum is also the tip of a and a minus b.
    const state = withArrows({ a: { x: 1, y: 2 }, b: { x: 0, y: 0 } });
    expect(feedback(predict(state, 1, 2))?.mistakes).toEqual([]);
  });

  test.each([
    [{ a: { x: 3, y: 2 }, b: { x: -1, y: -2 } }, { x: 4, y: 4 }, ["difference", "signs"]],
    [{ a: { x: 4, y: 2 }, b: { x: 2, y: 1 } }, { x: 2, y: 1 }, ["tip of b", "difference"]],
    [{ a: { x: 1, y: 2 }, b: { x: 1, y: 2 } }, { x: 0, y: 0 }, ["difference"]],
  ])("%j and the prediction %j: every mistake that gives it is named once", (arrows, { x, y }, mistakes) => {
    expect(feedback(predict(withArrows(arrows), x, y))?.mistakes).toEqual(mistakes);
  });

  test("stays about the arrows that the prediction was for", () => {
    const submitted = predict(start, 4, 4);
    const changed = withComponent(submitted, "b", "x", 1)!;
    expect(feedback(changed)).toEqual(feedback(submitted));
  });
});

describe("the prediction in the drawing", () => {
  test("is shown when it is complete", () => {
    expect(shownPrediction(withPrediction(start, "x", 1)!)).toBeUndefined();
    expect(shownPrediction(predict(start, 1, 0))).toEqual({ x: 1, y: 0 });
  });

  test("is left out while the arrows differ from those it was for", () => {
    const changed = withComponent(predict(start, 1, 0), "a", "y", 3)!;
    expect(shownPrediction(changed)).toBeUndefined();
    expect(shownPrediction(withComponent(changed, "a", "y", 2)!)).toEqual({ x: 1, y: 0 });
  });
});
