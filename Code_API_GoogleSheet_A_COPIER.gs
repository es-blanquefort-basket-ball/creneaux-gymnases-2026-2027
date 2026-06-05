const SHEETS = {
  CRENEAUX: "APP_CRENEAUX",
  CONFLITS: "APP_CONFLITS",
  PROPOSITIONS: "APP_PROPOSITIONS",
  BROUILLON: "APP_BROUILLON",
  SWITCHS: "APP_SWITCHS",
  SCENARIOS: "APP_SCENARIOS",
  SCENARIO_CRENEAUX: "APP_SCENARIO_CRENEAUX",
  SCENARIO_RETENU: "APP_SCENARIO_RETENU",
  LOGS_MODIFS: "APP_LOGS_MODIFS"
};

const HEADERS = {
  CRENEAUX: ["id","source","jour","gymnase","debut","fin","association","usage","nature","statut","note"],
  SCENARIOS: ["scenario_id","nom","auteur","date_creation","date_modification","statut","commentaire"],
  SCENARIO_CRENEAUX: ["scenario_id","creneau_id","club","categorie","usage","jour","equipement","heure_debut","heure_fin","statut_creneau","note","origine","modifie_par","modifie_le"],
  SCENARIO_RETENU: ["creneau_id","club","categorie","usage","jour","equipement","heure_debut","heure_fin","statut_creneau","note","modifie_par","modifie_le"],
  LOGS_MODIFS: ["date","auteur","action","scenario_id","creneau_id","ancienne_valeur","nouvelle_valeur","note"]
};

function doGet(e) {
  const action = (e.parameter.action || "data").toLowerCase();
  const callback = e.parameter.callback || "";

  let payload;

  if (action === "data") {
    payload = {
      ok: true,
      creneaux: readSheet_(SHEETS.CRENEAUX),
      conflits: readSheet_(SHEETS.CONFLITS),
      propositions: readSheet_(SHEETS.PROPOSITIONS),
      switchs: readSheet_(SHEETS.SWITCHS)
    };
  } else if (action === "draft") {
    payload = {
      ok: true,
      brouillon: readSheet_(SHEETS.BROUILLON)
    };
  } else if (action === "loadscenariosfromsheet") {
    payload = {
      ok: true,
      scenarios: readSheet_(SHEETS.SCENARIOS)
    };
  } else if (action === "loadscenarioretenu") {
    payload = {
      ok: true,
      scenario_retenu: readSheet_(SHEETS.SCENARIO_RETENU),
      scenarios: readSheet_(SHEETS.SCENARIOS)
    };
  } else if (action === "loadscenariobyid") {
    const scenarioId = String(e.parameter.scenario_id || "");
    const scenarios = readSheet_(SHEETS.SCENARIOS);
    payload = {
      ok: true,
      scenario: scenarios.find(row => String(row.scenario_id || "") === scenarioId) || {},
      creneaux: readSheet_(SHEETS.SCENARIO_CRENEAUX).filter(row => String(row.scenario_id || "") === scenarioId)
    };
  } else {
    payload = { ok: false, error: "Action inconnue" };
  }

  const json = JSON.stringify(payload);

  if (callback) {
    return ContentService
      .createTextOutput(callback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const raw = e.postData && e.postData.contents ? e.postData.contents : "{}";
    const data = JSON.parse(raw);
    const action = String(data.action || "").toLowerCase();

    if (action === "replacecreneaux") {
      replaceRows_(SHEETS.CRENEAUX, data.rows || []);
      log_("replaceCreneaux", "Planning remplacé depuis interface");
      return json_({ ok: true, message: "Planning mis à jour" });
    }

    if (action === "replacebrouillon") {
      replaceRows_(SHEETS.BROUILLON, data.rows || []);
      log_("replaceBrouillon", "Brouillon remplacé depuis interface");
      return json_({ ok: true, message: "Brouillon mis à jour" });
    }

    if (action === "switch" || action === "edit") {
      log_(action, JSON.stringify(data.details || data));
      return json_({ ok: true, message: "Action tracée" });
    }

    if (action === "savescenariotosheet") {
      saveScenario_(data.scenario || {}, data.rows || []);
      return json_({ ok: true, message: "Scénario sauvegardé" });
    }

    if (action === "publishscenarioasretenu") {
      saveScenario_(data.scenario || {}, data.rows || []);
      publishScenarioRetenu_(data.scenario || {}, data.rows || []);
      return json_({ ok: true, message: "Scénario publié comme retenu" });
    }

    return json_({ ok: false, error: "Action POST inconnue" });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function setupSheets() {
  setup_(SHEETS.CRENEAUX, HEADERS.CRENEAUX);
  setup_(SHEETS.CONFLITS, ["id","point","situation","ce_qui_ne_va_pas","proposition"]);
  setup_(SHEETS.PROPOSITIONS, ["id","blocage","hypothese","proposition_1","proposition_2","niveau"]);
  setup_(SHEETS.BROUILLON, HEADERS.CRENEAUX);
  setup_(SHEETS.SWITCHS, ["horodatage","type","details"]);
  setup_(SHEETS.SCENARIOS, HEADERS.SCENARIOS);
  setup_(SHEETS.SCENARIO_CRENEAUX, HEADERS.SCENARIO_CRENEAUX);
  setup_(SHEETS.SCENARIO_RETENU, HEADERS.SCENARIO_RETENU);
  setup_(SHEETS.LOGS_MODIFS, HEADERS.LOGS_MODIFS);
}

function readSheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(name);
  if (!sh) return [];
  const values = sh.getDataRange().getDisplayValues();
  if (!values || values.length < 2) return [];
  const headers = values[0].map(h => String(h).trim());
  return values.slice(1)
    .filter(row => row.some(cell => String(cell).trim() !== ""))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i] || "");
      return obj;
    });
}

function replaceRows_(sheetName, rows) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(sheetName);
  if (!sh) sh = ss.insertSheet(sheetName);

  const headers = HEADERS.CRENEAUX;
  sh.clearContents();
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);

  if (rows.length) {
    const matrix = rows.map(r => [
      r.id || "",
      r.source || "",
      r.jour || "",
      r.gymnase || "",
      r.debut || "",
      r.fin || "",
      r.association || "",
      r.usage || "",
      r.nature || "",
      r.statut || "",
      r.note || ""
    ]);
    sh.getRange(2, 1, matrix.length, headers.length).setValues(matrix);
  }

  style_(sh, headers.length);
}

function replaceObjectRows_(sheetName, headers, rows) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(sheetName);
  if (!sh) sh = ss.insertSheet(sheetName);

  sh.clearContents();
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);

  if (rows.length) {
    const matrix = rows.map(row => headers.map(header => row[header] || ""));
    sh.getRange(2, 1, matrix.length, headers.length).setValues(matrix);
  }

  style_(sh, headers.length);
}

function saveScenario_(scenario, rows) {
  setup_(SHEETS.SCENARIOS, HEADERS.SCENARIOS);
  setup_(SHEETS.SCENARIO_CRENEAUX, HEADERS.SCENARIO_CRENEAUX);

  const scenarioId = String(scenario.scenario_id || scenario.id || "");
  if (!scenarioId) throw new Error("scenario_id manquant");

  const now = new Date();
  const scenarios = readSheet_(SHEETS.SCENARIOS)
    .filter(row => String(row.scenario_id || "") !== scenarioId);

  scenarios.push({
    scenario_id: scenarioId,
    nom: scenario.nom || scenario.scenario_nom || "",
    auteur: scenario.auteur || scenario.scenario_auteur || "",
    date_creation: scenario.date_creation || scenario.scenario_date || now,
    date_modification: now,
    statut: scenario.statut || scenario.scenario_statut || "brouillon",
    commentaire: scenario.commentaire || scenario.scenario_commentaire || ""
  });

  replaceObjectRows_(SHEETS.SCENARIOS, HEADERS.SCENARIOS, scenarios);

  const existingRows = readSheet_(SHEETS.SCENARIO_CRENEAUX)
    .filter(row => String(row.scenario_id || "") !== scenarioId);
  const nextRows = rows.map(row => ({
    scenario_id: scenarioId,
    creneau_id: row.creneau_id || row.id || "",
    club: row.club || row.association || "",
    categorie: row.categorie || row.nature || "",
    usage: row.usage || "",
    jour: row.jour || "",
    equipement: row.equipement || row.gymnase || "",
    heure_debut: row.heure_debut || row.debut || "",
    heure_fin: row.heure_fin || row.fin || "",
    statut_creneau: row.statut_creneau || "retenu",
    note: row.note || "",
    origine: row.origine || row.source || "scenario",
    modifie_par: row.modifie_par || scenario.auteur || scenario.scenario_auteur || "",
    modifie_le: row.modifie_le || now
  }));

  replaceObjectRows_(SHEETS.SCENARIO_CRENEAUX, HEADERS.SCENARIO_CRENEAUX, existingRows.concat(nextRows));
}

function publishScenarioRetenu_(scenario, rows) {
  setup_(SHEETS.SCENARIO_RETENU, HEADERS.SCENARIO_RETENU);

  const now = new Date();
  const retainedRows = rows.map(row => ({
    creneau_id: row.creneau_id || row.id || "",
    club: row.club || row.association || "",
    categorie: row.categorie || row.nature || "",
    usage: row.usage || "",
    jour: row.jour || "",
    equipement: row.equipement || row.gymnase || "",
    heure_debut: row.heure_debut || row.debut || "",
    heure_fin: row.heure_fin || row.fin || "",
    statut_creneau: row.statut_creneau || "retenu",
    note: row.note || "",
    modifie_par: row.modifie_par || scenario.auteur || scenario.scenario_auteur || "",
    modifie_le: row.modifie_le || now
  }));

  replaceObjectRows_(SHEETS.SCENARIO_RETENU, HEADERS.SCENARIO_RETENU, retainedRows);
  appendLogModif_({
    date: now,
    auteur: scenario.auteur || scenario.scenario_auteur || "",
    action: "publishScenarioAsRetenu",
    scenario_id: scenario.scenario_id || scenario.id || "",
    creneau_id: "",
    ancienne_valeur: "",
    nouvelle_valeur: retainedRows.length + " creneau(x)",
    note: scenario.nom || scenario.scenario_nom || ""
  });
}

function appendLogModif_(row) {
  setup_(SHEETS.LOGS_MODIFS, HEADERS.LOGS_MODIFS);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEETS.LOGS_MODIFS);
  sh.appendRow(HEADERS.LOGS_MODIFS.map(header => row[header] || ""));
}

function setup_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);

  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  style_(sh, headers.length);
}

function style_(sh, cols) {
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, cols)
    .setFontWeight("bold")
    .setBackground("#2F4858")
    .setFontColor("#FFFFFF");
  sh.autoResizeColumns(1, cols);
}

function log_(type, details) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEETS.SWITCHS);
  if (!sh) sh = ss.insertSheet(SHEETS.SWITCHS);

  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, 3).setValues([["horodatage","type","details"]]);
    style_(sh, 3);
  }

  sh.appendRow([new Date(), type, details]);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
