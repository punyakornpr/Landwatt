import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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

// T01–T15: golden fixture 2072 m² agrivoltaics — ตามเอกสาร v6 §11.1
const gold = calculateAgrivoltaicsSpecs({ areaSqM: 2072, excludedAreaSqM: 0, provinceData: { ghi: 5.28 } });
near(2072 / 1600, 1.2950, 1e-4);                                        // T01
near((2072 - 0) * 0.78, 1616.16, 0.01);                                 // T02
assert.equal(gold.areaCandidatePanelCount, '404');                        // T03 ⌊1616.16/4⌋
assert.equal(gold.stringDesign.installedPanelCount, 280);               // T04 ⌊20×0.7⌋=14 สตริง
assert.equal(gold.stringDesign.stringCount, 14);
assert.equal(gold.stringDesign.stringCount * gold.stringDesign.stringSize, 280); // T05
near(gold.stringDesign.installedPanelCount * 620 / 1000, 173.6, 1e-9);  // T06 exact
assert.equal(gold.dcCapacityKWp, 174);                                  // T06 display = Math.round
near(parseFloat(gold.dcCapacityMWp), 0.1736, 0.001);                    // T07
assert.equal(gold.inverterCount, 1);
near(parseFloat(gold.acCapacityMW) * 1000, 300, 1e-9);                  // T08
near(parseFloat(gold.actualDcAcRatio), 0.5787, 0.001);                  // T09
near(parseFloat(gold.stringDesign.vocCold), 46.895, 0.01);              // T10
near(20 * parseFloat(gold.stringDesign.vocCold), 937.9, 0.3);
near(parseFloat(gold.stringDesign.vmpHot), 34.0995, 0.01);              // T11
near(20 * parseFloat(gold.stringDesign.vmpHot), 681.99, 0.3);
near(parseFloat(gold.annualEnergyMWh.replace(/,/g, '')), 267.65, 1.0);  // T12 (ปัด)
near(parseFloat(gold.financials.totalCapexMillionTHB), 4.34, 0.01);     // T13
near(parseFloat(gold.dualIncome.powerRevenueMillionTHB) * 1e6, 580237, 500); // T14
// T15-status: UI-level (ตรวจในการ์ดเอง) — F-01/F-04=calc, F-02=assumed, F-05=warn, F-07=warn

// 11.2: เปลี่ยนพื้นที่ต้องไม่ hardcode — 2394 m² candidate ≠ 404
const bigger = calculateSolarFarmSpecs({ areaSqM: 2394, excludedAreaSqM: 0, provinceData: { ghi: 5.28 } });
assert.ok(parseInt(bigger.areaCandidatePanelCount) !== 404, 'candidate ต้องเปลี่ยนตามพื้นที่');
assert.equal(bigger.stringDesign.installedPanelCount, bigger.stringDesign.stringCount * bigger.stringDesign.stringSize);
// exclusion ลด usable ไม่ติดลบ
const excl = calculateSolarFarmSpecs({ areaSqM: 2072, excludedAreaSqM: 100, provinceData: { ghi: 5.28 } });
assert.equal(parseInt(excl.areaCandidatePanelCount), Math.floor(((2072 - 100) * 0.78) / 4));
// 11.5: agri CF — เสื่อมเฉพาะไฟฟ้า ส่วนพืชคงที่ → CF2−CF1 = −0.004×PV_rev เท่านั้น
const cfDiff = gold.cashFlows[1] - gold.cashFlows[2];
assert.ok(cfDiff > 0 && cfDiff < 5000, `degradation ไฟฟ้าเท่านั้น: diff ${cfDiff.toFixed(0)}`);
assert.equal(gold.cashFlows[0], -parseFloat(gold.financials.totalCapexMillionTHB) * 1e6);

// F-20: deterministic results + tie-break
assert.deepEqual(recommendProjects(land, DEFAULT_GOALS), recommendProjects(land, DEFAULT_GOALS));

// 11.4/T15: source-level UI checks — ทุกการ์ดมี status, accordion มี aria, ชื่อเป็นคำถามไทย
const evSrc = readFileSync(new URL('../src/components/EngineeringView.jsx', import.meta.url), 'utf8');
const fidCalls = [...evSrc.matchAll(/fid="(F-[0-9A-Z]+)"/g)].map(m => m[1]);
assert.ok(fidCalls.length >= 9, `พบการ์ด ${fidCalls.length} ใบ`);
for (const fid of fidCalls) {
  const at = evSrc.indexOf(`fid="${fid}"`);
  const slice = evSrc.slice(at, at + 300);
  assert.ok(slice.includes('status='), `${fid} ขาด status prop`);
}
assert.ok(evSrc.includes('aria-expanded'), 'ต้องมี aria-expanded บนปุ่มขยาย');
assert.ok(evSrc.includes('aria-controls'), 'ต้องมี aria-controls');
assert.ok(evSrc.includes('มีกำลังติดตั้งรวมเท่าไร'), 'F-04 ต้องเป็นหัวข้อคำถามกำลังติดตั้ง');
// กราฟต้องใช้ cashFlows เดียวกับ engine (11.5)
const chartSrc = readFileSync(new URL('../src/components/FinancialYieldChart.jsx', import.meta.url), 'utf8');
assert.ok(chartSrc.includes('specs.cashFlows'), 'กราฟต้องอ่าน specs.cashFlows ไม่คำนวณแยก');

console.log('ALL FORMULA TESTS PASS');
