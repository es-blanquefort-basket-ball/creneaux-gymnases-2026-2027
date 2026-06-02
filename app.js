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
