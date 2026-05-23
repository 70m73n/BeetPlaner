<script>
  import { getContext } from "svelte";
  import AppHeader from "$lib/components/AppHeader.svelte";
  import BedPreview from "$lib/components/BedPreview.svelte";
  import BottomNav from "$lib/components/BottomNav.svelte";

  const planner = getContext("planner");
  let { state } = $props();
  let carousel;
  let scrollTimer;
  let bed = $derived(planner.activeBed(state));
  let hints = $derived(planner.dashboardHints(state, bed).slice(0, 2));
  let activeBedIndex = $derived(Math.max(0, state.beds.findIndex((item) => item.id === state.activeBedId)));

  $effect(() => {
    if (!carousel) return;
    const slide = carousel.children[activeBedIndex];
    requestAnimationFrame(() => {
      slide?.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" });
    });
  });

  function metric(icon, label, value) {
    return { icon, label, value };
  }

  function taskIcon(type) {
    if (type.includes("Gieß")) return "♢";
    if (type.includes("Ernte")) return "♧";
    return "☘";
  }

  function openBed(bedId) {
    planner.setActiveBed(bedId);
    planner.go("planner");
  }

  function scrollToBed(index) {
    const slide = carousel?.children[index];
    if (!slide) return;
    slide.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    planner.setActiveBed(state.beds[index].id);
  }

  function handleCarouselScroll() {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if (!carousel) return;
      const center = carousel.getBoundingClientRect().left + carousel.clientWidth / 2;
      const slides = Array.from(carousel.children);
      const nearestIndex = slides.reduce((best, slide, index) => {
        const rect = slide.getBoundingClientRect();
        const distance = Math.abs(rect.left + rect.width / 2 - center);
        return distance < best.distance ? { index, distance } : best;
      }, { index: activeBedIndex, distance: Infinity }).index;
      const nextBed = state.beds[nearestIndex];
      if (nextBed && nextBed.id !== state.activeBedId) planner.setActiveBed(nextBed.id);
    }, 90);
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
  <div class="bed-carousel-wrap">
    <div class="bed-carousel" bind:this={carousel} onscroll={handleCarouselScroll} aria-label="Beete">
      {#each state.beds as item, index}
        <article class:active={item.id === state.activeBedId} class="card hero-card bed-slide" aria-label={`${item.name}, Beet ${index + 1} von ${state.beds.length}`}>
          <button class="bed-slide-main" type="button" onclick={() => openBed(item.id)}>
            <div class="card-title-row">
              <div class="title-lockup"><span class="bed-emoji">🪴</span><div><h2>{item.name}</h2><p>{item.widthCm} × {item.lengthCm} cm</p></div></div>
              <span class="chevron">›</span>
            </div>
            <div class="hero-grid">
              <BedPreview bed={item} selectedParcel={item.id === state.activeBedId ? state.selectedParcel : ""} />
              <div class="metric-list" aria-label="Beetdaten">
                {#each [
                  metric("⌁", "Größe", `${item.widthCm} × ${item.lengthCm} cm`),
                  metric("▦", "Raster", `${item.fieldSizeCm} cm`),
                  metric("☼", "Sonne", planner.orientationShort(item.orientation))
                ] as metricItem}
                  <div class="metric"><span>{metricItem.icon}</span><div><small>{metricItem.label}</small><strong>{metricItem.value}</strong></div></div>
                {/each}
              </div>
            </div>
          </button>
        </article>
      {/each}
    </div>

    {#if state.beds.length > 1}
      <div class="carousel-dots" aria-label="Beet auswählen">
        {#each state.beds as item, index}
          <button
            class:active={index === activeBedIndex}
            type="button"
            aria-label={`${item.name} anzeigen`}
            aria-current={index === activeBedIndex ? "true" : undefined}
            onclick={() => scrollToBed(index)}
          ></button>
        {/each}
      </div>
    {/if}
  </div>

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
    <h2>Beetstatus</h2>
    <div class="status-grid">
      <div class="status-pill"><span>▦</span><small>Belegte Felder</small><strong>{planner.occupiedCount(bed)} / {planner.parcelLabels(bed).length}</strong></div>
      <div class="status-pill"><span>□</span><small>Freie Felder</small><strong>{planner.freeCount(bed)} / {planner.parcelLabels(bed).length}</strong></div>
      <div class="status-pill"><span>▣</span><small>Nächste Ernte</small><strong>{planner.nextHarvestText(state, bed)}</strong></div>
    </div>
  </article>
</section>
<BottomNav active="home" />
