<!-- PROTOTYPE, throwaway. Reveals the verified output. Nothing runs. -->
<script lang="ts">
  let { output, label }: { output: string; label: string } = $props();
  let shown = $state(false);
</script>

<div class="run">
  <div class="run-buttons">
    <button type="button" class="run-go" onclick={() => (shown = true)}>Run</button>
    <button type="button" class="run-reset" disabled={!shown} onclick={() => (shown = false)}>Reset</button>
  </div>
  <div class="run-result" aria-live="polite">
    {#if shown}
      <p class="run-label">{label}</p>
      <pre class="run-out"><code>{output}</code></pre>
    {/if}
  </div>
</div>
