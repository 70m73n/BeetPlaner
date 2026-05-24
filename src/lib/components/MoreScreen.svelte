<script>
  import { getContext } from "svelte";
  import AppHeader from "$lib/components/AppHeader.svelte";
  import BottomNav from "$lib/components/BottomNav.svelte";

  const planner = getContext("planner");
  let { state } = $props();
</script>

<AppHeader title="Mehr" />
<section class="screen with-nav">
  <article class="card">
    <h2>Lokale Daten</h2>
    <p>Alle Daten bleiben auf diesem Gerät. Kein Login. Keine Cloud. Offline nutzbar.</p>
    <div class="status-grid single">
      <div class="status-pill"><span>▦</span><small>Beete</small><strong>{state.beds.length}</strong></div>
      <div class="status-pill"><span>☘</span><small>Pflanzen</small><strong>{state.data.plants.length}</strong></div>
    </div>
  </article>
  <article class="card data-actions">
    <h2>Daten verwalten</h2>
    <p>Änderungen im Planer werden automatisch lokal gespeichert.</p>
    <button class="reset-action" type="button" onclick={() => planner.resetAll()}>
      <span><strong>Lokale Daten zurücksetzen</strong><small>Beete und Pflanzungen auf den Startzustand setzen</small></span>
      <b>›</b>
    </button>
  </article>
  <article class="card app-facts">
    <h2>Über die App</h2>
    <p>BeetPlaner ist ein lokaler Hochbeet- und Quadratgarten-Planer.</p>
    <dl>
      <div><dt>Version</dt><dd>0.3.0</dd></div>
      <div><dt>Lizenzhinweise</dt><dd>Pflanzenbilder als Unicode-Emojis</dd></div>
    </dl>
  </article>
</section>
<BottomNav active="more" />
