const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbz7wVlTcE_FTXb9e_PfjDEFw5vv-1DHx4WrfwxP3gE-H1Ssq70-hTg08JRK4W49shzXEg/exec",
  EDIT_CODE: "2026"
};

const LOCAL_SLOT_META_KEY = "blanquefortSlotMetaV13";
const LOCAL_CLUB_PROPOSALS_KEY = "blanquefortClubProposalsV13";
const LOCAL_WORKING_SLOTS_KEY = "blanquefortWorkingSlotsV14";
const LOCAL_BLANK_SLOTS_KEY = "blanquefortBlankSlotsV14";
const LOCAL_SCENARIOS_KEY = "blanquefortScenariosV14";
const LOCAL_SCENARIO_META_KEY = "blanquefortScenarioMetaV14";
const CLUBS = ["Basket", "Handball", "Handi-basket", "Volley", "Badminton", "Futsal", "Ecole multisports", "Entretien / Ville", "Libre / a arbitrer"];
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const LONG_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const LONG_GYMS = ["Fongravey", "Port du Roy", "Dupaty", "Lycee des metiers", "Lycée agricole"];
const BLANK_LONG_TIMES = ["17h00", "17h30", "18h00", "18h30", "19h00", "19h30", "20h00", "20h30", "21h00", "21h30", "22h00", "22h30", "23h00"];
const PROPOSAL_LONG_TIMES = BLANK_LONG_TIMES;
const REQUEST_STATUS = {
  existant_a_conserver: "Existant à conserver",
  demande_en_plus: "Demande en plus",
  a_liberer: "À libérer",
  a_deplacer: "À déplacer / échanger",
  a_preciser: "À préciser"
};
const RETAINED_SLOT_STATUS = {
  retenu: "Retenu",
  a_confirmer: "À confirmer",
  a_corriger: "À corriger",
  conflit: "Conflit",
  en_attente_club: "En attente club"
};
const PLANNING_ALL_LIMIT = 80;
const PRIORITY_LABELS = {
  vital: "Vital",
  important: "Important",
  confort: "Confort",
  negociable: "Négociable"
};

const GYMS = [
  ["Fongravey", "3 terrains possibles", "Grande salle pour les besoins à plusieurs terrains et les créneaux adaptés."],
  ["Port du Roy", "2 terrains maximum", "Gymnase utilisé pour les entraînements et rencontres selon les besoins de coordination."],
  ["Dupaty", "Bloc complet possible", "Salle utile pour les blocs longs et les usages sportifs coordonnes."],
  ["Lycee des metiers", "Salle annexe", "Salle utilisée dans les scénarios de travail pour compléter la coordination."],
  ["Lycée agricole", "Équipement complémentaire", "Équipement ajouté aux plannings de travail et scénarios."]
].map(([name, capacity, role]) => ({ name, capacity, role }));

const LONG_PROPOSALS_TEXT = `
Dupaty|Lundi|17h30|19h30|Badminton
Dupaty|Lundi|20h00|22h30|Badminton
Dupaty|Mardi|17h30|19h30|Basket
Dupaty|Mardi|20h00|22h30|Basket
Dupaty|Mercredi|17h30|19h30|Volley
Dupaty|Mercredi|20h00|22h30|Badminton
Dupaty|Jeudi|17h30|19h30|Volley
Dupaty|Jeudi|20h00|22h30|Volley
Dupaty|Vendredi|17h30|19h30|Volley
Dupaty|Vendredi|20h00|22h30|Basket
Port du Roy|Lundi|17h00|20h30|Handball
Port du Roy|Lundi|20h30|23h00|Handball
Port du Roy|Mardi|17h00|20h30|Volley
Port du Roy|Mardi|20h30|23h00|Volley
Port du Roy|Mercredi|17h00|18h30|Handball
Port du Roy|Mercredi|18h30|23h00|Basket
Port du Roy|Jeudi|17h00|20h30|Handball
Port du Roy|Jeudi|20h30|23h00|Handball
Port du Roy|Vendredi|17h00|20h30|Volley
Port du Roy|Vendredi|20h30|23h00|Volley
Fongravey|Lundi|17h00|20h30|Basket
Fongravey|Lundi|20h30|23h00|Volley
Fongravey|Mardi|17h00|19h00|Handball
Fongravey|Mardi|19h00|21h00|Handi-basket
Fongravey|Mardi|21h00|23h00|Handball
Fongravey|Mercredi|13h30|15h00|Badminton
Fongravey|Mercredi|15h00|17h00|Basket
Fongravey|Mercredi|17h00|19h00|Basket
Fongravey|Mercredi|19h30|23h00|Handball
Fongravey|Jeudi|17h00|19h00|Handball
Fongravey|Jeudi|19h30|21h00|Badminton
Fongravey|Vendredi|17h00|18h30|Handball
Fongravey|Vendredi|19h00|20h30|Handi-basket
Fongravey|Vendredi|21h00|23h00|Handball
Lycee des metiers|Lundi|19h30|22h30|Badminton
Lycee des metiers|Mardi|19h30|22h30|Badminton
Lycee des metiers|Mercredi|13h30|16h30|Badminton
Lycee des metiers|Mercredi|19h30|22h30|Badminton
Lycee des metiers|Jeudi|19h30|22h30|Futsal
Lycee des metiers|Vendredi|19h30|22h30|Badminton
`;

const LONG_PROPOSALS = LONG_PROPOSALS_TEXT.trim().split("\n").map(line => {
  const [gymnase, jour, debut, fin, association] = line.split("|");
  return { gymnase, jour, debut, fin, association };
});

let slots = [];
let workingSlots = loadLocalObject(LOCAL_WORKING_SLOTS_KEY, []);
let blankSlots = loadLocalObject(LOCAL_BLANK_SLOTS_KEY, []);
let scenarios = loadLocalObject(LOCAL_SCENARIOS_KEY, {});
let scenarioMeta = loadLocalObject(LOCAL_SCENARIO_META_KEY, {});
let activeScenario = "";
let editContext = { type: "work", id: "" };
let proposals = [];
let selected = [];
let canEdit = false;
let slotMeta = loadLocalObject(LOCAL_SLOT_META_KEY, {});
let clubProposals = loadLocalObject(LOCAL_CLUB_PROPOSALS_KEY, []);
let retainedScenarioSlots = [];
let retainedScenarioMeta = {};
let retainedViewMode = "planning";

function $(id) {
  return document.getElementById(id);
}

function loadLocalObject(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveLocalObject(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    toast("Stockage local indisponible");
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function ensureScenarioMeta(id = activeScenario) {
  const key = String(id || "1");
  if (!scenarioMeta[key]) {
    scenarioMeta[key] = {
      name: "",
      author: "",
      date: todayISO(),
      goal: "",
      comment: "",
      status: "brouillon"
    };
  }
  return scenarioMeta[key];
}

function scenarioIds() {
  return Object.keys(scenarios).sort((a, b) => {
    const da = ensureScenarioMeta(a).date || "";
    const db = ensureScenarioMeta(b).date || "";
    return da.localeCompare(db) || a.localeCompare(b);
  });
}

function ensureScenarioList() {
  if (!scenarioIds().length) {
    const id = newScenarioId();
    scenarios[id] = [];
    scenarioMeta[id] = { name: "Nouveau scénario", author: "", date: todayISO(), goal: "", comment: "", status: "brouillon" };
    activeScenario = id;
    saveLocalObject(LOCAL_SCENARIOS_KEY, scenarios);
    saveLocalObject(LOCAL_SCENARIO_META_KEY, scenarioMeta);
  }
  if (!scenarios[activeScenario]) activeScenario = scenarioIds()[0];
}

function newScenarioId() {
  return "scenario-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

function escapeHTML(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function normalizeText(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function normalizeEquipment(value) {
  const raw = String(value || "").trim();
  const key = normalizeText(raw);
  if (!key) return "";
  if (key.includes("agricole")) return "Lycée agricole";
  if (key.includes("fongravey")) return "Fongravey";
  if (key.includes("port") && key.includes("roy")) return "Port du Roy";
  if (key.includes("dupaty")) return "Dupaty";
  if (key.includes("lycee") && key.includes("metier")) return "Lycee des metiers";
  return raw;
}

function equipmentListFor(rows = []) {
  const base = GYMS.map(g => g.name);
  const extras = rows.map(s => normalizeEquipment(s[3])).filter(Boolean).filter(name => !base.includes(name));
  return [...base, ...Array.from(new Set(extras))];
}

function loadJSONP(url) {
  return new Promise((resolve, reject) => {
    const callback = "jsonp_cb_" + Math.random().toString(36).slice(2);
    const script = document.createElement("script");
    window[callback] = data => {
      delete window[callback];
      script.remove();
      resolve(data || {});
    };
    script.onerror = () => {
      delete window[callback];
      script.remove();
      reject(new Error("Impossible de charger l'API Apps Script"));
    };
    script.src = url + (url.includes("?") ? "&" : "?") + "callback=" + callback + "&t=" + Date.now();
    document.body.appendChild(script);
  });
}

async function reloadFromSheet() {
  setStatus("Chargement du Google Sheet...");
  try {
    const data = await loadJSONP(CONFIG.API_URL + (CONFIG.API_URL.includes("?") ? "&" : "?") + "action=data");
    slots = (data.creneaux || []).map(rowToArray);
    const savedWorkingSlots = loadLocalObject(LOCAL_WORKING_SLOTS_KEY, []);
    workingSlots = savedWorkingSlots.length ? savedWorkingSlots : initWorkingSlots(slots);
    proposals = data.propositions || [];
    selected = [];
    renderAll();
    setStatus("Données chargées : " + slots.length + " créneaux.", true);
  } catch (e) {
    setStatus("Erreur de chargement : " + e.message);
    alert("Erreur de chargement : " + e.message);
  }
}

function rowToArray(r) {
  const row = [r.id, r.source, r.jour, r.gymnase, r.debut, r.fin, r.association, r.usage, r.nature, r.statut, r.note].map(v => String(v || ""));
  row[3] = normalizeEquipment(row[3]);
  return row;
}

function copySlot(s) {
  return [...s].map(v => String(v || ""));
}

function normalizeTimeForWork(value) {
  const parsed = parseTime(value);
  if (!parsed) return String(value || "");
  if (parsed.minute === 15 || parsed.minute === 45) {
    const total = parsed.hour * 60 + parsed.minute - 15;
    return formatTime(Math.floor(total / 60), total % 60);
  }
  return formatTime(parsed.hour, parsed.minute);
}

function normalizeSlotForWork(s) {
  const copy = copySlot(s);
  copy[3] = normalizeEquipment(copy[3]);
  copy[4] = normalizeTimeForWork(copy[4]);
  copy[5] = normalizeTimeForWork(copy[5]);
  return copy;
}

function initWorkingSlots(baseSlots) {
  const normalized = baseSlots.map(normalizeSlotForWork);
  saveLocalObject(LOCAL_WORKING_SLOTS_KEY, normalized);
  return normalized;
}

function arrayToRow(s) {
  return { id: s[0] || "", source: s[1] || "", jour: s[2] || "", gymnase: s[3] || "", debut: s[4] || "", fin: s[5] || "", association: s[6] || "", usage: s[7] || "", nature: s[8] || "", statut: s[9] || "", note: s[10] || "" };
}

function arrayToDemandRow(s) {
  return {
    ...arrayToRow(s),
    statut_demande: requestStatus(s),
    statut_demande_libelle: requestStatusLabel(s),
    priorite: priorityValue(s),
    priorite_libelle: priorityLabel(s),
    remplace_creneau: replaceSlotText(s)
  };
}

function setStatus(message, ok = false) {
  const el = $("syncStatus");
  if (!el) return;
  el.className = "notice " + (ok ? "okmsg" : "");
  el.textContent = message;
}

function toast(message) {
  const t = $("toast");
  if (!t) return;
  t.textContent = message;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2600);
}

function unlockEdit() {
  const code = prompt("Code edition");
  if (code === CONFIG.EDIT_CODE) {
    canEdit = true;
    document.body.classList.remove("locked");
    toast("Mode edition active");
  } else if (code !== null) {
    toast("Code incorrect");
  }
}

function showTab(id, btn) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  $(id)?.classList.add("active");
  document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderActiveView();
}

function minutes(t) {
  const [h, m] = String(t || "00:00").replace("h", ":").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function parseTime(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{1,2})\s*[h:]\s*(\d{2})$/i);
  if (!match) return null;
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

function formatTime(hour, minute) {
  return String(hour).padStart(2, "0") + "h" + String(minute).padStart(2, "0");
}

function timeMinutes(value) {
  const parsed = parseTime(value);
  return parsed ? parsed.hour * 60 + parsed.minute : null;
}

function longPlanningTimeLines(rows = [], startForRow, endForRow) {
  const starts = rows.map(startForRow).map(timeMinutes).filter(value => value !== null);
  const ends = rows.map(endForRow).map(timeMinutes).filter(value => value !== null);
  if (!starts.length && !ends.length) return BLANK_LONG_TIMES;

  let first = starts.some(value => value < minutes("17h00")) ? minutes("09h00") : minutes(BLANK_LONG_TIMES[0]);
  if (starts.some(value => value < minutes("09h00"))) first = minutes("08h00");
  const last = Math.max(minutes("23h00"), ...ends);
  const roundedFirst = Math.floor(first / 30) * 30;
  const roundedLast = Math.ceil(last / 30) * 30;
  const times = [];

  for (let value = roundedFirst; value <= roundedLast; value += 30) {
    times.push(formatTime(Math.floor(value / 60), value % 60));
  }
  return times;
}

function suggestTime(value) {
  return normalizeTimeForWork(value);
}

function mairieRange(s) {
  return `${s[4] || ""}-${s[5] || ""}`;
}

function suggestedRange(s) {
  return `${suggestTime(s[4])}-${suggestTime(s[5])}`;
}

function splitRange(value) {
  const [start, end] = String(value || "").split("-").map(v => v.trim());
  return { start: start || "", end: end || "" };
}

function hasQuarterHourToVerify(s) {
  const start = parseTime(s[4]);
  const end = parseTime(s[5]);
  return [start?.minute, end?.minute].some(m => m === 15 || m === 45);
}

function getSlotMeta(id) {
  return slotMeta[id] || {};
}

function inferPriority(s) {
  const key = normalizeText([s[8], s[9], s[10]].join(" "));
  if (key.includes("socle prioritaire") || key.includes("besoin prioritaire")) return "vital";
  if (key.includes("besoin important")) return "important";
  if (key.includes("confort")) return "confort";
  return "";
}

function inferRequestStatus(s) {
  const key = normalizeText([s[1], s[7], s[8], s[9], s[10]].join(" "));
  if (key.includes("en plus") || key.includes("supplementaire") || key.includes("nouvelle demande")) return "demande_en_plus";
  if (key.includes("a liberer") || key.includes("liberable")) return "a_liberer";
  if (key.includes("a deplacer") || key.includes("deplacement") || key.includes("echange") || key.includes("switch")) return "a_deplacer";
  if (!originalMairieSlot(s[0])) return "demande_en_plus";
  return "a_preciser";
}

function requestStatus(s) {
  const meta = getSlotMeta(s[0]);
  if (meta.requestStatus || meta.statut_demande) return meta.requestStatus || meta.statut_demande;
  return inferRequestStatus(s);
}

function requestStatusLabel(s) {
  return REQUEST_STATUS[requestStatus(s)] || REQUEST_STATUS.a_preciser;
}

function requestStatusClass(s) {
  return "request-" + requestStatus(s).replaceAll("_", "-");
}

function priorityValue(s) {
  return getSlotMeta(s[0]).priority || inferPriority(s);
}

function priorityLabel(s) {
  const value = priorityValue(s);
  return value ? (PRIORITY_LABELS[value] || value) : "À préciser";
}

function replaceSlotText(s) {
  return getSlotMeta(s[0]).replaceSlot || "";
}

function getTimeStatus(s) {
  const meta = getSlotMeta(s[0]);
  return meta.timeStatus || "à vérifier";
}

function confirmedStart(s) {
  const meta = getSlotMeta(s[0]);
  return meta.confirmedStart || splitRange(meta.confirmedTime).start || "";
}

function confirmedEnd(s) {
  const meta = getSlotMeta(s[0]);
  return meta.confirmedEnd || splitRange(meta.confirmedTime).end || "";
}

function hasConfirmedRange(s) {
  return !!(confirmedStart(s) && confirmedEnd(s));
}

function effectiveStart(s) {
  return confirmedStart(s) || s[4] || "";
}

function effectiveEnd(s) {
  return confirmedEnd(s) || s[5] || "";
}

function effectiveRange(s) {
  return `${effectiveStart(s)}-${effectiveEnd(s)}`;
}

function isCorrectedSlot(s) {
  return hasConfirmedRange(s) && (getTimeStatus(s) === "corrigé" || effectiveStart(s) !== s[4] || effectiveEnd(s) !== s[5]);
}

function needsTimeReview(s) {
  return !hasConfirmedRange(s) && hasQuarterHourToVerify(s);
}

function timeStatusClass(status) {
  if (status === "confirmé") return "confirmed";
  if (status === "corrigé") return "corrected";
  return "verify";
}

function clubClass(club) {
  if (!club) return "Libre";
  if (club.includes("Basket") && !club.includes("Handi") && !club.includes("Handball")) return "Basket";
  if (club === "Handball") return "Handball";
  if (club.includes("Handi-basket")) return "Handi-basket";
  if (club.includes("Volley")) return "Volley";
  if (club.includes("Badminton")) return "Badminton";
  if (club.includes("Futsal")) return "Futsal";
  return "Libre";
}

function shortText(value, max = 70) {
  const text = String(value || "").trim();
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

function isArtificialCategory(value) {
  const key = normalizeText(value);
  return [
    "socle prioritaire",
    "socles prioritaires",
    "besoin prioritaire",
    "besoins prioritaires",
    "besoin important",
    "besoins importants",
    "occupation technique",
    "confort"
  ].some(term => key.includes(term));
}

function realCategory(value) {
  return isArtificialCategory(value) ? "" : String(value || "").trim();
}

function isCategoryValue(value) {
  const key = normalizeText(value);
  return /\bu\s?\d{1,2}\b/.test(key)
    || ["baby", "mini", "jeune", "jeunes", "u18", "senior", "seniors", "loisir", "loisirs", "handi", "handi basket", "handi-basket", "ecole", "ecole multisports"].some(term => key.includes(term));
}

function isUsageValue(value) {
  const key = normalizeText(value);
  return ["entrainement", "entrainements", "match", "matches", "competition", "competitions", "loisir", "loisirs", "tournoi", "tournois", "stage", "stages", "reunion"].some(term => key.includes(term));
}

function categoryValue(s) {
  const category = realCategory(s[8]);
  const usage = String(s[7] || "").trim();
  if (category && isCategoryValue(category)) return category;
  if (category && !isUsageValue(category)) return category;
  if (isCategoryValue(usage)) return usage;
  return "";
}

function categoryLabel(s) {
  return categoryValue(s) || "à préciser";
}

function usageLabel(s) {
  const usage = String(s[7] || "").trim();
  const category = realCategory(s[8]);
  if (usage && !isCategoryValue(usage)) return usage;
  if (isUsageValue(category)) return category;
  return "à préciser";
}

function displayNote(s) {
  const parts = [];
  if (isArtificialCategory(s[8])) parts.push(String(s[8]).trim());
  if (s[10]) parts.push(String(s[10]).trim());
  return Array.from(new Set(parts.filter(Boolean))).join(" - ");
}

function displayStatus(s) {
  const parts = [s[9], getTimeStatus(s)].map(v => String(v || "").trim()).filter(Boolean);
  return Array.from(new Set(parts)).join(" - ") || "à vérifier";
}

function requestMetrics(rows = workingSlots) {
  const metrics = {
    total: 0,
    existant_a_conserver: 0,
    demande_en_plus: 0,
    a_liberer: 0,
    a_deplacer: 0,
    a_preciser: 0,
    categories: new Set()
  };
  rows.forEach(s => {
    const hours = durationHours(s);
    const status = requestStatus(s);
    metrics.total += hours;
    metrics[status] = (metrics[status] || 0) + hours;
    const category = realCategory(s[8]);
    if (category) metrics.categories.add(category);
  });
  return metrics;
}

function formatHours(value) {
  return `${Number(value || 0).toFixed(1)} h`;
}

function slotInfoHTML(s, options = {}) {
  const note = shortText(displayNote(s), 80);
  let html = "";
  html += `<div class="meta"><b>Catégorie :</b> ${escapeHTML(categoryLabel(s))}</div>`;
  html += `<div class="meta"><b>Usage :</b> ${escapeHTML(usageLabel(s))}</div>`;
  if (options.showEquipment) html += `<div class="meta"><b>Équipement :</b> ${escapeHTML(normalizeEquipment(s[3]))}</div>`;
  if (options.showDayTime) html += `<div class="meta"><b>Jour + horaire :</b> ${escapeHTML(s[2])} ${escapeHTML(s[4])}-${escapeHTML(s[5])}</div>`;
  if (options.showRequestStatus) html += `<div class="meta"><b>Statut demande :</b> ${escapeHTML(requestStatusLabel(s))}</div>`;
  if (options.showPriority) html += `<div class="meta"><b>Priorité :</b> ${escapeHTML(priorityLabel(s))}</div>`;
  if (note) html += `<div class="meta"><b>Note :</b> ${escapeHTML(note)}</div>`;
  if (options.showReplaceSlot && replaceSlotText(s)) html += `<div class="meta"><b>Remplace :</b> ${escapeHTML(shortText(replaceSlotText(s), 90))}</div>`;
  if (options.showStatus) html += `<div class="meta"><b>Statut :</b> ${escapeHTML(displayStatus(s))}</div>`;
  return html;
}

function planningGymGroup(value) {
  const name = normalizeEquipment(value);
  const known = GYMS.map(g => g.name);
  return known.includes(name) ? name : "Autres";
}

function setSelectOptions(select, options, current) {
  if (!select) return;
  select.innerHTML = options.map(option => `<option value="${escapeHTML(option.value)}">${escapeHTML(option.label)}</option>`).join("");
  select.value = options.some(option => option.value === current) ? current : options[0]?.value || "";
}

function renderPlanningFilters() {
  const gymOptions = GYMS.map(g => ({ value: g.name, label: g.name }))
    .concat([{ value: "Autres", label: "Autres" }, { value: "Tous", label: "Tous (limite compact)" }]);
  const clubOptions = [{ value: "Tous", label: "Tous les clubs" }]
    .concat(Array.from(new Set(workingSlots.map(s => s[6]).filter(Boolean))).sort().map(value => ({ value, label: value })));
  const dayOptions = [{ value: "Tous", label: "Tous les jours" }].concat(DAYS.map(value => ({ value, label: value })));
  const statusOptions = [{ value: "Tous", label: "Tous les statuts" }]
    .concat(Object.entries(REQUEST_STATUS).map(([value, label]) => ({ value, label })));

  setSelectOptions($("planningGymFilter"), gymOptions, $("planningGymFilter")?.value || "Fongravey");
  setSelectOptions($("planningClubFilter"), clubOptions, $("planningClubFilter")?.value || "Tous");
  setSelectOptions($("planningDayFilter"), dayOptions, $("planningDayFilter")?.value || "Tous");
  setSelectOptions($("planningStatusFilter"), statusOptions, $("planningStatusFilter")?.value || "Tous");
}

function planningFilteredRows() {
  renderPlanningFilters();
  const gymFilter = $("planningGymFilter")?.value || "Fongravey";
  const clubFilter = $("planningClubFilter")?.value || "Tous";
  const dayFilter = $("planningDayFilter")?.value || "Tous";
  const statusFilter = $("planningStatusFilter")?.value || "Tous";
  const q = normalizeText($("q")?.value || "");

  return workingSlots
    .filter(s => gymFilter === "Tous" || planningGymGroup(s[3]) === gymFilter)
    .filter(s => clubFilter === "Tous" || s[6] === clubFilter)
    .filter(s => dayFilter === "Tous" || s[2] === dayFilter)
    .filter(s => statusFilter === "Tous" || requestStatus(s) === statusFilter)
    .filter(s => !q || normalizeText(s.join(" ")).includes(q))
    .sort((a, b) => planningGymGroup(a[3]).localeCompare(planningGymGroup(b[3])) || DAYS.indexOf(a[2]) - DAYS.indexOf(b[2]) || minutes(a[4]) - minutes(b[4]) || String(a[6]).localeCompare(String(b[6])));
}

function overlapRows(a, b) {
  return normalizeEquipment(a[3]) === normalizeEquipment(b[3])
    && a[2] === b[2]
    && minutes(a[4]) < minutes(b[5])
    && minutes(a[5]) > minutes(b[4]);
}

function conflictSlotIds(rows = workingSlots) {
  const ids = new Set();
  rows.forEach((row, index) => {
    rows.slice(index + 1).forEach(other => {
      if (row[0] !== other[0] && overlapRows(row, other)) {
        ids.add(row[0]);
        ids.add(other[0]);
      }
    });
  });
  return ids;
}

function conflictGroupsForDay(rows, day) {
  const dayRows = rows.filter(s => s[2] === day);
  const conflictIds = conflictSlotIds(dayRows);
  const groups = [];
  const used = new Set();

  dayRows
    .filter(s => conflictIds.has(s[0]))
    .sort((a, b) => normalizeEquipment(a[3]).localeCompare(normalizeEquipment(b[3])) || minutes(a[4]) - minutes(b[4]))
    .forEach(seed => {
      if (used.has(seed[0])) return;
      const group = [seed];
      used.add(seed[0]);
      let changed = true;
      while (changed) {
        changed = false;
        dayRows.forEach(candidate => {
          if (used.has(candidate[0]) || !conflictIds.has(candidate[0])) return;
          if (group.some(existing => overlapRows(existing, candidate))) {
            group.push(candidate);
            used.add(candidate[0]);
            changed = true;
          }
        });
      }
      groups.push(group.sort((a, b) => minutes(a[4]) - minutes(b[4]) || String(a[6]).localeCompare(String(b[6]))));
    });

  return { groups, conflictIds };
}

function planningSlotCard(s, conflictIds = conflictSlotIds()) {
  const sel = selected.includes(s[0]) ? " selected" : "";
  const needsCheck = hasQuarterHourToVerify(s);
  const conflict = conflictIds.has(s[0]);
  const conflictBadge = conflict ? '<span class="conflictBadge">Conflit</span>' : "";
  return `<div class="slot planningSlot ${clubClass(s[6])} ${requestStatusClass(s)}${sel} ${needsCheck ? "needsCheck" : ""} ${conflict ? "conflictSlot" : ""}" onclick="selectSlot('${escapeHTML(s[0])}')" ondblclick="openEdit('${escapeHTML(s[0])}', 'work')"><div class="top"><strong>${escapeHTML(s[6] || "Sans association")}</strong></div><div class="meta"><b>Catégorie :</b> ${escapeHTML(categoryLabel(s))}</div><div class="meta"><b>Usage :</b> ${escapeHTML(usageLabel(s))}</div><div class="meta"><b>Jour + horaire :</b> ${escapeHTML(s[2])} ${escapeHTML(s[4])}-${escapeHTML(s[5])}</div><div class="slotBadges"><span class="requestBadge ${requestStatusClass(s)}">${escapeHTML(requestStatusLabel(s))}</span>${conflictBadge}</div><div class="slotActions"><button class="slotAction" onclick="event.stopPropagation(); openEdit('${escapeHTML(s[0])}', 'work')">Modifier</button></div></div>`;
}

function planningDaySection(day, rows) {
  const { groups, conflictIds } = conflictGroupsForDay(rows, day);
  const conflictHtml = groups.map(group => {
    const start = Math.min(...group.map(s => minutes(s[4])));
    const end = Math.max(...group.map(s => minutes(s[5])));
    const title = `${normalizeEquipment(group[0][3])} ${formatTime(Math.floor(start / 60), start % 60)}-${formatTime(Math.floor(end / 60), end % 60)}`;
    return `<div class="conflictGroup"><div class="conflictTitle">Conflit / chevauchement - ${escapeHTML(title)}</div><div class="planningDaySlots">${group.map(s => planningSlotCard(s, conflictIds)).join("")}</div></div>`;
  }).join("");
  const normalCards = rows.filter(s => !conflictIds.has(s[0])).map(s => planningSlotCard(s, conflictIds)).join("");
  const normalHtml = normalCards ? `<div class="planningDaySlots">${normalCards}</div>` : "";
  return `<section class="planningDayGroup"><h3>${escapeHTML(day)}</h3>${conflictHtml}${normalHtml || (!conflictHtml ? '<div class="emptyClub">Aucun créneau.</div>' : "")}</section>`;
}

function renderPlanning() {
  const container = $("planningGrid");
  if (!container) return;
  const gymFilter = $("planningGymFilter")?.value || "Fongravey";
  let rows = planningFilteredRows();
  const total = rows.length;
  const limited = gymFilter === "Tous" && rows.length > PLANNING_ALL_LIMIT;
  if (limited) rows = rows.slice(0, PLANNING_ALL_LIMIT);

  container.className = "planningList";
  container.style.gridTemplateColumns = "";
  container.style.minWidth = "";
  if (!rows.length) {
    container.innerHTML = '<div class="emptyClub">Aucun créneau pour ces filtres.</div>';
    return;
  }

  const summary = `<div class="planningCount">${escapeHTML(String(total))} créneau(x) affiché(s)${limited ? ` - vue Tous limitée aux ${PLANNING_ALL_LIMIT} premiers, affine les filtres pour réduire la liste` : ""}</div>`;
  container.innerHTML = summary + DAYS
    .filter(day => rows.some(s => s[2] === day))
    .map(day => planningDaySection(day, rows.filter(s => s[2] === day)))
    .join("");
  return;
  const q = ($("q")?.value || "").toLowerCase();
  const gyms = equipmentListFor(workingSlots);
  container.style.gridTemplateColumns = `110px repeat(${gyms.length}, minmax(260px, 1fr))`;
  container.style.minWidth = `${110 + gyms.length * 260}px`;
  let html = "<div></div>" + gyms.map(name => `<div class="gymHead">${escapeHTML(name)}</div>`).join("");

  DAYS.forEach(day => {
    html += `<div class="day">${escapeHTML(day)}</div>`;
    gyms.forEach(gym => {
      let list = workingSlots.filter(s => s[2] === day && normalizeEquipment(s[3]) === gym).sort((a, b) => minutes(a[4]) - minutes(b[4]));
      if (q) list = list.filter(s => s.join(" ").toLowerCase().includes(q));
      html += '<div class="cell">';
      if (!list.length) html += '<span style="color:#647067">-</span>';
      list.forEach(s => {
        const sel = selected.includes(s[0]) ? " selected" : "";
        const status = getTimeStatus(s);
        const needsCheck = hasQuarterHourToVerify(s);
        const corrected = status === "corrigé";
        const badges = corrected
          ? `<div class="slotBadges"><span class="timeBadge corrected">corrigé</span></div>`
          : (needsCheck ? `<div class="slotBadges"><span class="timeBadge verify">à vérifier</span><span class="timeBadge soft">15/45 min</span></div>` : (status === "confirmé" ? `<div class="slotBadges"><span class="timeBadge confirmed">confirmé</span></div>` : ""));
        const requestBadge = `<div class="slotBadges"><span class="requestBadge ${requestStatusClass(s)}">${escapeHTML(requestStatusLabel(s))}</span></div>`;
        html += `<div class="slot ${clubClass(s[6])} ${requestStatusClass(s)}${sel} ${needsCheck ? "needsCheck" : ""}" onclick="selectSlot('${escapeHTML(s[0])}')" ondblclick="openEdit('${escapeHTML(s[0])}', 'work')"><div class="top"><strong>${escapeHTML(s[6] || "Sans association")}</strong></div>${slotInfoHTML(s, { showEquipment: true, showDayTime: true, showRequestStatus: true, showPriority: true, showReplaceSlot: true, showStatus: true })}${requestBadge}${badges}<div class="slotActions"><button class="slotAction" onclick="event.stopPropagation(); openEdit('${escapeHTML(s[0])}', 'work')">Modifier</button><button class="slotAction" onclick="event.stopPropagation(); setRequestStatus('${escapeHTML(s[0])}', 'a_liberer')">À libérer</button><button class="slotAction" onclick="event.stopPropagation(); setRequestStatus('${escapeHTML(s[0])}', 'a_deplacer')">À déplacer</button><button class="slotAction danger" onclick="event.stopPropagation(); deleteWorkSlot('${escapeHTML(s[0])}')">Supprimer</button></div></div>`;
      });
      html += "</div>";
    });
  });
  container.innerHTML = html;
}

function renderCards() {
  const box = $("gymCards");
  if (!box) return;
  box.innerHTML = GYMS.map(g => `<div class="tile"><b>${escapeHTML(g.name)}</b><p>${escapeHTML(g.capacity)}</p><p>${escapeHTML(g.role)}</p></div>`).join("");
}

function renderDemandSummary() {
  const metrics = requestMetrics(workingSlots);
  if ($("totalHoursKpi")) $("totalHoursKpi").textContent = formatHours(metrics.total);
  if ($("extraHoursKpi")) $("extraHoursKpi").textContent = formatHours(metrics.demande_en_plus);
  if ($("releaseHoursKpi")) $("releaseHoursKpi").textContent = formatHours(metrics.a_liberer);
  if ($("categoryKpi")) $("categoryKpi").textContent = String(metrics.categories.size);
  const box = $("demandSummary");
  if (!box) return;
  box.innerHTML = [
    ["Total heures demandées", metrics.total],
    ["Existantes à conserver", metrics.existant_a_conserver],
    ["Demandées en plus", metrics.demande_en_plus],
    ["Libérables", metrics.a_liberer],
    ["À déplacer / échanger", metrics.a_deplacer],
    ["À préciser", metrics.a_preciser],
    ["Catégories renseignées", metrics.categories.size]
  ].map(([label, value]) => `<div class="summaryPill"><b>${escapeHTML(label)}</b><span>${typeof value === "number" && label !== "Catégories renseignées" ? formatHours(value) : escapeHTML(value)}</span></div>`).join("");
}

function renderAll() {
  renderDemandSummary();
  renderActiveView();
}

function activeSectionId() {
  return document.querySelector(".section.active")?.id || "modifier";
}

function renderActiveView() {
  const id = activeSectionId();
  if (id === "modifier") renderPlanning();
  if (id === "gymnases") renderCards();
  if (id === "parClub") renderClubView();
  if (id === "propositionsClub") renderCurrentBaseView();
  if (id === "propositionsLongues") renderLongProposals();
  if (id === "scenarioRetenu") renderScenarioRetenu();
  if (id === "viergeLong") renderLongDraftPlanning();
}

function selectSlot(id) {
  selected = selected.includes(id) ? selected.filter(x => x !== id) : [...selected.slice(-1), id];
  renderPlanning();
}

function clearSelection() {
  selected = [];
  renderPlanning();
}

function editSelected() {
  if (selected.length !== 1) return toast("Sélectionne un seul créneau à déplacer.");
  openEdit(selected[0], "work");
}

function nextSlotId(list, prefix) {
  const nums = list.map(s => parseInt(String(s[0]).replace(/\D/g, ""), 10)).filter(Boolean);
  return prefix + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0");
}

function addSlot() {
  const nextId = nextSlotId(workingSlots, "W");
  const gymFilter = $("planningGymFilter")?.value || "Fongravey";
  const dayFilter = $("planningDayFilter")?.value || "Mercredi";
  const gym = gymFilter && gymFilter !== "Tous" && gymFilter !== "Autres" ? gymFilter : "Fongravey";
  const day = dayFilter && dayFilter !== "Tous" ? dayFilter : "Mercredi";
  workingSlots.push([nextId, "Ajout interface", day, gym, "17h30", "19h00", "Libre / a arbitrer", "entrainement", "", "A programmer", ""]);
  slotMeta[nextId] = { ...getSlotMeta(nextId), requestStatus: "demande_en_plus", statut_demande: "demande_en_plus" };
  saveLocalObject(LOCAL_SLOT_META_KEY, slotMeta);
  saveLocalObject(LOCAL_WORKING_SLOTS_KEY, workingSlots);
  selected = [nextId];
  renderAll();
  openEdit(nextId, "work");
}

function swapSelected() {
  if (selected.length !== 2) return toast("Sélectionne deux créneaux à échanger.");
  const a = workingSlots.find(s => s[0] === selected[0]);
  const b = workingSlots.find(s => s[0] === selected[1]);
  if (!a || !b) return;
  [a[6], b[6]] = [b[6], a[6]];
  [a[7], b[7]] = [b[7], a[7]];
  [a[8], b[8]] = [b[8], a[8]];
  [a[9], b[9]] = [b[9], a[9]];
  [a[10], b[10]] = [b[10], a[10]];
  selected = [];
  saveLocalObject(LOCAL_WORKING_SLOTS_KEY, workingSlots);
  renderAll();
  toast("Echange applique au planning des demandes");
}

function deleteWorkSlot(id) {
  if (originalMairieSlot(id)) {
    if (!confirm("Ce créneau vient de la base mairie. Le marquer comme À libérer dans le planning des demandes  La base mairie originale ne sera pas modifiée.")) return;
    setRequestStatus(id, "a_liberer");
    return;
  }
  if (!confirm("Supprimer ce créneau du planning de travail  La base mairie originale ne sera pas modifiée.")) return;
  workingSlots = workingSlots.filter(s => s[0] !== id);
  selected = selected.filter(x => x !== id);
  saveLocalObject(LOCAL_WORKING_SLOTS_KEY, workingSlots);
  renderAll();
  toast("Créneau supprimé du planning des demandes");
}

function setRequestStatus(id, status) {
  slotMeta[id] = { ...getSlotMeta(id), requestStatus: status, statut_demande: status };
  saveLocalObject(LOCAL_SLOT_META_KEY, slotMeta);
  renderAll();
  toast("Statut de demande mis a jour");
}

function getListForContext(context = editContext) {
  if (context.type === "blank") return blankSlots;
  if (context.type === "scenario") return scenarios[context.scenario || activeScenario] || [];
  return workingSlots;
}

function persistContext(context = editContext) {
  if (context.type === "blank") saveLocalObject(LOCAL_BLANK_SLOTS_KEY, blankSlots);
  if (context.type === "scenario") saveLocalObject(LOCAL_SCENARIOS_KEY, scenarios);
  if (context.type === "work") saveLocalObject(LOCAL_WORKING_SLOTS_KEY, workingSlots);
}

function originalMairieSlot(id) {
  return slots.find(s => s[0] === id);
}

function fillEditDrawer(s) {
  const meta = getSlotMeta(s[0]);
  const mairieSlot = originalMairieSlot(s[0]);
  $("editId").value = s[0];
  $("editSource").value = s[1];
  $("editJour").value = s[2];
  $("editDebut").value = s[4];
  $("editFin").value = s[5];
  $("editNature").value = categoryValue(s);
  $("editStatut").value = s[9];
  $("editGroupe").value = usageLabel(s) === "à préciser" ? "" : usageLabel(s);
  $("editNote").value = s[10];
  if ($("editRequestStatus")) $("editRequestStatus").value = requestStatus(s);
  if ($("editPriority")) $("editPriority").value = priorityValue(s);
  if ($("editReplaceSlot")) $("editReplaceSlot").value = replaceSlotText(s);
  $("editMairieTime").value = mairieSlot ? mairieRange(mairieSlot) : "";
  $("editSuggestedTime").value = suggestedRange(s);
  $("editTimeStatus").value = meta.timeStatus || (hasQuarterHourToVerify(s) ? "à vérifier" : "à vérifier");
  $("editClubNote").value = meta.clubNote || "";
  const knownGyms = equipmentListFor([...slots, ...workingSlots, ...blankSlots, ...(scenarios[activeScenario] || [])]);
  $("editGym").innerHTML = knownGyms.map(name => `<option ${name === normalizeEquipment(s[3]) ? "selected" : ""}>${escapeHTML(name)}</option>`).join("");
  $("editClub").innerHTML = CLUBS.map(c => `<option ${c === s[6] ? "selected" : ""}>${escapeHTML(c)}</option>`).join("") + "<option>Handball / Basket</option><option>Basket / Handball</option><option>Libre / a arbitrer</option>";
  const details = document.querySelector(".sourceDetails");
  if (details) details.style.display = mairieSlot ? "" : "none";
}

function openEdit(id, type = "work", scenario = activeScenario) {
  editContext = { type, id, scenario };
  const s = getListForContext(editContext).find(x => x[0] === id);
  if (!s) return;
  fillEditDrawer(s);
  $("drawer").classList.add("show");
}

function closeDrawer() {
  $("drawer")?.classList.remove("show");
}

function saveEdit() {
  const list = getListForContext();
  const s = list.find(x => x[0] === $("editId").value);
  if (!s) return;
  s[1] = $("editSource").value;
  s[2] = $("editJour").value;
  s[3] = normalizeEquipment($("editGym").value);
  s[4] = normalizeTimeForWork($("editDebut").value);
  s[5] = normalizeTimeForWork($("editFin").value);
  s[6] = $("editClub").value;
  s[7] = $("editGroupe").value;
  s[8] = $("editNature").value;
  s[9] = $("editStatut").value;
  s[10] = $("editNote").value;
  saveSlotMetaFromDrawer(s);
  persistContext();
  closeDrawer();
  renderAll();
  toast("Créneau mis à jour");
}

function saveSlotMetaFromDrawer(s) {
  const start = normalizeTimeForWork($("editDebut").value.trim());
  const end = normalizeTimeForWork($("editFin").value.trim());
  slotMeta[s[0]] = {
    confirmedStart: start,
    confirmedEnd: end,
    confirmedTime: start && end ? `${start}-${end}` : "",
    timeStatus: $("editTimeStatus").value,
    clubNote: $("editClubNote").value.trim(),
    requestStatus: $("editRequestStatus")?.value || requestStatus(s),
    statut_demande: $("editRequestStatus")?.value || requestStatus(s),
    priority: $("editPriority")?.value || "",
    replaceSlot: $("editReplaceSlot")?.value.trim() || ""
  };
  saveLocalObject(LOCAL_SLOT_META_KEY, slotMeta);
}

function applySuggestion() {
  const id = $("editId")?.value;
  const s = getListForContext().find(x => x[0] === id);
  if (!s) return;
  $("editDebut").value = normalizeTimeForWork(s[4]);
  $("editFin").value = normalizeTimeForWork(s[5]);
  $("editTimeStatus").value = "corrigé";
}

async function saveAll(reason) {
  if (!canEdit) return toast("Active le mode edition d'abord.");
  try {
    await fetch(CONFIG.API_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "replaceCreneaux", rows: slots.map(arrayToRow) }) });
    toast(reason);
    setStatus("Enregistrement envoyé. Clique sur Recharger Sheet dans quelques secondes pour vérifier.", true);
  } catch (e) {
    setStatus("Erreur d'enregistrement : " + e.message);
  }
}

function exportCSV() {
  const header = ["id", "source", "jour", "gymnase", "debut", "fin", "association", "usage", "nature", "statut", "note"];
  const csv = [header, ...slots].map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadTextFile("creneaux_blanquefort_export.csv", csv, "text/csv;charset=utf-8");
}

function renderLongProposals() {
  updateScenarioSelectLabels();
  loadScenarioMetaForm();
  renderScenarioRecap();
  const rows = scenarios[activeScenario] || [];
  const times = longPlanningTimeLines(rows, s => s[4], s => s[5]);
  const status = $("scenarioWorkStatus");
  if (status) {
    status.textContent = rows.length
      ? `Scénario affiché : ${rows.length} créneau(x), amplitude ${times[0]}-${times[times.length - 1]}.`
      : "Scénario affiché : 0 créneau. Utilise \"Depuis Planning des demandes\" puis \"Créer le scénario\" pour copier les demandes.";
  }
  renderEditableLongPlanning("longProposalCards", rows, { type: "scenario", scenario: activeScenario, subtitle: "Scénario éditable - non validé" });
}

function renderLongDraftPlanning() {
  renderEditableLongPlanning("longDraftPlanning", blankSlots, { type: "blank", subtitle: "Planning vierge éditable" });
}

function toEditableSlot(seed, prefix, list) {
  const base = seed ? copySlot(seed) : [nextSlotId(list, prefix), "Saisie locale", "Lundi", "Fongravey", "17h00", "18h30", "Libre / a arbitrer", "", "", "À vérifier", ""];
  base[0] = base[0] || nextSlotId(list, prefix);
  base[3] = normalizeEquipment(base[3]);
  base[4] = normalizeTimeForWork(base[4]);
  base[5] = normalizeTimeForWork(base[5]);
  return base;
}

function addBlankSlot() {
  const item = toEditableSlot(null, "B", blankSlots);
  blankSlots.push(item);
  saveLocalObject(LOCAL_BLANK_SLOTS_KEY, blankSlots);
  renderAll();
  openEdit(item[0], "blank");
}

function scenarioLabel(id) {
  const meta = ensureScenarioMeta(id);
  const legacy = /^[123]$/.test(String(id)) ? `Scénario ${id}` : "Scénario";
  return meta.name ? `${legacy} - ${meta.name}` : legacy;
}

function updateScenarioSelectLabels() {
  const select = $("scenarioSelect");
  if (!select) return;
  ensureScenarioList();
  const ids = scenarioIds();
  select.innerHTML = "";
  ids.forEach(id => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = scenarioLabel(id);
    select.appendChild(option);
  });
  select.value = activeScenario;
}

function loadScenarioMetaForm() {
  const meta = ensureScenarioMeta(activeScenario);
  if ($("scenarioName")) $("scenarioName").value = meta.name || "";
  if ($("scenarioAuthor")) $("scenarioAuthor").value = meta.author || "";
  if ($("scenarioDate")) $("scenarioDate").value = meta.date || todayISO();
  if ($("scenarioGoal")) $("scenarioGoal").value = meta.goal || "";
  if ($("scenarioComment")) $("scenarioComment").value = meta.comment || "";
  if ($("scenarioStatus")) $("scenarioStatus").value = meta.status || "brouillon";
}

function readScenarioMetaForm(id = activeScenario) {
  const meta = ensureScenarioMeta(id);
  if ($("scenarioName")) meta.name = $("scenarioName").value.trim();
  if ($("scenarioAuthor")) meta.author = $("scenarioAuthor").value.trim();
  if ($("scenarioDate")) meta.date = $("scenarioDate").value || meta.date || todayISO();
  if ($("scenarioGoal")) meta.goal = $("scenarioGoal").value.trim();
  if ($("scenarioComment")) meta.comment = $("scenarioComment").value.trim();
  if ($("scenarioStatus")) meta.status = $("scenarioStatus").value || "brouillon";
  return meta;
}

function saveScenarioMeta(id = activeScenario) {
  readScenarioMetaForm(id);
  saveLocalObject(LOCAL_SCENARIO_META_KEY, scenarioMeta);
  updateScenarioSelectLabels();
  renderScenarioRecap();
}

function selectScenario(value) {
  saveScenarioMeta(activeScenario);
  activeScenario = String(value || "1");
  ensureScenarioMeta(activeScenario);
  renderLongProposals();
}

function currentPlanningRowsForScenario() {
  if (!workingSlots.length) workingSlots = loadLocalObject(LOCAL_WORKING_SLOTS_KEY, []);
  if (!workingSlots.length && slots.length) workingSlots = initWorkingSlots(slots);
  return workingSlots.map(s => copySlot(s));
}

function scenarioRowsFromSource(source) {
  if (source === "blank") return [];
  if (source === "duplicate") return (scenarios[activeScenario] || []).map(s => copySlot(s));
  return currentPlanningRowsForScenario();
}

function createNewScenario() {
  const source = $("newScenarioSource")?.value || "current";
  if (source === "duplicate" && !scenarios[activeScenario]) ensureScenarioList();
  const id = newScenarioId();
  const rows = scenarioRowsFromSource(source);
  if (source === "current" && !rows.length) return toast("Aucun créneau dans le planning des demandes à copier.");
  scenarios[id] = rows;
  const sourceName = source === "blank" ? "scénario vierge" : source === "duplicate" ? "duplication" : "planning des demandes";
  scenarioMeta[id] = {
    name: source === "blank" ? "Nouveau scénario vierge" : source === "duplicate" ? "Copie de " + scenarioLabel(activeScenario) : "Base actuelle corrigée",
    author: "",
    date: todayISO(),
    goal: "",
    comment: "",
    status: "brouillon"
  };
  activeScenario = id;
  saveLocalObject(LOCAL_SCENARIOS_KEY, scenarios);
  saveLocalObject(LOCAL_SCENARIO_META_KEY, scenarioMeta);
  if ($("scenarioSelect")) $("scenarioSelect").value = activeScenario;
  renderLongProposals();
  toast("Scénario créé depuis " + sourceName + " : " + rows.length + " créneau(x)");
}

function createScenarioFromCurrent() {
  const id = newScenarioId();
  scenarios[id] = workingSlots.map(s => copySlot(s));
  scenarioMeta[id] = { name: "Base actuelle corrigée", author: "", date: todayISO(), goal: "", comment: "", status: "brouillon" };
  activeScenario = id;
  saveLocalObject(LOCAL_SCENARIOS_KEY, scenarios);
  saveLocalObject(LOCAL_SCENARIO_META_KEY, scenarioMeta);
  renderLongProposals();
  toast("Scénario créé depuis le planning des demandes");
}

function createScenarioFromBlank() {
  const id = newScenarioId();
  scenarios[id] = [];
  scenarioMeta[id] = { name: "Scénario vierge", author: "", date: todayISO(), goal: "", comment: "", status: "brouillon" };
  activeScenario = id;
  saveLocalObject(LOCAL_SCENARIOS_KEY, scenarios);
  saveLocalObject(LOCAL_SCENARIO_META_KEY, scenarioMeta);
  renderLongProposals();
  toast("Scénario vierge créé");
}

function addScenarioSlot() {
  ensureScenarioList();
  if (!scenarios[activeScenario]) scenarios[activeScenario] = [];
  const item = toEditableSlot(null, "SC" + activeScenario + "-", scenarios[activeScenario]);
  scenarios[activeScenario].push(item);
  saveLocalObject(LOCAL_SCENARIOS_KEY, scenarios);
  renderAll();
  openEdit(item[0], "scenario", activeScenario);
}

function saveScenario() {
  saveScenarioMeta(activeScenario);
  saveLocalObject(LOCAL_SCENARIOS_KEY, scenarios);
  toast("Scénario enregistré localement");
  renderLongProposals();
}

function renameScenario() {
  const meta = ensureScenarioMeta(activeScenario);
  const next = prompt("Nouveau nom du scénario", meta.name || scenarioLabel(activeScenario));
  if (next === null) return;
  meta.name = next.trim();
  saveLocalObject(LOCAL_SCENARIO_META_KEY, scenarioMeta);
  renderLongProposals();
}

function deleteScenario() {
  ensureScenarioList();
  if (!confirm("Supprimer ce scénario local  La base mairie et le planning des demandes ne seront pas modifiés.")) return;
  delete scenarios[activeScenario];
  delete scenarioMeta[activeScenario];
  if (!scenarioIds().length) {
    const id = newScenarioId();
    scenarios[id] = [];
    scenarioMeta[id] = { name: "Nouveau scénario", author: "", date: todayISO(), goal: "", comment: "", status: "brouillon" };
  }
  activeScenario = scenarioIds()[0];
  saveLocalObject(LOCAL_SCENARIOS_KEY, scenarios);
  saveLocalObject(LOCAL_SCENARIO_META_KEY, scenarioMeta);
  renderLongProposals();
}

function scenarioPayload(id = activeScenario) {
  const meta = ensureScenarioMeta(id);
  const rows = scenarios[id] || [];
  return {
    scenario_id: String(id),
    scenario_nom: meta.name || "",
    scenario_auteur: meta.author || "",
    scenario_date: meta.date || "",
    scenario_statut: meta.status || "brouillon",
    scenario_objectif: meta.goal || "",
    scenario_commentaire: meta.comment || "",
    creneaux_json: JSON.stringify(rows.map(arrayToDemandRow)),
    creneaux: rows.map(arrayToDemandRow)
  };
}

function safeFilename(value) {
  return normalizeText(value || "scenario").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "scenario";
}

function exportScenarioJSON(id = activeScenario) {
  saveScenarioMeta(id);
  const payload = scenarioPayload(id);
  const label = payload.scenario_nom || `scenario-${id}`;
  downloadTextFile(`${safeFilename(label)}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
}

function retainedStatusLabel(value) {
  return RETAINED_SLOT_STATUS[value] || value || "Retenu";
}

function retainedStatusClass(value) {
  return "retained-" + normalizeText(value || "retenu").replace(/[^a-z0-9]+/g, "-");
}

function retainedCategoryValue(row) {
  const value = String(row.categorie || "").trim();
  return value || "Catégorie à préciser";
}

function retainedHasMissingCategory(row) {
  return !String(row.categorie || "").trim();
}

function scenarioRowForSheet(s) {
  return {
    id: s[0] || "",
    creneau_id: s[0] || "",
    club: s[6] || "",
    categorie: categoryValue(s) || "",
    usage: usageLabel(s) === "à préciser" ? "" : usageLabel(s),
    jour: s[2] || "",
    equipement: normalizeEquipment(s[3]),
    heure_debut: s[4] || "",
    heure_fin: s[5] || "",
    statut_creneau: "retenu",
    note: displayNote(s),
    origine: s[1] || "scenario",
    modifie_par: ensureScenarioMeta(activeScenario).author || "",
    modifie_le: new Date().toISOString()
  };
}

function activeScenarioSheetPayload() {
  saveScenarioMeta(activeScenario);
  const meta = ensureScenarioMeta(activeScenario);
  const rows = (scenarios[activeScenario] || []).map(scenarioRowForSheet);
  return {
    scenario: {
      scenario_id: String(activeScenario),
      nom: meta.name || scenarioLabel(activeScenario),
      auteur: meta.author || "",
      date_creation: meta.date || todayISO(),
      date_modification: new Date().toISOString(),
      statut: "retenu",
      commentaire: [meta.goal, meta.comment].filter(Boolean).join(" - ")
    },
    rows
  };
}

async function postToSheet(action, payload) {
  await fetch(CONFIG.API_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload })
  });
}

async function publishActiveScenarioAsRetained() {
  ensureScenarioList();
  const payload = activeScenarioSheetPayload();
  if (!payload.rows.length) return toast("Aucun créneau à publier dans ce scénario.");
  const name = payload.scenario.nom || scenarioLabel(activeScenario);
  if (!confirm(`Publier "${name}" comme scénario retenu partagé ? Cela remplacera l'onglet APP_SCENARIO_RETENU.`)) return;

  try {
    await postToSheet("publishScenarioAsRetenu", payload);
    retainedScenarioMeta = payload.scenario;
    toast("Publication envoyée vers Google Sheet");
    setTimeout(loadScenarioRetenu, 1800);
    showTab("scenarioRetenu", Array.from(document.querySelectorAll(".tabs button")).find(b => b.textContent.includes("retenu")));
  } catch (e) {
    toast("Publication impossible : " + e.message);
  }
}

async function loadScenariosFromSheet() {
  const data = await loadJSONP(CONFIG.API_URL + (CONFIG.API_URL.includes("?") ? "&" : "?") + "action=loadScenariosFromSheet");
  return data.scenarios || [];
}

async function loadScenarioRetenu() {
  const status = $("retainedStatus");
  if (status) status.textContent = "Chargement du scénario retenu...";
  try {
    const data = await loadJSONP(CONFIG.API_URL + (CONFIG.API_URL.includes("?") ? "&" : "?") + "action=loadScenarioRetenu");
    retainedScenarioSlots = (data.scenario_retenu || []).map(row => ({
      creneau_id: row.creneau_id || "",
      club: row.club || "",
      categorie: row.categorie || "",
      usage: row.usage || "",
      jour: row.jour || "",
      equipement: normalizeEquipment(row.equipement || ""),
      heure_debut: row.heure_debut || "",
      heure_fin: row.heure_fin || "",
      statut_creneau: row.statut_creneau || "retenu",
      note: row.note || "",
      modifie_par: row.modifie_par || "",
      modifie_le: row.modifie_le || ""
    }));
    retainedScenarioMeta = (data.scenarios || []).find(s => s.statut === "retenu") || retainedScenarioMeta || {};
    renderScenarioRetenu();
    toast("Scénario retenu chargé");
  } catch (e) {
    if (status) status.textContent = "Erreur de chargement du scénario retenu : " + e.message;
  }
}

function retainedFilterValue(id, fallback = "Tous") {
  return $(id)?.value || fallback;
}

function renderRetainedFilters() {
  const rows = retainedScenarioSlots;
  const clubs = Array.from(new Set(rows.map(r => r.club || "Sans club"))).sort();
  const categories = Array.from(new Set(rows.map(retainedCategoryValue))).sort();
  const equipments = Array.from(new Set(rows.map(r => normalizeEquipment(r.equipement)).filter(Boolean))).sort();
  const statuses = Array.from(new Set(rows.map(r => r.statut_creneau || "retenu"))).sort();

  setSelectOptions($("retainedClubFilter"), [{ value: "Tous", label: "Tous les clubs" }].concat(clubs.map(value => ({ value, label: value }))), retainedFilterValue("retainedClubFilter"));
  setSelectOptions($("retainedCategoryFilter"), [{ value: "Tous", label: "Toutes les catégories" }].concat(categories.map(value => ({ value, label: value }))), retainedFilterValue("retainedCategoryFilter"));
  setSelectOptions($("retainedEquipmentFilter"), [{ value: "Tous", label: "Tous les équipements" }].concat(equipments.map(value => ({ value, label: value }))), retainedFilterValue("retainedEquipmentFilter"));
  setSelectOptions($("retainedDayFilter"), [{ value: "Tous", label: "Tous les jours" }].concat(DAYS.map(value => ({ value, label: value }))), retainedFilterValue("retainedDayFilter"));
  setSelectOptions($("retainedStatusFilter"), [{ value: "Tous", label: "Tous les statuts" }].concat(statuses.map(value => ({ value, label: retainedStatusLabel(value) }))), retainedFilterValue("retainedStatusFilter"));
}

function retainedFilteredRows() {
  renderRetainedFilters();
  const club = retainedFilterValue("retainedClubFilter");
  const category = retainedFilterValue("retainedCategoryFilter");
  const equipment = retainedFilterValue("retainedEquipmentFilter");
  const day = retainedFilterValue("retainedDayFilter");
  const status = retainedFilterValue("retainedStatusFilter");
  const missing = retainedFilterValue("retainedMissingCategoryFilter", "all");

  return retainedScenarioSlots.filter(row => {
    if (club !== "Tous" && (row.club || "Sans club") !== club) return false;
    if (category !== "Tous" && retainedCategoryValue(row) !== category) return false;
    if (equipment !== "Tous" && normalizeEquipment(row.equipement) !== equipment) return false;
    if (day !== "Tous" && row.jour !== day) return false;
    if (status !== "Tous" && row.statut_creneau !== status) return false;
    if (missing === "missing" && !retainedHasMissingCategory(row)) return false;
    return true;
  });
}

function setRetainedView(mode) {
  retainedViewMode = mode;
  renderScenarioRetenu();
}

function retainedDurationHours(row) {
  return Math.max(0, minutes(row.heure_fin) - minutes(row.heure_debut)) / 60;
}

function renderScenarioRetenu() {
  const content = $("retainedContent");
  if (!content) return;
  if (!retainedScenarioSlots.length) {
    renderRetainedFilters();
    $("retainedSummary").innerHTML = "";
    $("retainedStatus").textContent = "Aucun scénario retenu chargé. Publie un scénario depuis l'onglet Scénarios ou clique sur Recharger.";
    content.innerHTML = '<div class="emptyClub">Aucun scénario retenu disponible pour le moment.</div>';
    return;
  }

  const rows = retainedFilteredRows();
  const totalHours = rows.reduce((sum, row) => sum + retainedDurationHours(row), 0);
  const missingCategories = rows.filter(retainedHasMissingCategory).length;
  $("retainedStatus").textContent = `Scénario retenu : ${retainedScenarioSlots.length} créneau(x) chargé(s). Vue filtrée : ${rows.length} créneau(x).`;
  $("retainedSummary").innerHTML = [
    ["Créneaux affichés", rows.length],
    ["Heures affichées", formatHours(totalHours)],
    ["Sans catégorie", missingCategories],
    ["Vue", retainedViewMode === "planning" ? "Planning" : retainedViewMode === "club" ? "Par club" : "Par catégorie"]
  ].map(([label, value]) => `<div class="summaryPill"><b>${escapeHTML(label)}</b><span>${escapeHTML(value)}</span></div>`).join("");

  if (retainedViewMode === "club") {
    content.innerHTML = renderRetainedGrouped(rows, row => row.club || "Sans club");
  } else if (retainedViewMode === "category") {
    content.innerHTML = renderRetainedGrouped(rows, retainedCategoryValue);
  } else {
    content.innerHTML = renderRetainedPlanning(rows);
  }
}

function renderRetainedGrouped(rows, groupForRow) {
  const groups = Array.from(new Set(rows.map(groupForRow))).sort();
  if (!groups.length) return '<div class="emptyClub">Aucun créneau avec ces filtres.</div>';
  return `<div class="retainedGroups">${groups.map(group => {
    const list = rows.filter(row => groupForRow(row) === group)
      .sort((a, b) => DAYS.indexOf(a.jour) - DAYS.indexOf(b.jour) || normalizeEquipment(a.equipement).localeCompare(normalizeEquipment(b.equipement)) || minutes(a.heure_debut) - minutes(b.heure_debut));
    return `<section class="clubGroup"><div class="clubGroupHead"><h3>${escapeHTML(group)}</h3><span>${formatHours(list.reduce((sum, row) => sum + retainedDurationHours(row), 0))}</span></div><div class="clubSlotsGrid">${list.map(renderRetainedCard).join("")}</div></section>`;
  }).join("")}</div>`;
}

function renderRetainedCard(row) {
  const missing = retainedHasMissingCategory(row) ? '<span class="conflictBadge">Catégorie à préciser</span>' : "";
  return `<article class="clubSlot compact ${clubClass(row.club)} ${retainedStatusClass(row.statut_creneau)}"><div class="clubSlotHead"><strong>${escapeHTML(row.club || "Sans club")}</strong><span>${escapeHTML(row.heure_debut)}-${escapeHTML(row.heure_fin)}</span></div><div class="clubMiniLine"><b>Catégorie</b><span>${escapeHTML(retainedCategoryValue(row))}</span></div><div class="clubMiniLine"><b>Usage</b><span>${escapeHTML(row.usage || "-")}</span></div><div class="clubMiniLine"><b>Équipement</b><span>${escapeHTML(normalizeEquipment(row.equipement))}</span></div><div class="clubMiniLine"><b>Jour</b><span>${escapeHTML(row.jour)}</span></div><div class="slotBadges"><span class="requestBadge ${retainedStatusClass(row.statut_creneau)}">${escapeHTML(retainedStatusLabel(row.statut_creneau))}</span>${missing}</div>${row.note ? `<div class="clubMiniLine"><b>Note</b><span>${escapeHTML(shortText(row.note, 70))}</span></div>` : ""}</article>`;
}

function renderRetainedPlanning(rows) {
  if (!rows.length) return '<div class="emptyClub">Aucun créneau avec ces filtres.</div>';
  const times = longPlanningTimeLines(rows, row => row.heure_debut, row => row.heure_fin);
  const first = minutes(times[0]);
  const last = minutes(times[times.length - 1]);
  const rowCount = times.length - 1;
  const gyms = Array.from(new Set(rows.map(row => normalizeEquipment(row.equipement)).filter(Boolean))).sort();

  return gyms.map(gym => {
    const blocks = rows.filter(row => normalizeEquipment(row.equipement) === gym).map(row => {
      const start = minutes(row.heure_debut);
      const end = minutes(row.heure_fin);
      const startLine = Math.round((Math.max(start, first) - first) / 30) + 2;
      const endLine = Math.round((Math.min(end, last) - first) / 30) + 2;
      const dayIndex = LONG_DAYS.indexOf(row.jour);
      if (dayIndex < 0 || end <= first || start >= last || endLine <= startLine) return "";
      const missing = retainedHasMissingCategory(row) ? '<span>Catégorie à préciser</span>' : "";
      return `<div class="meetingBlock slot ${clubClass(row.club)} ${retainedStatusClass(row.statut_creneau)}" style="grid-column:${dayIndex + 2};grid-row:${startLine}/${endLine}"><strong>${escapeHTML(row.club || "Sans club")}</strong><span>${escapeHTML(row.heure_debut)}-${escapeHTML(row.heure_fin)}</span><span>${escapeHTML(retainedCategoryValue(row))}</span><span>${escapeHTML(retainedStatusLabel(row.statut_creneau))}</span>${missing}</div>`;
    }).join("");
    return `<section class="meetingGym"><div class="meetingGymHead"><h3>${escapeHTML(gym)}</h3><span>Scénario retenu - lecture seule</span></div><div class="meetingGrid" style="--row-count:${rowCount}">${meetingGridChrome(times)}${blocks}</div></section>`;
  }).join("");
}

function exportRetainedJSON() {
  downloadTextFile("scenario-retenu.json", JSON.stringify({ meta: retainedScenarioMeta, creneaux: retainedScenarioSlots }, null, 2), "application/json;charset=utf-8");
}

function exportRetainedCSV() {
  const header = ["creneau_id","club","categorie","usage","jour","equipement","heure_debut","heure_fin","statut_creneau","note","modifie_par","modifie_le"];
  const csv = [header, ...retainedScenarioSlots.map(row => header.map(key => row[key] || ""))]
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  downloadTextFile("scenario-retenu.csv", csv, "text/csv;charset=utf-8");
}

function durationHours(s) {
  const start = minutes(s[4]);
  const end = minutes(s[5]);
  return Math.max(0, end - start) / 60;
}

function scenarioStats(id) {
  const rows = scenarios[id] || [];
  const hoursByClub = {};
  const equipments = new Set();
  rows.forEach(s => {
    const club = s[6] || "Autres";
    hoursByClub[club] = (hoursByClub[club] || 0) + durationHours(s);
    if (s[3]) equipments.add(normalizeEquipment(s[3]));
  });
  return { rows, hoursByClub, equipments: Array.from(equipments).sort() };
}

function scenarioSummaryText(id = activeScenario) {
  const meta = ensureScenarioMeta(id);
  const stats = scenarioStats(id);
  const hours = Object.entries(stats.hoursByClub)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([club, value]) => `${club}: ${value.toFixed(1)} h`)
    .join(", ") || "Aucune heure";
  return [
    `Scénario ${id}${meta.name ? " - " + meta.name : ""}`,
    `Auteur: ${meta.author || "-"}`,
    `Date: ${meta.date || "-"}`,
    `Statut: ${meta.status || "brouillon"}`,
    `Objectif: ${meta.goal || "-"}`,
    `Créneaux: ${stats.rows.length}`,
    `Heures par club: ${hours}`,
    `Équipements: ${stats.equipments.join(", ") || "-"}`,
    `Commentaire: ${meta.comment || "-"}`
  ].join("\n");
}

async function copyScenarioSummary(id = activeScenario) {
  saveScenarioMeta(id);
  const text = scenarioSummaryText(id);
  try {
    await navigator.clipboard.writeText(text);
    toast("Resume copie");
  } catch (e) {
    prompt("Copie le résumé du scénario", text);
  }
}

function openScenario(id) {
  activeScenario = String(id || "1");
  renderLongProposals();
  showTab("propositionsLongues", Array.from(document.querySelectorAll(".tabs button")).find(b => b.textContent.includes("Scénarios")));
}

function printScenario(id) {
  openScenario(id);
  setTimeout(() => window.print(), 50);
}

function renderScenarioRecap() {
  const container = $("scenarioRecap");
  if (!container) return;
  ensureScenarioList();
  container.innerHTML = scenarioIds().map(id => {
    const meta = ensureScenarioMeta(id);
    const stats = scenarioStats(id);
    const hours = Object.entries(stats.hoursByClub)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([club, value]) => `<span>${escapeHTML(club)}: ${value.toFixed(1)} h</span>`)
      .join("");
    return `<article class="scenarioCard"><div class="proposalHead"><strong>${escapeHTML(scenarioLabel(id))}</strong><span class="priority">${escapeHTML(meta.status || "brouillon")}</span></div><p><b>Auteur</b><br>${escapeHTML(meta.author || "-")}</p><p><b>Total créneaux</b><br>${stats.rows.length}</p><p><b>Heures par club</b><br><span class="hoursList">${hours || "Aucune heure"}</span></p><p><b>Équipements</b><br>${escapeHTML(stats.equipments.join(", ") || "-")}</p><div class="slotActions"><button class="slotAction" onclick="openScenario('${id}')">Ouvrir</button><button class="slotAction" onclick="printScenario('${id}')">Imprimer ce scénario</button><button class="slotAction" onclick="exportScenarioJSON('${id}')">Export JSON</button></div></article>`;
  }).join("");
}

function deleteEditableSlot(id, type, scenario = activeScenario) {
  if (type === "blank") {
    blankSlots = blankSlots.filter(s => s[0] !== id);
    saveLocalObject(LOCAL_BLANK_SLOTS_KEY, blankSlots);
  } else if (type === "scenario") {
    scenarios[scenario] = (scenarios[scenario] || []).filter(s => s[0] !== id);
    saveLocalObject(LOCAL_SCENARIOS_KEY, scenarios);
  }
  renderAll();
}

function meetingGridChrome(times) {
  const header = `<div class="meetingCorner" style="grid-column:1;grid-row:1"></div>`
    + LONG_DAYS.map((day, index) => `<div class="meetingDay" style="grid-column:${index + 2};grid-row:1">${escapeHTML(day)}</div>`).join("");
  const rows = times.slice(0, -1).map((time, index) => {
    const row = index + 2;
    return `<div class="meetingTime" style="grid-column:1;grid-row:${row}">${escapeHTML(time)}</div>`
      + LONG_DAYS.map((day, dayIndex) => `<div class="meetingCell" style="grid-column:${dayIndex + 2};grid-row:${row}"></div>`).join("");
  }).join("");
  return header + rows;
}

function overlapLayout(rows, gym) {
  const layouts = {};
  LONG_DAYS.forEach(day => {
    const dayRows = rows
      .filter(s => normalizeEquipment(s[3]) === gym && s[2] === day)
      .sort((a, b) => minutes(a[4]) - minutes(b[4]) || minutes(a[5]) - minutes(b[5]));
    const lanes = [];
    dayRows.forEach(s => {
      const start = minutes(s[4]);
      const end = minutes(s[5]);
      let lane = lanes.findIndex(lastEnd => lastEnd <= start);
      if (lane < 0) {
        lane = lanes.length;
        lanes.push(end);
      } else {
        lanes[lane] = end;
      }
      const overlaps = dayRows.filter(other => other[0] !== s[0] && minutes(other[4]) < end && minutes(other[5]) > start);
      const maxLane = overlaps.reduce((max, other) => Math.max(max, layouts[other[0]]?.lane ?? 0), lane);
      layouts[s[0]] = { lane, count: Math.max(lanes.length, maxLane + 1, 1) };
    });
    dayRows.forEach(s => {
      const start = minutes(s[4]);
      const end = minutes(s[5]);
      const overlapping = dayRows.filter(other => minutes(other[4]) < end && minutes(other[5]) > start);
      const count = Math.max(...overlapping.map(other => (layouts[other[0]]?.lane ?? 0) + 1), 1);
      layouts[s[0]].count = count;
    });
  });
  return layouts;
}

function renderEditableLongPlanning(containerId, rows, options = {}) {
  const container = $(containerId);
  if (!container) return;
  if (!rows.length) {
    container.innerHTML = '<div class="emptyClub">Aucun créneau dans ce scénario.</div>';
    return;
  }
  const times = longPlanningTimeLines(rows, s => s[4], s => s[5]);
  const first = minutes(times[0]);
  const last = minutes(times[times.length - 1]);
  const rowCount = times.length - 1;
  const type = options.type || "blank";
  const scenario = options.scenario || activeScenario;
  const gyms = equipmentListFor(rows);

  container.innerHTML = gyms.map(gym => {
    const layouts = overlapLayout(rows, gym);
    const blocks = rows.filter(s => normalizeEquipment(s[3]) === gym).map(s => {
      const start = minutes(s[4]);
      const end = minutes(s[5]);
      const startLine = Math.round((Math.max(start, first) - first) / 30) + 2;
      const endLine = Math.round((Math.min(end, last) - first) / 30) + 2;
      const dayIndex = LONG_DAYS.indexOf(s[2]);
      if (dayIndex < 0 || end <= first || start >= last || endLine <= startLine) return "";
      const deleteButton = `<button class="miniDelete" onclick="event.stopPropagation(); deleteEditableSlot('${escapeHTML(s[0])}', '${escapeHTML(type)}', '${escapeHTML(scenario)}')">Supprimer</button>`;
      const layout = layouts[s[0]] || { lane: 0, count: 1 };
      const overlapStyle = layout.count > 1 ? `width:calc(100% / ${layout.count});margin-left:calc(${layout.lane} * 100% / ${layout.count});` : "";
      const category = categoryValue(s);
      const usage = usageLabel(s);
      const note = displayNote(s);
      return `<div class="meetingBlock editableBlock slot ${clubClass(s[6])} ${requestStatusClass(s)}" onclick="openEdit('${escapeHTML(s[0])}', '${escapeHTML(type)}', '${escapeHTML(scenario)}')" style="grid-column:${dayIndex + 2};grid-row:${startLine}/${endLine};${overlapStyle}"><strong>${escapeHTML(s[6])}</strong><span>${escapeHTML(s[4])}-${escapeHTML(s[5])}</span><span>${escapeHTML(requestStatusLabel(s))}</span>${category ? `<span>Cat. ${escapeHTML(shortText(category, 28))}</span>` : ""}${usage !== "à préciser" ? `<span>${escapeHTML(shortText(usage, 32))}</span>` : ""}${note ? `<span>Note: ${escapeHTML(shortText(note, 34))}</span>` : ""}${deleteButton}</div>`;
    }).join("");

    return `<section class="meetingGym"><div class="meetingGymHead"><h3>${escapeHTML(gym)}</h3>${options.subtitle ? `<span>${escapeHTML(options.subtitle)}</span>` : ""}</div><div class="meetingGrid" style="--row-count:${rowCount}">${meetingGridChrome(times)}${blocks}</div></section>`;
  }).join("");
}

function clubGroup(association) {
  const value = String(association || "").toLowerCase();
  if (value.includes("handi") || value.includes("handisport")) return "Handi-basket / handisport";
  if (value.includes("basket") && !value.includes("handball")) return "Basket";
  if (value.includes("handball")) return "Handball";
  if (value.includes("volley")) return "Volley";
  if (value.includes("badminton")) return "Badminton";
  if (value.includes("futsal")) return "Futsal";
  return "Autres";
}

function renderClubView() {
  const container = $("clubView");
  if (!container) return;
  const preferred = ["Basket", "Handball", "Volley", "Badminton", "Futsal", "Handi-basket / handisport", "Autres"];
  const groups = preferred.filter(group => workingSlots.some(s => clubGroup(s[6]) === group));
  if (!groups.length) {
    container.innerHTML = '<div class="emptyClub">Aucun créneau chargé.</div>';
    return;
  }
  container.innerHTML = groups.map(group => {
    const list = workingSlots
      .filter(s => clubGroup(s[6]) === group)
      .sort((a, b) => DAYS.indexOf(a[2]) - DAYS.indexOf(b[2]) || normalizeEquipment(a[3]).localeCompare(normalizeEquipment(b[3])) || minutes(a[4]) - minutes(b[4]));
    const metrics = requestMetrics(list);
    const rows = list.length ? list.map(s => {
      const status = getTimeStatus(s);
      const note = shortText(displayNote(s), 58);
      const replaceText = shortText(replaceSlotText(s), 58);
      return `<div class="clubSlot compact ${clubClass(s[6])} ${requestStatusClass(s)}"><div class="clubSlotHead"><strong>${escapeHTML(s[6] || "Sans association")}</strong></div><div class="clubMiniLine"><b>Catégorie</b><span>${escapeHTML(categoryLabel(s))}</span></div><div class="clubMiniLine"><b>Usage</b><span>${escapeHTML(shortText(usageLabel(s), 44))}</span></div><div class="clubMiniLine"><b>Équipement</b><span>${escapeHTML(normalizeEquipment(s[3]))}</span></div><div class="clubMiniLine"><b>Jour</b><span>${escapeHTML(s[2])} ${escapeHTML(s[4])}-${escapeHTML(s[5])}</span></div><div class="clubMiniLine"><b>Demande</b><span>${escapeHTML(requestStatusLabel(s))}</span></div><div class="clubMiniLine"><b>Priorité</b><span>${escapeHTML(priorityLabel(s))}</span></div>${note ? `<div class="clubMiniLine"><b>Note</b><span>${escapeHTML(note)}</span></div>` : ""}${replaceText ? `<div class="clubMiniLine"><b>Remplace</b><span>${escapeHTML(replaceText)}</span></div>` : ""}<div class="clubMiniLine"><b>Statut</b><span>${escapeHTML(displayStatus(s))}</span></div><div class="clubCardFoot"><span class="requestBadge ${requestStatusClass(s)}">${escapeHTML(requestStatusLabel(s))}</span><button class="slotAction" onclick="openEdit('${escapeHTML(s[0])}', 'work')">Modifier</button></div></div>`;
    }).join("") : '<div class="emptyClub">Aucun créneau chargé.</div>';
    const summary = `<div class="clubStats"><span>Total ${formatHours(metrics.total)}</span><span>Conserver ${formatHours(metrics.existant_a_conserver)}</span><span>En plus ${formatHours(metrics.demande_en_plus)}</span><span>Libérables ${formatHours(metrics.a_liberer)}</span><span>À déplacer ${formatHours(metrics.a_deplacer)}</span></div>`;
    return `<section class="clubGroup ${clubClass(group)}"><div class="clubGroupHead"><h3>${escapeHTML(group)}</h3><span>${formatHours(metrics.total)}</span></div>${summary}<div class="clubSlotsGrid">${rows}</div></section>`;
  }).join("");
}

function renderCurrentBaseView() {
  const container = $("currentBaseList");
  if (!container) return;
  if (!slots.length) {
    container.innerHTML = '<div class="emptyClub">Aucune donnee mairie chargee.</div>';
    return;
  }
  const rows = slots
    .slice()
    .sort((a, b) => DAYS.indexOf(a[2]) - DAYS.indexOf(b[2]) || normalizeEquipment(a[3]).localeCompare(normalizeEquipment(b[3])) || minutes(a[4]) - minutes(b[4]));
  container.innerHTML = `<div class="currentGrid">${rows.map(s => `<div class="clubSlot compact ${clubClass(s[6])}"><div class="clubSlotHead"><strong>${escapeHTML(s[6] || "Sans association")}</strong><span>${escapeHTML(s[4])}-${escapeHTML(s[5])}</span></div><div class="meta">${escapeHTML(s[2])} - ${escapeHTML(normalizeEquipment(s[3]))}</div>${slotInfoHTML(s)}<div class="slotBadges"><span class="timeBadge soft">base mairie</span></div></div>`).join("")}</div>`;
}

function addClubProposal() {
  const item = {
    id: String(Date.now()),
    club: $("proposalClub").value,
    priority: $("proposalPriority").value,
    main: $("proposalMain").value.trim(),
    equipment: $("proposalEquipment").value.trim(),
    day: $("proposalDay").value.trim(),
    time: $("proposalTime").value.trim(),
    alt1: $("proposalAlt1").value.trim(),
    alt2: $("proposalAlt2").value.trim(),
    fallback: $("proposalFallback").value.trim(),
    reason: $("proposalReason").value.trim(),
    comment: $("proposalComment").value.trim()
  };
  if (!item.main && !item.equipment && !item.day && !item.time && !item.alt1 && !item.alt2 && !item.fallback && !item.reason && !item.comment) return toast("Ajoute au moins une demande ou justification.");
  clubProposals.unshift(item);
  saveLocalObject(LOCAL_CLUB_PROPOSALS_KEY, clubProposals);
  clearClubProposalForm();
  renderClubProposals();
  toast("Proposition club enregistree localement");
}

function clearClubProposalForm() {
  ["proposalMain", "proposalEquipment", "proposalDay", "proposalTime", "proposalAlt1", "proposalAlt2", "proposalFallback", "proposalReason", "proposalComment"].forEach(id => {
    if ($(id)) $(id).value = "";
  });
}

function deleteClubProposal(id) {
  clubProposals = clubProposals.filter(p => p.id !== id);
  saveLocalObject(LOCAL_CLUB_PROPOSALS_KEY, clubProposals);
  renderClubProposals();
}

function renderClubProposals() {
  const container = $("clubProposalList");
  if (!container) return;
  if (!clubProposals.length) {
    container.innerHTML = '<div class="emptyClub">Aucune proposition locale pour le moment.</div>';
    return;
  }
  const groups = ["Basket", "Handball", "Volley", "Badminton", "Futsal", "Handi-basket / handisport", "Autres"];
  container.innerHTML = groups.map(group => {
    const items = clubProposals.filter(p => p.club === group);
    if (!items.length) return "";
    return `<section class="proposalGroup"><h3>${escapeHTML(group)}</h3>${items.map(renderClubProposalItem).join("")}</section>`;
  }).join("");
}

function renderClubProposalItem(p) {
  return `<article class="proposalItem"><div class="proposalHead"><strong>${escapeHTML(p.club)}</strong><span class="priority ${escapeHTML(p.priority)}">${escapeHTML(p.priority)}</span></div>${p.main ? `<p><b>Demande principale</b><br>${escapeHTML(p.main)}</p>` : ""}${p.equipment ? `<p><b>Équipement souhaité</b><br>${escapeHTML(p.equipment)}</p>` : ""}${p.day ? `<p><b>Jour souhaité</b><br>${escapeHTML(p.day)}</p>` : ""}${p.time ? `<p><b>Horaire souhaité</b><br>${escapeHTML(p.time)}</p>` : ""}${p.reason ? `<p><b>Justification</b><br>${escapeHTML(p.reason)}</p>` : ""}${p.alt1 ? `<p><b>Alternative 1</b><br>${escapeHTML(p.alt1)}</p>` : ""}${p.alt2 ? `<p><b>Alternative 2</b><br>${escapeHTML(p.alt2)}</p>` : ""}${p.fallback ? `<p><b>Dernier recours</b><br>${escapeHTML(p.fallback)}</p>` : ""}${p.comment ? `<p><b>Commentaire libre</b><br>${escapeHTML(p.comment)}</p>` : ""}<button class="secondary" onclick="deleteClubProposal('${escapeHTML(p.id)}')">Supprimer</button></article>`;
}

function renderLongPlanning(containerId, rows, options = {}) {
  const container = $(containerId);
  if (!container) return;
  const times = options.times || longPlanningTimeLines(rows, s => s.debut, s => s.fin);
  const first = minutes(times[0]);
  const last = minutes(times[times.length - 1]);
  const rowCount = times.length - 1;

  container.innerHTML = LONG_GYMS.map(gym => {
    const blocks = options.empty ? "" : rows.filter(s => s.gymnase === gym).map(s => {
      const start = minutes(s.debut);
      const end = minutes(s.fin);
      const startLine = Math.round((Math.max(start, first) - first) / 30) + 2;
      const endLine = Math.round((Math.min(end, last) - first) / 30) + 2;
      const dayIndex = LONG_DAYS.indexOf(s.jour);
      if (dayIndex < 0 || end <= first || start >= last || endLine <= startLine) return "";
      return `<div class="meetingBlock slot ${clubClass(s.association)}" style="grid-column:${dayIndex + 2};grid-row:${startLine}/${endLine}"><strong>${escapeHTML(s.association)}</strong><span>${escapeHTML(s.debut)}-${escapeHTML(s.fin)}</span></div>`;
    }).join("");

    return `<section class="meetingGym"><div class="meetingGymHead"><h3>${escapeHTML(gym)}</h3>${options.subtitle ? `<span>${escapeHTML(options.subtitle)}</span>` : ""}</div><div class="meetingGrid" style="--row-count:${rowCount}">${meetingGridChrome(times)}${blocks}</div></section>`;
  }).join("");
}

function downloadTextFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

document.addEventListener("DOMContentLoaded", reloadFromSheet);
