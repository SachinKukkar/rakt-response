#!/usr/bin/env node
/**
 * Builds public/data/locations/<state>.json for the State → District → City/Town pickers.
 *
 * Sources (both MIT licensed, extracted with `npm pack <name>` + `tar -xzf`):
 *   - india-location-kit@1.0.0  src/data/{states,districts}.json   district names
 *   - india-pincode@2.5.9       data/pincodes.json.gz              India Post office directory
 *                                                                  (the data.gov.in "All India Pincode Directory")
 *
 * Usage:
 *   node scripts/build-location-data.mjs <path/to/india-location-kit/package> <path/to/india-pincode/package>
 *
 * District lists are corrected below where the source is out of date. Anything a
 * donor can't find can still be typed in, so the lists only need to be helpful,
 * not exhaustive. Re-run after editing the corrections and check the report.
 */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { join } from "node:path";

const [kitDir, pinDir] = process.argv.slice(2);
if (!kitDir || !pinDir) {
  console.error("Usage: node scripts/build-location-data.mjs <india-location-kit/package> <india-pincode/package>");
  process.exit(1);
}

const readJson = (p) => JSON.parse(readFileSync(p, "utf8"));
const kitStates = readJson(join(kitDir, "src/data/states.json"));
const kitDistricts = readJson(join(kitDir, "src/data/districts.json"));
const offices = JSON.parse(gunzipSync(readFileSync(join(pinDir, "data/pincodes.json.gz"))).toString("utf8"));

// --- Corrections to the district source (as of Oct 2026) --------------------
const REMOVE = {
  // Nine of the 2023 districts were abolished in December 2024.
  Rajasthan: ["Anupgarh", "Dudu", "Gangapur City", "Jaipur Rural", "Jodhpur Rural", "Kekri", "Neem Ka Thana", "Sanchore", "Shahpura"],
  // Proposed, never notified.
  "West Bengal": ["Berhampore", "Bishnupur", "Ichamati", "Jangipur", "Ranaghat"],
  "Madhya Pradesh": ["Chachaura", "Nagda"],
  // Announced in 2024; not yet functioning districts. Donors can still type them.
  Ladakh: ["Changthang", "Drass", "Nubra", "Sham", "Zanskar"],
};
const ADD = {
  Rajasthan: ["Karauli"],
  Gujarat: ["Vav-Tharad"],
  "Arunachal Pradesh": ["Lohit", "Siang"],
  Tripura: ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
};
const RENAME = { Rajasthan: { Ganganagar: "Sri Ganganagar" } };

// India Post district names (normalised) → our district names, per state.
const POSTAL_ALIASES = {
  "Andaman and Nicobar Islands": { nicobars: "Nicobar", southandamans: "South Andaman" },
  "Andhra Pradesh": { konaseema: "Dr. B.R. Ambedkar Konaseema", spsrnellore: "Sri Potti Sriramulu Nellore", visakhapatanam: "Visakhapatnam", ysr: "YSR Kadapa" },
  Assam: { kamrupmetro: "Kamrup Metropolitan", marigaon: "Morigaon", southsalmaramancachar: "South Salmara-Mankachar" },
  Chhattisgarh: { balodabazar: "Baloda Bazar-Bhatapara", gariyaband: "Gariaband", gaurellapendramarwahi: "Gaurela-Pendra-Marwahi", korea: "Koriya" },
  Delhi: {
    central: "Central Delhi", east: "East Delhi", northeast: "North East Delhi", northwest: "North West Delhi", north: "North Delhi",
    southwest: "South West Delhi", south: "South Delhi", southeast: "South East Delhi", west: "West Delhi",
  },
  Gujarat: { kachchh: "Kutch", mahesana: "Mehsana", panchmahals: "Panchmahal", ahmadabad: "Ahmedabad", arvalli: "Aravalli", dohad: "Dahod" },
  Haryana: { charkidadri: "Charkhi Dadri" },
  "Himachal Pradesh": { lahulandspiti: "Lahaul and Spiti" },
  Bihar: { kaimurbhabua: "Kaimur", pashchimchamparan: "West Champaran", purbichamparan: "East Champaran" },
  Jharkhand: { eastsinghbum: "East Singhbhum", sahebganj: "Sahibganj", saraikelakharsawan: "Seraikela Kharsawan" },
  Ladakh: { lehladakh: "Leh" },
  Odisha: { khordha: "Khordha", anugul: "Angul", baleshwar: "Balasore", jagatsinghapur: "Jagatsinghpur", jajapur: "Jajpur", sonepur: "Subarnapur" },
  Rajasthan: { ganganagar: "Sri Ganganagar" },
  Karnataka: { chamarajanagara: "Chamarajanagar", chikkaballapura: "Chikkaballapur", davangere: "Davanagere", vijaynagar: "Vijayanagara" },
  Lakshadweep: { lakshadweepdistrict: "Lakshadweep" },
  "Madhya Pradesh": { hoshangabad: "Narmadapuram", eastnimar: "Khandwa" },
  Maharashtra: { ahmednagar: "Ahilyanagar", osmanabad: "Dharashiv", aurangabad: "Chhatrapati Sambhajinagar", mumbai: "Mumbai City" },
  Puducherry: { mahe: "Mahé", pondicherry: "Puducherry" },
  Punjab: { firozepur: "Firozpur", sasnagar: "Sahibzada Ajit Singh Nagar (Mohali)", srimuktsarsahib: "Muktsar" },
  // Sikkim renamed its districts in 2021.
  Sikkim: { eastdistrict: "Gangtok", northdistrict: "Mangan", southdistrict: "Namchi", westdistrict: "Gyalshing" },
  "Tamil Nadu": { thenilgiris: "Nilgiris", villupuram: "Viluppuram", kanchipuram: "Kanchipuram", kanniyakumari: "Kanyakumari", thiruvallur: "Tiruvallur", thiruvarur: "Tiruvarur", tuticorin: "Thoothukudi" },
  Telangana: { jangoan: "Jangaon", jayashankarbhupalapally: "Jayashankar Bhupalpally", jagitial: "Jagtial" },
  "Uttar Pradesh": { kheri: "Kheri", santkabeernagar: "Sant Kabir Nagar" },
  Uttarakhand: { udamsinghnagar: "Udham Singh Nagar" },
  "West Bengal": { maldah: "Malda", medinipureast: "Purba Medinipur", medinipurwest: "Paschim Medinipur", "24paraganasnorth": "North 24 Parganas", "24paraganassouth": "South 24 Parganas", dinajpurdakshin: "Dakshin Dinajpur", dinajpuruttar: "Uttar Dinajpur" },
};

const norm = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");
const titleCase = (s) =>
  s
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\b(Ii|Iii|Iv)\b/g, (m) => m.toUpperCase());

/** "Pune City H.O" → "Pune City"; "Airport S.O (Pune)" → "Airport". */
function cleanOffice(name) {
  return name
    .replace(/\s*\(.*?\)\s*$/, "")
    .replace(/\s*\b(B\.?\s?O|S\.?\s?O|H\.?\s?O|D\.?\s?S\.?\s?O|G\.?\s?P\.?\s?O|P\.?\s?O|MDG|NDG|E\.?\s?D\.?\s?S\.?\s?O|Extn\.?\s?Counter)\.?\s*$/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const kitStateName = Object.fromEntries(kitStates.map((s) => [s.code, s.name]));
const stateDistricts = new Map();
for (const d of kitDistricts) {
  const state = kitStateName[d.stateCode];
  if (!stateDistricts.has(state)) stateDistricts.set(state, new Set());
  stateDistricts.get(state).add(d.name.trim());
}
for (const [state, names] of Object.entries(REMOVE)) for (const n of names) stateDistricts.get(state)?.delete(n);
for (const [state, names] of Object.entries(ADD)) {
  if (!stateDistricts.has(state)) stateDistricts.set(state, new Set());
  for (const n of names) stateDistricts.get(state).add(n);
}
for (const [state, map] of Object.entries(RENAME))
  for (const [from, to] of Object.entries(map)) if (stateDistricts.get(state)?.delete(from)) stateDistricts.get(state).add(to);

const postalState = (s) => (s === "THE DADRA AND NAGAR HAVELI AND DAMAN AND DIU" ? "Dadra and Nagar Haveli and Daman and Diu" : s);

// Group cleaned office names by (state, district).
const places = new Map(); // `${normState}|${normDistrict}` → Map(normPlace → [name, pin])
const unmatched = new Map();
for (const o of offices) {
  if (!o.s || o.s === "NA" || !o.i) continue;
  const state = [...stateDistricts.keys()].find((s) => norm(s) === norm(postalState(o.s)));
  if (!state) continue;
  const districts = [...stateDistricts.get(state)];
  const alias = POSTAL_ALIASES[state]?.[norm(o.i)];
  const district = alias ? districts.find((d) => d === alias) : districts.find((d) => norm(d) === norm(o.i));
  if (!district) {
    unmatched.set(`${state} / ${o.i}`, (unmatched.get(`${state} / ${o.i}`) ?? 0) + 1);
    continue;
  }
  const name = titleCase(cleanOffice(o.o));
  if (name.length < 2) continue;
  const bucketKey = `${state}|${district}`;
  if (!places.has(bucketKey)) places.set(bucketKey, new Map());
  const bucket = places.get(bucketKey);
  // Prefer head/sub offices (towns) over branch offices for the PIN shown.
  if (!bucket.has(norm(name)) || o.t !== "BO") bucket.set(norm(name), [name, o.p]);
}

const outDir = join(process.cwd(), "public/data/locations");
mkdirSync(outDir, { recursive: true });
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const index = {};
const allDistricts = []; // [district, state] for the all-India district search
let totalDistricts = 0;
let totalPlaces = 0;
for (const [state, set] of [...stateDistricts.entries()].sort()) {
  const districts = [...set].sort((a, b) => a.localeCompare(b)).map((name) => {
    const list = [...(places.get(`${state}|${name}`)?.values() ?? [])].sort((a, b) => a[0].localeCompare(b[0]));
    totalPlaces += list.length;
    allDistricts.push([name, state]);
    return { name, places: list };
  });
  totalDistricts += districts.length;
  index[state] = slug(state);
  writeFileSync(join(outDir, `${slug(state)}.json`), JSON.stringify({ state, districts }));
}
writeFileSync(join(outDir, "index.json"), JSON.stringify(index));
allDistricts.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
writeFileSync(join(outDir, "districts.json"), JSON.stringify(allDistricts));

console.log(`States: ${Object.keys(index).length}, districts: ${totalDistricts}, places: ${totalPlaces}`);
const missing = [...stateDistricts.entries()].flatMap(([s, set]) => [...set].filter((d) => !places.has(`${s}|${d}`)).map((d) => `${s} / ${d}`));
console.log(`Districts with no postal places (donors type their town): ${missing.length}`);
console.log(missing.join("\n"));
console.log(`\nUnmatched postal districts (${unmatched.size}):`);
for (const [k, n] of [...unmatched.entries()].sort()) console.log(`  ${k} (${n})`);
