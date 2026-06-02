const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbz7wVlTcE_FTXb9e_PfjDEFw5vv-1DHx4WrfwxP3gE-H1Ssq70-hTg08JRK4W49shzXEg/exec",
  EDIT_CODE: "2026"
};

const CLUBS = [
  { name: "Basket" },
  { name: "Handball" },
  { name: "Handi-basket" },
  { name: "Volley" },
  { name: "Badminton" },
  { name: "Futsal" },
  { name: "Ecole multisports" },
  { name: "Entretien / Ville" },
  { name: "Libre / a arbitrer" }
];

const GYMS = [
  {
    name: "Fongravey",
    capacity: "3 terrains possibles",
    role: "Grande salle : besoins a 3 terrains, jeunes avec materiel adapte, creneaux handi-basket viables."
  },
  {
    name: "Port du Roy",
    capacity: "2 terrains maximum",
    role: "Gymnase de match / competition pour basket et volley. Pas equivalent a Fongravey pour une demande a 3 terrains."
  },
  {
    name: "Dupaty",
    capacity: "Bloc complet possible",
    role: "Salle utile pour blocs longs, badminton, volley, technique basket et futsal selon arbitrage."
  }
];

const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const LONG_DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const LONG_GYMS = ["Fongravey", "Port du Roy", "Dupaty", "Lycee des metiers"];
const BLANK_LONG_TIMES = ["17h00", "17h30", "18h00", "18h30", "19h00", "19h30", "20h00", "20h30", "21h00", "21h30", "22h00", "22h30", "23h00"];
const PROPOSAL_LONG_TIMES = ["13h30", "14h00", "14h30", "15h00", "15h30", "16h00", "16h30", ...BLANK_LONG_TIMES];

const LONG_PROPOSALS = [
  { gymnase: "Dupaty", jour: "Lundi", debut: "17h30", fin: "19h30", association: "Badminton" },
  { gymnase: "Dupaty", jour: "Lundi", debut: "20h00", fin: "22h30", association: "Badminton" },
  { gymnase: "Dupaty", jour: "Mardi", debut: "17h30", fin: "19h30", association: "Basket" },
  { gymnase: "Dupaty", jour: "Mardi", debut: "20h00", fin: "22h30", association: "Basket" },
  { gymnase: "Dupaty", jour: "Mercredi", debut: "17h30", fin: "19h30", association: "Volley" },
  { gymnase: "Dupaty", jour: "Mercredi", debut: "20h00", fin: "22h30", association: "Badminton" },
  { gymnase: "Dupaty", jour: "Jeudi", debut: "17h30", fin: "19h30", association: "Volley" },
  { gymnase: "Dupaty", jour: "Jeudi", debut: "20h00", fin: "22h30", association: "Volley" },
  { gymnase: "Dupaty", jour: "Vendredi", debut: "17h30", fin: "19h30", association: "Volley" },
  { gymnase: "Dupaty", jour: "Vendredi", debut: "20h00", fin: "22h30", association: "Basket" },

  { gymnase: "Port du Roy", jour: "Lundi", debut: "17h00", fin: "20h30", association: "Handball" },
  { gymnase: "Port du Roy", jour: "Lundi", debut: "20h30", fin: "23h00", association: "Handball" },
  { gymnase: "Port du Roy", jour: "Mardi", debut: "17h00", fin: "20h30", association: "Volley" },
  { gymnase: "Port du Roy", jour: "Mardi", debut: "20h30", fin: "23h00", association: "Volley" },
  { gymnase: "Port du Roy", jour: "Mercredi", debut: "17h00", fin: "18h30", association: "Handball" },
  { gymnase: "Port du Roy", jour: "Mercredi", debut: "18h30", fin: "23h00", association: "Basket" },
  { gymnase: "Port du Roy", jour: "Jeudi", debut: "17h00", fin: "20h30", association: "Handball" },
  { gymnase: "Port du Roy", jour: "Jeudi", debut: "20h30", fin: "23h00", association: "Handball" },
  { gymnase: "Port du Roy", jour: "Vendredi", debut: "17h00", fin: "20h30", association: "Volley" },
  { gymnase: "Port du Roy", jour: "Vendredi", debut: "20h30", fin: "23h00", association: "Volley" },

  { gymnase: "Fongravey", jour: "Lundi", debut: "17h00", fin: "20h30", association: "Basket" },
  { gymnase: "Fongravey", jour: "Lundi", debut: "20h30", fin: "23h00", association: "Volley" },
  { gymnase: "Fongravey", jour: "Mardi", debut: "17h00", fin: "19h00", association: "Handball" },
  { gymnase: "Fongravey", jour: "Mardi", debut: "19h00", fin: "21h00", association: "Handi-basket" },
  { gymnase: "Fongravey", jour: "Mardi", debut: "21h00", fin: "23h00", association: "Handball" },
  { gymnase: "Fongravey", jour: "Mercredi", debut: "13h30", fin: "15h00", association: "Badminton" },
  { gymnase: "Fongravey", jour: "Mercredi", debut: "15h00", fin: "17h00", association: "Basket" },
  { gymnase: "Fongravey", jour: "Mercredi", debut: "17h00", fin: "19h00", association: "Basket" },
  { gymnase: "Fongravey", jour: "Mercredi", debut: "19h30", fin: "23h00", association: "Handball" },
  { gymnase: "Fongravey", jour: "Jeudi", debut: "17h00", fin: "19h00", association: "Handball" },
  { gymnase: "Fongravey", jour: "Jeudi", debut: "19h30", fin: "21h00", association: "Badminton" },
  { gymnase: "Fongravey", jour: "Vendredi", debut: "17h00", fin: "18h30", association: "Handball" },
  { gymnase: "Fongravey", jour: "Vendredi", debut: "19h00", fin: "20h30", association: "Handi-basket" },
  { gymnase: "Fongravey", jour: "Vendredi", debut: "21h00", fin: "23h00", association: "Handball" },

  { gymnase: "Lycee des metiers", jour: "Lundi", debut: "19h30", fin: "22h30", association: "Badminton" },
  { gymnase: "Lycee des metiers", jour: "Mardi", debut: "19h30", fin: "22h30", association: "Badminton" },
  { gymnase: "Lycee des metiers", jour: "Mercredi", debut: "13h30", fin: "16h30", association: "Badminton" },
  { gymnase: "Lycee des metiers", jour: "Mercredi", debut: "19h30", fin: "22h30", association: "Badminton" },
  { gymnase: "Lycee des metiers", jour: "Jeudi", debut: "19h30", fin: "22h30", association: "Futsal" },
  { gymnase: "Lycee des metiers", jour: "Vendredi", debut: "19h30", fin: "22h30", association: "Badminton" }
];

let slots = [];
let draftSlots = [];
let conflicts = [];
let proposals = [];
let selected = [];
let selectedDraft = [];
let canEdit = false;

function $(id) {
  return document.getElementById(id);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

    const separator = url.includes("?") ? "&" : "?";
    script.src = url + separator + "callback=" + callback + "&t=" + Date.now();
    document.body.appendChild(script);
  });
}

async function reloadFromSheet() {
  setStatus("Chargement du Google Sheet...");

  try {
    const data = await loadJSONP(CONFIG.API_URL + (CONFIG.API_URL.includes("?") ? "&" : "?") + "action=data");

    slots = (data.creneaux || []).map(rowToArray);
    conflicts = (data.conflits || []).map(c => [
      c.id || "",
      c.point || "",
      c.situation || "",
      c.ce_qui_ne_va_pas || "",
      c.proposition || ""
    ]);
    proposals = (data.propositions || []).map(p => [
      p.id || "",
      p.blocage || "",
      p.hypothese || "",
      p.proposition_1 || "",
      p.proposition_2 || "",
      p.niveau || ""
    ]);

    selected = [];
    renderAll();
    setStatus("Donnees chargees : " + slots.length + " creneaux.", true);

    loadDraftFromSheet(false);
  } catch (e) {
    setStatus("Erreur de chargement : " + e.message);
    alert("Erreur de chargement : " + e.message);
  }
}

async function saveAll(reason) {
  if (!canEdit) {
    toast("Active le mode edition d'abord.");
    return;
  }

  const payload = { action: "replaceCreneaux", rows: slots.map(arrayToRow) };

  try {
    await fetch(CONFIG.API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    toast(reason || "Enregistrement envoye au Google Sheet");
    setStatus("Enregistrement envoye. Clique sur Recharger Sheet dans quelques secondes pour verifier.", true);
  } catch (e) {
    setStatus("Erreur d'enregistrement : " + e.message);
  }
}

function logAction(type, details) {
  fetch(CONFIG.API_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: type, details })
  }).catch(() => {});
}

function rowToArray(r) {
  return [
    String(r.id || ""),
    String(r.source || ""),
    String(r.jour || ""),
    String(r.gymnase || ""),
    String(r.debut || ""),
    String(r.fin || ""),
    String(r.association || ""),
    String(r.usage || ""),
    String(r.nature || ""),
    String(r.statut || ""),
    String(r.note || "")
  ];
}

function arrayToRow(s) {
  return {
    id: s[0] || "",
    source: s[1] || "",
    jour: s[2] || "",
    gymnase: s[3] || "",
    debut: s[4] || "",
    fin: s[5] || "",
    association: s[6] || "",
    usage: s[7] || "",
    nature: s[8] || "",
    statut: s[9] || "",
    note: s[10] || ""
  };
}

function setStatus(message, ok = false) {
  const el = $("syncStatus");
  if (!el) return;
  el.className = "notice " + (ok ? "okmsg" : "");
  el.textContent = message;
}

function setDraftStatus(message, ok = false) {
  const el = $("draftStatus");
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

  if (id === "vierge") renderDraftPlanning();
  if (id === "viergeLong") renderLongDraftPlanning();
  if (id === "propositionsLongues") renderLongProposals();
}

function minutes(t) {
  const [h, m] = String(t || "00:00").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function overlaps(a, b) {
  return a[2] === b[2]
    && a[3] === b[3]
    && Math.max(minutes(a[4]), minutes(b[4])) < Math.min(minutes(a[5]), minutes(b[5]));
}

function getOverlaps() {
  const out = [];
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (overlaps(slots[i], slots[j])) out.push([slots[i], slots[j]]);
    }
  }
  return out;
}

function overlapIds() {
  const ids = new Set();
  getOverlaps().forEach(p => {
    ids.add(p[0][0]);
    ids.add(p[1][0]);
  });
  return ids;
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

  const gyms = GYMS.map(g => g.name);
  const ids = overlapIds();
  const q = ($("q")?.value || "").toLowerCase();

  let html = "<div></div>" + gyms.map(g => `<div class="gymHead">${escapeHTML(g)}</div>`).join("");

  DAYS.forEach(day => {
    html += `<div class="day">${escapeHTML(day)}</div>`;

    gyms.forEach(gym => {
      let list = slots
        .filter(s => s[2] === day && s[3] === gym)
        .sort((a, b) => minutes(a[4]) - minutes(b[4]));

      if (q) list = list.filter(s => s.join(" ").toLowerCase().includes(q));

      html += '<div class="cell">';
      if (!list.length) html += '<span style="color:#647067">-</span>';

      list.forEach(s => {
        const sel = selected.includes(s[0]) ? " selected" : "";
        const ov = ids.has(s[0]) ? " overlap" : "";
        const tag = ids.has(s[0]) ? '<span class="overlapTag">doublon</span>' : "";
        html += `
          <div class="slot ${clubClass(s[6])}${sel}${ov}" onclick="selectSlot('${escapeHTML(s[0])}')" ondblclick="openEdit('${escapeHTML(s[0])}')">
            <div class="top">${escapeHTML(s[4])}-${escapeHTML(s[5])} - ${escapeHTML(s[6])} ${tag}</div>
            <div class="meta">${escapeHTML(s[7])}</div>
            <div class="meta">${escapeHTML(s[8])} - ${escapeHTML(s[9])}</div>
          </div>`;
      });

      html += "</div>";
    });
  });

  container.innerHTML = html;
}

function renderTable() {
  const body = $("tbody");
  if (!body) return;

  const club = $("clubFilter")?.value || "";
  const gym = $("gymFilter")?.value || "";
  const ids = overlapIds();
  const list = slots.filter(s => (!club || s[6].includes(club)) && (!gym || s[3] === gym));

  body.innerHTML = list.map(s => `
    <tr class="${ids.has(s[0]) ? "overlapRow" : ""}">
      <td>${escapeHTML(s[2])}</td>
      <td>${escapeHTML(s[3])}</td>
      <td>${escapeHTML(s[4])}</td>
      <td>${escapeHTML(s[5])}</td>
      <td>${escapeHTML(s[6])}</td>
      <td>${escapeHTML(s[7])}</td>
      <td><span class="badge">${escapeHTML(s[8])}</span></td>
      <td>${escapeHTML(s[9])}</td>
      <td>${escapeHTML(s[1])}</td>
      <td>${escapeHTML(s[10])}</td>
    </tr>`).join("");
}

function renderFilters() {
  const cf = $("clubFilter");
  const gf = $("gymFilter");

  if (cf && cf.innerHTML === "") {
    cf.innerHTML = '<option value="">Toutes associations</option>' + CLUBS.map(c => `<option>${escapeHTML(c.name)}</option>`).join("");
  }

  if (gf && gf.innerHTML === "") {
    gf.innerHTML = '<option value="">Tous gymnases</option>' + GYMS.map(g => `<option>${escapeHTML(g.name)}</option>`).join("");
  }
}

function renderCards() {
  const gymCards = $("gymCards");
  if (gymCards) {
    gymCards.innerHTML = GYMS.map(g => `
      <div class="tile">
        <b>${escapeHTML(g.name)}</b>
        <p>${escapeHTML(g.capacity)}</p>
        <p>${escapeHTML(g.role)}</p>
      </div>`).join("");
  }

  const conflictCards = $("conflictCards");
  if (conflictCards) {
    conflictCards.innerHTML = conflicts.map(c => `
      <div class="tile">
        <b>${escapeHTML(c[1])}</b>
        <p>${escapeHTML(c[2])}</p>
        <p>${escapeHTML(c[3])}</p>
        <p><strong>${escapeHTML(c[4])}</strong></p>
      </div>`).join("");
  }

  const proposalCards = $("proposalCards");
  if (proposalCards) {
    proposalCards.innerHTML = proposals.map(p => `
      <div class="tile">
        <b>${escapeHTML(p[1])}</b>
        <p><strong>${escapeHTML(p[5])}</strong> - ${escapeHTML(p[2])}</p>
        <p>${escapeHTML(p[3])}</p>
        <p><em>${escapeHTML(p[4])}</em></p>
      </div>`).join("");
  }
}

function renderLongProposals() {
  renderLongPlanning("longProposalCards", LONG_PROPOSALS, {
    empty: false,
    times: PROPOSAL_LONG_TIMES,
    subtitle: "Scenario de travail a verifier - non valide"
  });
}

function renderOverlaps() {
  const o = getOverlaps();

  if ($("overlapKpi")) $("overlapKpi").textContent = o.length;
  if ($("rowKpi")) $("rowKpi").textContent = slots.length;
  if ($("proposalKpi")) $("proposalKpi").textContent = proposals.length;

  const banner = $("overlapBanner");
  if (banner) {
    banner.innerHTML = o.length
      ? `<div class="notice alert">${o.length} doublon(s) detecte(s). Va dans l'onglet Doublons.</div>`
      : "";
  }

  const box = $("overlapList");
  if (box) {
    box.innerHTML = o.length
      ? o.map(p => `
        <div class="tile">
          <b>${escapeHTML(p[0][2])} - ${escapeHTML(p[0][3])}</b>
          <p>${escapeHTML(p[0][4])}-${escapeHTML(p[0][5])} - ${escapeHTML(p[0][6])} - ${escapeHTML(p[0][7])}</p>
          <p>${escapeHTML(p[1][4])}-${escapeHTML(p[1][5])} - ${escapeHTML(p[1][6])} - ${escapeHTML(p[1][7])}</p>
        </div>`).join("")
      : '<div class="notice">Aucun doublon horaire detecte.</div>';
  }
}

function renderAll() {
  renderFilters();
  renderPlanning();
  renderTable();
  renderCards();
  renderOverlaps();
  renderDraftPlanning();
  renderLongProposals();
  renderLongDraftPlanning();
}

function selectSlot(id) {
  if (selected.includes(id)) {
    selected = selected.filter(x => x !== id);
  } else {
    if (selected.length >= 2) selected.shift();
    selected.push(id);
  }
  renderPlanning();
}

function clearSelection() {
  selected = [];
  renderPlanning();
}

function editSelected() {
  if (selected.length !== 1) {
    toast("Selectionne un seul creneau a deplacer.");
    return;
  }
  openEdit(selected[0]);
}

function nextSlotId(list, prefix) {
  const nums = list
    .map(s => parseInt(String(s[0]).replace(/\D/g, ""), 10))
    .filter(Boolean);
  return prefix + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0");
}

function addSlot() {
  if (!canEdit) {
    toast("Active le mode edition d'abord.");
    return;
  }

  const nextId = nextSlotId(slots, "S");
  const newSlot = [
    nextId,
    "Ajout interface",
    "Mercredi",
    "Fongravey",
    "17:30",
    "19:00",
    "Libre / a arbitrer",
    "Nouveau creneau a preciser",
    "A confirmer",
    "A programmer",
    ""
  ];

  slots.push(newSlot);
  selected = [nextId];
  renderAll();
  openEdit(nextId);
}

function swapSelected() {
  if (!canEdit) {
    toast("Active le mode edition d'abord.");
    return;
  }

  if (selected.length !== 2) {
    toast("Selectionne deux creneaux a switcher.");
    return;
  }

  const a = slots.find(s => s[0] === selected[0]);
  const b = slots.find(s => s[0] === selected[1]);
  if (!a || !b) return;

  const before = { a: [...a], b: [...b] };

  [a[6], b[6]] = [b[6], a[6]];
  [a[7], b[7]] = [b[7], a[7]];
  [a[8], b[8]] = [b[8], a[8]];
  [a[9], b[9]] = [b[9], a[9]];
  [a[10], b[10]] = [b[10], a[10]];

  selected = [];
  renderAll();
  logAction("switch", { before, after: { a, b } });
  saveAll("Switch envoye au Google Sheet");
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
  $("editClub").innerHTML = CLUBS.map(c => `<option ${c.name === s[6] ? "selected" : ""}>${escapeHTML(c.name)}</option>`).join("")
    + "<option>Handball / Basket</option><option>Basket / Handball</option><option>Libre / a arbitrer</option>";
}

function openEdit(id) {
  if (!canEdit) {
    toast("Active le mode edition d'abord.");
    return;
  }

  const s = slots.find(x => x[0] === id);
  if (!s) return;

  $("drawer").dataset.mode = "base";
  fillEditDrawer(s);
  $("drawer").classList.add("show");
}

function closeDrawer() {
  $("drawer")?.classList.remove("show");
}

function saveEdit() {
  const mode = $("drawer")?.dataset.mode || "base";
  const list = mode === "draft" ? draftSlots : slots;
  const s = list.find(x => x[0] === $("editId").value);
  if (!s) return;

  const before = [...s];

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

  if (mode === "draft") {
    toast("Creneau modifie dans le brouillon. Pense a enregistrer le brouillon.");
  } else {
    logAction("edit", { before, after: s });
    saveAll("Creneau envoye au Google Sheet");
  }
}

function exportCSV() {
  const header = ["id", "source", "jour", "gymnase", "debut", "fin", "association", "usage", "nature", "statut", "note"];
  const csv = [header, ...slots]
    .map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  downloadTextFile("creneaux_blanquefort_export.csv", csv, "text/csv;charset=utf-8");
}

function renderDraftPlanning() {
  const container = $("draftPlanningGrid");
  if (!container) return;

  if (!Array.isArray(draftSlots)) draftSlots = [];

  const gyms = GYMS.map(g => g.name);
  let html = "<div></div>" + gyms.map(g => `<div class="gymHead">${escapeHTML(g)}</div>`).join("");

  DAYS.forEach(day => {
    html += `<div class="day">${escapeHTML(day)}</div>`;

    gyms.forEach(gym => {
      const list = draftSlots
        .filter(s => s[2] === day && s[3] === gym)
        .sort((a, b) => minutes(a[4]) - minutes(b[4]));

      html += '<div class="cell">';
      if (!list.length) html += '<span style="color:#647067">-</span>';

      list.forEach(s => {
        const sel = selectedDraft.includes(s[0]) ? " selected" : "";
        html += `
          <div class="slot ${clubClass(s[6])}${sel}" onclick="selectDraftSlot('${escapeHTML(s[0])}')" ondblclick="openDraftEdit('${escapeHTML(s[0])}')">
            <div class="top">${escapeHTML(s[4])}-${escapeHTML(s[5])} - ${escapeHTML(s[6])}</div>
            <div class="meta">${escapeHTML(s[7])}</div>
            <div class="meta">${escapeHTML(s[8])} - ${escapeHTML(s[9])}</div>
          </div>`;
      });

      html += "</div>";
    });
  });

  container.innerHTML = html;

  if (!draftSlots.length) {
    setDraftStatus("Brouillon vide : tu peux copier la base actuelle ou ajouter un creneau.");
  } else {
    setDraftStatus("Brouillon charge : " + draftSlots.length + " creneau(x).", true);
  }
}

function timeToMinutes(value) {
  const text = String(value || "").replace("h", ":");
  const [h, m] = text.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function timeLabelToCss(value) {
  return String(value || "").replace("h", "-");
}

function renderLongPlanning(containerId, rows, options = {}) {
  const container = $(containerId);
  if (!container) return;

  const times = options.times || BLANK_LONG_TIMES;
  const rowCount = times.length - 1;
  const gymRows = Array.isArray(rows) ? rows : [];
  const isEmptyGrid = Boolean(options.empty);
  const subtitle = options.subtitle || "";

  container.innerHTML = LONG_GYMS.map(gym => {
    const blocks = isEmptyGrid ? [] : gymRows
      .filter(s => s.gymnase === gym)
      .map(s => {
        const start = timeToMinutes(s.debut);
        const end = timeToMinutes(s.fin);
        const first = timeToMinutes(times[0]);
        const last = timeToMinutes(times[times.length - 1]);
        const clampedStart = Math.max(start, first);
        const clampedEnd = Math.min(end, last);
        const startLine = Math.round((clampedStart - first) / 30) + 2;
        const endLine = Math.round((clampedEnd - first) / 30) + 2;
        const dayIndex = LONG_DAYS.indexOf(s.jour);
        if (dayIndex < 0 || end <= first || start >= last || endLine <= startLine) return "";
        const label = [s.association, s.usage].filter(Boolean).join(" - ");
        return `
          <div class="meetingBlock slot ${clubClass(s.association)}"
               style="grid-column:${dayIndex + 2};grid-row:${startLine}/${endLine}">
            <strong>${escapeHTML(label || "Scenario de travail")}</strong>
            <span>${escapeHTML(s.debut)}-${escapeHTML(s.fin)}</span>
          </div>`;
      }).join("");

    return `
      <section class="meetingGym">
        <div class="meetingGymHead">
          <h3>${escapeHTML(gym)}</h3>
          ${subtitle ? `<span>${escapeHTML(subtitle)}</span>` : ""}
        </div>
        <div class="meetingGrid" style="--row-count:${rowCount}">
          <div class="meetingCorner"></div>
          ${LONG_DAYS.map(day => `<div class="meetingDay">${escapeHTML(day)}</div>`).join("")}
          ${times.slice(0, -1).map(time => `
            <div class="meetingTime">${escapeHTML(time)}</div>
            ${LONG_DAYS.map(day => `<div class="meetingCell time-${timeLabelToCss(time)} day-${escapeHTML(day)}"></div>`).join("")}
          `).join("")}
          ${blocks}
        </div>
      </section>`;
  }).join("");
}

function renderLongDraftPlanning() {
  renderLongPlanning("longDraftPlanning", [], {
    empty: true,
    times: BLANK_LONG_TIMES
  });
}

function selectDraftSlot(id) {
  if (selectedDraft.includes(id)) {
    selectedDraft = selectedDraft.filter(x => x !== id);
  } else {
    selectedDraft = [id];
  }
  renderDraftPlanning();
  renderLongDraftPlanning();
}

function openDraftEdit(id) {
  if (!canEdit) {
    toast("Active le mode edition d'abord.");
    return;
  }

  const s = draftSlots.find(x => x[0] === id);
  if (!s) return;

  $("drawer").dataset.mode = "draft";
  fillEditDrawer(s);
  $("drawer").classList.add("show");
}

function addDraftSlot() {
  if (!canEdit) {
    toast("Active le mode edition d'abord.");
    return;
  }

  const nextId = nextSlotId(draftSlots, "D");
  const newSlot = [
    nextId,
    "Brouillon interface",
    "Mercredi",
    "Fongravey",
    "17:30",
    "19:00",
    "Libre / a arbitrer",
    "Nouveau creneau brouillon",
    "A confirmer",
    "Brouillon",
    ""
  ];

  draftSlots.push(newSlot);
  selectedDraft = [nextId];
  renderDraftPlanning();
  renderLongDraftPlanning();
  openDraftEdit(nextId);
}

function clearDraft() {
  if (!canEdit) {
    toast("Active le mode edition d'abord.");
    return;
  }

  const ok = confirm("Vider le planning vierge affiche a l'ecran ? Cela n'efface le Sheet que si tu cliques ensuite sur Enregistrer le brouillon.");
  if (!ok) return;

  draftSlots = [];
  selectedDraft = [];
  renderDraftPlanning();
  renderLongDraftPlanning();
  toast("Planning vierge vide a l'ecran");
}

function copyCurrentToDraft() {
  draftSlots = JSON.parse(JSON.stringify(slots));
  draftSlots = draftSlots.map((s, index) => {
    const copy = [...s];
    copy[0] = copy[0] || "D" + String(index + 1).padStart(3, "0");
    copy[1] = "Copie base mairie vers brouillon";
    copy[9] = copy[9] || "Brouillon";
    return copy;
  });
  selectedDraft = [];
  renderDraftPlanning();
  renderLongDraftPlanning();
  toast("Base actuelle copiee dans le planning vierge");
}

async function loadDraftFromSheet(showToast = true) {
  try {
    const data = await loadJSONP(CONFIG.API_URL + (CONFIG.API_URL.includes("?") ? "&" : "?") + "action=draft");
    draftSlots = (data.brouillon || []).map(rowToArray);
    selectedDraft = [];
    renderDraftPlanning();
    renderLongDraftPlanning();
    if (showToast) toast("Brouillon recharge depuis le Sheet");
  } catch (e) {
    setDraftStatus("Brouillon non charge : " + e.message);
    if (showToast) toast("Impossible de charger le brouillon");
  }
}

async function saveDraftToSheet() {
  if (!canEdit) {
    toast("Active le mode edition d'abord.");
    return;
  }

  const payload = { action: "replaceBrouillon", rows: draftSlots.map(arrayToRow) };

  try {
    await fetch(CONFIG.API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    toast("Brouillon envoye au Google Sheet");
    setDraftStatus("Brouillon envoye. Clique sur Recharger brouillon dans quelques secondes pour verifier.", true);
  } catch (e) {
    setDraftStatus("Erreur d'enregistrement du brouillon : " + e.message);
  }
}

function exportDraftCSV() {
  const header = ["id", "source", "jour", "gymnase", "debut", "fin", "association", "usage", "nature", "statut", "note"];
  const csv = [header, ...draftSlots]
    .map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  downloadTextFile("creneaux_blanquefort_brouillon.csv", csv, "text/csv;charset=utf-8");
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
