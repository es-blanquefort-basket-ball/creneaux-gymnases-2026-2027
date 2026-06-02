/***********************
 * CONFIGURATION
 ***********************/
const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbz7wVlTcE_FTXb9e_PfjDEFw5vv-1DHx4WrfwxP3gE-H1Ssq70-hTg08JRK4W49shzXEg/exec",
  EDIT_CODE: "2026"
};

const CLUBS = [
  { name: "Basket", color: "#2E7D32" },
  { name: "Handball", color: "#1565C0" },
  { name: "Handi-basket", color: "#C62828" },
  { name: "Volley", color: "#EF6C00" },
  { name: "Badminton", color: "#6A1B9A" },
  { name: "Futsal", color: "#455A64" },
  { name: "Libre / à arbitrer", color: "#94A3B8" }
];

const GYMS = [
  {
    name: "Fongravey",
    capacity: "3 terrains possibles",
    role: "Grande salle : besoins à 3 terrains, jeunes avec matériel adapté, créneaux handi-basket viables."
  },
  {
    name: "Port du Roy",
    capacity: "2 terrains maximum",
    role: "Gymnase de match / compétition pour basket et volley. Pas équivalent à Fongravey pour une demande à 3 terrains."
  },
  {
    name: "Dupaty",
    capacity: "Bloc complet possible",
    role: "Salle utile pour blocs longs, badminton, volley, technique basket et futsal selon arbitrage."
  }
];

let slots = [];
let conflicts = [];
let selected = [];
let canEdit = false;

/***********************
 * API APPS SCRIPT
 ***********************/
function loadJSONP(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error("URL Apps Script manquante"));
      return;
    }

    const callback = "jsonp_cb_" + Math.random().toString(36).slice(2);

    window[callback] = function (data) {
      delete window[callback];
      script.remove();
      resolve(data || {});
    };

    const script = document.createElement("script");

    script.onerror = function () {
      delete window[callback];
      script.remove();
      reject(new Error("Impossible de charger l’API Apps Script"));
    };

    const separator = url.includes("?") ? "&" : "?";
    script.src = url + separator + "action=data&callback=" + callback + "&t=" + Date.now();

    document.body.appendChild(script);
  });
}

async function reloadFromSheet() {
  setStatus("Chargement du Google Sheet…");

  try {
    const data = await loadJSONP(CONFIG.API_URL);

    slots = (data.creneaux || []).map(rowToArray);

    conflicts = (data.conflits || []).map(c => [
      c.id || "",
      c.point || "",
      c.situation || "",
      c.ce_qui_ne_va_pas || "",
      c.proposition || ""
    ]);

    selected = [];
    renderAll();

    setStatus("Données chargées depuis le Google Sheet : " + slots.length + " créneaux.", true);
  } catch (e) {
    setStatus("Erreur de chargement : " + e.message);
    alert("Erreur de chargement : " + e.message);
  }
}

async function saveAll(reason) {
  if (!canEdit) {
    toast("Active le mode édition d’abord.");
    return;
  }

  const payload = {
    action: "replaceCreneaux",
    rows: slots.map(arrayToRow)
  };

  try {
    await fetch(CONFIG.API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    toast(reason || "Enregistrement envoyé au Google Sheet");
    setStatus("Enregistrement envoyé. Clique sur Recharger Sheet dans quelques secondes pour vérifier.", true);
  } catch (e) {
    toast("Erreur d’enregistrement");
    setStatus("Erreur d’enregistrement : " + e.message);
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

/***********************
 * CONVERSIONS
 ***********************/
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
    id: s[0],
    source: s[1],
    jour: s[2],
    gymnase: s[3],
    debut: s[4],
    fin: s[5],
    association: s[6],
    usage: s[7],
    nature: s[8],
    statut: s[9],
    note: s[10]
  };
}

/***********************
 * INTERFACE
 ***********************/
function setStatus(message, ok = false) {
  const el = document.getElementById("syncStatus");
  if (!el) return;

  el.className = "notice " + (ok ? "okmsg" : "");
  el.textContent = message;
}

function toast(message) {
  const t = document.getElementById("toast");
  if (!t) return;

  t.textContent = message;
  t.classList.add("show");

  setTimeout(() => {
    t.classList.remove("show");
  }, 2600);
}

function unlockEdit() {
  const code = prompt("Code édition");

  if (code === CONFIG.EDIT_CODE) {
    canEdit = true;
    document.body.classList.remove("locked");
    toast("Mode édition activé");
  } else if (code !== null) {
    toast("Code incorrect");
  }
}

function showTab(id, btn) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));

  const target = document.getElementById(id);
  if (target) target.classList.add("active");

  document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
}

/***********************
 * HORAIRES / DOUBLONS
 ***********************/
function minutes(t) {
  const parts = String(t || "00:00").split(":").map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  return h * 60 + m;
}

function overlaps(a, b) {
  return (
    a[2] === b[2] &&
    a[3] === b[3] &&
    Math.max(minutes(a[4]), minutes(b[4])) < Math.min(minutes(a[5]), minutes(b[5]))
  );
}

function getOverlaps() {
  const out = [];

  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      if (overlaps(slots[i], slots[j])) {
        out.push([slots[i], slots[j]]);
      }
    }
  }

  return out;
}

function overlapIds() {
  const ids = new Set();

  getOverlaps().forEach(pair => {
    ids.add(pair[0][0]);
    ids.add(pair[1][0]);
  });

  return ids;
}

/***********************
 * COULEURS
 ***********************/
function clubClass(club) {
  if (!club) return "Libre";

  if (club.includes("Basket") && !club.includes("Handi") && !club.includes("Handball")) {
    return "Basket";
  }

  if (club === "Handball") return "Handball";
  if (club.includes("Handi-basket")) return "Handi-basket";
  if (club.includes("Volley")) return "Volley";
  if (club.includes("Badminton")) return "Badminton";
  if (club.includes("Futsal")) return "Futsal";

  return "Libre";
}

/***********************
 * RENDUS
 ***********************/
function renderPlanning() {
  const container = document.getElementById("planningGrid");
  if (!container) return;

  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const gyms = ["Fongravey", "Port du Roy", "Dupaty"];
  const ids = overlapIds();
  const q = (document.getElementById("q")?.value || "").toLowerCase();

  let html = "<div></div>" + gyms.map(g => `<div class="gymHead">${g}</div>`).join("");

  days.forEach(day => {
    html += `<div class="day">${day}</div>`;

    gyms.forEach(gym => {
      let list = slots
        .filter(s => s[2] === day && s[3] === gym)
        .sort((a, b) => minutes(a[4]) - minutes(b[4]));

      if (q) {
        list = list.filter(s => s.join(" ").toLowerCase().includes(q));
      }

      html += '<div class="cell">';

      if (!list.length) {
        html += '<span style="color:#647067">—</span>';
      }

      list.forEach(s => {
        const isSelected = selected.includes(s[0]) ? " selected" : "";
        const isOverlap = ids.has(s[0]) ? " overlap" : "";
        const tag = ids.has(s[0]) ? '<span class="overlapTag">doublon</span>' : "";
        const cls = clubClass(s[6]);

        html += `
          <div class="slot ${cls}${isSelected}${isOverlap}" onclick="selectSlot('${s[0]}')" ondblclick="openEdit('${s[0]}')">
            <div class="top">${s[4]}–${s[5]} · ${s[6]} ${tag}</div>
            <div class="meta">${s[7]}</div>
            <div class="meta">${s[8]} · ${s[9]}</div>
          </div>
        `;
      });

      html += "</div>";
    });
  });

  container.innerHTML = html;
}

function renderTable() {
  const body = document.getElementById("tbody");
  if (!body) return;

  const club = document.getElementById("clubFilter")?.value || "";
  const gym = document.getElementById("gymFilter")?.value || "";
  const ids = overlapIds();

  const list = slots.filter(s => {
    const okClub = !club || s[6].includes(club);
    const okGym = !gym || s[3] === gym;
    return okClub && okGym;
  });

  body.innerHTML = list.map(s => `
    <tr class="${ids.has(s[0]) ? "overlapRow" : ""}">
      <td>${s[2]}</td>
      <td>${s[3]}</td>
      <td>${s[4]}</td>
      <td>${s[5]}</td>
      <td>${s[6]}</td>
      <td>${s[7]}</td>
      <td><span class="badge">${s[8]}</span></td>
      <td>${s[9]}</td>
      <td>${s[1]}</td>
      <td>${s[10]}</td>
    </tr>
  `).join("");
}

function renderFilters() {
  const clubFilter = document.getElementById("clubFilter");
  const gymFilter = document.getElementById("gymFilter");

  if (clubFilter && clubFilter.innerHTML === "") {
    clubFilter.innerHTML =
      '<option value="">Toutes associations</option>' +
      CLUBS.map(c => `<option>${c.name}</option>`).join("");
  }

  if (gymFilter && gymFilter.innerHTML === "") {
    gymFilter.innerHTML =
      '<option value="">Tous gymnases</option>' +
      GYMS.map(g => `<option>${g.name}</option>`).join("");
  }
}

function renderCards() {
  const gymCards = document.getElementById("gymCards");
  const conflictCards = document.getElementById("conflictCards");

  if (gymCards) {
    gymCards.innerHTML = GYMS.map(g => `
      <div class="tile">
        <b>${g.name}</b>
        <p>${g.capacity}</p>
        <p>${g.role}</p>
      </div>
    `).join("");
  }

  if (conflictCards) {
    conflictCards.innerHTML = conflicts.map(c => `
      <div class="tile">
        <b>${c[1]}</b>
        <p>${c[2]}</p>
        <p>${c[3]}</p>
        <p><strong>${c[4]}</strong></p>
      </div>
    `).join("");
  }
}

function renderOverlaps() {
  const overlapsList = getOverlaps();

  const overlapKpi = document.getElementById("overlapKpi");
  if (overlapKpi) overlapKpi.textContent = overlapsList.length;

  const rowKpi = document.getElementById("rowKpi");
  if (rowKpi) rowKpi.textContent = slots.length;

  const banner = document.getElementById("overlapBanner");
  if (banner) {
    banner.innerHTML = overlapsList.length
      ? `<div class="notice alert">${overlapsList.length} doublon(s) détecté(s) : va dans l’onglet Doublons pour les voir.</div>`
      : "";
  }

  const box = document.getElementById("overlapList");
  if (box) {
    box.innerHTML = overlapsList.length
      ? overlapsList.map(pair => `
        <div class="tile">
          <b>${pair[0][2]} · ${pair[0][3]}</b>
          <p>${pair[0][4]}-${pair[0][5]} · ${pair[0][6]} · ${pair[0][7]}</p>
          <p>${pair[1][4]}-${pair[1][5]} · ${pair[1][6]} · ${pair[1][7]}</p>
        </div>
      `).join("")
      : '<div class="notice">Aucun doublon horaire détecté.</div>';
  }
}

function renderAll() {
  renderFilters();
  renderPlanning();
  renderTable();
  renderCards();
  renderOverlaps();
}

/***********************
 * ACTIONS
 ***********************/
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
    toast("Sélectionne un seul créneau à déplacer.");
    return;
  }

  openEdit(selected[0]);
}

function swapSelected() {
  if (!canEdit) {
    toast("Active le mode édition d’abord.");
    return;
  }

  if (selected.length !== 2) {
    toast("Sélectionne deux créneaux à switcher.");
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
  saveAll("Switch envoyé au Google Sheet");
}

function openEdit(id) {
  if (!canEdit) {
    toast("Active le mode édition d’abord.");
    return;
  }

  const s = slots.find(x => x[0] === id);
  if (!s) return;

  document.getElementById("editId").value = id;
  document.getElementById("editSource").value = s[1];
  document.getElementById("editJour").value = s[2];
  document.getElementById("editDebut").value = s[4];
  document.getElementById("editFin").value = s[5];
  document.getElementById("editNature").value = s[8];
  document.getElementById("editStatut").value = s[9];
  document.getElementById("editGroupe").value = s[7];
  document.getElementById("editNote").value = s[10];

  document.getElementById("editGym").innerHTML = GYMS
    .map(g => `<option ${g.name === s[3] ? "selected" : ""}>${g.name}</option>`)
    .join("");

  document.getElementById("editClub").innerHTML =
    CLUBS.map(c => `<option ${c.name === s[6] ? "selected" : ""}>${c.name}</option>`).join("") +
    "<option>Handball / Basket</option>" +
    "<option>Basket / Handball</option>" +
    "<option>Libre / à arbitrer</option>";

  document.getElementById("drawer").classList.add("show");
}

function closeDrawer() {
  document.getElementById("drawer").classList.remove("show");
}

function saveEdit() {
  const id = document.getElementById("editId").value;
  const s = slots.find(x => x[0] === id);

  if (!s) return;

  const before = [...s];

  s[1] = document.getElementById("editSource").value;
  s[2] = document.getElementById("editJour").value;
  s[3] = document.getElementById("editGym").value;
  s[4] = document.getElementById("editDebut").value;
  s[5] = document.getElementById("editFin").value;
  s[6] = document.getElementById("editClub").value;
  s[7] = document.getElementById("editGroupe").value;
  s[8] = document.getElementById("editNature").value;
  s[9] = document.getElementById("editStatut").value;
  s[10] = document.getElementById("editNote").value;

  closeDrawer();
  renderAll();

  logAction("edit", { before, after: s });
  saveAll("Créneau envoyé au Google Sheet");
}

function exportCSV() {
  const header = ["id", "source", "jour", "gymnase", "debut", "fin", "association", "usage", "nature", "statut", "note"];
  const csv = [header, ...slots]
    .map(row => row.map(v => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);
  a.download = "creneaux_blanquefort_export.csv";
  a.click();
}

/***********************
 * INIT
 ***********************/
document.addEventListener("DOMContentLoaded", () => {
  reloadFromSheet();
});
