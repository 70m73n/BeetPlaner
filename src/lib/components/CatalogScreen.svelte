<script>
  import { getContext } from "svelte";
  import AppHeader from "$lib/components/AppHeader.svelte";
  import BottomNav from "$lib/components/BottomNav.svelte";

  const planner = getContext("planner");
  let { state } = $props();
  let plants = $derived(planner.filteredPlants(state));
  const categories = ["Alle", "Gemüse", "Kräuter", "Obst", "Blumen"];
  const icons = { Alle: "▦", Gemüse: "🥬", Kräuter: "🌿", Obst: "🍓", Blumen: "🌼" };
  const filters = [
    ["beginner", "Anfängerfreundlich"],
    ["quick", "Schnelle Ernte"],
    ["small", "Kleines Feld"]
  ];
</script>

<AppHeader title="Pflanzenkatalog" actions={[{ icon: "▤", label: "Filter" }]} />
<section class="screen with-nav catalog-screen">
  <label class="search-box">
    <span>⌕</span>
    <input value={state.catalogQuery} placeholder="Pflanzen suchen..." autocomplete="off" oninput={(event) => planner.setCatalogQuery(event.currentTarget.value)} />
    <span>☷</span>
  </label>
  <div class="chip-row">
    {#each categories as category}
      <button class:active={state.catalogCategory === category} class="chip" type="button" onclick={() => planner.setCatalogCategory(category)}>
        {icons[category]} {category}
      </button>
    {/each}
  </div>
  <div class="chip-row compact">
    {#each filters as [id, label]}
      <button class:active={state.catalogFilters.includes(id)} class="chip soft" type="button" onclick={() => planner.toggleFilter(id)}>{label}</button>
    {/each}
  </div>
  <div class="plant-grid">
    {#each plants as plant}
      <article class="plant-card">
        <div class="plant-image">{plant.icon}</div>
        <div class="plant-card-body">
          <h2>{plant.name}</h2>
          <div class="plant-meta"><span>☼ {plant.lightRequirement}</span><span>{plant.nutrientRequirement}</span></div>
          <small>{plant.plantsPerFieldMin}-{plant.plantsPerFieldMax} pro Feld · {plant.harvestDaysMin}-{plant.harvestDaysMax} Tage</small>
          <button type="button" onclick={() => { planner.setSelectedPlant(plant.id); planner.plantSelectedField(plant.id); planner.go("planner"); }}>Für Feld auswählen ›</button>
        </div>
      </article>
    {/each}
  </div>
</section>
<BottomNav active="catalog" />
