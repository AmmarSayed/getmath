import type { SatteriProcessorOptions } from "@astrojs/markdown-satteri";
import katex from "katex";

/**
 * Draws a formula while the site is built, so that it needs no JavaScript in
 * the browser. A formula that KaTeX cannot draw, or that is not standard
 * LaTeX, fails the build.
 *
 * The result holds MathML for assistive technology, and the drawn form, which
 * is hidden from it.
 */
function draw(source: string, onOwnLine: boolean) {
  return katex.renderToString(source, {
    displayMode: onOwnLine,
    output: "htmlAndMathml",
    throwOnError: true,
    strict: "error",
  });
}

/**
 * A formula on its own line scrolls when it is too wide for the screen. It can
 * take the keyboard focus, because not every browser lets the keyboard scroll
 * what cannot be focused.
 */
function drawOnOwnLine(source: string) {
  return `<div class="formula" role="group" aria-label="Formula" tabindex="0">${draw(source, true)}</div>`;
}

/** The Markdown plugins that draw `$…$` and `$$…$$`. */
export const formulas: SatteriProcessorOptions["mdastPlugins"] = [
  {
    name: "formulas",
    inlineMath: ({ value }) => ({ raw: draw(value, false), mdxExpressions: false }),
    math: ({ value }) => ({ raw: drawOnOwnLine(value), mdxExpressions: false }),
  },
];
