<script>
  import { getContext } from "svelte";
  import AppHeader from "$lib/components/AppHeader.svelte";
  import BedGrid from "$lib/components/BedGrid.svelte";

  const planner = getContext("planner");
  let { state } = $props();
  let bed = $derived(planner.activeBed(state));
  let selectedPlanting = $derived(bed.plantings[state.selectedParcel]);
  let selectedPlant = $derived(selectedPlanting ? planner.findPlant(selectedPlanting.plantId) : planner.findPlant(state.selectedPlantId));
</script>

<AppHeader title="Beet planen" compact back={() => planner.go("home")} actions={[{ icon: "?", label: "Hilfe" }]} />
<section class="screen planner-screen">
  <article class="card planner-card">
    <div class="planner-topline">
      <div class="title-lockup"><span class="bed-emoji">🪴</span><div><h2>{bed.name}</h2><p>{bed.widthCm} × {bed.lengthCm} cm · {bed.fieldSizeCm} cm Raster</p></div></div>
      <button class="primary small" type="button">Speichern</button>
    </div>
    <div class="segmented">
      <button class="active" type="button">☝ Manuell</button>
      <button type="button" onclick={() => planner.randomFill()}>🎲 Zufall</button>
      <button type="button" onclick={() => planner.resetBed()}>↺ Zurücksetzen</button>
    </div>
    <div class="direction-chip">Norden ↑</div>
    <BedGrid {bed} selectedParcel={state.selectedParcel} />
    <div class="direction-chip bottom">{planner.orientationShort(bed.orientation)}</div>
    <div class="plant-strip">
      {#each state.data.plants.slice(0, 6) as plant}
        <button class:active={state.selectedPlantId === plant.id} type="button" onclick={() => planner.plantSelectedField(plant.id)}>
          <span>{plant.icon}</span><small>{plant.name}</small>
        </button>
      {/each}
    </div>
  </article>
  <article class="hint-card">
    <strong>{state.selectedParcel}</strong>
    <span>{planner.plausibilityText(state, bed, state.selectedParcel, selectedPlant)}</span>
  </article>
  <div class="planner-actions">
    <button type="button" onclick={() => planner.plantSelectedField()}>＋ Pflanze hinzufügen</button>
    <button type="button" disabled={!selectedPlanting} onclick={() => planner.go("detail")}>✎ Feld bearbeiten</button>
    <button type="button" onclick={() => planner.clearField()}>⌫ Feld löschen</button>
  </div>
</section>
