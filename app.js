const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbz7wVlTcE_FTXb9e_PfjDEFw5vv-1DHx4WrfwxP3gE-H1Ssq70-hTg08JRK4W49shzXEg/exec",
  EDIT_CODE: "2026"
};

const CLUBS = ["Basket", "Handball", "Handi-basket", "Volley", "Badminton", "Futsal", "Ecole multisports", "Entretien / Ville", "Libre / a arbitrer"];
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const LONG_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const LONG_GYMS = ["Fongravey", "Port du Roy", "Dupaty", "Lycee des metiers"];
const BLANK_LONG_TIMES = ["17h00", "17h30", "18h00", "18h30", "19h00", "19h30", "20h00", "20h30", "21h00", "21h30", "22h00", "22h30", "23h00"];
const PROPOSAL_LONG_TIMES = ["13h30", "14h00", "14h30", "15h00", "15h30", "16h00", "16h30", ...BLANK_LONG_TIMES];

const GYMS = [
  ["Fongravey", "3 terrains possibles", "Grande salle pour les besoins a plusieurs terrains et les creneaux adaptes."],
  ["Port du Roy", "2 terrains maximum", "Gymnase utilise pour les entrainements et rencontres selon les besoins de coordination."],
  ["Dupaty", "Bloc complet possible", "Salle utile pour les blocs longs et les usages sportifs coordonnes."],
  ["Lycee des metiers", "Salle annexe", "Salle utilisee dans les scenarios de travail pour completer la coordination."]
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
let proposals = [];
let selected = [];
let canEdit = false;

function $(id) {
  return document.getElementById(id);
}

function escapeHTML(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
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
    proposals = data.propositions || [];
    selected = [];
    renderAll();
    setStatus("Donnees chargees : " + slots.length + " creneaux.", true);
  } catch (e) {
    setStatus("Erreur de chargement : " + e.message);
    alert("Erreur de chargement : " + e.message);
  }
}

function rowToArray(r) {
  return [r.id, r.source, r.jour, r.gymnase, r.debut, r.fin, r.association, r.usage, r.nature, r.statut, r.note].map(v => String(v || ""));
}

function arrayToRow(s) {
  return { id: s[0] || "", source: s[1] || "", jour: s[2] || "", gymnase: s[3] || "", debut: s[4] || "", fin: s[5] || "", association: s[6] || "", usage: s[7] || "", nature: s[8] || "", statut: s[9] || "", note: s[10] || "" };
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
  if (id === "viergeLong") renderLongDraftPlanning();
  if (id === "propositionsLongues") renderLongProposals();
}

function minutes(t) {
  const [h, m] = String(t || "00:00").replace("h", ":").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
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

function renderPlanning() {
  const container = $("planningGrid");
  if (!container) return;
  const q = ($("q")?.value || "").toLowerCase();
  let html = "<div></div>" + GYMS.map(g => `<div class="gymHead">${escapeHTML(g.name)}</div>`).join("");

  DAYS.forEach(day => {
    html += `<div class="day">${escapeHTML(day)}</div>`;
    GYMS.forEach(gym => {
      let list = slots.filter(s => s[2] === day && s[3] === gym.name).sort((a, b) => minutes(a[4]) - minutes(b[4]));
      if (q) list = list.filter(s => s.join(" ").toLowerCase().includes(q));
      html += '<div class="cell">';
      if (!list.length) html += '<span style="color:#647067">-</span>';
      list.forEach(s => {
        const sel = selected.includes(s[0]) ? " selected" : "";
        html += `<div class="slot ${clubClass(s[6])}${sel}" onclick="selectSlot('${escapeHTML(s[0])}')" ondblclick="openEdit('${escapeHTML(s[0])}')"><div class="top">${escapeHTML(s[4])}-${escapeHTML(s[5])} - ${escapeHTML(s[6])}</div><div class="meta">${escapeHTML(s[7])}</div><div class="meta">${escapeHTML(s[8])} - ${escapeHTML(s[9])}</div></div>`;
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

function renderAll() {
  renderPlanning();
  renderCards();
  renderLongProposals();
  renderLongDraftPlanning();
  if ($("rowKpi")) $("rowKpi").textContent = slots.length;
  if ($("proposalKpi")) $("proposalKpi").textContent = LONG_PROPOSALS.length;
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
  if (selected.length !== 1) return toast("Selectionne un seul creneau a deplacer.");
  openEdit(selected[0]);
}

function nextSlotId(list, prefix) {
  const nums = list.map(s => parseInt(String(s[0]).replace(/\D/g, ""), 10)).filter(Boolean);
  return prefix + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0");
}

function addSlot() {
  if (!canEdit) return toast("Active le mode edition d'abord.");
  const nextId = nextSlotId(slots, "S");
  slots.push([nextId, "Ajout interface", "Mercredi", "Fongravey", "17:30", "19:00", "Libre / a arbitrer", "Nouveau creneau a preciser", "A confirmer", "A programmer", ""]);
  selected = [nextId];
  renderAll();
  openEdit(nextId);
}

function swapSelected() {
  if (!canEdit) return toast("Active le mode edition d'abord.");
  if (selected.length !== 2) return toast("Selectionne deux creneaux a echanger.");
  const a = slots.find(s => s[0] === selected[0]);
  const b = slots.find(s => s[0] === selected[1]);
  if (!a || !b) return;
  [a[6], b[6]] = [b[6], a[6]];
  [a[7], b[7]] = [b[7], a[7]];
  [a[8], b[8]] = [b[8], a[8]];
  [a[9], b[9]] = [b[9], a[9]];
  [a[10], b[10]] = [b[10], a[10]];
  selected = [];
  renderAll();
  saveAll("Echange envoye au Google Sheet");
}

function fillEditDrawer(s) {
  $("editId").value = s[0];
  $("editSource").value = s[1];
  $("editJour").value = s[2];
  $("editDebut").value = s[4];
  $("editFin").value = s[5];
  $("editNature").value = s[8];
  $("editStatut").value = s[9];
  $("editGroupe").value = s[7];
  $("editNote").value = s[10];
  $("editGym").innerHTML = GYMS.map(g => `<option ${g.name === s[3] ? "selected" : ""}>${escapeHTML(g.name)}</option>`).join("");
  $("editClub").innerHTML = CLUBS.map(c => `<option ${c === s[6] ? "selected" : ""}>${escapeHTML(c)}</option>`).join("") + "<option>Handball / Basket</option><option>Basket / Handball</option><option>Libre / a arbitrer</option>";
}

function openEdit(id) {
  if (!canEdit) return toast("Active le mode edition d'abord.");
  const s = slots.find(x => x[0] === id);
  if (!s) return;
  fillEditDrawer(s);
  $("drawer").classList.add("show");
}

function closeDrawer() {
  $("drawer")?.classList.remove("show");
}

function saveEdit() {
  const s = slots.find(x => x[0] === $("editId").value);
  if (!s) return;
  s[1] = $("editSource").value;
  s[2] = $("editJour").value;
  s[3] = $("editGym").value;
  s[4] = $("editDebut").value;
  s[5] = $("editFin").value;
  s[6] = $("editClub").value;
  s[7] = $("editGroupe").value;
  s[8] = $("editNature").value;
  s[9] = $("editStatut").value;
  s[10] = $("editNote").value;
  closeDrawer();
  renderAll();
  saveAll("Creneau envoye au Google Sheet");
}

async function saveAll(reason) {
  if (!canEdit) return toast("Active le mode edition d'abord.");
  try {
    await fetch(CONFIG.API_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "replaceCreneaux", rows: slots.map(arrayToRow) }) });
    toast(reason);
    setStatus("Enregistrement envoye. Clique sur Recharger Sheet dans quelques secondes pour verifier.", true);
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
  renderLongPlanning("longProposalCards", LONG_PROPOSALS, { empty: false, times: PROPOSAL_LONG_TIMES, subtitle: "Scenario de travail a verifier - non valide" });
}

function renderLongDraftPlanning() {
  renderLongPlanning("longDraftPlanning", [], { empty: true, times: BLANK_LONG_TIMES });
}

function renderLongPlanning(containerId, rows, options = {}) {
  const container = $(containerId);
  if (!container) return;
  const times = options.times || BLANK_LONG_TIMES;
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

    return `<section class="meetingGym"><div class="meetingGymHead"><h3>${escapeHTML(gym)}</h3>${options.subtitle ? `<span>${escapeHTML(options.subtitle)}</span>` : ""}</div><div class="meetingGrid" style="--row-count:${rowCount}"><div class="meetingCorner"></div>${LONG_DAYS.map(day => `<div class="meetingDay">${escapeHTML(day)}</div>`).join("")}${times.slice(0, -1).map(time => `<div class="meetingTime">${escapeHTML(time)}</div>${LONG_DAYS.map(day => `<div class="meetingCell"></div>`).join("")}`).join("")}${blocks}</div></section>`;
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
