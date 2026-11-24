<script lang="ts">
  import { add, sumLimit, type Arrows, type Vector } from "./state";

  interface Props {
    arrows: Arrows;
    sum: Vector | undefined;
    prediction: Vector | undefined;
    describedby: string;
  }

  const { arrows, sum, prediction, describedby }: Props = $props();
  const { a, b } = $derived(arrows);

  const origin: Vector = { x: 0, y: 0 };
  const edge = sumLimit + 2;
  const steps = Array.from({ length: 2 * sumLimit + 1 }, (_, i) => i - sumLimit);
  const grid = steps.map((i) => `M${i} ${-sumLimit}V${sumLimit}M${-sumLimit} ${i}H${sumLimit}`).join("");
  const ticks = steps.filter((i) => i && i % 4 === 0);

  const length = ({ x, y }: Vector) => Math.hypot(x, y);

  /** The label of an arrow, beside its middle and on the side away from the other arrow. */
  function beside(arrow: Vector, left: boolean): Vector {
    const side = (left ? 0.8 : -0.8) / (length(arrow) || 1);
    const still = length(arrow) ? 0 : left ? -0.8 : 0.8;
    return { x: arrow.x / 2 - arrow.y * side + still, y: arrow.y / 2 + arrow.x * side };
  }

  const turnsLeft = $derived(a.x * b.y - a.y * b.x > 0);
  const label = $derived({ a: beside(a, !turnsLeft), b: beside(b, turnsLeft) });

  const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
  const sumLabel = $derived(sum && { x: clamp(sum.x, sumLimit), y: sum.y + (sum.y < 0 ? -0.9 : 0.9) });
</script>

<!-- The drawing's y goes down, so every y is negated. -->
{#snippet arrow(name: string, from: Vector, to: Vector)}
  {@const along = { x: to.x - from.x, y: to.y - from.y }}
  {@const size = length(along)}
  <g class="arrow {name}" data-arrow={name}>
    {#if size}
      {@const unit = { x: along.x / size, y: along.y / size }}
      {@const neck = { x: to.x - 0.7 * unit.x, y: to.y - 0.7 * unit.y }}
      <line x1={from.x} y1={-from.y} x2={neck.x} y2={-neck.y} />
      <polygon
        points="{to.x},{-to.y} {neck.x - 0.35 * unit.y},{-neck.y - 0.35 * unit.x} {neck.x + 0.35 * unit.y},{-neck.y + 0.35 * unit.x}"
      />
    {:else}
      <circle cx={to.x} cy={-to.y} r="0.3" />
    {/if}
  </g>
{/snippet}

<svg viewBox="{-edge} {-edge} {2 * edge} {2 * edge}" role="img" aria-label="Arrows on a grid" aria-describedby={describedby}>
  <path class="grid" d={grid} />
  <path class="axes" d="M{-sumLimit} 0H{sumLimit}M0 {-sumLimit}V{sumLimit}" />
  {#each ticks as tick (tick)}
    <text class="tick" x={tick} y="0.7">{tick < 0 ? `−${-tick}` : tick}</text>
    <text class="tick" x="-0.6" y={-tick}>{tick < 0 ? `−${-tick}` : tick}</text>
  {/each}
  <text class="tick" x={sumLimit + 0.8} y="0">x</text>
  <text class="tick" x="0" y={-sumLimit - 0.8}>y</text>

  {#if sum}
    {@render arrow("sum", origin, sum)}
    {#if length(a) && length(b)}
      {@render arrow("copy", a, add(a, b))}
    {/if}
  {/if}
  {@render arrow("a", origin, a)}
  {@render arrow("b", origin, b)}
  {#if prediction}
    {@const { x, y } = prediction}
    <path class="prediction" data-x={x} data-y={y} d="M{x - 0.4} {-y - 0.4}l.8 .8m0 -.8l-.8 .8" />
  {/if}

  <text class="a" x={label.a.x} y={-label.a.y}>a</text>
  <text class="b" x={label.b.x} y={-label.b.y}>b</text>
  {#if sumLabel}
    <text class="sum" x={sumLabel.x} y={-sumLabel.y}>a + b</text>
  {/if}
</svg>

<style>
  svg {
    display: block;
    width: 100%;
    max-width: 32rem;
    margin: 0 auto;
    --a: light-dark(#0b4fb3, #9cc3ff);
    --b: light-dark(#a03c00, #ffb37a);
    --sum: light-dark(#6b2fa0, #d4b0ff);
    --ink: light-dark(#1b1b1b, #e4e6ea);
    --faint: light-dark(#d5d8dd, #3a3f4a);
    --paper: light-dark(#fff, #16181d);
  }

  .grid,
  .axes {
    fill: none;
    stroke: var(--faint);
    stroke-width: 0.04;
  }

  .axes {
    stroke: var(--ink);
  }

  .arrow line {
    stroke: currentColor;
    stroke-width: 0.16;
  }

  .arrow polygon,
  .arrow circle {
    fill: currentColor;
  }

  .a {
    color: var(--a);
  }

  .b,
  .copy {
    color: var(--b);
  }

  .b line {
    stroke-dasharray: 0.5 0.25;
  }

  .copy line {
    stroke-width: 0.08;
    stroke-dasharray: 0.2 0.2;
  }

  .sum {
    color: var(--sum);
  }

  .sum line {
    stroke-width: 0.3;
    stroke-dasharray: 0 0.5;
    stroke-linecap: round;
  }

  .prediction {
    fill: none;
    stroke: var(--ink);
    stroke-width: 0.14;
  }

  text {
    fill: currentColor;
    stroke: var(--paper);
    stroke-width: 0.3;
    paint-order: stroke;
    font-size: 1.15px;
    font-weight: bold;
    text-anchor: middle;
    dominant-baseline: central;
  }

  .tick {
    color: var(--ink);
    font-size: 0.85px;
    font-weight: normal;
  }

  /* Browsers leave the colours of drawings alone, so the drawing takes the system's. */
  @media (forced-colors: active) {
    svg {
      --a: CanvasText;
      --b: CanvasText;
      --sum: CanvasText;
      --ink: CanvasText;
      --faint: GrayText;
      --paper: Canvas;
    }
  }
</style>
