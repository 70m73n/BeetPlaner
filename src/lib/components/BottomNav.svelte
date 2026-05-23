<script>
  import { getContext } from "svelte";

  const planner = getContext("planner");
  let { active } = $props();
  const items = [
    ["home", "⌂", "Start"],
    ["beds", "▦", "Beete"],
    ["catalog", "♧", "Katalog"],
    ["more", "⚙", "Mehr"]
  ];
</script>

<nav class="bottom-nav" aria-label="Hauptnavigation">
  {#each items as [screen, icon, label]}
    <button class:active={active === screen} type="button" onclick={() => planner.go(screen)}>
      <span>{icon}</span>{label}
    </button>
  {/each}
</nav>
