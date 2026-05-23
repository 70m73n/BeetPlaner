<script>
  import { getContext } from "svelte";

  const planner = getContext("planner");
  let { bed, size = "preview", selectedParcel = "" } = $props();
</script>

<div class={`bed-preview ${size}`} style={`--rows:${bed.rows};--cols:${bed.columns}`}>
  <div class="bed-preview-grid">
    {#each planner.parcelLabels(bed) as label}
      {@const plant = bed.plantings[label] ? planner.findPlant(bed.plantings[label].plantId) : null}
      <span class:selected={selectedParcel === label}>{plant?.icon || ""}</span>
    {/each}
  </div>
</div>
