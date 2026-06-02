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
