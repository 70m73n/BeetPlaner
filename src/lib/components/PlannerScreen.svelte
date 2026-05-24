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
  let guidancePlant = $derived(selectedPlanting ? selectedPlant : pendingPlant);

  function displayDate(value) {
    if (!value) return "";
    return new Intl.DateTimeFormat("de-DE").format(new Date(`${value}T00:00:00`));
  }
</script>

<AppHeader title="Beet planen" compact back={() => planner.go("home")} />
<section class="screen planner-screen">
  <article class="card planner-card">
    <div class="planner-topline">
      <div class="title-lockup"><span class="bed-emoji">🪴</span><div><h2>{bed.name}</h2><p>{bed.widthCm} × {bed.lengthCm} cm · {bed.fieldSizeCm} cm Raster</p></div></div>
      <p class="autosave-note">Änderungen werden automatisch gespeichert.</p>
    </div>
    {#if pendingPlant}
      <div class="placement-prompt">
        <span>{pendingPlant.icon}</span>
        <div><strong>{pendingPlant.name} platzieren</strong><small>Tippe auf ein freies Feld im Beet.</small></div>
        <button type="button" onclick={() => planner.cancelPendingPlant()}>Abbrechen</button>
      </div>
    {/if}
    <div class="direction-chip">Norden ↑</div>
    <BedGrid {bed} selectedParcel={state.selectedParcel} />
    <div class="direction-chip bottom">{planner.orientationShort(bed.orientation)}</div>
  </article>

  <article class="card field-context">
    <p class="context-kicker">Ausgewähltes Feld</p>
    {#if selectedPlanting}
      <h2>Feld {state.selectedParcel}</h2>
      <div class="field-plant">
        <span>{selectedPlant?.icon || "🌱"}</span>
        <strong>{selectedPlant?.name || "Unbekannte Pflanze"}</strong>
      </div>
      <dl class="planting-meta">
        {#if selectedPlanting.plantedDate}
          <div><dt>Pflanzdatum</dt><dd>{displayDate(selectedPlanting.plantedDate)}</dd></div>
        {/if}
        {#if selectedPlanting.count}
          <div><dt>Anzahl</dt><dd>{selectedPlanting.count}</dd></div>
        {/if}
        {#if selectedPlanting.variety}
          <div><dt>Sorte</dt><dd>{selectedPlanting.variety}</dd></div>
        {/if}
      </dl>
      <div class="context-actions occupied">
        <button class="primary" type="button" onclick={() => planner.go("detail")}>Bearbeiten</button>
        <button type="button" onclick={() => planner.openPlantCatalog()}>Ersetzen</button>
        <button class="danger" type="button" onclick={() => planner.clearField()}>Löschen</button>
      </div>
    {:else}
      <h2>Feld {state.selectedParcel} ist frei</h2>
      <p class="context-copy">Wähle eine Pflanze aus, um dieses Feld zu bepflanzen.</p>
      <div class="context-actions">
        <button class="primary" type="button" onclick={() => planner.openPlantCatalog()}>Pflanze auswählen</button>
      </div>
    {/if}
  </article>

  <article class="hint-card planner-hint">
    <small>Hinweis zu Feld {state.selectedParcel}</small>
    <p>{planner.plausibilityText(state, bed, state.selectedParcel, guidancePlant)}</p>
  </article>

  <details class="planner-tools">
    <summary>Testfunktionen</summary>
    <div>
      <button type="button" onclick={() => planner.randomFill()}>Zufall befüllen</button>
      <button class="danger" type="button" onclick={() => planner.resetBed()}>Beet zurücksetzen</button>
    </div>
  </details>
</section>
