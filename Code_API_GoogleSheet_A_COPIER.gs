const SHEETS = {
  CRENEAUX: "APP_CRENEAUX",
  CONFLITS: "APP_CONFLITS",
  PROPOSITIONS: "APP_PROPOSITIONS",
  BROUILLON: "APP_BROUILLON",
  SWITCHS: "APP_SWITCHS"
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

    return json_({ ok: false, error: "Action POST inconnue" });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function setupSheets() {
  setup_(SHEETS.CRENEAUX, ["id","source","jour","gymnase","debut","fin","association","usage","nature","statut","note"]);
  setup_(SHEETS.CONFLITS, ["id","point","situation","ce_qui_ne_va_pas","proposition"]);
  setup_(SHEETS.PROPOSITIONS, ["id","blocage","hypothese","proposition_1","proposition_2","niveau"]);
  setup_(SHEETS.BROUILLON, ["id","source","jour","gymnase","debut","fin","association","usage","nature","statut","note"]);
  setup_(SHEETS.SWITCHS, ["horodatage","type","details"]);
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

  const headers = ["id","source","jour","gymnase","debut","fin","association","usage","nature","statut","note"];
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
