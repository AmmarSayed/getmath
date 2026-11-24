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

/** A number as it is added: negative ones in brackets. */
const addend = (value: number) => (value < 0 ? `(${numeral(value)})` : numeral(value));

export function explain({ a, b, sum, prediction, right }: Feedback, axis: Axis): string {
  const result = right[axis] ? "You had this right." : `You predicted ${numeral(prediction[axis])}.`;
  return `${numeral(a[axis])} + ${addend(b[axis])} = ${numeral(sum[axis])}. ${result}`;
}

export const mistakes: Record<Mistake, string> = {
  "tip of a": "You predicted the tip of a by itself. The sum goes on from there, along b.",
  "tip of b": "You predicted the tip of b by itself. The sum goes along a first, and then along b.",
  difference: "You predicted what subtracting gives. Adding follows both arrows the way they point.",
  signs: "You predicted what you get without the minus signs. A minus sign means going left or down.",
};

/** The formula in LaTeX. Like every other view, it has no sum to show before the prediction. */
export function formula(state: State): string {
  const { a, b } = state;
  const sum = visibleSum(state);
  const column = (x: string | number, y: string | number) => `\\begin{bmatrix} ${x} \\\\ ${y} \\end{bmatrix}`;
  const added = (axis: Axis) => `${a[axis]} + ${b[axis] < 0 ? `(${b[axis]})` : b[axis]}`;
  const result = sum ? `${column(added("x"), added("y"))} = ${column(sum.x, sum.y)}` : column("?", "?");
  return `\\mathbf{a} + \\mathbf{b} = ${column(a.x, a.y)} + ${column(b.x, b.y)} = ${result}`;
}
