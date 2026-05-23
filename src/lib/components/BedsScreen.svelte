<script>
  import { getContext } from "svelte";
  import AppHeader from "$lib/components/AppHeader.svelte";
  import BedPreview from "$lib/components/BedPreview.svelte";
  import BottomNav from "$lib/components/BottomNav.svelte";

  const planner = getContext("planner");
  let { state } = $props();

  function createCustom(event) {
    planner.createCustomBed(new FormData(event.currentTarget.form));
  }
</script>

<AppHeader
  title="Beete"
  actions={[{ icon: "＋", label: "Neues Beet", onClick: () => document.querySelector("#new-bed")?.scrollIntoView({ behavior: "smooth" }) }]}
/>
<section class="screen with-nav">
  <article class="card">
    <div class="section-heading"><h2>Meine Beete</h2><button type="button" onclick={() => planner.go("planner")}>Aktives Beet ›</button></div>
    <div class="bed-list">
      {#each state.beds as bed}
        <button class:active={bed.id === state.activeBedId} class="bed-list-card" type="button" onclick={() => planner.selectBed(bed.id)}>
          <BedPreview {bed} size="mini" selectedParcel={state.selectedParcel} />
          <span><strong>{bed.name}</strong><small>{bed.widthCm} × {bed.lengthCm} cm · {planner.occupiedCount(bed)} Felder belegt</small></span>
          <b>›</b>
        </button>
      {/each}
    </div>
  </article>

  <article class="card" id="new-bed">
    <h2>Neues Beet</h2>
    <form class="form-grid">
      <label>Beetname<input name="name" value={`Hochbeet ${state.beds.length + 1}`} /></label>
      <label>Breite in cm<input name="widthCm" type="number" min="20" step="10" value="120" /></label>
      <label>Länge in cm<input name="lengthCm" type="number" min="20" step="10" value="240" /></label>
      <label>Feldgröße<select name="fieldSizeCm"><option value="30">30 × 30 cm</option><option value="40">40 × 40 cm</option><option value="20">20 × 20 cm</option></select></label>
      <label class="wide">Ausrichtung<select name="orientation"><option>Süden oben</option><option>Norden oben</option><option>Osten oben</option><option>Westen oben</option></select></label>
      <button class="primary wide" type="button" onclick={createCustom}>Raster anlegen</button>
    </form>
  </article>

  <article class="card">
    <h2>Vorlage wählen</h2>
    <div class="template-grid">
      {#each state.data.bedTemplates as template}
        <button class="template-card" type="button" onclick={() => planner.createTemplateBed(template.id)}>
          <strong>{template.name}</strong>
          <small>{template.description}</small>
        </button>
      {/each}
    </div>
  </article>
</section>
<BottomNav active="beds" />
