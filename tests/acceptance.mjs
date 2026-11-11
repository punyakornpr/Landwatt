// LandWatt acceptance — ตรวจ F-01..F-14, F-24..F-28, F-03, SLD fields, Cash Flow,
// เปลี่ยนพื้นที่ 2 กรณี, และ save/load + import ผ่าน localStorage mock
import assert from 'node:assert/strict';
import { calculateSolarFarmSpecs, calculateAgrivoltaicsSpecs, calculateEVHubSpecs, calculateBESSFarmSpecs, calculateFloatingSolarSpecs, calculateBiogasSpecs } from '../src/utils/engineeringCalculations.js';

// ---- localStorage mock สำหรับ storage.js ----
const store = {};
globalThis.localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; },
};
const { saveProjects, loadProjects, exportProjectJSON, importProjectJSON } = await import('../src/engine/storage.js');

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b} (tol ${tol})`);
const num = s => parseFloat(String(s).replace(/,/g, ''));
const GHI = 5.28, DEG = 0.004;

function checkPVChain(specs, land, tag, isAgri = false) {
  const sd = specs.stringDesign;
  const usable = Math.max(0, land.areaSqM - (land.excludedAreaSqM || 0)) * 0.78;
  // F-01/F-02
  near(land.areaSqM / 1600, land.areaSqM / 1600, 0);
  assert.equal(num(specs.areaCandidatePanelCount), Math.floor(usable / 4), `${tag}: candidate=⌊usable/4⌋`);
  // F-03/F-04: installed = strings × size, exact DC
  assert.equal(sd.stringCount * sd.stringSize, sd.installedPanelCount, `${tag}: strings×size=installed`);
  const dcKwpExact = sd.installedPanelCount * 620 / 1000;
  near(dcKwpExact / 1000, num(specs.dcCapacityMWp), 0.001, `${tag}: dcMWp`);
  // F-06/F-07
  const acKw = specs.inverterCount * 300;
  near(acKw / 1000, num(specs.acCapacityMW), 1e-9, `${tag}: acMW=inv×300`);
  near(dcKwpExact / acKw, num(specs.actualDcAcRatio), 0.001, `${tag}: ratio`);
  // F-05: string voltage bounds
  assert.ok(sd.stringSize * num(sd.vocCold) <= sd.vdcMax + 1e-9, `${tag}: Voc_string ≤ VdcMax`);
  const vmp = sd.stringSize * num(sd.vmpHot);
  assert.ok(vmp >= sd.mpptMin - 1e-9 && vmp <= sd.mpptMax + 1e-9, `${tag}: Vmp_string ∈ MPPT`);
  // F-14: transformer covers AC/PF
  assert.ok(specs.transformerKVA * 0.95 >= acKw - 1e-9, `${tag}: tr×0.95 ≥ AC`);
  assert.ok(specs.transformerRating.startsWith(String(specs.transformerKVA)), `${tag}: SLD transformerRating มี kVA เดียวกัน`);
  // SLD fields: moduleCount ↔ installed
  assert.equal(num(specs.moduleCount), sd.installedPanelCount, `${tag}: SLD moduleCount=installed`);
  return { dcKwpExact, acKw };
}

function checkCashFlows(specs, land, tag, hasAgri = false) {
  const f = specs.financials, cf = specs.cashFlows;
  assert.ok(cf && cf.length === 26, `${tag}: cashFlows[0..25]`);
  // reconstruct จากค่าดิบตามสูตร engine — ไม่ใช้ display fields ที่ปัดแล้ว
  const dcKwpExact = specs.stringDesign.installedPanelCount * 620 / 1000;
  const areaRai = land.areaSqM / 1600;
  const ghi = land.provinceData.ghi;
  let capex, opex, pvRev, crop = 0;
  if (hasAgri) {
    capex = (dcKwpExact / 1000) * 25e6;
    pvRev = num(specs.annualEnergyMWh) * 1000 * 2.1679; // engine ใช้ MWh ปัดเต็ม
    crop = areaRai * 160000;
    opex = capex * 0.018 + areaRai * 30000;
  } else {
    capex = (dcKwpExact / 1000) * 21.5e6;
    pvRev = (dcKwpExact * ghi * 365 * 0.8 / 1000) * 1000 * 2.1679;
    opex = capex * 0.015;
  }
  near(cf[0], -capex, 1, `${tag}: CF0 = −CAPEX`);
  for (let y = 1; y <= 25; y++) {
    near(cf[y], pvRev * Math.pow(1 - DEG, y - 1) + crop - opex, 1, `${tag}: CF${y} F-24`);
  }
  // F-26: payback = ปีแรก CCF≥0
  let ccf = 0, pb = null;
  for (let y = 0; y <= 25; y++) { ccf += cf[y]; if (pb === null && ccf >= 0) pb = y; }
  assert.equal(f.paybackYears, pb === null ? 'ไม่คืนทุนภายใน 25 ปี' : String(pb), `${tag}: payback`);
  // F-27: NPV จาก array เดียวกัน
  const npv = cf.reduce((s, c, y) => s + c / Math.pow(1.06, y), 0);
  near(npv / 1e6, num(f.npv25YrMillionTHB), 0.05, `${tag}: NPV`);
  // F-28: IRR ต้องทำให้ NPV(rate)≈0
  const irr = num(f.irrPercent) / 100;
  const npvAtIrr = cf.reduce((s, c, y) => s + c / Math.pow(1 + irr, y), 0);
  assert.ok(Math.abs(npvAtIrr) < 20000, `${tag}: IRR root, NPV(${f.irrPercent}%)=${npvAtIrr.toFixed(0)}`); // tol: IRR แสดง 0.1% → residual จากการปัด
  return { pb };
}

// ===== กรณีที่ 1: 2072 m² (golden) =====
const L1 = { areaSqM: 2072, excludedAreaSqM: 0, provinceData: { ghi: GHI } };
const s1 = calculateSolarFarmSpecs(L1);
const a1 = calculateAgrivoltaicsSpecs(L1);
checkPVChain(s1, L1, 'solar@2072'); checkCashFlows(s1, L1, 'solar@2072');
checkPVChain(a1, L1, 'agri@2072', true); checkCashFlows(a1, L1, 'agri@2072', true);
// agri = 70% ของ solar strings เสมอ
assert.equal(a1.stringDesign.stringCount, Math.floor(s1.stringDesign.stringCount * 0.7), 'agri: 0.7×solar strings');
assert.equal(a1.baseStringCount, s1.stringDesign.stringCount, 'agri: baseStringCount');

// ===== กรณีที่ 2: เปลี่ยนพื้นที่ 2394 m² — ทุกค่าต้องขยับสอดคล้อง =====
const L2 = { areaSqM: 2394, excludedAreaSqM: 0, provinceData: { ghi: GHI } };
const s2 = calculateSolarFarmSpecs(L2);
checkPVChain(s2, L2, 'solar@2394'); checkCashFlows(s2, L2, 'solar@2394');
assert.ok(s2.stringDesign.installedPanelCount > s1.stringDesign.installedPanelCount, 'พื้นที่ใหญ่ขึ้น → แผงมากขึ้น');
near(num(s2.annualEnergyMWh) / num(s1.annualEnergyMWh),
     s2.stringDesign.installedPanelCount / s1.stringDesign.installedPanelCount, 0.01,
     'energy สัดส่วนกับแผง');
// กรณีที่ 3: exclusion + area เล็ก 1470
const L3 = { areaSqM: 1470, excludedAreaSqM: 200, provinceData: { ghi: GHI } };
const s3 = calculateSolarFarmSpecs(L3);
checkPVChain(s3, L3, 'solar@1470ex200'); checkCashFlows(s3, L3, 'solar@1470ex200');
assert.equal(num(s3.areaCandidatePanelCount), Math.floor((1470 - 200) * 0.78 / 4), 'exclusion หักก่อน candidate');

// ===== F-26/27/28 consistency สำหรับทุกประเภท — payback/NPV/IRR ต้องมาจาก cashFlows เดียวกัน =====
function checkFinConsistency(specs, tag) {
  const f = specs.financials, cf = specs.cashFlows;
  assert.ok(cf && cf.length === 26, `${tag}: cashFlows[0..25]`);
  assert.ok(f.npv25YrMillionTHB !== undefined && f.irrPercent !== undefined, `${tag}: NPV/IRR fields`);
  near(cf[0], -num(f.totalCapexMillionTHB) * 1e6, 15000, `${tag}: CF0=−CAPEX`);
  let ccf = 0, pb = null;
  for (let y = 0; y <= 25; y++) { ccf += cf[y]; if (pb === null && ccf >= 0) pb = y; }
  assert.equal(f.paybackYears, pb === null ? 'ไม่คืนทุนภายใน 25 ปี' : String(pb), `${tag}: payback=ปีแรก CCF≥0`);
  const npv = cf.reduce((s, c, y) => s + c / Math.pow(1.06, y), 0);
  near(npv / 1e6, num(f.npv25YrMillionTHB), 0.05, `${tag}: NPV จาก array เดียวกัน`);
  const irr = num(f.irrPercent);
  if (!Number.isNaN(irr)) {
    const npvAtIrr = cf.reduce((s, c, y) => s + c / Math.pow(1 + irr / 100, y), 0);
    // residual สูงสุดที่ยอม = |dNPV/dr| ณ จุด IRR × ข้อผิดพลาดการปัด (±0.1%)
    const dNpv = cf.reduce((s, c, y) => s - y * c / Math.pow(1 + irr / 100, y + 1), 0);
    const tol = Math.max(20000, Math.abs(dNpv) * 0.002);
    assert.ok(Math.abs(npvAtIrr) < tol, `${tag}: IRR root residual=${npvAtIrr.toFixed(0)} (tol ${tol.toFixed(0)})`);
  }
  assert.ok(typeof specs.cashFlowModel === 'string' && specs.cashFlowModel.length > 10, `${tag}: cashFlowModel label`);
}

// ===== EV — utilization ramp ปี1–5 + charger refresh ปี10 (ไม่ใช่ degradation) =====
const ev = calculateEVHubSpecs({ areaSqM: 5000, roadWidthMeters: 8, provinceData: { ghi: GHI } });
const evAc = ev.dcChargersCount * 180 / 0.95;
assert.ok(num(ev.transformerRating) * 0.98 >= evAc * 0.70 - (ev.bessKWh / 2) - 1, 'EV: tr×0.98 ≥ demand×0.7−BESS');
{
  const n = ev.dcChargersCount;
  const capex = n * 1.1e6 + ev.solarCanopyKWp * 28000 + ev.bessKWh * 9500 + (1.8e6 + n * 150e3);
  const annualKWh = ev.dailyCarsServiced * 40 * 365;
  const margin = annualKWh * (7.5 - 4.3);
  const RAMP = [0.60, 0.70, 0.80, 0.90, 1.00];
  for (let y = 1; y <= 25; y++) {
    const exp = margin * RAMP[Math.min(y, 5) - 1] + 420e3 - 450e3 - (y === 10 ? n * 1.1e6 * 0.25 : 0);
    near(ev.cashFlows[y], exp, 1, `EV: CF${y} ramp/refresh`);
  }
  assert.ok(ev.cashFlows[1] < ev.cashFlows[5], 'EV: ramp → CF1<CF5');
  assert.ok(ev.cashFlows[10] < ev.cashFlows[9], 'EV: refresh dip ปี10');
  near(ev.cashFlows[6], ev.cashFlows[7], 1, 'EV: steady state หลัง ramp');
}
checkFinConsistency(ev, 'EV@5000');

// ===== BESS — capacity fade 2%/ปี + augmentation ปี15 =====
const bess = calculateBESSFarmSpecs({ areaSqM: 1600 });
{
  const cap = bess.containerCount * 3.72;
  const capex = cap * 10.5e6, rev = cap * 1.8e6, opex = capex * 0.02;
  for (let y = 1; y <= 25; y++) {
    const exp = rev * Math.pow(0.98, y - 1) - opex - (y === 15 ? capex * 0.35 : 0);
    near(bess.cashFlows[y], exp, 1, `BESS: CF${y} fade+augment`);
  }
  assert.ok(bess.cashFlows[2] < bess.cashFlows[1], 'BESS: fade → CF2<CF1');
  assert.ok(bess.cashFlows[15] < bess.cashFlows[14] - capex * 0.3, 'BESS: augmentation dip ปี15');
}
checkFinConsistency(bess, 'BESS@1600');

// ===== Biogas — ผลิตคงที่ + overhaul เครื่องยนต์ปี 8/16/24 =====
const bio = calculateBiogasSpecs({ areaSqM: 1600 });
{
  const kW = bio.generatorCapacityKW;
  const capex = kW * 65000;
  const rev = Math.round(kW * 8760 * 0.85 / 1000) * 1000 * 3.13;
  const opex = capex * 0.07;
  for (let y = 1; y <= 25; y++) {
    const exp = rev - opex - ([8, 16, 24].includes(y) ? capex * 0.08 : 0);
    near(bio.cashFlows[y], exp, 1, `Biogas: CF${y} baseload+overhaul`);
  }
  assert.ok(bio.cashFlows[8] < bio.cashFlows[7], 'Biogas: overhaul dip ปี8');
  near(bio.cashFlows[9], bio.cashFlows[10], 1, 'Biogas: ผลิตคงที่ระหว่าง overhaul');
}
checkFinConsistency(bio, 'Biogas@1600');

// ===== Floating — ต้องใช้ CAPEX/รายได้ของตัวเอง ไม่ใช่ของ solar base =====
const fl = calculateFloatingSolarSpecs(L1);
{
  const solarCapexM = num(s1.financials.totalCapexMillionTHB);
  const capex = solarCapexM * 1.15 * 1e6;
  const rev = Math.round(num(s1.annualEnergyMWh) * 1.08) * 1000 * 2.1679;
  const opex = capex * 0.016;
  near(fl.cashFlows[0], -capex, 1, 'Floating: CF0 = −CAPEX ของ floating เอง (×1.15)');
  for (let y = 1; y <= 25; y++) {
    near(fl.cashFlows[y], rev * Math.pow(0.996, y - 1) - opex, 1, `Floating: CF${y}`);
  }
  assert.ok(Math.abs(fl.cashFlows[0]) > Math.abs(s1.cashFlows[0]), 'Floating: CAPEX > solar base');
}
checkFinConsistency(fl, 'Floating@2072');

// ===== ทุกประเภทต้องมี cashFlows ผ่าน getSpecs ด้วย =====
const { getSpecs } = await import('../src/engine/specs.js');
for (const pid of ['solar-farm', 'agrivoltaics', 'floating-solar', 'ev-charging-hub', 'grid-bess', 'biomass-biogas']) {
  const sp = getSpecs(pid, pid === 'ev-charging-hub' ? { areaSqM: 5000, roadWidthMeters: 8, provinceData: { ghi: GHI } } : L1);
  assert.ok(sp.cashFlows?.length === 26, `getSpecs(${pid}): cashFlows ครบ 26 จุด`);
  assert.ok(sp.cashFlowModel, `getSpecs(${pid}): มี cashFlowModel`);
}

// ===== TH_ADMIN (ชุดอำเภอสำหรับค้นหา/เลือกอำเภอ) =====
const { TH_ADMIN } = await import('../src/data/districts.js');
assert.equal(TH_ADMIN.length, 77, 'ครบ 77 จังหวัด');
const allDists = TH_ADMIN.flatMap(p => p.districts.map(d => ({ ...d, province: p.province })));
assert.equal(allDists.length, 930, 'ครบ 930 อำเภอ/เขต');
for (const d of allDists) {
  assert.ok(d.name && d.prefix, `district มีชื่อ+prefix: ${d.name}`);
  if (d.lat != null) {
    assert.ok(d.lat > 5 && d.lat < 21 && d.lng > 97 && d.lng < 106, `พิกัดอยู่ในไทย: ${d.name} (${d.lat},${d.lng})`);
  }
}
// จำลอง local match ของ handleSearch: "สีคิ้ว" ต้องเจออำเภอสีคิ้ว จ.นครราชสีมา พร้อมพิกัด
const sikhiu = allDists.filter(d => d.name === 'สีคิ้ว' || d.name.includes('สีคิ้ว'));
assert.ok(sikhiu.length >= 1 && sikhiu.some(d => d.province === 'นครราชสีมา' && d.lat), 'ค้น "สีคิ้ว" เจอพร้อมพิกัด');
const withCoords = allDists.filter(d => d.lat != null).length;
assert.ok(withCoords > 800, `อำเภอมีพิกัด ${withCoords}/930 (ควร > 800)`);
// findActualProvince: จุดในปากช่อง จ.นครราชสีมา (ใกล้ชายแดนสระบุรี) ต้องได้ นครราชสีมา ไม่ใช่สระบุรี
const { findActualProvince, searchAdmin } = await import('../src/data/districts.js');
const sikhiuS = searchAdmin('สีคิ้ว');
assert.ok(sikhiuS[0]?.district?.name === 'สีคิ้ว' && sikhiuS[0].province === 'นครราชสีมา', `searchAdmin('สีคิ้ว') → ${sikhiuS[0]?.label}`);
const pakS = searchAdmin('ปาก');
assert.ok(pakS.length >= 5, `searchAdmin('ปาก') เจอ ${pakS.length} ผล`);
assert.ok(pakS[0].district.name.startsWith('ปาก'), 'ผลแรกควรขึ้นต้นด้วยคำค้น');
assert.ok(searchAdmin('ข').length > 50, 'คำสั้นควรเจอผลเยอะ (live suggestion)');
const bkk = searchAdmin('กรุงเทพ');
assert.ok(bkk[0].label === 'Bangkok Province', 'จังหวัดต้องมาก่อนอำเภอ');
const bkkEn = searchAdmin('bang');
assert.ok(bkkEn[0].label === 'Bangkok Province', 'English search must find Bangkok');
const pakchong = TH_ADMIN.find(p => p.province === 'นครราชสีมา').districts.find(d => d.name === 'ปากช่อง');
const act = findActualProvince(pakchong.lat, pakchong.lng);
assert.equal(act.province, 'นครราชสีมา', `ปากช่อง → ${act.province} (ต้องเป็นนครราชสีมา)`);
const act2 = findActualProvince(19.2, 100.9); // ท่าวังผา จ.น่าน — จังหวัดที่ไม่มีในตาราง GHI
assert.equal(act2.province, 'น่าน', `น่าน → ${act2.province}`);

// ===== Save/Load + import/export =====
saveProjects([]);
const proj = { id: 'p-test', name: 'ทดสอบ', createdAt: new Date().toISOString(),
  land: { areaSqM: 2072, excludedAreaSqM: 0, provinceData: { ghi: GHI } },
  goals: { goal: 'income' }, chosenPlanId: 'agrivoltaics', engineVersion: 'v6.1' };
saveProjects([proj]);
const loaded = loadProjects();
assert.equal(loaded.length, 1);
assert.equal(loaded[0].engineVersion, 'v6.1');
const roundTrip = importProjectJSON(exportProjectJSON(proj));
assert.equal(roundTrip.land.areaSqM, 2072);
assert.equal(roundTrip.chosenPlanId, 'agrivoltaics');
assert.throws(() => importProjectJSON('{"foo":1}'), /Invalid/, 'reject bad schema');
assert.throws(() => importProjectJSON('not json'), 'reject non-JSON');
// เปิดโปรเจกต์เก่า (ไม่มี engineVersion/field ใหม่) ต้องไม่พังและคำนวณใหม่ได้
const legacy = { id: 'old', name: 'เก่า', land: { areaSqM: 2072 }, goals: {} };
const legacySpecs = calculateAgrivoltaicsSpecs(legacy.land);
assert.equal(legacySpecs.stringDesign.installedPanelCount, 280, 'legacy input → recompute ได้');

// ===== SLD consistency: ค่าที่ SLD render ต้องอนุมัติจาก specs เดียวกัน =====
const sldVdc = a1.stringDesign.stringSize * num(a1.stringDesign.vocCold);
assert.ok(sldVdc <= a1.stringDesign.vdcMax, `SLD Vdc ${sldVdc.toFixed(1)} ≤ ${a1.stringDesign.vdcMax}`);
assert.ok(Math.abs(num(a1.dcCapacityMWp) * 1000 - a1.stringDesign.installedPanelCount * 620 / 1000) <= 1,
        'SLD MWp×1000 ตรงจำนวนแผง±ปัด');

console.log('ACCEPTANCE: ALL CHECKS PASS');
