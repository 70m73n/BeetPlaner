<script>
  let { title, compact = false, narrowTitle = false, back = null, backLabel = "Zurück", actions = [] } = $props();
</script>

<header class:compact class:narrow-title={narrowTitle} class="app-header">
  <div class="header-row">
    {#if back}
      <button class="icon-button ghost" type="button" onclick={back} aria-label={backLabel}>←</button>
    {/if}
    <h1>{title}</h1>
    <div class="header-actions">
      {#each actions as action}
        <button class="icon-button" type="button" onclick={action.onClick} aria-label={action.label}>
          {action.icon}
        </button>
      {/each}
    </div>
  </div>
</header>
