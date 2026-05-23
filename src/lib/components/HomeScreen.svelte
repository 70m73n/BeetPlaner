<script>
  import { getContext } from "svelte";
  import AppHeader from "$lib/components/AppHeader.svelte";
  import BedPreview from "$lib/components/BedPreview.svelte";
  import BottomNav from "$lib/components/BottomNav.svelte";

  const planner = getContext("planner");
  let { state } = $props();
  let bed = $derived(planner.activeBed(state));
  let hints = $derived(planner.dashboardHints(state, bed).slice(0, 3));
  let recent = $derived(planner.recentPlantings(state, bed).slice(0, 4));

  function metric(icon, label, value) {
    return { icon, label, value };
  }

  function taskIcon(type) {
    if (type.includes("Gieß")) return "♢";
    if (type.includes("Ernte")) return "♧";
    return "☘";
  }
</script>

<AppHeader
  title="Mein Beet"
  actions={[
    { icon: "♡", label: "Favorit" },
    { icon: "⚙", label: "Einstellungen", onClick: () => planner.go("more") }
  ]}
/>
<section class="screen with-nav">
  <button class="card hero-card tappable as-card" type="button" onclick={() => planner.go("planner")}>
    <div class="card-title-row">
      <div class="title-lockup"><span class="bed-emoji">🪴</span><div><h2>{bed.name}</h2><p>{bed.widthCm} × {bed.lengthCm} cm</p></div></div>
      <span class="chevron">›</span>
    </div>
    <div class="hero-grid">
      <div class="metric-list">
        {#each [
          metric("⌁", "Größe", `${bed.widthCm} × ${bed.lengthCm} cm`),
          metric("▦", "Feldgröße", `${bed.fieldSizeCm} × ${bed.fieldSizeCm} cm`),
          metric("☼", "Sonne", planner.orientationShort(bed.orientation))
        ] as item}
          <div class="metric"><span>{item.icon}</span><div><small>{item.label}</small><strong>{item.value}</strong></div></div>
        {/each}
      </div>
      <BedPreview {bed} selectedParcel={state.selectedParcel} />
    </div>
  </button>

  <article class="card">
    <div class="section-heading"><h2>Heute im Beet</h2><button type="button" onclick={() => planner.go("planner")}>Alle anzeigen ›</button></div>
    <div class="task-list">
      {#each hints as hint}
        <button class="task-item" type="button" onclick={() => planner.go("planner")}>
          <span>{taskIcon(hint.type)}</span><strong>{hint.type}</strong><small>{hint.text}</small><b>›</b>
        </button>
      {/each}
    </div>
  </article>

  <article class="card">
    <div class="section-heading"><h2>Letzte Pflanzungen</h2><button type="button" onclick={() => planner.go("catalog")}>Katalog ›</button></div>
    <div class="recent-row">
      {#each recent as item}
        <button class="recent-card" type="button" onclick={() => { planner.setSelectedPlant(item.plant.id); planner.go("catalog"); }}>
          <span>{item.plant.icon}</span><strong>{item.plant.name}</strong><small>{item.days}</small>
        </button>
      {/each}
    </div>
  </article>

  <article class="card">
    <h2>Beetstatus</h2>
    <div class="status-grid">
      <div class="status-pill"><span>▦</span><small>Belegte Felder</small><strong>{planner.occupiedCount(bed)} / {planner.parcelLabels(bed).length}</strong></div>
      <div class="status-pill"><span>□</span><small>Freie Felder</small><strong>{planner.freeCount(bed)} / {planner.parcelLabels(bed).length}</strong></div>
      <div class="status-pill"><span>▣</span><small>Nächste Ernte</small><strong>{planner.nextHarvestText(state, bed)}</strong></div>
    </div>
  </article>
</section>
<BottomNav active="home" />
