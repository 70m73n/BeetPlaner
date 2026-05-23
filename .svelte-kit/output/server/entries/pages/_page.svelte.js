import { F as getContext, k as attr_class, l as attr_style, y as ensure_array_like, z as escape_html, j as attr, v as derived, a1 as setContext, a6 as store_get, a9 as unsubscribe_stores } from "../../chunks/renderer.js";
import { w as writable } from "../../chunks/index.js";
import "clsx";
const STORAGE_KEY = "beetplaner:pwa:v2";
const screens = ["home", "beds", "catalog", "more", "planner", "detail"];
const initialState = {
  loading: true,
  data: null,
  screen: "home",
  activeBedId: "",
  beds: [],
  selectedParcel: "B3",
  selectedPlantId: "tomato",
  catalogTargetParcel: "",
  pendingPlantId: "",
  catalogCategory: "Alle",
  catalogQuery: "",
  catalogFilters: [],
  toast: ""
};
function createPlannerStore() {
  const store = writable(initialState);
  let snapshot = initialState;
  let toastTimer;
  store.subscribe((value) => {
    snapshot = value;
  });
  function commit(updater, persistState = true) {
    store.update((current) => {
      const next = typeof updater === "function" ? updater(structuredClone(current)) : updater;
      if (persistState && !next.loading) persist(next);
      return next;
    });
  }
  function notify(message) {
    clearTimeout(toastTimer);
    commit((state) => ({ ...state, toast: message }));
    toastTimer = setTimeout(() => {
      commit((state) => ({ ...state, toast: "" }));
    }, 1800);
  }
  function activeBed(state = snapshot) {
    return state.beds.find((bed) => bed.id === state.activeBedId) || state.beds[0];
  }
  function findPlant(id, state = snapshot) {
    return state.data?.plants.find((plant) => plant.id === id);
  }
  function parcelLabels(bed = activeBed()) {
    if (!bed) return [];
    return Array.from({ length: bed.rows * bed.columns }, (_, index) => {
      const row = Math.floor(index / bed.columns) + 1;
      const column = index % bed.columns;
      return `${String.fromCharCode(65 + column)}${row}`;
    });
  }
  function createPlanting(plantId, plantedDate = toDateInput(/* @__PURE__ */ new Date()), state = snapshot) {
    const plant = findPlant(plantId, state);
    return {
      id: `planting-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      plantId,
      plantedDate,
      plantingType: "Jungpflanze",
      count: plant?.plantsPerFieldMin || 1,
      variety: plant?.id === "tomato" ? "San Marzano" : "",
      note: plant?.notes || "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  function createBedFromTemplate(template, name, plantingTemplate, state = snapshot) {
    const columns = Math.max(1, Math.floor(template.widthCm / template.fieldSizeCm));
    const rows = Math.max(1, Math.floor(template.lengthCm / template.fieldSizeCm));
    const plantings = {};
    const now = /* @__PURE__ */ new Date();
    const plantedDate = toDateInput(new Date(now.getFullYear(), now.getMonth(), Math.max(1, now.getDate() - 11)));
    for (const placement of plantingTemplate?.plantPlacements || []) {
      if (isValidLabel(placement.parcelLabel, rows, columns)) {
        plantings[placement.parcelLabel] = createPlanting(placement.plantId, plantedDate, state);
      }
    }
    return {
      id: `bed-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      widthCm: template.widthCm,
      lengthCm: template.lengthCm,
      fieldSizeCm: template.fieldSizeCm,
      orientation: template.orientation || "Süden oben",
      rows,
      columns,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      plantings
    };
  }
  function createInitialState(data) {
    const bedTemplate = data.bedTemplates.find((template) => template.id === "raised_120_240") || data.bedTemplates[0];
    const plantingTemplate = data.plantingTemplates.find((template) => template.id === "starter_raised") || data.plantingTemplates[0];
    const base = { ...initialState, loading: false, data };
    const bed = createBedFromTemplate(bedTemplate, "Hochbeet 1", plantingTemplate, base);
    return {
      ...base,
      activeBedId: bed.id,
      beds: [bed]
    };
  }
  function persist(state) {
    const { loading, data, toast, catalogTargetParcel, pendingPlantId, ...saved } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }
  function loadSaved(data) {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!parsed?.beds?.length) return null;
      return { ...initialState, ...parsed, data, loading: false, toast: "" };
    } catch {
      return null;
    }
  }
  return {
    subscribe: store.subscribe,
    async load() {
      const [plants, bedTemplates, plantingTemplates, seasonHints] = await Promise.all([
        fetchJson("/assets/data/plants.json"),
        fetchJson("/assets/data/bed_templates.json"),
        fetchJson("/assets/data/planting_templates.json"),
        fetchJson("/assets/data/season_hints.json")
      ]);
      const data = { plants, bedTemplates, plantingTemplates, seasonHints };
      const loaded = loadSaved(data) || createInitialState(data);
      const urlScreen = new URLSearchParams(location.search).get("screen");
      if (screens.includes(urlScreen)) loaded.screen = urlScreen;
      ensureSelectedParcel(loaded, activeBed(loaded));
      commit(loaded);
    },
    activeBed,
    findPlant,
    parcelLabels,
    occupiedCount: (bed = activeBed()) => Object.keys(bed?.plantings || {}).length,
    freeCount: (bed = activeBed()) => parcelLabels(bed).length - Object.keys(bed?.plantings || {}).length,
    orientationShort,
    go(screen) {
      commit((state) => ({
        ...state,
        screen,
        catalogTargetParcel: "",
        pendingPlantId: ""
      }));
      window.scrollTo({ top: 0 });
    },
    selectBed(bedId) {
      commit((state) => {
        state.activeBedId = bedId;
        state.screen = "planner";
        state.catalogTargetParcel = "";
        state.pendingPlantId = "";
        ensureSelectedParcel(state, activeBed(state));
        return state;
      });
      window.scrollTo({ top: 0 });
    },
    setActiveBed(bedId) {
      commit((state) => {
        state.activeBedId = bedId;
        ensureSelectedParcel(state, activeBed(state));
        return state;
      });
    },
    selectParcel(label) {
      if (!snapshot.pendingPlantId) {
        commit((state) => ({ ...state, selectedParcel: label }));
        return;
      }
      const plantId = snapshot.pendingPlantId;
      commit((state) => {
        const bed = activeBed(state);
        bed.plantings[label] = createPlanting(plantId, toDateInput(/* @__PURE__ */ new Date()), state);
        bed.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        state.selectedParcel = label;
        state.selectedPlantId = plantId;
        state.pendingPlantId = "";
        return state;
      });
      notify(`${findPlant(plantId)?.name || "Pflanze"} in Feld ${label} gesetzt.`);
    },
    openParcelDetail(label) {
      commit((state) => ({ ...state, selectedParcel: label, screen: "detail", pendingPlantId: "", catalogTargetParcel: "" }));
      window.scrollTo({ top: 0 });
    },
    openPlantCatalog() {
      commit((state) => ({ ...state, catalogTargetParcel: state.selectedParcel, pendingPlantId: "", screen: "catalog" }));
      window.scrollTo({ top: 0 });
    },
    cancelPlantCatalog() {
      commit((state) => ({ ...state, catalogTargetParcel: "", screen: "planner" }));
      window.scrollTo({ top: 0 });
    },
    setCatalogQuery(query) {
      commit((state) => ({ ...state, catalogQuery: query }));
    },
    setCatalogCategory(category) {
      commit((state) => ({ ...state, catalogCategory: category }));
    },
    toggleFilter(filter) {
      commit((state) => ({
        ...state,
        catalogFilters: state.catalogFilters.includes(filter) ? state.catalogFilters.filter((item) => item !== filter) : [...state.catalogFilters, filter]
      }));
    },
    setSelectedPlant(plantId) {
      commit((state) => ({ ...state, selectedPlantId: plantId }));
    },
    choosePlantForPlanning(plantId) {
      commit((state) => ({
        ...state,
        selectedPlantId: plantId,
        pendingPlantId: plantId,
        screen: "planner",
        catalogTargetParcel: ""
      }));
      window.scrollTo({ top: 0 });
      notify(`${findPlant(plantId)?.name || "Pflanze"} gewählt. Tippe auf ein freies Feld.`);
    },
    cancelPendingPlant() {
      commit((state) => ({ ...state, pendingPlantId: "" }));
    },
    plantFromCatalog(plantId) {
      const label = snapshot.catalogTargetParcel;
      if (!label) {
        commit((state) => ({
          ...state,
          selectedPlantId: plantId,
          pendingPlantId: plantId,
          screen: "planner",
          catalogTargetParcel: ""
        }));
        window.scrollTo({ top: 0 });
        notify(`${findPlant(plantId)?.name || "Pflanze"} gewählt. Tippe auf ein freies Feld.`);
        return;
      }
      commit((state) => {
        const bed = activeBed(state);
        bed.plantings[label] = createPlanting(plantId, toDateInput(/* @__PURE__ */ new Date()), state);
        bed.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        state.selectedParcel = label;
        state.selectedPlantId = plantId;
        state.catalogTargetParcel = "";
        state.pendingPlantId = "";
        state.screen = "planner";
        return state;
      });
      window.scrollTo({ top: 0 });
      notify(`${findPlant(plantId)?.name || "Pflanze"} in Feld ${label} gesetzt.`);
    },
    plantSelectedField(plantId = snapshot.selectedPlantId) {
      commit((state) => {
        const bed = activeBed(state);
        bed.plantings[state.selectedParcel] = createPlanting(plantId, toDateInput(/* @__PURE__ */ new Date()), state);
        bed.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        state.selectedPlantId = plantId;
        state.pendingPlantId = "";
        return state;
      });
      notify(`${findPlant(plantId)?.name || "Pflanze"} in Feld ${snapshot.selectedParcel} gesetzt.`);
    },
    clearField() {
      commit((state) => {
        delete activeBed(state).plantings[state.selectedParcel];
        return state;
      });
      notify(`Feld ${snapshot.selectedParcel} ist frei.`);
    },
    resetBed() {
      if (!confirm("Alle Pflanzungen in diesem Beet löschen?")) return;
      commit((state) => {
        activeBed(state).plantings = {};
        return state;
      });
      notify("Beet wurde zurückgesetzt.");
    },
    randomFill() {
      commit((state) => {
        const bed = activeBed(state);
        const candidates = state.data.plants.filter(
          (plant) => plant.recommendedFieldSizeCm <= bed.fieldSizeCm || plant.smallSpaceSuitable
        );
        bed.plantings = {};
        parcelLabels(bed).forEach((label, index) => {
          if (index % 3 === 2) return;
          const plant = candidates[index % candidates.length];
          bed.plantings[label] = createPlanting(plant.id, toDateInput(/* @__PURE__ */ new Date()), state);
        });
        return state;
      });
      notify("Demo-Verteilung erzeugt.");
    },
    createTemplateBed(templateId) {
      commit((state) => {
        const template = state.data.bedTemplates.find((item) => item.id === templateId);
        const plantingTemplate = state.data.plantingTemplates.find((item) => item.bedTemplateId === template.id) || state.data.plantingTemplates[0];
        const bed = createBedFromTemplate(template, template.name.replace(" x ", " × "), plantingTemplate, state);
        state.beds.unshift(bed);
        state.activeBedId = bed.id;
        state.selectedParcel = "A1";
        state.catalogTargetParcel = "";
        state.pendingPlantId = "";
        state.screen = "planner";
        return state;
      });
      notify("Vorlage angelegt.");
    },
    createCustomBed(formData) {
      commit((state) => {
        const template = {
          widthCm: Number(formData.get("widthCm") || 120),
          lengthCm: Number(formData.get("lengthCm") || 240),
          fieldSizeCm: Number(formData.get("fieldSizeCm") || 30),
          orientation: String(formData.get("orientation") || "Süden oben")
        };
        const bed = createBedFromTemplate(template, String(formData.get("name") || "Neues Beet"), null, state);
        state.beds.unshift(bed);
        state.activeBedId = bed.id;
        state.selectedParcel = "A1";
        state.catalogTargetParcel = "";
        state.pendingPlantId = "";
        state.screen = "planner";
        return state;
      });
      notify("Neues Beet angelegt.");
    },
    saveDetail(formData) {
      commit((state) => {
        const plantId = String(formData.get("plantId"));
        activeBed(state).plantings[state.selectedParcel] = {
          ...activeBed(state).plantings[state.selectedParcel] || createPlanting(plantId, toDateInput(/* @__PURE__ */ new Date()), state),
          plantId,
          plantedDate: String(formData.get("plantedDate")),
          plantingType: String(formData.get("plantingType")),
          count: Number(formData.get("count") || 1),
          variety: String(formData.get("variety") || ""),
          note: String(formData.get("note") || ""),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        state.selectedPlantId = plantId;
        state.pendingPlantId = "";
        state.catalogTargetParcel = "";
        state.screen = "planner";
        return state;
      });
      notify("Feld gespeichert.");
    },
    deleteDetail() {
      commit((state) => {
        delete activeBed(state).plantings[state.selectedParcel];
        state.pendingPlantId = "";
        state.catalogTargetParcel = "";
        state.screen = "planner";
        return state;
      });
      notify("Pflanzung gelöscht.");
    },
    resetAll() {
      if (!confirm("Alle lokalen Beetdaten zurücksetzen?")) return;
      localStorage.removeItem(STORAGE_KEY);
      const fresh = createInitialState(snapshot.data);
      commit(fresh);
      notify("Lokale Daten zurückgesetzt.");
    },
    dashboardHints,
    recentPlantings,
    filteredPlants,
    plausibilityText,
    nextHarvestText,
    categoryDetail,
    relativeDate,
    toDateInput
  };
}
async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Konnte ${path} nicht laden`);
  return response.json();
}
function dashboardHints(state, bed) {
  const month = (/* @__PURE__ */ new Date()).getMonth() + 1;
  const plantedIds = new Set(Object.values(bed.plantings).map((planting) => planting.plantId));
  const hints = state.data.seasonHints.filter((hint) => hint.month === month && (!hint.plantId || plantedIds.has(hint.plantId))).map((hint) => ({ type: hint.type, text: hint.text }));
  const free = parcelLabelsFor(bed).find((label) => !bed.plantings[label]);
  if (free) hints.push({ type: "Freies Feld", text: `Feld ${free} ist frei und kann neu bepflanzt werden.` });
  for (const [label, planting] of Object.entries(bed.plantings)) {
    const plant = state.data.plants.find((item) => item.id === planting.plantId);
    if (!plant) continue;
    if (daysSince(planting.plantedDate) >= plant.harvestDaysMin - 7) {
      hints.push({ type: "Bald ernten", text: `${plant.name} in Feld ${label} ist bald erntereif.` });
    }
  }
  return hints.length ? hints : [{ type: "Jetzt pflanzen", text: "Jetzt pflanzen: Basilikum, Tomate." }];
}
function recentPlantings(state, bed) {
  return Object.values(bed.plantings).map((planting) => ({
    plant: state.data.plants.find((plant) => plant.id === planting.plantId),
    days: relativeDate(planting.plantedDate),
    date: planting.plantedDate
  })).filter((item) => item.plant).sort((a, b) => b.date.localeCompare(a.date));
}
function filteredPlants(state) {
  const query = state.catalogQuery.trim().toLowerCase();
  return state.data.plants.filter((plant) => {
    if (state.catalogCategory !== "Alle" && plant.category !== state.catalogCategory) return false;
    if (query && !plant.name.toLowerCase().includes(query)) return false;
    if (state.catalogFilters.includes("beginner") && plant.beginnerFriendliness !== "einfach") return false;
    if (state.catalogFilters.includes("quick") && !plant.quickHarvest) return false;
    if (state.catalogFilters.includes("small") && !plant.smallSpaceSuitable) return false;
    return true;
  });
}
function plausibilityText(state, bed, label, plant) {
  if (!plant) return "Wähle eine Pflanze aus der Leiste oder aus dem Katalog.";
  const month = (/* @__PURE__ */ new Date()).getMonth() + 1;
  const messages = [];
  if (plant.recommendedFieldSizeCm > bed.fieldSizeCm) messages.push("Für dieses Feld eher zu groß.");
  if (!plant.plantingMonths.includes(month) && !plant.sowingMonths.includes(month)) {
    messages.push("Aktuell ist kein idealer Pflanzmonat.");
  }
  if (plant.lightRequirement === "Sonne") messages.push("Braucht viel Sonne.");
  const neighbors = neighborPlants(state, bed, label);
  const good = neighbors.find((neighbor) => plant.goodNeighbors.includes(neighbor.name));
  const bad = neighbors.find((neighbor) => plant.badNeighbors.includes(neighbor.name));
  if (good) messages.push(`Passt gut neben ${good.name}.`);
  if (bad) messages.push(`Lieber nicht direkt neben ${bad.name} setzen.`);
  messages.push(`In dieses Feld passen ca. ${plant.plantsPerFieldMin}-${plant.plantsPerFieldMax} Pflanzen.`);
  return messages.join(" ");
}
function nextHarvestText(state, bed) {
  const values = Object.values(bed.plantings).map((planting) => {
    const plant = state.data.plants.find((item) => item.id === planting.plantId);
    return plant ? plant.harvestDaysMin - daysSince(planting.plantedDate) : null;
  }).filter((days) => days !== null).sort((a, b) => a - b);
  if (!values.length) return "offen";
  return values[0] <= 0 ? "jetzt" : `in ${values[0]} Tagen`;
}
function neighborPlants(state, bed, label) {
  const match = /^([A-Z])(\d+)$/.exec(label);
  if (!match) return [];
  const col = match[1].charCodeAt(0) - 65;
  const row = Number(match[2]) - 1;
  return [
    [col - 1, row],
    [col + 1, row],
    [col, row - 1],
    [col, row + 1]
  ].filter(([c, r]) => c >= 0 && c < bed.columns && r >= 0 && r < bed.rows).map(([c, r]) => `${String.fromCharCode(65 + c)}${r + 1}`).map((parcel) => state.data.plants.find((plant) => plant.id === bed.plantings[parcel]?.plantId)).filter(Boolean);
}
function parcelLabelsFor(bed) {
  return Array.from({ length: bed.rows * bed.columns }, (_, index) => {
    const row = Math.floor(index / bed.columns) + 1;
    const column = index % bed.columns;
    return `${String.fromCharCode(65 + column)}${row}`;
  });
}
function ensureSelectedParcel(state, bed) {
  if (!bed || isValidLabel(state.selectedParcel, bed.rows, bed.columns)) return;
  state.selectedParcel = "A1";
}
function isValidLabel(label, rows, columns) {
  const match = /^([A-Z])(\d+)$/.exec(label);
  if (!match) return false;
  const column = match[1].charCodeAt(0) - 64;
  const row = Number(match[2]);
  return column >= 1 && column <= columns && row >= 1 && row <= rows;
}
function categoryDetail(plant) {
  if (plant.id === "tomato" || plant.id === "pepper" || plant.id === "cucumber") return "Fruchtgemüse";
  if (plant.category === "Kräuter") return "Küchenkraut";
  return plant.category;
}
function orientationShort(orientation) {
  return String(orientation).replace(" oben", "").replace("Süden", "Südseite");
}
function daysSince(value) {
  const start = new Date(value);
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 864e5));
}
function relativeDate(value) {
  const days = daysSince(value);
  if (days === 0) return "heute";
  if (days === 1) return "gestern";
  if (days < 7) return `vor ${days} Tagen`;
  return `vor ${Math.floor(days / 7)} Woche${days >= 14 ? "n" : ""}`;
}
function toDateInput(date) {
  return date.toISOString().slice(0, 10);
}
function BedPreview($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const planner = getContext("planner");
    let { bed, size = "preview", selectedParcel = "" } = $$props;
    $$renderer2.push(`<div${attr_class(`bed-preview ${size}`)}${attr_style(`--rows:${bed.rows};--cols:${bed.columns}`)}><div class="bed-preview-grid"><!--[-->`);
    const each_array = ensure_array_like(planner.parcelLabels(bed));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let label = each_array[$$index];
      const plant = bed.plantings[label] ? planner.findPlant(bed.plantings[label].plantId) : null;
      $$renderer2.push(`<span${attr_class("", void 0, { "selected": selectedParcel === label })}>${escape_html(plant?.icon || "")}</span>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
function BottomNav($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("planner");
    let { active } = $$props;
    const items = [
      ["home", "⌂", "Start"],
      ["beds", "▦", "Beete"],
      ["catalog", "♧", "Katalog"],
      ["more", "⚙", "Mehr"]
    ];
    $$renderer2.push(`<nav class="bottom-nav" aria-label="Hauptnavigation"><!--[-->`);
    const each_array = ensure_array_like(items);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let [screen, icon, label] = each_array[$$index];
      $$renderer2.push(`<button type="button"${attr_class("", void 0, { "active": active === screen })}><span>${escape_html(icon)}</span>${escape_html(label)}</button>`);
    }
    $$renderer2.push(`<!--]--></nav>`);
  });
}
function HomeScreen($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const planner = getContext("planner");
    let { state } = $$props;
    let bed = derived(() => planner.activeBed(state));
    let hints = derived(() => planner.dashboardHints(state, bed()).slice(0, 2));
    let activeBedIndex = derived(() => Math.max(0, state.beds.findIndex((item) => item.id === state.activeBedId)));
    function taskIcon(type) {
      if (type.includes("Gieß")) return "♢";
      if (type.includes("Ernte")) return "♧";
      return "☘";
    }
    $$renderer2.push(`<section class="screen with-nav home-screen"><div class="bed-carousel-wrap"><div class="bed-carousel" aria-label="Beete"><!--[-->`);
    const each_array = ensure_array_like(state.beds);
    for (let index = 0, $$length = each_array.length; index < $$length; index++) {
      let item = each_array[index];
      $$renderer2.push(`<article${attr_class("card hero-card bed-slide", void 0, { "active": item.id === state.activeBedId })}${attr("aria-label", `${item.name}, Beet ${index + 1} von ${state.beds.length}`)}><button class="bed-slide-main" type="button"><div class="card-title-row"><div class="title-lockup"><span class="bed-emoji">🪴</span><div><h2>${escape_html(item.name)}</h2><p>${escape_html(item.widthCm)} × ${escape_html(item.lengthCm)} cm</p></div></div> <span class="chevron">›</span></div> <div class="hero-grid">`);
      BedPreview($$renderer2, {
        bed: item,
        selectedParcel: item.id === state.activeBedId ? state.selectedParcel : ""
      });
      $$renderer2.push(`<!----></div></button></article>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (state.beds.length > 1) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="carousel-dots" aria-label="Beet auswählen"><!--[-->`);
      const each_array_1 = ensure_array_like(state.beds);
      for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
        let item = each_array_1[index];
        $$renderer2.push(`<button type="button"${attr("aria-label", `${item.name} anzeigen`)}${attr("aria-current", index === activeBedIndex() ? "true" : void 0)}${attr_class("", void 0, { "active": index === activeBedIndex() })}></button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <article class="card"><div class="section-heading"><h2>Heute im Beet</h2><button type="button">Alle anzeigen ›</button></div> <div class="task-list"><!--[-->`);
    const each_array_2 = ensure_array_like(hints());
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let hint = each_array_2[$$index_2];
      $$renderer2.push(`<button class="task-item" type="button"><span>${escape_html(taskIcon(hint.type))}</span><strong>${escape_html(hint.type)}</strong><small>${escape_html(hint.text)}</small><b>›</b></button>`);
    }
    $$renderer2.push(`<!--]--></div></article> <article class="card"><h2>Beetstatus</h2> <div class="status-grid"><div class="status-pill"><span>▦</span><small>Belegte Felder</small><strong>${escape_html(planner.occupiedCount(bed()))} / ${escape_html(planner.parcelLabels(bed()).length)}</strong></div> <div class="status-pill"><span>□</span><small>Freie Felder</small><strong>${escape_html(planner.freeCount(bed()))} / ${escape_html(planner.parcelLabels(bed()).length)}</strong></div> <div class="status-pill"><span>▣</span><small>Nächste Ernte</small><strong>${escape_html(planner.nextHarvestText(state, bed()))}</strong></div></div></article></section> `);
    BottomNav($$renderer2, { active: "home" });
    $$renderer2.push(`<!---->`);
  });
}
function AppHeader($$renderer, $$props) {
  let { title, compact = false, back = null, actions = [] } = $$props;
  $$renderer.push(`<header${attr_class("app-header", void 0, { "compact": compact })}><div class="header-row">`);
  if (back) {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<button class="icon-button ghost" type="button" aria-label="Zurück">←</button>`);
  } else {
    $$renderer.push("<!--[-1-->");
  }
  $$renderer.push(`<!--]--> <h1>${escape_html(title)}</h1> <div class="header-actions"><!--[-->`);
  const each_array = ensure_array_like(actions);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let action = each_array[$$index];
    $$renderer.push(`<button class="icon-button" type="button"${attr("aria-label", action.label)}>${escape_html(action.icon)}</button>`);
  }
  $$renderer.push(`<!--]--></div></div></header>`);
}
function BedsScreen($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const planner = getContext("planner");
    let { state } = $$props;
    AppHeader($$renderer2, {
      title: "Beete",
      actions: [
        {
          icon: "＋",
          label: "Neues Beet",
          onClick: () => document.querySelector("#new-bed")?.scrollIntoView({ behavior: "smooth" })
        }
      ]
    });
    $$renderer2.push(`<!----> <section class="screen with-nav"><article class="card"><div class="section-heading"><h2>Meine Beete</h2><button type="button">Aktives Beet ›</button></div> <div class="bed-list"><!--[-->`);
    const each_array = ensure_array_like(state.beds);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let bed = each_array[$$index];
      $$renderer2.push(`<button${attr_class("bed-list-card", void 0, { "active": bed.id === state.activeBedId })} type="button">`);
      BedPreview($$renderer2, { bed, size: "mini", selectedParcel: state.selectedParcel });
      $$renderer2.push(`<!----> <span><strong>${escape_html(bed.name)}</strong><small>${escape_html(bed.widthCm)} × ${escape_html(bed.lengthCm)} cm · ${escape_html(planner.occupiedCount(bed))} Felder belegt</small></span> <b>›</b></button>`);
    }
    $$renderer2.push(`<!--]--></div></article> <article class="card" id="new-bed"><h2>Neues Beet</h2> <form class="form-grid"><label>Beetname<input name="name"${attr("value", `Hochbeet ${state.beds.length + 1}`)}/></label> <label>Breite in cm<input name="widthCm" type="number" min="20" step="10" value="120"/></label> <label>Länge in cm<input name="lengthCm" type="number" min="20" step="10" value="240"/></label> <label>Feldgröße<select name="fieldSizeCm">`);
    $$renderer2.option({ value: "30" }, ($$renderer3) => {
      $$renderer3.push(`30 × 30 cm`);
    });
    $$renderer2.option({ value: "40" }, ($$renderer3) => {
      $$renderer3.push(`40 × 40 cm`);
    });
    $$renderer2.option({ value: "20" }, ($$renderer3) => {
      $$renderer3.push(`20 × 20 cm`);
    });
    $$renderer2.push(`</select></label> <label class="wide">Ausrichtung<select name="orientation">`);
    $$renderer2.option({}, ($$renderer3) => {
      $$renderer3.push(`Süden oben`);
    });
    $$renderer2.option({}, ($$renderer3) => {
      $$renderer3.push(`Norden oben`);
    });
    $$renderer2.option({}, ($$renderer3) => {
      $$renderer3.push(`Osten oben`);
    });
    $$renderer2.option({}, ($$renderer3) => {
      $$renderer3.push(`Westen oben`);
    });
    $$renderer2.push(`</select></label> <button class="primary wide" type="button">Raster anlegen</button></form></article> <article class="card"><h2>Vorlage wählen</h2> <div class="template-grid"><!--[-->`);
    const each_array_1 = ensure_array_like(state.data.bedTemplates);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let template = each_array_1[$$index_1];
      $$renderer2.push(`<button class="template-card" type="button"><strong>${escape_html(template.name)}</strong> <small>${escape_html(template.description)}</small></button>`);
    }
    $$renderer2.push(`<!--]--></div></article></section> `);
    BottomNav($$renderer2, { active: "beds" });
    $$renderer2.push(`<!---->`);
  });
}
function CatalogScreen($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const planner = getContext("planner");
    let { state } = $$props;
    let plants = derived(() => planner.filteredPlants(state));
    let bed = derived(() => planner.activeBed(state));
    let targetParcel = derived(() => state.catalogTargetParcel);
    const categories = ["Alle", "Gemüse", "Kräuter", "Obst", "Blumen"];
    const icons = {
      Alle: "▦",
      Gemüse: "🥬",
      Kräuter: "🌿",
      Obst: "🍓",
      Blumen: "🌼"
    };
    const filters = [
      ["beginner", "Anfängerfreundlich"],
      ["quick", "Schnelle Ernte"],
      ["small", "Kleines Feld"]
    ];
    AppHeader($$renderer2, {
      title: targetParcel() ? "Pflanze wählen" : "Pflanzenkatalog",
      compact: !!targetParcel(),
      back: targetParcel() ? () => planner.cancelPlantCatalog() : null
    });
    $$renderer2.push(`<!----> <section${attr_class("screen catalog-screen", void 0, { "with-nav": !targetParcel() })}>`);
    if (targetParcel()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<article class="catalog-target"><span>▦</span> <div><small>Ziel im Beet</small><strong>Feld ${escape_html(targetParcel())} · ${escape_html(bed().name)}</strong></div></article>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <label class="search-box"><span>⌕</span> <input${attr("value", state.catalogQuery)} placeholder="Pflanzen suchen..." autocomplete="off"/> <span>☷</span></label> <div class="chip-row"><!--[-->`);
    const each_array = ensure_array_like(categories);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let category = each_array[$$index];
      $$renderer2.push(`<button${attr_class("chip", void 0, { "active": state.catalogCategory === category })} type="button">${escape_html(icons[category])} ${escape_html(category)}</button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="chip-row compact"><!--[-->`);
    const each_array_1 = ensure_array_like(filters);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let [id, label] = each_array_1[$$index_1];
      $$renderer2.push(`<button${attr_class("chip soft", void 0, { "active": state.catalogFilters.includes(id) })} type="button">${escape_html(label)}</button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="plant-grid"><!--[-->`);
    const each_array_2 = ensure_array_like(plants());
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let plant = each_array_2[$$index_2];
      $$renderer2.push(`<article class="plant-card"><div class="plant-image">${escape_html(plant.icon)}</div> <div class="plant-card-body"><h2>${escape_html(plant.name)}</h2> <div class="plant-meta"><span>☼ ${escape_html(plant.lightRequirement)}</span><span>${escape_html(plant.nutrientRequirement)}</span></div> <small>${escape_html(plant.plantsPerFieldMin)}-${escape_html(plant.plantsPerFieldMax)} pro Feld · ${escape_html(plant.harvestDaysMin)}-${escape_html(plant.harvestDaysMax)} Tage</small> <button type="button">${escape_html(targetParcel() ? `In Feld ${targetParcel()} pflanzen` : "Im Beet verwenden")} ›</button></div></article>`);
    }
    $$renderer2.push(`<!--]--></div></section> `);
    if (!targetParcel()) {
      $$renderer2.push("<!--[0-->");
      BottomNav($$renderer2, { active: "catalog" });
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function BedGrid($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const planner = getContext("planner");
    let { bed, selectedParcel } = $$props;
    $$renderer2.push(`<div class="grid-wrap"${attr_style(`--rows:${bed.rows};--cols:${bed.columns}`)}><div class="row-labels"><!--[-->`);
    const each_array = ensure_array_like(Array.from({ length: bed.rows }, (_, index) => index + 1));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let row = each_array[$$index];
      $$renderer2.push(`<span>${escape_html(row)}</span>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="bed-frame"><div class="soil-grid"><!--[-->`);
    const each_array_1 = ensure_array_like(planner.parcelLabels(bed));
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let label = each_array_1[$$index_1];
      const planting = bed.plantings[label];
      const plant = planting ? planner.findPlant(planting.plantId) : null;
      $$renderer2.push(`<button${attr_class("parcel", void 0, { "selected": selectedParcel === label })} type="button"${attr("aria-label", `Feld ${label}`)}><small>${escape_html(label)}</small><span>${escape_html(plant?.icon || "")}</span></button>`);
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
  });
}
function PlannerScreen($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const planner = getContext("planner");
    let { state } = $$props;
    let bed = derived(() => planner.activeBed(state));
    let selectedPlanting = derived(() => bed().plantings[state.selectedParcel]);
    let selectedPlant = derived(() => selectedPlanting() ? planner.findPlant(selectedPlanting().plantId) : planner.findPlant(state.selectedPlantId));
    let pendingPlant = derived(() => state.pendingPlantId ? planner.findPlant(state.pendingPlantId) : null);
    AppHeader($$renderer2, {
      title: "Beet planen",
      compact: true,
      back: () => planner.go("home"),
      actions: [{ icon: "?", label: "Hilfe" }]
    });
    $$renderer2.push(`<!----> <section class="screen planner-screen"><article class="card planner-card"><div class="planner-topline"><div class="title-lockup"><span class="bed-emoji">🪴</span><div><h2>${escape_html(bed().name)}</h2><p>${escape_html(bed().widthCm)} × ${escape_html(bed().lengthCm)} cm · ${escape_html(bed().fieldSizeCm)} cm Raster</p></div></div> <button class="primary small" type="button">Speichern</button></div> <div class="segmented"><button class="active" type="button">☝ Manuell</button> <button type="button">🎲 Zufall</button> <button type="button">↺ Zurücksetzen</button></div> `);
    if (pendingPlant()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="placement-prompt"><span>${escape_html(pendingPlant().icon)}</span> <div><strong>${escape_html(pendingPlant().name)} platzieren</strong><small>Tippe auf ein freies Feld im Beet.</small></div> <button type="button">Abbrechen</button></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="selected-field"><div><small>Ausgewähltes Feld</small> <strong>Feld ${escape_html(state.selectedParcel)}</strong> <span>${escape_html(selectedPlanting() ? `${selectedPlant().name} gepflanzt` : "Noch frei")}</span></div> <button class="primary small" type="button">${escape_html(selectedPlanting() ? "Ändern" : "Pflanze wählen")}</button></div> <div class="direction-chip">Norden ↑</div> `);
    BedGrid($$renderer2, { bed: bed(), selectedParcel: state.selectedParcel });
    $$renderer2.push(`<!----> <div class="direction-chip bottom">${escape_html(planner.orientationShort(bed().orientation))}</div> <p class="plant-strip-label">Schnell pflanzen in Feld ${escape_html(state.selectedParcel)}</p> <div class="plant-strip"><!--[-->`);
    const each_array = ensure_array_like(state.data.plants.slice(0, 6));
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let plant = each_array[$$index];
      $$renderer2.push(`<button type="button"${attr_class("", void 0, { "active": state.selectedPlantId === plant.id })}><span>${escape_html(plant.icon)}</span><small>${escape_html(plant.name)}</small></button>`);
    }
    $$renderer2.push(`<!--]--></div></article> <article class="hint-card"><strong>Feld ${escape_html(state.selectedParcel)}</strong> <span>${escape_html(planner.plausibilityText(state, bed(), state.selectedParcel, selectedPlant()))}</span></article> <div class="planner-actions"><button type="button">＋ Pflanze wählen</button> <button type="button"${attr("disabled", !selectedPlanting(), true)}>✎ Feld bearbeiten</button> <button type="button"${attr("disabled", !selectedPlanting(), true)}>⌫ Feld löschen</button></div></section>`);
  });
}
function DetailScreen($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const planner = getContext("planner");
    let { state } = $$props;
    let bed = derived(() => planner.activeBed(state));
    let planting = derived(() => bed().plantings[state.selectedParcel] || {
      plantId: state.selectedPlantId,
      plantedDate: planner.toDateInput(/* @__PURE__ */ new Date()),
      plantingType: "Jungpflanze",
      count: 1,
      variety: "",
      note: ""
    });
    let plant = derived(() => planner.findPlant(planting().plantId) || state.data.plants[0]);
    AppHeader($$renderer2, {
      title: `Feld ${state.selectedParcel}`,
      compact: true,
      back: () => planner.go("planner"),
      actions: [{ icon: "⋮", label: "Mehr" }]
    });
    $$renderer2.push(`<!----> <section class="screen detail-screen"><article class="card detail-hero"><div class="plant-portrait">${escape_html(plant().icon)}</div> <div><h2>${escape_html(plant().name)}</h2> <span class="badge">⌁ ${escape_html(plant().category)}</span> <p>${escape_html(planner.categoryDetail(plant()))} · ${escape_html(plant().nutrientRequirement)}</p> <p>Ernte in ca. ${escape_html(plant().harvestDaysMin)}-${escape_html(plant().harvestDaysMax)} Tagen</p></div> <div class="parcel-strip"><span class="round-icon">▦</span> <div><strong>Parzelle ${escape_html(state.selectedParcel)}</strong><small>${escape_html(bed().fieldSizeCm)} × ${escape_html(bed().fieldSizeCm)} cm</small></div> `);
    BedPreview($$renderer2, {
      bed: bed(),
      size: "micro",
      selectedParcel: state.selectedParcel
    });
    $$renderer2.push(`<!----></div></article> <article class="card"><form class="detail-form"><label><span>⚑ Pflanze</span>`);
    $$renderer2.select({ name: "plantId", value: plant().id }, ($$renderer3) => {
      $$renderer3.push(`<!--[-->`);
      const each_array = ensure_array_like(state.data.plants);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let item = each_array[$$index];
        $$renderer3.option({ value: item.id }, ($$renderer4) => {
          $$renderer4.push(`${escape_html(item.name)}`);
        });
      }
      $$renderer3.push(`<!--]-->`);
    });
    $$renderer2.push(`</label> <label><span>▣ Gepflanzt am</span><input type="date" name="plantedDate"${attr("value", planting().plantedDate)}/></label> <label><span>☘ Direktsaat / Jungpflanze</span>`);
    $$renderer2.select({ name: "plantingType", value: planting().plantingType }, ($$renderer3) => {
      $$renderer3.option({}, ($$renderer4) => {
        $$renderer4.push(`Jungpflanze`);
      });
      $$renderer3.option({}, ($$renderer4) => {
        $$renderer4.push(`Direktsaat`);
      });
    });
    $$renderer2.push(`</label> <label><span># Anzahl</span><input type="number" min="1" max="99" name="count"${attr("value", planting().count)}/></label> <label><span>◇ Sorte</span><input name="variety"${attr("value", planting().variety || "")} placeholder="z. B. San Marzano"/></label> <label><span>☷ Notiz</span><textarea name="note" rows="2">`);
    const $$body = escape_html(planting().note || "");
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea></label> <button class="primary full" type="button">✓ Speichern</button></form></article> <div class="info-grid"><div class="info-box"><span>☼</span><strong>${escape_html(plant().lightRequirement)}</strong><small>Sonne: ${escape_html(planner.orientationShort(bed().orientation))}</small></div> <div class="info-box"><span>♧</span><strong>${escape_html(plant().nutrientRequirement)}</strong><small>Nährstoffbedarf</small></div> <div class="info-box"><span>☘</span><strong>Guter Nachbar</strong><small>${escape_html(plant().goodNeighbors.slice(0, 2).join(", ") || "keine Angabe")}</small></div></div> <button class="danger full" type="button">⌫ Pflanzung löschen</button></section>`);
  });
}
function MoreScreen($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    getContext("planner");
    let { state } = $$props;
    AppHeader($$renderer2, { title: "Mehr", actions: [{ icon: "…", label: "Mehr" }] });
    $$renderer2.push(`<!----> <section class="screen with-nav"><article class="card"><h2>Lokale Daten</h2> <p>Alle Daten bleiben auf diesem Gerät. Kein Login. Keine Cloud. Offline nutzbar.</p> <div class="status-grid single"><div class="status-pill"><span>▦</span><small>Beete</small><strong>${escape_html(state.beds.length)}</strong></div> <div class="status-pill"><span>☘</span><small>Pflanzen</small><strong>${escape_html(state.data.plants.length)}</strong></div></div></article> <article class="card settings-list"><button type="button">Daten speichern <span>›</span></button> <button type="button">Daten zurücksetzen <span>›</span></button> <button type="button">Über die App <span>0.3.0</span></button> <button type="button">Lizenzhinweise <span>Unicode-Emojis</span></button></article></section> `);
    BottomNav($$renderer2, { active: "more" });
    $$renderer2.push(`<!---->`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const planner = createPlannerStore();
    setContext("planner", planner);
    $$renderer2.push(`<main class="app-shell" aria-live="polite">`);
    if (store_get($$store_subs ??= {}, "$planner", planner).loading) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="loading-card">BeetPlaner wird geladen...</div>`);
    } else if (store_get($$store_subs ??= {}, "$planner", planner).screen === "home") {
      $$renderer2.push("<!--[1-->");
      HomeScreen($$renderer2, { state: store_get($$store_subs ??= {}, "$planner", planner) });
    } else if (store_get($$store_subs ??= {}, "$planner", planner).screen === "beds") {
      $$renderer2.push("<!--[2-->");
      BedsScreen($$renderer2, { state: store_get($$store_subs ??= {}, "$planner", planner) });
    } else if (store_get($$store_subs ??= {}, "$planner", planner).screen === "catalog") {
      $$renderer2.push("<!--[3-->");
      CatalogScreen($$renderer2, { state: store_get($$store_subs ??= {}, "$planner", planner) });
    } else if (store_get($$store_subs ??= {}, "$planner", planner).screen === "planner") {
      $$renderer2.push("<!--[4-->");
      PlannerScreen($$renderer2, { state: store_get($$store_subs ??= {}, "$planner", planner) });
    } else if (store_get($$store_subs ??= {}, "$planner", planner).screen === "detail") {
      $$renderer2.push("<!--[5-->");
      DetailScreen($$renderer2, { state: store_get($$store_subs ??= {}, "$planner", planner) });
    } else {
      $$renderer2.push("<!--[-1-->");
      MoreScreen($$renderer2, { state: store_get($$store_subs ??= {}, "$planner", planner) });
    }
    $$renderer2.push(`<!--]--> `);
    if (store_get($$store_subs ??= {}, "$planner", planner).toast) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="toast">${escape_html(store_get($$store_subs ??= {}, "$planner", planner).toast)}</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></main>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
