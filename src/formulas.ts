import type { SatteriProcessorOptions } from "@astrojs/markdown-satteri";
import { drawFormula, drawFormulaOnOwnLine } from "./draw-formula";

/** The Markdown plugins that draw `$…$` and `$$…$$`. */
export const formulas: SatteriProcessorOptions["mdastPlugins"] = [
  {
    name: "formulas",
    inlineMath: ({ value }) => ({ raw: drawFormula(value, false), mdxExpressions: false }),
    math: ({ value }) => ({ raw: drawFormulaOnOwnLine(value), mdxExpressions: false }),
  },
];
