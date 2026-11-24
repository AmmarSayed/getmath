<script lang="ts">
  import { onMount } from "svelte";

  const { name, output }: { name: string; output: string } = $props();
  const id = $props.id();

  let shown = $state(false);
  // A new object each time, so that the same words are announced again.
  let announcement = $state.raw({ text: "" });
  // The page is built with the buttons off and the output in place.
  let live = $state(false);

  onMount(() => {
    live = true;
  });

  function say(text: string, show: boolean) {
    shown = show;
    announcement = { text };
  }
</script>

{#snippet expected()}
  <p><b>Expected output</b>. It was checked with real Python before this page was published. No code runs here.</p>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -- a block that scrolls must be reachable by keyboard -->
  <pre data-output={name} class="code" tabindex="0" role="group" aria-label="Expected output"><samp>{output}</samp></pre>
{/snippet}

<div class="interaction" data-example={name}>
  <div class="row">
    <button type="button" disabled={!live} onclick={() => say("The expected output is shown below. No code was run.", true)}>Run</button>
    <button type="button" disabled={!live} onclick={() => say("The expected output is hidden.", false)}>Reset</button>
  </div>
  {#if shown}
    {@render expected()}
  {/if}
  {#if !live}
    <p class="late">The buttons are not working. <a href="#{id}-still">See the expected output</a> instead.</p>
  {/if}
  <p class="announcement" role="status">{#key announcement}<span>{announcement.text}</span>{/key}</p>
</div>

{#if !live}
  <div class="still" data-example={name} id="{id}-still">
    {@render expected()}
  </div>
{/if}

<style>
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin: 0.5rem 0;
  }
</style>
