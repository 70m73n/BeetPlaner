<script>
  import { getContext } from "svelte";
  import AppHeader from "$lib/components/AppHeader.svelte";
  import BedGrid from "$lib/components/BedGrid.svelte";

  const planner = getContext("planner");
  let { state } = $props();
  let bed = $derived(planner.activeBed(state));
  let selectedPlanting = $derived(bed.plantings[state.selectedParcel]);
  let selectedPlant = $derived(selectedPlanting ? planner.findPlant(selectedPlanting.plantId) : planner.findPlant(state.selectedPlantId));
  let pendingPlant = $derived(state.pendingPlantId ? planner.findPlant(state.pendingPlantId) : null);
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
    {#if pendingPlant}
      <div class="placement-prompt">
        <span>{pendingPlant.icon}</span>
        <div><strong>{pendingPlant.name} platzieren</strong><small>Tippe auf ein freies Feld im Beet.</small></div>
        <button type="button" onclick={() => planner.cancelPendingPlant()}>Abbrechen</button>
      </div>
    {/if}
    <div class="selected-field">
      <div>
        <small>Ausgewähltes Feld</small>
        <strong>Feld {state.selectedParcel}</strong>
        <span>{selectedPlanting ? `${selectedPlant.name} gepflanzt` : "Noch frei"}</span>
      </div>
      <button class="primary small" type="button" onclick={() => planner.openPlantCatalog()}>
        {selectedPlanting ? "Ändern" : "Pflanze wählen"}
      </button>
    </div>
    <div class="direction-chip">Norden ↑</div>
    <BedGrid {bed} selectedParcel={state.selectedParcel} />
    <div class="direction-chip bottom">{planner.orientationShort(bed.orientation)}</div>
    <p class="plant-strip-label">Schnell pflanzen in Feld {state.selectedParcel}</p>
    <div class="plant-strip">
      {#each state.data.plants.slice(0, 6) as plant}
        <button class:active={state.selectedPlantId === plant.id} type="button" onclick={() => planner.plantSelectedField(plant.id)}>
          <span>{plant.icon}</span><small>{plant.name}</small>
        </button>
      {/each}
    </div>
  </article>
  <article class="hint-card">
    <strong>Feld {state.selectedParcel}</strong>
    <span>{planner.plausibilityText(state, bed, state.selectedParcel, selectedPlant)}</span>
  </article>
  <div class="planner-actions">
    <button type="button" onclick={() => planner.openPlantCatalog()}>＋ Pflanze wählen</button>
    <button type="button" disabled={!selectedPlanting} onclick={() => planner.go("detail")}>✎ Feld bearbeiten</button>
    <button type="button" disabled={!selectedPlanting} onclick={() => planner.clearField()}>⌫ Feld löschen</button>
  </div>
</section>
