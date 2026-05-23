<script>
  import { getContext } from "svelte";
  import AppHeader from "$lib/components/AppHeader.svelte";
  import BedPreview from "$lib/components/BedPreview.svelte";

  const planner = getContext("planner");
  let { state } = $props();
  let bed = $derived(planner.activeBed(state));
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
    planner.saveDetail(new FormData(event.currentTarget.form));
  }
</script>

<AppHeader title={`Feld ${state.selectedParcel}`} compact back={() => planner.go("planner")} actions={[{ icon: "⋮", label: "Mehr" }]} />
<section class="screen detail-screen">
  <article class="card detail-hero">
    <div class="plant-portrait">{plant.icon}</div>
    <div>
      <h2>{plant.name}</h2>
      <span class="badge">⌁ {plant.category}</span>
      <p>{planner.categoryDetail(plant)} · {plant.nutrientRequirement}</p>
      <p>Ernte in ca. {plant.harvestDaysMin}-{plant.harvestDaysMax} Tagen</p>
    </div>
    <div class="parcel-strip">
      <span class="round-icon">▦</span>
      <div><strong>Parzelle {state.selectedParcel}</strong><small>{bed.fieldSizeCm} × {bed.fieldSizeCm} cm</small></div>
      <BedPreview {bed} size="micro" selectedParcel={state.selectedParcel} />
    </div>
  </article>

  <article class="card">
    <form class="detail-form">
      <label><span>⚑ Pflanze</span><select name="plantId" value={plant.id}>{#each state.data.plants as item}<option value={item.id}>{item.name}</option>{/each}</select></label>
      <label><span>▣ Gepflanzt am</span><input type="date" name="plantedDate" value={planting.plantedDate} /></label>
      <label><span>☘ Direktsaat / Jungpflanze</span><select name="plantingType" value={planting.plantingType}><option>Jungpflanze</option><option>Direktsaat</option></select></label>
      <label><span># Anzahl</span><input type="number" min="1" max="99" name="count" value={planting.count} /></label>
      <label><span>◇ Sorte</span><input name="variety" value={planting.variety || ""} placeholder="z. B. San Marzano" /></label>
      <label><span>☷ Notiz</span><textarea name="note" rows="2" value={planting.note || ""}></textarea></label>
      <button class="primary full" type="button" onclick={save}>✓ Speichern</button>
    </form>
  </article>

  <div class="info-grid">
    <div class="info-box"><span>☼</span><strong>{plant.lightRequirement}</strong><small>Sonne: {planner.orientationShort(bed.orientation)}</small></div>
    <div class="info-box"><span>♧</span><strong>{plant.nutrientRequirement}</strong><small>Nährstoffbedarf</small></div>
    <div class="info-box"><span>☘</span><strong>Guter Nachbar</strong><small>{plant.goodNeighbors.slice(0, 2).join(", ") || "keine Angabe"}</small></div>
  </div>

  <button class="danger full" type="button" onclick={() => planner.deleteDetail()}>⌫ Pflanzung löschen</button>
</section>
