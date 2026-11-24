<script lang="ts">
  import { onMount, tick } from "svelte";
  import { drawFormulaOnOwnLine } from "../draw-formula";
  import Drawing from "./Drawing.svelte";
  import {
    add,
    feedback,
    readNumber,
    shownPrediction,
    start,
    submit,
    visibleSum,
    withComponent,
    withPrediction,
    type ArrowName,
    type Axis,
  } from "./state";
  import { arrowRange, explain, formula, mistakes, moves, numeral, pair, predictionRange } from "./words";

  const id = $props.id();
  const axes = ["x", "y"] as const;
  const names = ["a", "b"] as const;

  let current = $state.raw(start);
  // What was refused in each place, until a value is accepted in the same field.
  type Place = ArrowName | "prediction";
  let problems = $state.raw<{ readonly [place in Place]?: { axis?: Axis; text: string } }>({});
  // A new object each time, so that the same words are announced again.
  let announcement = $state.raw({ text: "" });
  // The page is built with the controls off and the still figure in place.
  let live = $state(false);

  const sum = $derived(visibleSum(current));
  const prediction = $derived(shownPrediction(current));
  const answer = $derived(feedback(current));

  // For the still figure, which shows the start as it is after a right prediction.
  const startSum = add(start.a, start.b);
  const still = submit(withPrediction(withPrediction(start, "x", startSum.x)!, "y", startSum.y)!)!;

  let verdict = $state<HTMLElement>();
  const predictionFields: { [axis in Axis]?: HTMLInputElement } = $state({});
  // Whether the key or click that is still being handled had a prediction refused.
  // The same key or click must not submit the prediction before it.
  let justRefused = false;

  onMount(() => {
    live = true;
  });

  const announce = (text: string) => {
    announcement = { text };
  };

  function refuse(place: Place, axis: Axis, range: string, kept: number | undefined) {
    const text = `${axis} must be ${range}. It is still ${numeral(kept) || "empty"}.`;
    problems = { ...problems, [place]: { axis, text } };
    announce(text);
  }

  /** Takes the problem of this field away. The problem of an incomplete prediction goes when both numbers are there. */
  function accept(place: Place, axis: Axis) {
    const problem = problems[place];
    if (problem?.axis ? problem.axis === axis : prediction) problems = { ...problems, [place]: undefined };
  }

  function setComponent(arrow: ArrowName, axis: Axis, value: number) {
    const before = current[arrow][axis];
    const next = withComponent(current, arrow, axis, value);
    if (!next) {
      refuse(arrow, axis, arrowRange, before);
      return;
    }
    accept(arrow, axis);
    if (value === before) return;
    current = next;
    announce(`Arrow ${arrow} is ${pair(current[arrow])}.${sum ? ` The sum is ${pair(sum)}.` : ""}`);
  }

  function readComponent(arrow: ArrowName, axis: Axis, field: HTMLInputElement) {
    setComponent(arrow, axis, readNumber(field.value));
    field.value = numeral(current[arrow][axis]);
  }

  function readPrediction(axis: Axis, field: HTMLInputElement) {
    const next = withPrediction(current, axis, field.value.trim() === "" ? undefined : readNumber(field.value));
    if (next) {
      current = next;
      accept("prediction", axis);
      announce("");
    } else {
      justRefused = true;
      refuse("prediction", axis, predictionRange, current.prediction[axis]);
    }
    field.value = numeral(current.prediction[axis]);
  }

  async function submitPrediction(event: SubmitEvent) {
    event.preventDefault();
    // In case a browser submits before it says that a field has changed.
    for (const axis of axes) {
      const field = predictionFields[axis]!;
      if (field.value !== numeral(current.prediction[axis])) readPrediction(axis, field);
    }
    if (justRefused) {
      justRefused = false;
      return;
    }
    const next = submit(current);
    if (next) {
      current = next;
      problems = { ...problems, prediction: undefined };
      announce("");
      await tick();
      // Moving the focus here also announces the result.
      verdict?.focus();
      return;
    }
    const text = "Enter both numbers of your prediction.";
    problems = { ...problems, prediction: { text } };
    await tick();
    const field = predictionFields[axes.find((axis) => current.prediction[axis] === undefined)!]!;
    // Moving the focus to the field also announces the problem, which describes it.
    if (document.activeElement === field) announce(text);
    else field.focus();
  }

  function reset() {
    current = start;
    problems = {};
    justRefused = false;
    announce("Back at the start. The sum is hidden until you submit a prediction.");
  }

  function startGesture() {
    justRefused = false;
  }
</script>

<svelte:window onkeydowncapture={startGesture} onpointerdowncapture={startGesture} />

{#snippet key()}
  <ul class="key">
    <li><b>a</b>: solid line</li>
    <li><b>b</b>: dashed line</li>
    <li><b>a + b</b>: dotted line, with a thin copy of <b>b</b></li>
  </ul>
{/snippet}

{#snippet reason()}
  <p>
    Walk along <b>a</b>, then along <b>b</b>. The steps to the right add up, and so do the steps up, with left and down
    counted as negative. So each component of the sum is that component of <b>a</b> plus that component of <b>b</b>.
  </p>
{/snippet}

<div class="interaction">
  <div class="views">
    <Drawing arrows={current} {sum} {prediction} describedby="{id}-words" />
    {@render key()}
    <p id="{id}-words" data-view="words">
      Arrow <b>a</b> goes {moves(current.a)}. Arrow <b>b</b> goes {moves(current.b)}.
      {#if sum}The sum, <b>a + b</b>, goes {moves(sum)}.{:else}The sum is hidden until you submit a prediction.{/if}
      {#if answer && prediction}Your prediction, marked ×, ends at {pair(prediction)}.{/if}
    </p>
  </div>

  <div class="controls">
    {#if answer}
      <div data-view="feedback">
        <h3 tabindex="-1" bind:this={verdict}>
          {answer.right.x && answer.right.y ? "Yes" : "Not quite"}: {pair(answer.a)} + {pair(answer.b)} = {pair(answer.sum)}
        </h3>
        <p>You predicted {pair(answer.prediction)} for <b>a</b> = {pair(answer.a)} and <b>b</b> = {pair(answer.b)}.</p>
        <ul>
          {#each axes as axis (axis)}
            <li>{axis}: {explain(answer, axis)}</li>
          {/each}
        </ul>
        {#each answer.mistakes as mistake (mistake)}
          <p>{mistakes[mistake]}</p>
        {/each}
        {@render reason()}
      </div>
    {:else}
      <form onsubmit={submitPrediction} novalidate>
        <fieldset disabled={!live}>
          <legend>1. Predict where the sum ends</legend>
          <p id="{id}-prediction-hint">Each component is {predictionRange}.</p>
          <div class="row">
            {#each axes as axis (axis)}
              <label for="{id}-prediction-{axis}">{axis}</label>
              <input
                id="{id}-prediction-{axis}"
                bind:this={predictionFields[axis]}
                value={numeral(current.prediction[axis])}
                onchange={(event) => readPrediction(axis, event.currentTarget)}
                aria-describedby="{id}-prediction-hint {id}-prediction-problem"
                autocomplete="off"
                size="3"
              />
            {/each}
            <button>Submit prediction</button>
          </div>
          <!-- Below the button, and with room for its longest text, so that a click just after typing is not lost. -->
          <p class="message" id="{id}-prediction-problem">
            {#if problems.prediction}<b>{problems.prediction.text}</b>
            {:else if prediction}Your prediction is marked × at {pair(prediction)}.{/if}
          </p>
        </fieldset>
      </form>
    {/if}

    <h3>{answer ? "Change the arrows, and watch what else changes" : "2. Change the arrows"}</h3>
    <p id="{id}-arrow-hint">Each component is {arrowRange}.</p>
    {#each names as name (name)}
      <fieldset disabled={!live}>
        <legend>Arrow <b>{name}</b></legend>
        <div class="sides">
          <div>
            {#each axes as axis (axis)}
              {@const value = current[name][axis]}
              <div class="row">
                <label for="{id}-{name}-{axis}">{axis}</label>
                <button
                  type="button"
                  aria-label="Decrease {axis}"
                  aria-disabled={!withComponent(current, name, axis, value - 1)}
                  onclick={() => setComponent(name, axis, value - 1)}>−</button
                >
                <input
                  id="{id}-{name}-{axis}"
                  value={numeral(value)}
                  onchange={(event) => readComponent(name, axis, event.currentTarget)}
                  aria-describedby="{id}-arrow-hint {id}-{name}-problem"
                  autocomplete="off"
                  size="3"
                />
                <button
                  type="button"
                  aria-label="Increase {axis}"
                  aria-disabled={!withComponent(current, name, axis, value + 1)}
                  onclick={() => setComponent(name, axis, value + 1)}>+</button
                >
              </div>
            {/each}
          </div>
          <p class="message" id="{id}-{name}-problem"><b>{problems[name]?.text}</b></p>
        </div>
      </fieldset>
    {/each}

    <p data-view="numbers">
      Sum <b>a + b</b>: {#if sum}x = {numeral(sum.x)}, y = {numeral(sum.y)}{:else}x = ?, y = ?{/if}
    </p>
    <div data-view="formula">{@html drawFormulaOnOwnLine(formula(current))}</div>
    <fieldset class="plain" disabled={!live}>
      <button type="button" onclick={reset}>Reset</button>
    </fieldset>
    {#if !live}
      <p class="late">The controls are not working. <a href="#{id}-still">See a still figure</a> instead.</p>
    {/if}
  </div>

  <p class="announcement" role="status">{#key announcement}<span>{announcement.text}</span>{/key}</p>
</div>

{#if !live}
  <div class="still" id="{id}-still">
    <Drawing arrows={still} sum={visibleSum(still)} prediction={undefined} describedby="{id}-still-words" />
    {@render key()}
    <p id="{id}-still-words">
      Arrow <b>a</b> goes {moves(still.a)}. Arrow <b>b</b> goes {moves(still.b)}. The sum, <b>a + b</b>, goes {moves(startSum)}.
    </p>
    {@html drawFormulaOnOwnLine(formula(still))}
    {@render reason()}
  </div>
{/if}

<style>
  .interaction {
    position: relative;
  }

  /* Wider than the text, so that the drawing and the controls are seen together. */
  @media (min-width: 64rem) {
    .interaction {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      width: 60rem;
      margin-left: calc((100% - 60rem) / 2);
    }

    .views {
      position: sticky;
      top: 0;
      align-self: start;
    }
  }

  .key {
    display: flex;
    flex-wrap: wrap;
    gap: 0 1.5rem;
    margin: 0.5rem 0;
    padding: 0;
    list-style: none;
  }

  h3 {
    margin: 1rem 0 0.5rem;
    font-size: 1.125rem;
  }

  fieldset {
    margin: 0 0 1rem;
    padding: 0.25rem 1rem 0.75rem;
    border: 1px solid;
  }

  .plain {
    padding: 0;
    border: 0;
  }

  legend {
    padding: 0 0.5rem;
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin: 0.5rem 0;
  }

  input,
  button {
    box-sizing: border-box;
    min-width: 2.75rem;
    min-height: 2.75rem;
    border: 1px solid;
    color: inherit;
    background: transparent;
    font: inherit;
  }

  button {
    padding: 0 0.75rem;
    border-radius: 0.5rem;
  }

  :is(input, button):disabled {
    opacity: 0.6;
  }

  input {
    width: 4rem;
    text-align: center;
  }

  [aria-disabled="true"] {
    border-style: dashed;
  }

  /* Room for the longest words, so that the controls below stay in place while they change. */
  .views > p {
    min-height: 6lh;
  }

  .message {
    min-height: 3lh;
    margin: 0;
  }

  @media (min-width: 64rem) {
    .sides {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 1rem;
      align-items: center;
    }

    /* Beside two rows of controls, which are higher than the longest message. */
    .sides > .message {
      min-height: 0;
    }

    form .message {
      min-height: 2lh;
    }
  }

  /* Seen only if the scripts have not started by then. */
  .late {
    animation: appear 5s step-end both;
  }

  @keyframes appear {
    from {
      visibility: hidden;
    }
  }

  .announcement {
    position: absolute;
    left: 0;
    width: 100%;
    height: 1px;
    margin: 0;
    overflow: hidden;
    clip-path: inset(50%);
  }
</style>
