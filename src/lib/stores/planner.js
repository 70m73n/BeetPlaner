import { writable } from "svelte/store";

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

export function createPlannerStore() {
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

  function createPlanting(plantId, plantedDate = toDateInput(new Date()), state = snapshot) {
    const plant = findPlant(plantId, state);
    return {
      id: `planting-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      plantId,
      plantedDate,
      plantingType: "Jungpflanze",
      count: plant?.plantsPerFieldMin || 1,
      variety: plant?.id === "tomato" ? "San Marzano" : "",
      note: plant?.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  function createBedFromTemplate(template, name, plantingTemplate, state = snapshot) {
    const columns = Math.max(1, Math.floor(template.widthCm / template.fieldSizeCm));
    const rows = Math.max(1, Math.floor(template.lengthCm / template.fieldSizeCm));
    const plantings = {};
    const now = new Date();
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plantings
    };
  }

  function createInitialState(data) {
    const bedTemplate = data.bedTemplates.find((template) => template.id === "raised_120_240") || data.bedTemplates[0];
    const plantingTemplate =
      data.plantingTemplates.find((template) => template.id === "starter_raised") || data.plantingTemplates[0];
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
        bed.plantings[label] = createPlanting(plantId, toDateInput(new Date()), state);
        bed.updatedAt = new Date().toISOString();
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
        catalogFilters: state.catalogFilters.includes(filter)
          ? state.catalogFilters.filter((item) => item !== filter)
          : [...state.catalogFilters, filter]
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
        bed.plantings[label] = createPlanting(plantId, toDateInput(new Date()), state);
        bed.updatedAt = new Date().toISOString();
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
        bed.plantings[state.selectedParcel] = createPlanting(plantId, toDateInput(new Date()), state);
        bed.updatedAt = new Date().toISOString();
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
          bed.plantings[label] = createPlanting(plant.id, toDateInput(new Date()), state);
        });
        return state;
      });
      notify("Demo-Verteilung erzeugt.");
    },

    createTemplateBed(templateId) {
      commit((state) => {
        const template = state.data.bedTemplates.find((item) => item.id === templateId);
        const plantingTemplate =
          state.data.plantingTemplates.find((item) => item.bedTemplateId === template.id) ||
          state.data.plantingTemplates[0];
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
          ...(activeBed(state).plantings[state.selectedParcel] || createPlanting(plantId, toDateInput(new Date()), state)),
          plantId,
          plantedDate: String(formData.get("plantedDate")),
          plantingType: String(formData.get("plantingType")),
          count: Number(formData.get("count") || 1),
          variety: String(formData.get("variety") || ""),
          note: String(formData.get("note") || ""),
          updatedAt: new Date().toISOString()
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
  const month = new Date().getMonth() + 1;
  const plantedIds = new Set(Object.values(bed.plantings).map((planting) => planting.plantId));
  const hints = state.data.seasonHints
    .filter((hint) => hint.month === month && (!hint.plantId || plantedIds.has(hint.plantId)))
    .map((hint) => ({ type: hint.type, text: hint.text }));

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
  return Object.values(bed.plantings)
    .map((planting) => ({
      plant: state.data.plants.find((plant) => plant.id === planting.plantId),
      days: relativeDate(planting.plantedDate),
      date: planting.plantedDate
    }))
    .filter((item) => item.plant)
    .sort((a, b) => b.date.localeCompare(a.date));
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
  const month = new Date().getMonth() + 1;
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
  const values = Object.values(bed.plantings)
    .map((planting) => {
      const plant = state.data.plants.find((item) => item.id === planting.plantId);
      return plant ? plant.harvestDaysMin - daysSince(planting.plantedDate) : null;
    })
    .filter((days) => days !== null)
    .sort((a, b) => a - b);
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
  ]
    .filter(([c, r]) => c >= 0 && c < bed.columns && r >= 0 && r < bed.rows)
    .map(([c, r]) => `${String.fromCharCode(65 + c)}${r + 1}`)
    .map((parcel) => state.data.plants.find((plant) => plant.id === bed.plantings[parcel]?.plantId))
    .filter(Boolean);
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
  return Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000));
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
