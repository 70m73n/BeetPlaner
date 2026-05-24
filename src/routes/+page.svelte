<script>
  import { onMount, setContext } from "svelte";
  import "$lib/styles.css";
  import { createPlannerStore } from "$lib/stores/planner.js";
  import HomeScreen from "$lib/components/HomeScreen.svelte";
  import BedsScreen from "$lib/components/BedsScreen.svelte";
  import CatalogScreen from "$lib/components/CatalogScreen.svelte";
  import PlannerScreen from "$lib/components/PlannerScreen.svelte";
  import DetailScreen from "$lib/components/DetailScreen.svelte";
  import MoreScreen from "$lib/components/MoreScreen.svelte";

  const planner = createPlannerStore();
  setContext("planner", planner);

  onMount(() => {
    planner.load();
  });
</script>

<main class="app-shell">
  {#if $planner.loading}
    <div class="loading-card" role="status">BeetPlaner wird geladen...</div>
  {:else if $planner.screen === "home"}
    <HomeScreen state={$planner} />
  {:else if $planner.screen === "beds"}
    <BedsScreen state={$planner} />
  {:else if $planner.screen === "catalog"}
    <CatalogScreen state={$planner} />
  {:else if $planner.screen === "planner"}
    <PlannerScreen state={$planner} />
  {:else if $planner.screen === "detail"}
    <DetailScreen state={$planner} />
  {:else}
    <MoreScreen state={$planner} />
  {/if}

  {#if $planner.toast}
    <div class="toast" role="status" aria-live="polite">{$planner.toast}</div>
  {/if}
</main>
