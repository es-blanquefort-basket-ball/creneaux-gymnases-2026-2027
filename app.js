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
            <div class="top">${escapeHTML(s[4])}-${escapeHTML(s[5])} · ${escapeHTML(s[6])} ${tag}</div>
            <div class="meta">${escapeHTML(s[7])}</div>
            <div class="meta">${escapeHTML(s[8])} · ${escapeHTML(s[9])}</div>
          </div>`;
      });

      html += "</div>";
    });
  });

  container.innerHTML = html;
}
