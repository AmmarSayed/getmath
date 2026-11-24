<script lang="ts">
  import { drawingEdge } from "./Drawing.svelte";
  import { arrowLimit, type ArrowName, type Arrows, type Axis, type Vector } from "./state";
  import { numeral } from "./words";

  interface Props {
    arrows: Arrows;
    describedby: string;
    /** The learner drags the tip of an arrow to a point of the drawing. */
    ondrag: (arrow: ArrowName, point: Vector) => void;
    /** The learner lets go of a tip that is at another place than before. */
    ondrop: () => void;
    /** The learner moves a tip by one step with the keyboard. */
    onstep: (arrow: ArrowName, axis: Axis, step: number) => void;
  }

  const { arrows, describedby, ondrag, ondrop, onstep }: Props = $props();

  const steps: { readonly [key: string]: readonly [Axis, number] } = {
    ArrowLeft: ["x", -1],
    ArrowRight: ["x", 1],
    ArrowDown: ["y", -1],
    ArrowUp: ["y", 1],
  };

  interface Drag {
    readonly pointer: number;
    readonly arrow: ArrowName;
    /** Where the tip was before. */
    readonly from: Vector;
    /** From the tip to the place where it is held, so that a press does not move it. */
    readonly held: Vector;
  }

  let layer = $state<HTMLElement>();
  const tips: { [name in ArrowName]?: HTMLElement } = $state({});
  let drag = $state.raw<Drag>();

  const percent = (distance: number) => `${(100 * distance) / (2 * drawingEdge)}%`;
  /** The value changes only when a drag ends, so that it is read once. */
  const value = (name: ArrowName) => (drag?.arrow === name ? drag.from : arrows[name]);

  function pointAt({ clientX, clientY }: PointerEvent): Vector {
    const { left, top, width } = layer!.getBoundingClientRect();
    const unit = width / (2 * drawingEdge);
    return { x: (clientX - left) / unit - drawingEdge, y: drawingEdge - (clientY - top) / unit };
  }

  function startDrag(event: PointerEvent & { currentTarget: HTMLElement }, pressed: ArrowName) {
    if (drag || !event.isPrimary || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointAt(event);
    const distance = (name: ArrowName) => Math.hypot(point.x - arrows[name].x, point.y - arrows[name].y);
    // Targets of tips that are close to each other overlap.
    const other = pressed === "a" ? "b" : "a";
    const arrow = distance(other) < distance(pressed) ? other : pressed;
    // Before the rest, because leaving a field can still change an arrow.
    tips[arrow]!.focus({ preventScroll: true });
    const from = arrows[arrow];
    drag = { pointer: event.pointerId, arrow, from, held: { x: point.x - from.x, y: point.y - from.y } };
  }

  function moveDrag(event: PointerEvent) {
    if (drag?.pointer !== event.pointerId) return;
    const point = pointAt(event);
    ondrag(drag.arrow, { x: point.x - drag.held.x, y: point.y - drag.held.y });
  }

  function endDrag(event: PointerEvent) {
    if (drag?.pointer !== event.pointerId) return;
    const { arrow, from } = drag;
    drag = undefined;
    if (arrows[arrow].x !== from.x || arrows[arrow].y !== from.y) ondrop();
  }

  function step(event: KeyboardEvent, name: ArrowName) {
    const change = steps[event.key];
    if (!change || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    if (!drag) onstep(name, ...change);
  }
</script>

<!-- Over the drawing, and not in it: an image has no parts for assistive technology, and targets keep their size. -->
<div class="tips" bind:this={layer}>
  {#each ["a", "b"] as const as name (name)}
    {@const { x, y } = arrows[name]}
    <div
      class="tip {name}"
      style:left={percent(drawingEdge + x)}
      style:top={percent(drawingEdge - y)}
      bind:this={tips[name]}
      role="slider"
      tabindex="0"
      aria-label="Tip of arrow {name}"
      aria-valuemin={-arrowLimit}
      aria-valuemax={arrowLimit}
      aria-valuenow={value(name).x}
      aria-valuetext="x = {numeral(value(name).x)}, y = {numeral(value(name).y)}"
      aria-describedby={describedby}
      onkeydown={(event) => step(event, name)}
      onpointerdown={(event) => startDrag(event, name)}
      onpointermove={moveDrag}
      onpointerup={moveDrag}
      onlostpointercapture={endDrag}
      onmousedown={(event) => {
        // The focus is already on the tip that is dragged, which can be the other one.
        if (event.button === 0) event.preventDefault();
      }}
    >
      <span class="ring"></span>
    </div>
  {/each}
</div>

<style>
  .tips {
    position: absolute;
    inset: 0;
    /* Only the tips themselves take the pointer, so that the page scrolls everywhere else. */
    pointer-events: none;
  }

  .tip {
    position: absolute;
    display: grid;
    place-items: center;
    width: 2.75rem;
    height: 2.75rem;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    cursor: grab;
    pointer-events: auto;
    touch-action: none;
    user-select: none;
  }

  .tip:active {
    cursor: grabbing;
  }

  /* Of two sizes, so that both are seen where they are at the same place. */
  .ring {
    box-sizing: border-box;
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid;
    border-radius: 50%;
  }

  .a {
    z-index: 1;
    color: var(--a);
  }

  .b {
    color: var(--b);
  }

  .b .ring {
    width: 2.125rem;
    height: 2.125rem;
    border-style: dashed;
  }

  .tip:focus-visible .ring {
    border-width: 4px;
  }
</style>
