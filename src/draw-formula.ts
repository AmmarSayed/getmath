import katex from "katex";

/**
 * Draws a formula. One that KaTeX cannot draw, that is not standard LaTeX, or
 * that has a link, an image or HTML is an error. The formulas of a page are
 * drawn while the site is built, where the error fails the build; those of an
 * interaction are drawn again in the browser when they change.
 *
 * The result holds MathML for assistive technology, and the drawn form, which
 * is hidden from it.
 */
export function drawFormula(source: string, onOwnLine: boolean) {
  return katex.renderToString(source, {
    displayMode: onOwnLine,
    output: "htmlAndMathml",
    throwOnError: true,
    strict: "error",
    // KaTeX would draw such a command's name in red instead of failing.
    trust: ({ command }) => {
      throw new Error(`${command} is not allowed in a formula`);
    },
  });
}
