import type { SatteriProcessorOptions } from "@astrojs/markdown-satteri";
import { drawFormula } from "./draw-formula";

/**
 * A formula on its own line scrolls when it is too wide for the screen. It can
 * take the keyboard focus, because not every browser lets the keyboard scroll
 * what cannot be focused.
 */
function drawOnOwnLine(source: string) {
  return `<div class="formula" role="group" aria-label="Formula" tabindex="0">${drawFormula(source, true)}</div>`;
}

/** The Markdown plugins that draw `$…$` and `$$…$$`. */
export const formulas: SatteriProcessorOptions["mdastPlugins"] = [
  {
    name: "formulas",
    inlineMath: ({ value }) => ({ raw: drawFormula(value, false), mdxExpressions: false }),
    math: ({ value }) => ({ raw: drawOnOwnLine(value), mdxExpressions: false }),
  },
];
