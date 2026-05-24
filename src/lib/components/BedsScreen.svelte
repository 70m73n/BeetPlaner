<script>
  import { getContext } from "svelte";
  import AppHeader from "$lib/components/AppHeader.svelte";
  import BedPreview from "$lib/components/BedPreview.svelte";
  import BottomNav from "$lib/components/BottomNav.svelte";

  const planner = getContext("planner");
  let { state: plannerState } = $props();
  let customError = $state("");

  function createCustom(event) {
    event.preventDefault();
    customError = planner.createCustomBed(new FormData(event.currentTarget)) || "";
  }

  function openCustomBuilder() {
    const customBuilder = document.querySelector("#custom-bed");
    if (customBuilder instanceof HTMLDetailsElement) customBuilder.open = true;
    customBuilder?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function templateGridDescription(template) {
    const columns = Math.floor(template.widthCm / template.fieldSizeCm);
    const rows = Math.floor(template.lengthCm / template.fieldSizeCm);
    return `${columns} × ${rows} Felder · ${template.fieldSizeCm} cm Raster`;
  }
</script>

<AppHeader
  title="Beete"
  actions={[{ icon: "＋", label: "Maßbeet anlegen", onClick: openCustomBuilder }]}
/>
<section class="screen with-nav">
  <article class="card">
    <div class="section-heading"><h2>Meine Beete</h2><button type="button" onclick={() => planner.go("planner")}>Aktives Beet ›</button></div>
    <div class="bed-list">
      {#each plannerState.beds as bed}
        <button class:active={bed.id === plannerState.activeBedId} class="bed-list-card" type="button" onclick={() => planner.selectBed(bed.id)}>
          <BedPreview {bed} size="mini" selectedParcel={plannerState.selectedParcel} />
          <span><strong>{bed.name}</strong><small>{bed.widthCm} × {bed.lengthCm} cm · {planner.occupiedCount(bed)} Felder belegt</small></span>
          <b>›</b>
        </button>
      {/each}
    </div>
  </article>

  <article class="card templates-card">
    <div class="creation-intro">
      <p class="section-kicker">Schnellstart</p>
      <h2>Vorlage wählen</h2>
      <p>Starte mit einer passenden Beetgröße und passe die Bepflanzung anschließend im Planer an.</p>
    </div>
    <div class="template-grid">
      {#each plannerState.data.bedTemplates as template}
        <button class="template-card" type="button" onclick={() => planner.createTemplateBed(template.id)}>
          <span class="template-kicker">Vorlage</span>
          <strong>{template.name.replace(" x ", " × ")}</strong>
          <span class="template-meta">{templateGridDescription(template)}</span>
          <small>{template.description}</small>
          <span class="template-action">Im Planer öffnen ›</span>
        </button>
      {/each}
    </div>
  </article>

  <details class="card custom-bed" id="custom-bed">
    <summary>
      <span>
        <small>Individuelle Maße</small>
        <strong>Eigenes Beet nach Maß anlegen</strong>
      </span>
      <b aria-hidden="true">＋</b>
    </summary>
    <div class="custom-bed-body">
      <p>Wähle diese Option, wenn keine Vorlage zu deiner Fläche passt.</p>
      <form class="form-grid" onsubmit={createCustom} oninput={() => (customError = "")}>
        <label class="wide">Beetname<input name="name" maxlength="48" required value={`Hochbeet ${plannerState.beds.length + 1}`} /></label>
        <label>Breite in cm<input name="widthCm" type="number" min="20" step="10" required value="120" /></label>
        <label>Länge in cm<input name="lengthCm" type="number" min="20" step="10" required value="240" /></label>
        <label>Feldgröße<select name="fieldSizeCm"><option value="30">30 × 30 cm</option><option value="40">40 × 40 cm</option><option value="20">20 × 20 cm</option></select></label>
        <label>Ausrichtung<select name="orientation"><option>Süden oben</option><option>Norden oben</option><option>Osten oben</option><option>Westen oben</option></select></label>
        <p class="form-help wide">Breite und Länge müssen vollständig in die gewählte Feldgröße passen.</p>
        {#if customError}
          <p class="form-error wide" role="alert">{customError}</p>
        {/if}
        <button class="primary wide" type="submit">Maßbeet anlegen und öffnen</button>
      </form>
    </div>
  </details>
</section>
<BottomNav active="beds" />
