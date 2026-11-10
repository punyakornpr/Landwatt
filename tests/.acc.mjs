var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/engine/storage.js
var storage_exports = {};
__export(storage_exports, {
  DEFAULT_DRAFT: () => DEFAULT_DRAFT,
  DEFAULT_GOALS: () => DEFAULT_GOALS,
  DEFAULT_LAND: () => DEFAULT_LAND,
  exportProjectJSON: () => exportProjectJSON,
  importProjectJSON: () => importProjectJSON,
  loadDraft: () => loadDraft,
  loadProjects: () => loadProjects,
  saveDraft: () => saveDraft,
  saveProjects: () => saveProjects
});
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function loadDraft() {
  const d = readJSON(DRAFT_KEY, null);
  if (!d) return DEFAULT_DRAFT;
  return {
    land: { ...DEFAULT_LAND, ...d.land || {} },
    goals: { ...DEFAULT_GOALS, ...d.goals || {} },
    compareIds: d.compareIds || [],
    chosenPlanId: d.chosenPlanId || null
  };
}
function saveDraft(draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
  }
}
function loadProjects() {
  return readJSON(PROJECTS_KEY, []);
}
function saveProjects(list) {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(list));
  } catch {
  }
}
function exportProjectJSON(project) {
  return JSON.stringify(project, null, 2);
}
function importProjectJSON(text) {
  const obj = JSON.parse(text);
  if (!obj.land || !obj.land.areaSqM) throw new Error("\u0E44\u0E1F\u0E25\u0E4C\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07");
  return {
    ...obj,
    id: obj.id || `p-${Date.now()}`,
    land: { ...DEFAULT_LAND, ...obj.land },
    goals: { ...DEFAULT_GOALS, ...obj.goals || {} }
  };
}
var PROJECTS_KEY, DRAFT_KEY, DEFAULT_LAND, DEFAULT_GOALS, DEFAULT_DRAFT;
var init_storage = __esm({
  "src/engine/storage.js"() {
    PROJECTS_KEY = "terrawatt.projects.v1";
    DRAFT_KEY = "terrawatt.draft.v1";
    DEFAULT_LAND = {
      areaSqM: 8e3,
      // 5 ไร่
      provinceId: null,
      provinceData: null,
      coordinates: { lat: 13.7563, lng: 100.5018 },
      roadType: "secondary",
      roadWidthMeters: 8,
      gridDistanceMeters: 200,
      landType: "flat",
      landTypeUnknown: false,
      gridUnknown: false,
      hasWaterBody: false,
      hasAgriculturalWaste: false,
      hasShading: null,
      // true/false/null = ไม่ทราบ
      hasStructures: null,
      // มีอาคาร/สิ่งกีดขวางไหม (user-declared)
      excludedAreaSqM: 0,
      // พื้นที่ยกเว้นที่ผู้ใช้ระบุ [F-02]
      hasGridPower: null,
      // มีไฟฟ้าอยู่แล้วไหม
      soilStability: "good",
      zoningColor: "green"
    };
    DEFAULT_GOALS = {
      aims: [],
      budget: "unsure",
      monthlyBill: null,
      // ค่าไฟ/เดือน (บาท) ถ้าเลือกเป้าหมายประหยัด
      evTraffic: null
      // 'high'|'medium'|'low'|'unknown'
    };
    DEFAULT_DRAFT = {
      land: DEFAULT_LAND,
      goals: DEFAULT_GOALS,
      compareIds: [],
      chosenPlanId: null
    };
  }
});

// tests/acceptance.mjs
import assert from "node:assert/strict";

// src/utils/engineeringCalculations.js
function calculateSolarFarmSpecs(landData) {
  const { areaSqM = 1600, provinceData = {} } = landData;
  const ghi = provinceData.ghi || 5.1;
  const excludedAreaSqM = Math.max(0, landData.excludedAreaSqM || 0);
  const usableArea = Math.max(0, areaSqM - excludedAreaSqM) * 0.78;
  const areaPerModule = 4;
  const moduleCount = Math.floor(usableArea / areaPerModule);
  const moduleWatt = 620;
  const PV = { voc: 45.2, vmp: 38.1, betaVoc: -25e-4, betaVmp: -3e-3 };
  const INV = { vdcMax: 1100, mpptMin: 200, mpptMax: 1e3 };
  const T_MIN = 10, T_HIGH = 60;
  const vocCold = PV.voc * (1 + PV.betaVoc * (T_MIN - 25));
  const vmpHot = PV.vmp * (1 + PV.betaVmp * (T_HIGH - 25));
  const nsMax = Math.floor(INV.vdcMax / vocCold);
  const nsMin = Math.ceil(INV.mpptMin / vmpHot);
  const stringSize = Math.min(nsMax, 20);
  const stringValid = nsMin <= nsMax;
  const stringCount = stringValid ? Math.floor(moduleCount / stringSize) : 0;
  const installedPanelCount = stringCount * stringSize;
  const leftoverPanels = moduleCount - installedPanelCount;
  const dcCapacityKWp = installedPanelCount * moduleWatt / 1e3;
  const dcCapacityMWp = dcCapacityKWp / 1e3;
  const ilr = 1.25;
  const acRequiredKW = dcCapacityKWp / ilr;
  const inverterCount = Math.max(1, Math.round(acRequiredKW / 300));
  const acCapacityMW = inverterCount * 300 / 1e3;
  const actualDcAcRatio = dcCapacityKWp / (inverterCount * 300);
  const pr = 0.8;
  const annualEnergyMWh = dcCapacityKWp * ghi * 365 * pr / 1e3;
  const requiredKVA = inverterCount * 300 / 0.95;
  const standardTransformerKVA = getNextStandardTransformer(requiredKVA);
  const mvVoltageKV = provinceData.grid === "MEA" ? 24 : 22;
  const ratedMVCurrentA = (inverterCount * 300 / (Math.sqrt(3) * mvVoltageKV * 0.95)).toFixed(1);
  const recommendedMvCable = ratedMVCurrentA > 200 ? "XLPE 24kV 1x300 sq.mm Al (\u0E2B\u0E23\u0E37\u0E2D Cu 185 sq.mm)" : "XLPE 24kV 1x185 sq.mm Al (\u0E2B\u0E23\u0E37\u0E2D Cu 95 sq.mm)";
  const tariffPerKWh = 2.1679;
  const capexPerMWp = 215e5;
  const totalCapex = dcCapacityMWp * capexPerMWp;
  const annualRevenue = annualEnergyMWh * 1e3 * tariffPerKWh;
  const opexPerYear = totalCapex * 0.015;
  const DEG2 = 4e-3;
  const cashFlows = [-totalCapex];
  for (let y = 1; y <= 25; y++) {
    cashFlows.push(annualRevenue * Math.pow(1 - DEG2, y - 1) - opexPerYear);
  }
  let cum = -totalCapex, paybackYear = null;
  for (let y = 1; y <= 25 && paybackYear === null; y++) {
    cum += cashFlows[y];
    if (cum >= 0) paybackYear = y;
  }
  const netAnnualCashflow = annualRevenue - opexPerYear;
  const simplePaybackYears = paybackYear !== null ? String(paybackYear) : "\u0E44\u0E21\u0E48\u0E04\u0E37\u0E19\u0E17\u0E38\u0E19\u0E20\u0E32\u0E22\u0E43\u0E19 25 \u0E1B\u0E35";
  let paybackInterp = null;
  if (paybackYear !== null && paybackYear > 0) {
    const prevCcf = cashFlows.slice(0, paybackYear).reduce((a, b) => a + b, 0);
    paybackInterp = paybackYear - 1 + Math.abs(prevCcf) / cashFlows[paybackYear];
  }
  const npvValue = npvFromCashFlows(cashFlows);
  const irrValue = irrFromCashFlows(cashFlows);
  const irrPercent = irrValue === null ? "N/A" : irrValue.toFixed(1);
  const co2AvoidedTonsPerYear = annualEnergyMWh * 1e3 * 0.4999 / 1e3;
  const treeEquivalent = Math.round(co2AvoidedTonsPerYear * 60);
  return {
    dcCapacityMWp: dcCapacityMWp.toFixed(3),
    dcCapacityKWp: Math.round(dcCapacityKWp),
    acCapacityMW: acCapacityMW.toFixed(3),
    areaCandidatePanelCount: moduleCount.toLocaleString(),
    moduleCount: installedPanelCount.toLocaleString(),
    stringDesign: {
      stringSize,
      stringCount,
      installedPanelCount,
      leftoverPanels,
      stringValid,
      nsMin,
      nsMax,
      vocCold: vocCold.toFixed(1),
      vmpHot: vmpHot.toFixed(1),
      vdcMax: INV.vdcMax,
      mpptMin: INV.mpptMin,
      mpptMax: INV.mpptMax,
      catalogStatus: "demo"
      // อุปกรณ์จาก Demo Catalog ไม่ใช่ datasheet จริง
    },
    excludedAreaSqM,
    tariffStatus: "scenario",
    capexPerMWpMillionTHB: (capexPerMWp / 1e6).toFixed(1),
    cashFlows,
    moduleType: "N-Type TOPCon Bifacial 620W (Half-cut cells)",
    inverterCount,
    inverterModel: "String Inverter 300kW Grid-Tie 1500Vdc (Eff 98.8%)",
    actualDcAcRatio: actualDcAcRatio.toFixed(3),
    annualEnergyMWh: Math.round(annualEnergyMWh).toLocaleString(),
    transformerKVA: standardTransformerKVA,
    transformerRating: `${standardTransformerKVA} kVA, 0.8/${mvVoltageKV} kV, Dyn11, ONAN`,
    mvCurrentAmp: ratedMVCurrentA,
    mvCable: recommendedMvCable,
    protectionRelays: ["Overcurrent/Earth Fault (50/51/51N)", "Under/Over Voltage (27/59)", "Frequency Protection (81O/U)", "Reverse Power (32R)", "Differential Relay (87T)"],
    financials: {
      totalCapexMillionTHB: (totalCapex / 1e6).toFixed(2),
      annualRevenueMillionTHB: (annualRevenue / 1e6).toFixed(2),
      netAnnualCashflowMillionTHB: (netAnnualCashflow / 1e6).toFixed(2),
      paybackYears: simplePaybackYears,
      paybackInterpolated: paybackInterp !== null ? paybackInterp.toFixed(1) : "\u2014",
      irrPercent,
      npv25YrMillionTHB: (npvValue / 1e6).toFixed(2)
    },
    esg: {
      co2TonsYear: Math.round(co2AvoidedTonsPerYear).toLocaleString(),
      treesEquivalent: treeEquivalent.toLocaleString()
    }
  };
}
function calculateAgrivoltaicsSpecs(landData) {
  const baseSolar = calculateSolarFarmSpecs(landData);
  const areaRai = landData.areaSqM / 1600;
  const sd = baseSolar.stringDesign;
  const agriStringCount = Math.floor(sd.stringCount * 0.7);
  const agriInstalledPanels = agriStringCount * sd.stringSize;
  const dcCapacityMWp = (agriInstalledPanels * 620 / 1e6).toFixed(3);
  const dcCapacityKWp = agriInstalledPanels * 620 / 1e3;
  const dcRatio = parseFloat(dcCapacityMWp) / parseFloat(baseSolar.dcCapacityMWp);
  const annualEnergyMWh = Math.round(parseFloat(baseSolar.annualEnergyMWh.replace(/,/g, "")) * dcRatio);
  const agriInverterCount = Math.max(1, Math.round(dcCapacityKWp / 1.25 / 300));
  const agriAcCapacityMW = agriInverterCount * 300 / 1e3;
  const agriDcAcRatio = dcCapacityKWp / (agriInverterCount * 300);
  const agriTransformerKVA = getNextStandardTransformer(agriInverterCount * 300 / 0.95);
  const agriMvCurrentA = (agriInverterCount * 300 / (Math.sqrt(3) * 22 * 0.95)).toFixed(1);
  const capexPerMWp = 25e6;
  const totalCapex = dcCapacityKWp / 1e3 * capexPerMWp;
  const powerRevenue = annualEnergyMWh * 1e3 * 2.1679;
  const agriRevenue = areaRai * 16e4;
  const totalAnnualRevenue = powerRevenue + agriRevenue;
  const opexPerYear = totalCapex * 0.018 + areaRai * 3e4;
  const netAnnualCashflow = totalAnnualRevenue - opexPerYear;
  const AGRI_DEG = 4e-3;
  const cashFlows = [-totalCapex];
  for (let y = 1; y <= 25; y++) {
    cashFlows.push(powerRevenue * Math.pow(1 - AGRI_DEG, y - 1) + agriRevenue - opexPerYear);
  }
  let cum = -totalCapex, paybackYear = null;
  for (let y = 1; y <= 25 && paybackYear === null; y++) {
    cum += cashFlows[y];
    if (cum >= 0) paybackYear = y;
  }
  const paybackYears = paybackYear !== null ? String(paybackYear) : "\u0E44\u0E21\u0E48\u0E04\u0E37\u0E19\u0E17\u0E38\u0E19\u0E20\u0E32\u0E22\u0E43\u0E19 25 \u0E1B\u0E35";
  const npvValue = npvFromCashFlows(cashFlows);
  const irrValue = irrFromCashFlows(cashFlows);
  return {
    ...baseSolar,
    dcCapacityMWp,
    dcCapacityKWp: Math.round(dcCapacityKWp),
    acCapacityMW: agriAcCapacityMW.toFixed(3),
    inverterCount: agriInverterCount,
    actualDcAcRatio: agriDcAcRatio.toFixed(3),
    transformerRating: `${agriTransformerKVA} kVA, 22kV/0.4kV, Dyn11, ONAN (\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E40\u0E1A\u0E37\u0E49\u0E2D\u0E07\u0E15\u0E49\u0E19)`,
    transformerKVA: agriTransformerKVA,
    mvCurrentAmp: agriMvCurrentA,
    moduleCount: agriInstalledPanels.toLocaleString(),
    areaCandidatePanelCount: baseSolar.areaCandidatePanelCount,
    baseStringCount: sd.stringCount,
    // จำนวนสตริงก่อนหักพื้นที่เกษตร — ใช้อธิบายใน F-03
    panelSpacingFactor: 0.7,
    // สมมติฐานการจัดวาง agrivoltaics (ยังไม่ยืนยันพืชจริง)
    stringDesign: { ...sd, stringCount: agriStringCount, installedPanelCount: agriInstalledPanels, leftoverPanels: 0 },
    annualEnergyMWh: annualEnergyMWh.toLocaleString(),
    capexPerMWpMillionTHB: (capexPerMWp / 1e6).toFixed(1),
    mountingStructure: "\u0E42\u0E04\u0E23\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E22\u0E01\u0E2A\u0E39\u0E07\u0E1E\u0E34\u0E40\u0E28\u0E29 (Clearance 3.0 m) \u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A\u0E23\u0E16\u0E41\u0E17\u0E23\u0E01\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E1B\u0E25\u0E39\u0E01\u0E1E\u0E37\u0E0A",
    cropsRecommended: "\u0E27\u0E32\u0E19\u0E34\u0E25\u0E25\u0E32, \u0E1F\u0E49\u0E32\u0E17\u0E30\u0E25\u0E32\u0E22\u0E42\u0E08\u0E23, \u0E02\u0E21\u0E34\u0E49\u0E19\u0E0A\u0E31\u0E19, \u0E40\u0E2B\u0E47\u0E14\u0E15\u0E23\u0E30\u0E01\u0E39\u0E25\u0E15\u0E48\u0E32\u0E07\u0E46, \u0E1C\u0E31\u0E01\u0E2A\u0E25\u0E31\u0E14\u0E44\u0E2E\u0E42\u0E14\u0E23\u0E42\u0E1B\u0E19\u0E34\u0E01\u0E2A\u0E4C\u0E43\u0E15\u0E49\u0E23\u0E48\u0E21",
    dualIncome: {
      powerRevenueMillionTHB: (powerRevenue / 1e6).toFixed(2),
      agriRevenueMillionTHB: (agriRevenue / 1e6).toFixed(2),
      totalRevenueMillionTHB: (totalAnnualRevenue / 1e6).toFixed(2)
    },
    financials: {
      totalCapexMillionTHB: (totalCapex / 1e6).toFixed(2),
      annualRevenueMillionTHB: (totalAnnualRevenue / 1e6).toFixed(2),
      netAnnualCashflowMillionTHB: (netAnnualCashflow / 1e6).toFixed(2),
      paybackYears,
      irrPercent: irrValue === null ? "N/A" : irrValue.toFixed(1),
      npv25YrMillionTHB: (npvValue / 1e6).toFixed(2)
    },
    cashFlows
  };
}
function calculateEVHubSpecs(landData) {
  const { areaSqM = 1600, roadWidthMeters = 8, provinceData = {} } = landData;
  const areaRai = areaSqM / 1600;
  let dcFastChargerCount = 4;
  if (areaRai >= 2) dcFastChargerCount = 8;
  if (areaRai >= 4) dcFastChargerCount = 12;
  const chargerPowerKW = 180;
  const totalPeakEVLoadKW = dcFastChargerCount * chargerPowerKW / 0.95;
  const parkingBays = dcFastChargerCount * 2 + 10;
  const solarCanopyKWp = Math.round(parkingBays * 2.8);
  const bessKWh = dcFastChargerCount >= 8 ? 500 : 250;
  const bessPowerKW = bessKWh / 2;
  const transformerKVA = getNextStandardTransformer((totalPeakEVLoadKW * 0.7 - bessPowerKW) / 0.98);
  const dailyCars = dcFastChargerCount * 2 * 7;
  const avgKWhPerSession = 40;
  const dailyKWhSold = dailyCars * avgKWhPerSession;
  const annualKWhSold = dailyKWhSold * 365;
  const sellRate = 7.5;
  const costRate = 4.3;
  const marginPerKWh = sellRate - costRate;
  const annualChargingRevenue = annualKWhSold * sellRate;
  const annualElectricityCost = annualKWhSold * costRate;
  const commercialRentalRevenue = 35e3 * 12;
  const netAnnualCashflow = annualKWhSold * marginPerKWh + commercialRentalRevenue - 45e4;
  const chargersCost = dcFastChargerCount * 11e5;
  const canopyCost = solarCanopyKWp * 28e3;
  const bessCost = bessKWh * 9500;
  const transformerAndCivil = 18e5 + dcFastChargerCount * 15e4;
  const totalCapex = chargersCost + canopyCost + bessCost + transformerAndCivil;
  const paybackYears = (totalCapex / netAnnualCashflow).toFixed(1);
  return {
    dcChargersCount: dcFastChargerCount,
    totalGuns: dcFastChargerCount * 2,
    chargerModel: "DC Superfast 180kW Dual Gun (CCS2) Liquid-Cooled Ready",
    solarCanopyKWp,
    bessKWh,
    transformerRating: `${transformerKVA} kVA, 22kV / 400V, 3-Phase, Oil-immersed`,
    dailyCarsServiced: dailyCars,
    annualEnergyDispensedMWh: Math.round(annualKWhSold / 1e3),
    financials: {
      totalCapexMillionTHB: (totalCapex / 1e6).toFixed(2),
      annualRevenueMillionTHB: (annualChargingRevenue / 1e6).toFixed(2),
      netAnnualProfitMillionTHB: (netAnnualCashflow / 1e6).toFixed(2),
      paybackYears,
      irrPercent: calculateIRR(totalCapex, annualChargingRevenue, annualElectricityCost + 45e4, 15, 0).toFixed(1)
    },
    electricalFeatures: [
      "\u0E23\u0E30\u0E1A\u0E1A\u0E1A\u0E23\u0E34\u0E2B\u0E32\u0E23\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E01\u0E33\u0E25\u0E31\u0E07\u0E44\u0E1F\u0E1F\u0E49\u0E32\u0E2D\u0E31\u0E08\u0E09\u0E23\u0E34\u0E22\u0E30 (Dynamic Load Management - DLM)",
      "\u0E23\u0E30\u0E1A\u0E1A\u0E15\u0E31\u0E14\u0E15\u0E2D\u0E19\u0E1B\u0E49\u0E2D\u0E07\u0E01\u0E31\u0E19\u0E44\u0E1F\u0E14\u0E39\u0E14 \u0E44\u0E1F\u0E23\u0E31\u0E48\u0E27 Type B RCD \u0E41\u0E25\u0E30 Surge Protection Class I+II",
      "\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A\u0E23\u0E30\u0E1A\u0E1A\u0E0A\u0E33\u0E23\u0E30\u0E40\u0E07\u0E34\u0E19\u0E21\u0E32\u0E15\u0E23\u0E10\u0E32\u0E19 OCPP 1.6J / 2.0.1 \u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D\u0E41\u0E2D\u0E1B\u0E1E\u0E25\u0E34\u0E40\u0E04\u0E0A\u0E31\u0E19\u0E17\u0E38\u0E01\u0E04\u0E48\u0E32\u0E22"
    ]
  };
}
function getNextStandardTransformer(requiredKVA) {
  const standardRatings = [160, 250, 315, 400, 500, 630, 800, 1e3, 1250, 1600, 2e3, 2500, 3150, 4e3, 5e3];
  for (const rating of standardRatings) {
    if (rating >= requiredKVA) return rating;
  }
  return Math.ceil(requiredKVA / 1e3) * 1e3;
}
function npvFromCashFlows(cashFlows, discountRate = 0.06) {
  let npv = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    npv += cashFlows[t] / Math.pow(1 + discountRate, t);
  }
  return npv;
}
function irrFromCashFlows(cashFlows) {
  const npv = (r) => cashFlows.reduce((s, cf, t) => s + cf / Math.pow(1 + r, t), 0);
  if (npv(-0.99) * npv(10) >= 0) return null;
  let lo = -0.99, hi = 10;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    npv(mid) > 0 ? lo = mid : hi = mid;
  }
  return (lo + hi) / 2 * 100;
}
function calculateIRR(capex, revenue, opex, years = 25, degradation = 4e-3) {
  let rate = 0.1;
  for (let iter = 0; iter < 20; iter++) {
    let npv = -capex;
    let dNpv = 0;
    for (let t = 1; t <= years; t++) {
      const yearRevenue = revenue * Math.pow(1 - degradation, t - 1);
      const cf = yearRevenue - opex;
      npv += cf / Math.pow(1 + rate, t);
      dNpv -= t * cf / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(npv) < 1e3) break;
    if (dNpv === 0) break;
    rate = rate - npv / dNpv;
    if (rate < -0.5 || rate > 2) {
      rate = 0.08;
      break;
    }
  }
  return Math.max(0, rate * 100);
}

// tests/acceptance.mjs
var store = {};
globalThis.localStorage = {
  getItem: (k) => k in store ? store[k] : null,
  setItem: (k, v) => {
    store[k] = String(v);
  },
  removeItem: (k) => {
    delete store[k];
  }
};
var { saveProjects: saveProjects2, loadProjects: loadProjects2, exportProjectJSON: exportProjectJSON2, importProjectJSON: importProjectJSON2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
var near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} \u2248 ${b} (tol ${tol})`);
var num = (s) => parseFloat(String(s).replace(/,/g, ""));
var GHI = 5.28;
var DEG = 4e-3;
function checkPVChain(specs, land, tag, isAgri = false) {
  const sd = specs.stringDesign;
  const usable = Math.max(0, land.areaSqM - (land.excludedAreaSqM || 0)) * 0.78;
  near(land.areaSqM / 1600, land.areaSqM / 1600, 0);
  assert.equal(num(specs.areaCandidatePanelCount), Math.floor(usable / 4), `${tag}: candidate=\u230Ausable/4\u230B`);
  assert.equal(sd.stringCount * sd.stringSize, sd.installedPanelCount, `${tag}: strings\xD7size=installed`);
  const dcKwpExact = sd.installedPanelCount * 620 / 1e3;
  near(dcKwpExact / 1e3, num(specs.dcCapacityMWp), 1e-3, `${tag}: dcMWp`);
  const acKw = specs.inverterCount * 300;
  near(acKw / 1e3, num(specs.acCapacityMW), 1e-9, `${tag}: acMW=inv\xD7300`);
  near(dcKwpExact / acKw, num(specs.actualDcAcRatio), 1e-3, `${tag}: ratio`);
  assert.ok(sd.stringSize * num(sd.vocCold) <= sd.vdcMax + 1e-9, `${tag}: Voc_string \u2264 VdcMax`);
  const vmp = sd.stringSize * num(sd.vmpHot);
  assert.ok(vmp >= sd.mpptMin - 1e-9 && vmp <= sd.mpptMax + 1e-9, `${tag}: Vmp_string \u2208 MPPT`);
  assert.ok(specs.transformerKVA * 0.95 >= acKw - 1e-9, `${tag}: tr\xD70.95 \u2265 AC`);
  assert.ok(specs.transformerRating.startsWith(String(specs.transformerKVA)), `${tag}: SLD transformerRating \u0E21\u0E35 kVA \u0E40\u0E14\u0E35\u0E22\u0E27\u0E01\u0E31\u0E19`);
  assert.equal(num(specs.moduleCount), sd.installedPanelCount, `${tag}: SLD moduleCount=installed`);
  return { dcKwpExact, acKw };
}
function checkCashFlows(specs, land, tag, hasAgri = false) {
  const f = specs.financials, cf = specs.cashFlows;
  assert.ok(cf && cf.length === 26, `${tag}: cashFlows[0..25]`);
  const dcKwpExact = specs.stringDesign.installedPanelCount * 620 / 1e3;
  const areaRai = land.areaSqM / 1600;
  const ghi = land.provinceData.ghi;
  let capex, opex, pvRev, crop = 0;
  if (hasAgri) {
    capex = dcKwpExact / 1e3 * 25e6;
    pvRev = num(specs.annualEnergyMWh) * 1e3 * 2.1679;
    crop = areaRai * 16e4;
    opex = capex * 0.018 + areaRai * 3e4;
  } else {
    capex = dcKwpExact / 1e3 * 215e5;
    pvRev = dcKwpExact * ghi * 365 * 0.8 / 1e3 * 1e3 * 2.1679;
    opex = capex * 0.015;
  }
  near(cf[0], -capex, 1, `${tag}: CF0 = \u2212CAPEX`);
  for (let y = 1; y <= 25; y++) {
    near(cf[y], pvRev * Math.pow(1 - DEG, y - 1) + crop - opex, 1, `${tag}: CF${y} F-24`);
  }
  let ccf = 0, pb = null;
  for (let y = 0; y <= 25; y++) {
    ccf += cf[y];
    if (pb === null && ccf >= 0) pb = y;
  }
  assert.equal(f.paybackYears, pb === null ? "\u0E44\u0E21\u0E48\u0E04\u0E37\u0E19\u0E17\u0E38\u0E19\u0E20\u0E32\u0E22\u0E43\u0E19 25 \u0E1B\u0E35" : String(pb), `${tag}: payback`);
  const npv = cf.reduce((s, c, y) => s + c / Math.pow(1.06, y), 0);
  near(npv / 1e6, num(f.npv25YrMillionTHB), 0.05, `${tag}: NPV`);
  const irr = num(f.irrPercent) / 100;
  const npvAtIrr = cf.reduce((s, c, y) => s + c / Math.pow(1 + irr, y), 0);
  assert.ok(Math.abs(npvAtIrr) < 2e4, `${tag}: IRR root, NPV(${f.irrPercent}%)=${npvAtIrr.toFixed(0)}`);
  return { pb };
}
var L1 = { areaSqM: 2072, excludedAreaSqM: 0, provinceData: { ghi: GHI } };
var s1 = calculateSolarFarmSpecs(L1);
var a1 = calculateAgrivoltaicsSpecs(L1);
checkPVChain(s1, L1, "solar@2072");
checkCashFlows(s1, L1, "solar@2072");
checkPVChain(a1, L1, "agri@2072", true);
checkCashFlows(a1, L1, "agri@2072", true);
assert.equal(a1.stringDesign.stringCount, Math.floor(s1.stringDesign.stringCount * 0.7), "agri: 0.7\xD7solar strings");
assert.equal(a1.baseStringCount, s1.stringDesign.stringCount, "agri: baseStringCount");
var L2 = { areaSqM: 2394, excludedAreaSqM: 0, provinceData: { ghi: GHI } };
var s2 = calculateSolarFarmSpecs(L2);
checkPVChain(s2, L2, "solar@2394");
checkCashFlows(s2, L2, "solar@2394");
assert.ok(s2.stringDesign.installedPanelCount > s1.stringDesign.installedPanelCount, "\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E43\u0E2B\u0E0D\u0E48\u0E02\u0E36\u0E49\u0E19 \u2192 \u0E41\u0E1C\u0E07\u0E21\u0E32\u0E01\u0E02\u0E36\u0E49\u0E19");
near(
  num(s2.annualEnergyMWh) / num(s1.annualEnergyMWh),
  s2.stringDesign.installedPanelCount / s1.stringDesign.installedPanelCount,
  0.01,
  "energy \u0E2A\u0E31\u0E14\u0E2A\u0E48\u0E27\u0E19\u0E01\u0E31\u0E1A\u0E41\u0E1C\u0E07"
);
var L3 = { areaSqM: 1470, excludedAreaSqM: 200, provinceData: { ghi: GHI } };
var s3 = calculateSolarFarmSpecs(L3);
checkPVChain(s3, L3, "solar@1470ex200");
checkCashFlows(s3, L3, "solar@1470ex200");
assert.equal(num(s3.areaCandidatePanelCount), Math.floor((1470 - 200) * 0.78 / 4), "exclusion \u0E2B\u0E31\u0E01\u0E01\u0E48\u0E2D\u0E19 candidate");
var ev = calculateEVHubSpecs({ areaSqM: 5e3, roadWidthMeters: 8, provinceData: { ghi: GHI } });
var evAc = ev.dcChargersCount * 180 / 0.95;
assert.ok(num(ev.transformerRating) * 0.98 >= evAc * 0.7 - ev.bessKWh / 2 - 1, "EV: tr\xD70.98 \u2265 demand\xD70.7\u2212BESS");
saveProjects2([]);
var proj = {
  id: "p-test",
  name: "\u0E17\u0E14\u0E2A\u0E2D\u0E1A",
  createdAt: (/* @__PURE__ */ new Date()).toISOString(),
  land: { areaSqM: 2072, excludedAreaSqM: 0, provinceData: { ghi: GHI } },
  goals: { goal: "income" },
  chosenPlanId: "agrivoltaics",
  engineVersion: "v6.1"
};
saveProjects2([proj]);
var loaded = loadProjects2();
assert.equal(loaded.length, 1);
assert.equal(loaded[0].engineVersion, "v6.1");
var roundTrip = importProjectJSON2(exportProjectJSON2(proj));
assert.equal(roundTrip.land.areaSqM, 2072);
assert.equal(roundTrip.chosenPlanId, "agrivoltaics");
assert.throws(() => importProjectJSON2('{"foo":1}'), /ไม่ถูกต้อง/, "reject bad schema");
assert.throws(() => importProjectJSON2("not json"), "reject non-JSON");
var legacy = { id: "old", name: "\u0E40\u0E01\u0E48\u0E32", land: { areaSqM: 2072 }, goals: {} };
var legacySpecs = calculateAgrivoltaicsSpecs(legacy.land);
assert.equal(legacySpecs.stringDesign.installedPanelCount, 280, "legacy input \u2192 recompute \u0E44\u0E14\u0E49");
var sldVdc = a1.stringDesign.stringSize * num(a1.stringDesign.vocCold);
assert.ok(sldVdc <= a1.stringDesign.vdcMax, `SLD Vdc ${sldVdc.toFixed(1)} \u2264 ${a1.stringDesign.vdcMax}`);
assert.ok(
  Math.abs(num(a1.dcCapacityMWp) * 1e3 - a1.stringDesign.installedPanelCount * 620 / 1e3) <= 1,
  "SLD MWp\xD71000 \u0E15\u0E23\u0E07\u0E08\u0E33\u0E19\u0E27\u0E19\u0E41\u0E1C\u0E07\xB1\u0E1B\u0E31\u0E14"
);
console.log("ACCEPTANCE: ALL CHECKS PASS");
