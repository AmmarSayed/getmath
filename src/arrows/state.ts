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

export const same = (a: Vector, b: Vector) => a.x === b.x && a.y === b.y;

/** The number nearest to the value from −limit to limit. */
export const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));

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

/** The state with the tip of one arrow at the place nearest to this point, on the grid and within the bounds. */
export function withTip(state: State, arrow: ArrowName, point: Vector): State {
  // Adding 0 turns −0 into 0.
  const nearest = (value: number) => clamp(Math.round(value), arrowLimit) + 0;
  const tip = { x: nearest(point.x), y: nearest(point.y) };
  return same(tip, state[arrow]) ? state : { ...state, [arrow]: tip };
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
  /** The common mistakes that give exactly this prediction. Several can, so none is known to be the cause. */
  readonly mistakes: readonly Mistake[];
}

/** What to say about the submitted prediction, for the arrows that it was for. */
export function feedback(state: State): Feedback | undefined {
  const prediction = wholePrediction(state);
  if (!state.submittedFor || !prediction) return undefined;
  const { a, b } = state.submittedFor;
  const sum = add(a, b);
  const isPredicted = (...points: Vector[]) => points.some((point) => same(prediction, point));
  const results: [Mistake, boolean][] = [
    ["tip of a", isPredicted(a)],
    ["tip of b", isPredicted(b)],
    ["difference", isPredicted({ x: a.x - b.x, y: a.y - b.y }, { x: b.x - a.x, y: b.y - a.y })],
    ["signs", isPredicted({ x: Math.abs(a.x) + Math.abs(b.x), y: Math.abs(a.y) + Math.abs(b.y) })],
  ];
  const mistakes = same(prediction, sum) ? [] : results.filter(([, given]) => given).map(([mistake]) => mistake);
  return { a, b, prediction, sum, right: { x: prediction.x === sum.x, y: prediction.y === sum.y }, mistakes };
}
