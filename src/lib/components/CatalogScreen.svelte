<script>
  import { getContext } from "svelte";
  import AppHeader from "$lib/components/AppHeader.svelte";
  import BottomNav from "$lib/components/BottomNav.svelte";

  const planner = getContext("planner");
  let { state } = $props();
  let plants = $derived(planner.filteredPlants(state));
  let bed = $derived(planner.activeBed(state));
  let targetParcel = $derived(state.catalogTargetParcel);
  const categories = ["Alle", "Gemüse", "Kräuter", "Obst", "Blumen"];
  const icons = { Alle: "▦", Gemüse: "🥬", Kräuter: "🌿", Obst: "🍓", Blumen: "🌼" };
  const filters = [
    ["beginner", "Anfängerfreundlich"],
    ["quick", "Schnelle Ernte"],
    ["small", "Kleines Feld"]
  ];

  function choosePlant(plantId) {
    if (targetParcel) {
      planner.plantFromCatalog(plantId);
      return;
    }
    planner.choosePlantForPlanning(plantId);
  }
</script>

<AppHeader
  title={targetParcel ? `Pflanze für Feld ${targetParcel} auswählen` : "Pflanzenkatalog"}
  compact={!!targetParcel}
  narrowTitle={!!targetParcel}
  back={targetParcel ? () => planner.cancelPlantCatalog() : null}
  backLabel={targetParcel ? "Ohne Auswahl zurück" : "Zurück"}
/>
<section class="screen catalog-screen" class:with-nav={!targetParcel}>
  {#if targetParcel}
    <article class="catalog-target">
      <span>▦</span>
      <div>
        <small>Auswahl für ein Feld</small>
        <strong>Beet: {bed.name} · Feldgröße: {bed.fieldSizeCm} × {bed.fieldSizeCm} cm</strong>
      </div>
      <button type="button" onclick={() => planner.cancelPlantCatalog()}>Ohne Auswahl zurück</button>
    </article>
  {/if}
  <label class="search-box">
    <span>⌕</span>
    <input
      value={state.catalogQuery}
      placeholder="Pflanze suchen"
      aria-label="Pflanze suchen"
      autocomplete="off"
      oninput={(event) => planner.setCatalogQuery(event.currentTarget.value)}
    />
  </label>
  <div class="chip-row">
    {#each categories as category}
      <button
        class:active={state.catalogCategory === category}
        class="chip"
        type="button"
        aria-pressed={state.catalogCategory === category}
        onclick={() => planner.setCatalogCategory(category)}
      >
        {icons[category]} {category}
      </button>
    {/each}
  </div>
  <div class="chip-row compact">
    {#each filters as [id, label]}
      <button
        class:active={state.catalogFilters.includes(id)}
        class="chip soft"
        type="button"
        aria-pressed={state.catalogFilters.includes(id)}
        onclick={() => planner.toggleFilter(id)}
      >{label}</button>
    {/each}
  </div>
  {#if plants.length}
    <div class="plant-grid">
      {#each plants as plant}
        {@const suitability = targetParcel ? planner.catalogSuitability(plant, bed) : null}
        <article class="plant-card">
          <div class="plant-image">{plant.icon}</div>
          <div class="plant-card-body">
            <h2>{plant.name}</h2>
            <div class="plant-meta"><span>{plant.category}</span><span>☼ {plant.lightRequirement}</span></div>
            <div class="plant-facts">
              <small>Ernte nach ca. {plant.harvestDaysMin}-{plant.harvestDaysMax} Tagen</small>
              <small>{plant.plantsPerFieldMin}-{plant.plantsPerFieldMax} Pflanzen pro Feld</small>
            </div>
            {#if suitability}
              <p class={`suitability ${suitability.tone}`}>{suitability.text}</p>
            {/if}
            <button type="button" onclick={() => choosePlant(plant.id)}>
              {targetParcel ? `In Feld ${targetParcel} pflanzen` : "Im Beet verwenden"}
            </button>
          </div>
        </article>
      {/each}
    </div>
  {:else}
    <article class="empty-results">
      <strong>Keine passende Pflanze gefunden.</strong>
      <p>Entferne Filter oder ändere die Suche.</p>
    </article>
  {/if}
</section>
{#if !targetParcel}
  <BottomNav active="catalog" />
{/if}
