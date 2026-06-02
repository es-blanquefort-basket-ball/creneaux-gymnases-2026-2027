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
