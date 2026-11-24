<script lang="ts">
  import { onMount, tick } from "svelte";
  import { drawFormula } from "../draw-formula";
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
    type State,
  } from "./state";
  import { arrowRange, explain, formula, mistakes, moves, numeral, pair, predictionRange } from "./words";

  const id = $props.id();
  const axes = ["x", "y"] as const;
  const names = ["a", "b"] as const;

  let current = $state.raw(start);
  let problem = $state.raw<{ place: ArrowName | "prediction"; text: string }>();
  // A new object each time, so that the same words are announced again.
  let announcement = $state.raw({ text: "" });
  // The page is built with the controls off and the still figure in place.
  let live = $state(false);

  const sum = $derived(visibleSum(current));
  const prediction = $derived(shownPrediction(current));
  const answer = $derived(feedback(current));

  // For the still figure, which shows the start as it is after a right prediction.
  const { x, y } = add(start.a, start.b);
  const still = submit(withPrediction(withPrediction(start, "x", x)!, "y", y)!)!;

  let verdict = $state<HTMLElement>();
  const predictionFields: { [axis in Axis]?: HTMLInputElement } = $state({});
  // A prediction that was just refused must not be submitted as the one before it.
  let refused: Axis | undefined;

  onMount(() => {
    live = true;
  });

  const announce = (text: string) => {
    announcement = { text };
  };

  function refuse(place: ArrowName | "prediction", text: string) {
    problem = { place, text };
    announce(text);
  }

  function setComponent(arrow: ArrowName, axis: Axis, value: number) {
    const before = current[arrow][axis];
    const next = withComponent(current, arrow, axis, value);
    if (!next) {
      refuse(arrow, `${axis} of arrow ${arrow} must be ${arrowRange}. It is still ${numeral(before)}.`);
      return;
    }
    problem = undefined;
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
      problem = undefined;
      if (refused === axis) refused = undefined;
    } else {
      const before = numeral(current.prediction[axis]) || "empty";
      refused = axis;
      refuse("prediction", `${axis} of your prediction must be ${predictionRange}. It is still ${before}.`);
    }
    field.value = numeral(current.prediction[axis]);
  }

  async function submitPrediction(event: SubmitEvent) {
    event.preventDefault();
    for (const axis of axes) {
      const field = predictionFields[axis]!;
      if (field.value !== numeral(current.prediction[axis])) readPrediction(axis, field);
    }
    const next = submit(current);
    if (next && !refused) {
      current = next;
      problem = undefined;
      await tick();
      // Moving the focus here also announces the result.
      verdict?.focus();
      return;
    }
    const axis = refused ?? axes.find((name) => current.prediction[name] === undefined)!;
    if (!refused) problem = { place: "prediction", text: "Enter both numbers of your prediction." };
    refused = undefined;
    await tick();
    const field = predictionFields[axis]!;
    // Moving the focus to the field also announces the problem, which describes it.
    if (document.activeElement === field) announce(problem!.text);
    else field.focus();
  }

  function reset() {
    current = start;
    problem = undefined;
    refused = undefined;
    announce("Back at the start. The sum is hidden until you submit a prediction.");
  }
</script>

{#snippet problemAt(place: ArrowName | "prediction")}
  <p class="problem" id="{id}-{place}-problem">{problem?.place === place ? problem.text : ""}</p>
{/snippet}

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

{#snippet formulaOf(state: State)}
  <!-- It can be scrolled with the keyboard, like every formula on its own line. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div class="formula" role="group" aria-label="Formula" tabindex="0">{@html drawFormula(formula(state), true)}</div>
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
    {#if !live}
      <p>The controls work once the page has loaded. If they stay off, <a href="#{id}-still">see a still figure</a>.</p>
    {/if}
    {#if answer}
      <div data-view="feedback">
        <h3 tabindex="-1" bind:this={verdict}>
          {answer.right.x && answer.right.y ? "Yes" : "Not quite"}: the sum ends at {pair(answer.sum)}
        </h3>
        <p>You predicted {pair(answer.prediction)} for <b>a</b> = {pair(answer.a)} and <b>b</b> = {pair(answer.b)}.</p>
        <ul>
          {#each axes as axis (axis)}
            <li>{axis}: {explain(answer, axis)}</li>
          {/each}
        </ul>
        {#if answer.mistake}<p>{mistakes[answer.mistake]}</p>{/if}
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
          <!-- Below the button, so that a click just after typing does not miss it. -->
          <p class="echo">{#if prediction}Your prediction is marked × at {pair(prediction)}.{/if}</p>
          {@render problemAt("prediction")}
        </fieldset>
      </form>
    {/if}

    <h3>{answer ? "Change the arrows, and watch what else changes" : "2. Change the arrows"}</h3>
    <p id="{id}-arrow-hint">Each component is {arrowRange}.</p>
    {#each names as name (name)}
      <fieldset disabled={!live}>
        <legend>Arrow <b>{name}</b></legend>
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
        {@render problemAt(name)}
      </fieldset>
    {/each}

    <p data-view="numbers">
      Sum <b>a + b</b>: {#if sum}x = {numeral(sum.x)}, y = {numeral(sum.y)}{:else}x = ?, y = ?{/if}
    </p>
    <div data-view="formula">{@render formulaOf(current)}</div>
    <fieldset class="plain" disabled={!live}>
      <button type="button" onclick={reset}>Reset</button>
    </fieldset>
  </div>

  <p class="announcement" role="status">{#key announcement}<span>{announcement.text}</span>{/key}</p>
</div>

{#if !live}
  <div class="still" id="{id}-still">
    <Drawing arrows={still} sum={visibleSum(still)} prediction={undefined} describedby="{id}-still-words" />
    {@render key()}
    <p id="{id}-still-words">
      Arrow <b>a</b> goes {moves(still.a)}. Arrow <b>b</b> goes {moves(still.b)}. The sum, <b>a + b</b>, goes {moves({ x, y })}.
    </p>
    {@render formulaOf(still)}
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

  .echo {
    min-height: 1lh;
  }

  .problem,
  .echo {
    margin: 0;
  }

  .problem {
    font-weight: bold;
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
