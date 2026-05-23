<script>
  import { getContext } from "svelte";
  import AppHeader from "$lib/components/AppHeader.svelte";
  import BottomNav from "$lib/components/BottomNav.svelte";

  const planner = getContext("planner");
  let { state } = $props();
</script>

<AppHeader title="Mehr" actions={[{ icon: "…", label: "Mehr" }]} />
<section class="screen with-nav">
  <article class="card">
    <h2>Lokale Daten</h2>
    <p>Alle Daten bleiben auf diesem Gerät. Kein Login. Keine Cloud. Offline nutzbar.</p>
    <div class="status-grid single">
      <div class="status-pill"><span>▦</span><small>Beete</small><strong>{state.beds.length}</strong></div>
      <div class="status-pill"><span>☘</span><small>Pflanzen</small><strong>{state.data.plants.length}</strong></div>
    </div>
  </article>
  <article class="card settings-list">
    <button type="button">Daten speichern <span>›</span></button>
    <button type="button" onclick={() => planner.resetAll()}>Daten zurücksetzen <span>›</span></button>
    <button type="button">Über die App <span>0.3.0</span></button>
    <button type="button">Lizenzhinweise <span>Unicode-Emojis</span></button>
  </article>
</section>
<BottomNav active="more" />
