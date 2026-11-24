// PROTOTYPE, throwaway (issue #14). The lesson text of lesson.mdx, once, for all three looks.
import { drawFormula, drawFormulaOnOwnLine as display } from "../draw-formula";

const m = (source: string) => drawFormula(source, false);

export const title = "Two steps, one arrow";

export const puzzle = [
  `A delivery robot obeys two commands. The first moves it 3 tiles right and 2 tiles up. The second moves it 1 tile left and 2 tiles up. It starts on tile ${m("(0, 0)")}.`,
  `<strong>Before you read on:</strong> on which tile does it stop? Would it stop on a different tile if it obeyed the second command first?`,
];

export const arrows = {
  before: `Draw each command as an arrow. Write an arrow as two numbers, its <strong>components</strong>: ${m("x")}, how far right, and ${m("y")}, how far up. A step to the left is a negative ${m("x")}.`,
  formula: display(String.raw`\mathbf{a} = \begin{bmatrix} 3 \\ 2 \end{bmatrix} \qquad \mathbf{b} = \begin{bmatrix} -1 \\ 2 \end{bmatrix}`),
  after: `The letter <strong>a</strong> is bold to show that it names an arrow and not a single number.`,
};

export const tryIt = `Set the two arrows to any commands you like. Say where the robot stops before you look.`;

export const why = {
  before: `Steps to the right and steps up do not disturb each other. Moving up never changes how far right you are. So count each kind separately:`,
  formula: display(String.raw`\mathbf{a} + \mathbf{b} = \begin{bmatrix} 3 + (-1) \\ 2 + 2 \end{bmatrix} = \begin{bmatrix} 2 \\ 4 \end{bmatrix}`),
  after: `The robot stops on tile ${m("(2, 4)")}. The order does not matter, because ${m("3 + (-1) = (-1) + 3")} and ${m("2 + 2")} is the same either way round.`,
  key: `<strong>Key idea.</strong> To add two arrows, add their ${m("x")} components, and add their ${m("y")} components.`,
  mistake: `<strong>A common mistake.</strong> The length of the sum is usually <em>not</em> the sum of the lengths. Walking 3 right and then 3 left is a walk of 6 tiles, yet it ends where it began.`,
};

export const python = {
  intro: "Python can hold an arrow as a list. <code>a[0]</code> is the first number of the list and <code>a[1]</code> is the second.",
  code: "a = [3, 2]\nb = [-1, 2]\nprint([a[0] + b[0], a[1] + b[1]])",
  output: "[2, 4]",
  label: "Expected output. No code runs here.",
};

export const exercises = [
  {
    question: `The robot starts at ${m("(0, 0)")} and obeys ${m("(4, -1)")} and then ${m("(-2, 3)")}. Where does it stop?`,
    hint: "Work out the total right, then the total up.",
    answer: m(String.raw`(4 + (-2),\ -1 + 3) = (2, 2)`) + ".",
  },
  {
    question: `Find the one command that undoes ${m("(3, 2)")}.`,
    hint: `After both commands the robot must be back on ${m("(0, 0)")}.`,
    answer: `${m("(-3, -2)")}, because ${m("3 + (-3) = 0")} and ${m("2 + (-2) = 0")}.`,
  },
];

export const notes = {
  arrows: "An arrow says how far and which way. It does not say where you start.",
  why: `This is the first result of the book that you can prove yourself. It rests on one fact: for ordinary numbers, ${m("p + q = q + p")}.`,
};

export const mark = "Prototype, not a lesson";
