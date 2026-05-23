<script>
  import { getContext } from "svelte";

  const planner = getContext("planner");
  let { bed, selectedParcel } = $props();
</script>

<div class="grid-wrap" style={`--rows:${bed.rows};--cols:${bed.columns}`}>
  <div class="row-labels">
    {#each Array.from({ length: bed.rows }, (_, index) => index + 1) as row}
      <span>{row}</span>
    {/each}
  </div>
  <div class="bed-frame">
    <div class="soil-grid">
      {#each planner.parcelLabels(bed) as label}
        {@const planting = bed.plantings[label]}
        {@const plant = planting ? planner.findPlant(planting.plantId) : null}
        <button
          class:selected={selectedParcel === label}
          class="parcel"
          type="button"
          aria-label={`Feld ${label}`}
          onclick={() => planting ? planner.openParcelDetail(label) : planner.selectParcel(label)}
        >
          <small>{label}</small><span>{plant?.icon || ""}</span>
        </button>
      {/each}
    </div>
  </div>
</div>
