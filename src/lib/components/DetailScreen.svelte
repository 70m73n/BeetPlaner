<script>
  import { getContext } from "svelte";
  import AppHeader from "$lib/components/AppHeader.svelte";
  import BedPreview from "$lib/components/BedPreview.svelte";

  const planner = getContext("planner");
  let { state } = $props();
  let bed = $derived(planner.activeBed(state));
  let isExisting = $derived(Boolean(bed.plantings[state.selectedParcel]));
  let planting = $derived(bed.plantings[state.selectedParcel] || {
    plantId: state.selectedPlantId,
    plantedDate: planner.toDateInput(new Date()),
    plantingType: "Jungpflanze",
    count: 1,
    variety: "",
    note: ""
  });
  let plant = $derived(planner.findPlant(planting.plantId) || state.data.plants[0]);

  function save(event) {
    event.preventDefault();
    planner.saveDetail(new FormData(event.currentTarget));
  }
</script>

<AppHeader
  title={isExisting ? "Pflanzung bearbeiten" : "Feld bepflanzen"}
  compact
  narrowTitle
  back={() => planner.go("planner")}
  backLabel="Zurück zum Beet"
/>
<section class="screen detail-screen">
  <article class="card detail-hero">
    <div class="plant-portrait" aria-hidden="true">{plant.icon}</div>
    <div class="detail-heading">
      <p class="detail-kicker">{isExisting ? "Pflanzung in" : "Neue Pflanzung für"} Feld {state.selectedParcel}</p>
      <h2>{plant.name}</h2>
      <p>{planner.categoryDetail(plant)} · {plant.lightRequirement}</p>
    </div>
    <div class="field-strip">
      <div>
        <strong>Feld {state.selectedParcel}</strong>
        <small>{bed.name} · {bed.fieldSizeCm} × {bed.fieldSizeCm} cm</small>
      </div>
      <BedPreview {bed} size="micro" selectedParcel={state.selectedParcel} />
    </div>
  </article>

  <article class="card detail-editor">
    <form class="detail-form" onsubmit={save}>
      <fieldset class="form-section">
        <legend>Pflanzung</legend>
        <label>
          <span>Pflanze</span>
          <select name="plantId" value={plant.id}>
            {#each state.data.plants as item}<option value={item.id}>{item.name}</option>{/each}
          </select>
        </label>
        <label>
          <span>Gepflanzt am</span>
          <input type="date" name="plantedDate" value={planting.plantedDate} required />
        </label>
        <label>
          <span>Art der Pflanzung</span>
          <select name="plantingType" value={planting.plantingType}>
            <option>Jungpflanze</option>
            <option>Direktsaat</option>
          </select>
        </label>
      </fieldset>
      <fieldset class="form-section">
        <legend>Details</legend>
        <label>
          <span>Anzahl</span>
          <input type="number" min="1" max="99" name="count" value={planting.count} required />
        </label>
        <label>
          <span>Sorte</span>
          <input name="variety" value={planting.variety || ""} placeholder="z. B. San Marzano" />
        </label>
        <label class="note-field">
          <span>Notiz</span>
          <textarea name="note" rows="3" value={planting.note || ""} placeholder="Eigene Notiz zur Pflanzung"></textarea>
        </label>
      </fieldset>
      <div class="detail-actions">
        <button class="primary" type="submit">
          {isExisting ? "Änderungen speichern" : "Pflanzung speichern"}
        </button>
        <button class="secondary" type="button" onclick={() => planner.go("planner")}>Zurück</button>
      </div>
    </form>
  </article>

  {#if isExisting}
    <article class="delete-planting">
      <p><strong>Pflanzung entfernen</strong><small>Das Feld wird wieder frei.</small></p>
      <button class="danger" type="button" onclick={() => planner.deleteDetail()}>Pflanzung löschen</button>
    </article>
  {/if}
</section>
