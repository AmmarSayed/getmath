/** The two components of an arrow: `x` is how far right it goes, and `y` how far up. */
export interface Vector {
  readonly x: number;
  readonly y: number;
}

export type Axis = keyof Vector;
export type ArrowName = "a" | "b";
export type Arrows = { readonly [name in ArrowName]: Vector };

/** Each component is a whole number from −4 to 4, so the sum's are from −8 to 8. */
export const arrowLimit = 4;
export const sumLimit = 2 * arrowLimit;

/** The sum is not here: it is calculated, so it cannot disagree with the arrows. */
export interface State extends Arrows {
  readonly prediction: { readonly [axis in Axis]?: number };
  /** The arrows that the prediction was submitted for, once it has been. */
  readonly submittedFor?: Arrows;
}

export const start: State = { a: { x: 3, y: 2 }, b: { x: -1, y: 2 }, prediction: {} };

export function add(a: Vector, b: Vector): Vector {
  return { x: a.x + b.x, y: a.y + b.y };
}

const isWholeUpTo = (limit: number, value: number) => Number.isInteger(value) && Math.abs(value) <= limit;

/** The whole number that the learner typed, or NaN. Both kinds of minus sign count. */
export function readNumber(text: string): number {
  const digits = text.trim().replace("−", "-");
  return /^[+-]?\d+$/.test(digits) ? Number(digits) + 0 : NaN;
}

/** The state with one component of one arrow changed, or undefined if the value is not allowed. */
export function withComponent(state: State, arrow: ArrowName, axis: Axis, value: number): State | undefined {
  if (!isWholeUpTo(arrowLimit, value)) return undefined;
  return { ...state, [arrow]: { ...state[arrow], [axis]: value } };
}

/** The sum of the arrows, or undefined until a prediction is submitted. Every view gets it from here. */
export function visibleSum(state: State): Vector | undefined {
  return state.submittedFor && add(state.a, state.b);
}

/** The prediction, if it has both components. */
function wholePrediction({ prediction: { x, y } }: State): Vector | undefined {
  return x === undefined || y === undefined ? undefined : { x, y };
}

/**
 * The state with one component of the prediction changed, or emptied, or undefined
 * if the value is not allowed or the prediction has been submitted.
 */
export function withPrediction(state: State, axis: Axis, value: number | undefined): State | undefined {
  if (state.submittedFor || (value !== undefined && !isWholeUpTo(sumLimit, value))) return undefined;
  return { ...state, prediction: { ...state.prediction, [axis]: value } };
}

/** The state with the prediction submitted, or undefined if it is incomplete or was submitted before. */
export function submit(state: State): State | undefined {
  if (state.submittedFor || !wholePrediction(state)) return undefined;
  return { ...state, submittedFor: { a: state.a, b: state.b } };
}

const same = (a: Vector, b: Vector) => a.x === b.x && a.y === b.y;

/** The prediction for the arrows as they are now, or undefined. */
export function shownPrediction(state: State): Vector | undefined {
  const { a, b, submittedFor } = state;
  if (submittedFor && !(same(a, submittedFor.a) && same(b, submittedFor.b))) return undefined;
  return wholePrediction(state);
}

export type Mistake = "tip of a" | "tip of b" | "difference" | "signs";

export interface Feedback extends Arrows {
  readonly prediction: Vector;
  readonly sum: Vector;
  /** Which components of the prediction are right. */
  readonly right: { readonly [axis in Axis]: boolean };
  /** A common mistake that gives exactly this prediction. */
  readonly mistake: Mistake | undefined;
}

/** What to say about the submitted prediction, for the arrows that it was for. */
export function feedback(state: State): Feedback | undefined {
  const prediction = wholePrediction(state);
  if (!state.submittedFor || !prediction) return undefined;
  const { a, b } = state.submittedFor;
  const sum = add(a, b);
  const results: [Mistake, Vector][] = [
    ["tip of a", a],
    ["tip of b", b],
    ["difference", { x: a.x - b.x, y: a.y - b.y }],
    ["difference", { x: b.x - a.x, y: b.y - a.y }],
    ["signs", { x: Math.abs(a.x) + Math.abs(b.x), y: Math.abs(a.y) + Math.abs(b.y) }],
  ];
  const mistake = same(prediction, sum) ? undefined : results.find(([, result]) => same(prediction, result))?.[0];
  return { a, b, prediction, sum, right: { x: prediction.x === sum.x, y: prediction.y === sum.y }, mistake };
}
