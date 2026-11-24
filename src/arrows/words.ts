import { arrowLimit, sumLimit, type Axis, type Feedback, type Mistake, type State, type Vector, visibleSum } from "./state";

/** A number with a real minus sign, which screen readers do not skip. */
export const numeral = (value: number | undefined) => (value === undefined ? "" : String(value).replace("-", "−"));

export const pair = ({ x, y }: Vector) => `(${numeral(x)}, ${numeral(y)})`;

const range = (limit: number) => `a whole number from ${numeral(-limit)} to ${limit}`;
export const arrowRange = range(arrowLimit);
export const predictionRange = range(sumLimit);

/** Such as "3 right and 2 up". */
export function moves({ x, y }: Vector): string {
  const parts = [
    x && `${Math.abs(x)} ${x > 0 ? "right" : "left"}`,
    y && `${Math.abs(y)} ${y > 0 ? "up" : "down"}`,
  ].filter(Boolean);
  return parts.join(" and ") || "nowhere";
}

/** Such as "3 + (−1)". */
const added = (a: Vector, b: Vector, axis: Axis) =>
  `${numeral(a[axis])} + ${b[axis] < 0 ? `(${numeral(b[axis])})` : numeral(b[axis])}`;

export function explain({ a, b, sum, prediction, right }: Feedback, axis: Axis): string {
  const result = right[axis] ? "You had this right." : `You predicted ${numeral(prediction[axis])}.`;
  return `${added(a, b, axis)} = ${numeral(sum[axis])}. ${result}`;
}

export const mistakes: Record<Mistake, string> = {
  "tip of a": "This is the tip of a by itself. The sum goes on from there, along b.",
  "tip of b": "This is the tip of b by itself. The sum goes along a as well.",
  difference: "Subtracting one arrow from the other gives this point. Adding follows both arrows the way they point.",
  signs: "Leaving out the minus signs gives this point. A minus sign means going left or down.",
};

/** The formula in LaTeX. Like every other view, it has no sum to show before the prediction. */
export function formula(state: State): string {
  const { a, b } = state;
  const sum = visibleSum(state);
  const column = (x: string, y: string) => `\\begin{bmatrix} ${x} \\\\ ${y} \\end{bmatrix}`;
  const vector = ({ x, y }: Vector) => column(numeral(x), numeral(y));
  const result = sum ? `${column(added(a, b, "x"), added(a, b, "y"))} = ${vector(sum)}` : column("?", "?");
  return `\\mathbf{a} + \\mathbf{b} = ${vector(a)} + ${vector(b)} = ${result}`;
}
