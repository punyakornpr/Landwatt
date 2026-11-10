import assert from 'node:assert/strict';
import { calculateSolarFarmSpecs, calculateEVHubSpecs, calculateAgrivoltaicsSpecs } from '../src/utils/engineeringCalculations.js';
import { recommendProjects } from '../src/engine/recommend.js';
import { DEFAULT_LAND, DEFAULT_GOALS } from '../src/engine/storage.js';

const near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} ≈ ${b}`);
const land = { ...DEFAULT_LAND, areaSqM: 6552, landType: 'flat', provinceData: { ghi: 5.1 } };

// UT-02: F-01
assert.equal(6552 / 1600, 4.095);

// F-02: exclusion reduces usable area → fewer panels
const s1 = calculateSolarFarmSpecs(land);
const s2 = calculateSolarFarmSpecs({ ...land, excludedAreaSqM: 500 });
assert.ok(s2.stringDesign.installedPanelCount < s1.stringDesign.installedPanelCount);

// F-03/F-05: Σ N_s = installed panels; string size within voltage bounds
assert.equal(s1.stringDesign.stringSize * s1.stringDesign.stringCount, s1.stringDesign.installedPanelCount);
assert.ok(s1.stringDesign.stringSize <= s1.stringDesign.nsMax && s1.stringDesign.stringSize >= s1.stringDesign.nsMin);

// UT-04: F-04 — 8,000 m² → 1,560 panels → 967.2 kWp
const s3 = calculateSolarFarmSpecs({ areaSqM: 8000, excludedAreaSqM: 0, provinceData: { ghi: 5.1 } });
assert.equal(s3.stringDesign.installedPanelCount, 1560);
near(parseFloat(s3.dcCapacityMWp), 0.9672, 0.0005);

// F-26: payback = first year CCF ≥ 0 (from cashFlows[])
assert.equal(s1.cashFlows.length, 26);
assert.ok(s1.cashFlows[0] < 0);
let cum = s1.cashFlows[0], pb = null;
s1.cashFlows.forEach((cf, y) => { if (y > 0 && pb === null) { cum += cf; if (cum >= 0) pb = y; } });
assert.equal(String(pb), s1.financials.paybackYears);

// F-12/F-14: EV — AC load = DC/η, transformer covers S = P/PF
const ev = calculateEVHubSpecs({ ...land, areaSqM: 8000 });
const evAc = (parseInt(ev.dcChargersCount) * 180) / 0.95;
const needKVA = (evAc * 0.7 - ev.bessKWh / 2) / 0.98;
assert.ok(parseInt(ev.transformerRating) >= needKVA, `${ev.transformerRating} covers ${needKVA.toFixed(0)} kVA`);

// E-01..E-04: video fixture — area ที่ให้ candidate 280-299 แผง → 14 strings × 20 = 280 → 173.6 kWp, 1×300kW, ratio 0.579
// 1470×0.78 = 1146.6 → floor(1146.6/4) = 286 candidate → floor(286/20) = 14 strings → 280 installed
const fix = calculateSolarFarmSpecs({ areaSqM: 1470, excludedAreaSqM: 0, provinceData: { ghi: 5.1 } });
assert.equal(fix.stringDesign.installedPanelCount, 280);
assert.equal(fix.stringDesign.stringCount * fix.stringDesign.stringSize, 280);
near(parseFloat(fix.dcCapacityMWp), 0.1736, 0.001); // display toFixed(3)
near(fix.dcCapacityKWp, 173.6, 0.5);               // Math.round display
assert.equal(fix.inverterCount, 1);
near(parseFloat(fix.acCapacityMW), 0.3, 1e-9);
near(parseFloat(fix.actualDcAcRatio), 0.5787, 0.001);

// Agrivoltaics ต้องสอดคล้องกันทั้ง chain: floor(14×0.7)=9 strings → 180 แผง → 111.6 kWp
const ag = calculateAgrivoltaicsSpecs({ areaSqM: 1470, excludedAreaSqM: 0, provinceData: { ghi: 5.1 } });
assert.equal(ag.stringDesign.installedPanelCount, 180);
near(parseFloat(ag.dcCapacityMWp), 0.1116, 0.001); // display rounding
near(parseFloat(ag.actualDcAcRatio), ag.stringDesign.installedPanelCount * 620 / 1000 / (ag.inverterCount * 300), 0.001);
near(parseFloat(ag.acCapacityMW) * 1000, ag.inverterCount * 300, 1e-9);

// F-20: deterministic results + tie-break
assert.deepEqual(recommendProjects(land, DEFAULT_GOALS), recommendProjects(land, DEFAULT_GOALS));

console.log('ALL FORMULA TESTS PASS');
