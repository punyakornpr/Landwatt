// tests/formulas.test.mjs
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// src/utils/engineeringCalculations.js
function evaluateLandFeasibility(landData) {
  const {
    areaSqM = 0,
    provinceData = {},
    roadType = "main",
    // 'main' (ทางหลวง/ถนนใหญ่), 'secondary' (ถนนรอง/ซอย), 'dirt' (ถนนลูกรัง/ไม่มีทางสาธารณะ)
    roadWidthMeters = 8,
    gridDistanceMeters = 100,
    // ระยะห่างถึงสายส่งแรงกลาง 22kV/33kV
    landType = "flat",
    // 'flat' (ที่ราบ), 'slope' (ที่ลาดเอียง), 'pond' (มีบ่อน้ำ/แอ่งน้ำ), 'agri' (ที่ดินเกษตรเดิม)
    hasWaterBody = false,
    waterBodyAreaSqM = 0,
    hasAgriculturalWaste = false,
    // มีฟาร์มปศุสัตว์/ของเสียเกษตรใกล้เคียง
    soilStability = "good",
    // 'good', 'medium', 'soft'
    zoningColor = "green"
    // 'green' (ชนบทเกษตรกรรม), 'yellow' (ชุมชน), 'purple' (อุตสาหกรรม), 'orange' (การค้า)
  } = landData;
  const areaRai = areaSqM / 1600;
  const ghi = provinceData.ghi || 5.1;
  const evPot = provinceData.evPotential || 0.8;
  const isMea = provinceData.grid === "MEA";
  const scores = {};
  let solarScore = 65;
  if (areaRai >= 5) solarScore += 15;
  else if (areaRai >= 2) solarScore += 10;
  else solarScore -= 20;
  if (ghi >= 5.2) solarScore += 15;
  else if (ghi >= 4.9) solarScore += 10;
  if (gridDistanceMeters <= 200) solarScore += 10;
  else if (gridDistanceMeters > 1e3) solarScore -= 20;
  if (landType === "flat") solarScore += 10;
  else if (landType === "slope") solarScore += 5;
  else if (landType === "pond") solarScore -= 25;
  if (roadWidthMeters >= 6) solarScore += 5;
  scores["solar-farm"] = Math.min(Math.max(solarScore, 10), 98);
  let agriScore = 60;
  if (areaRai >= 2 && areaRai <= 20) agriScore += 20;
  else if (areaRai > 20) agriScore += 10;
  if (landType === "agri" || zoningColor === "green") agriScore += 20;
  if (ghi >= 4.9) agriScore += 10;
  if (gridDistanceMeters <= 500) agriScore += 5;
  scores["agrivoltaics"] = Math.min(Math.max(agriScore, 10), 96);
  let evScore = 40;
  if (roadType === "main") evScore += 35;
  else if (roadType === "secondary") evScore += 15;
  else evScore -= 30;
  if (roadWidthMeters >= 12) evScore += 15;
  else if (roadWidthMeters >= 8) evScore += 8;
  if (areaRai >= 1 && areaRai <= 5) evScore += 15;
  else if (areaRai < 0.5) evScore -= 10;
  if (gridDistanceMeters <= 100) evScore += 15;
  else if (gridDistanceMeters > 500) evScore -= 25;
  evScore += evPot * 15;
  scores["ev-charging-hub"] = Math.min(Math.max(Math.round(evScore), 10), 99);
  let bessScore = 55;
  if (gridDistanceMeters <= 150) bessScore += 25;
  else if (gridDistanceMeters <= 500) bessScore += 10;
  else bessScore -= 30;
  if (areaRai >= 1 && areaRai <= 10) bessScore += 15;
  if (zoningColor === "purple" || zoningColor === "yellow") bessScore += 10;
  scores["grid-bess"] = Math.min(Math.max(bessScore, 10), 95);
  let floatScore = 20;
  if (hasWaterBody || landType === "pond" || waterBodyAreaSqM > 800) {
    floatScore += 65;
    if (gridDistanceMeters <= 500) floatScore += 15;
    if (ghi >= 5) floatScore += 10;
  } else {
    floatScore = 15;
  }
  scores["floating-solar"] = Math.min(Math.max(floatScore, 10), 97);
  let bioScore = 30;
  if (hasAgriculturalWaste) bioScore += 45;
  if (areaRai >= 5) bioScore += 15;
  if (landType === "agri" || zoningColor === "green") bioScore += 10;
  if (roadType !== "dirt") bioScore += 5;
  scores["biomass-biogas"] = Math.min(Math.max(bioScore, 10), 94);
  return scores;
}
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
  const DEG = 4e-3;
  const cashFlows = [-totalCapex];
  for (let y = 1; y <= 25; y++) {
    cashFlows.push(annualRevenue * Math.pow(1 - DEG, y - 1) - opexPerYear);
  }
  let cum2 = -totalCapex, paybackYear = null;
  for (let y = 1; y <= 25 && paybackYear === null; y++) {
    cum2 += cashFlows[y];
    if (cum2 >= 0) paybackYear = y;
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
  let cum2 = -totalCapex, paybackYear = null;
  for (let y = 1; y <= 25 && paybackYear === null; y++) {
    cum2 += cashFlows[y];
    if (cum2 >= 0) paybackYear = y;
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

// src/engine/recommend.js
var PROJECT_FRIENDLY = {
  "solar-farm": {
    name: "\u0E17\u0E33\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C\u0E40\u0E0B\u0E25\u0E25\u0E4C\u0E1C\u0E25\u0E34\u0E15\u0E44\u0E1F\u0E1F\u0E49\u0E32",
    sub: "Solar Farm",
    icon: "Sun",
    oneLiner: "\u0E15\u0E34\u0E14\u0E15\u0E31\u0E49\u0E07\u0E41\u0E1C\u0E07\u0E23\u0E31\u0E1A\u0E41\u0E2A\u0E07\u0E2D\u0E32\u0E17\u0E34\u0E15\u0E22\u0E4C\u0E1A\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E14\u0E34\u0E19 \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E02\u0E32\u0E22\u0E44\u0E1F\u0E2B\u0E23\u0E37\u0E2D\u0E25\u0E14\u0E04\u0E48\u0E32\u0E44\u0E1F\u0E43\u0E19\u0E23\u0E30\u0E22\u0E30\u0E22\u0E32\u0E27"
  },
  "ev-charging-hub": {
    name: "\u0E08\u0E38\u0E14\u0E0A\u0E32\u0E23\u0E4C\u0E08\u0E23\u0E16\u0E44\u0E1F\u0E1F\u0E49\u0E32",
    sub: "EV Charging Station",
    icon: "Zap",
    oneLiner: "\u0E2A\u0E16\u0E32\u0E19\u0E35\u0E0A\u0E32\u0E23\u0E4C\u0E08\u0E23\u0E16\u0E44\u0E1F\u0E1F\u0E49\u0E32\u0E04\u0E27\u0E32\u0E21\u0E40\u0E23\u0E47\u0E27\u0E2A\u0E39\u0E07 \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E2B\u0E25\u0E31\u0E07\u0E04\u0E32\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C\u0E41\u0E25\u0E30\u0E41\u0E1A\u0E15\u0E40\u0E15\u0E2D\u0E23\u0E35\u0E48\u0E0A\u0E48\u0E27\u0E22\u0E25\u0E14\u0E15\u0E49\u0E19\u0E17\u0E38\u0E19\u0E44\u0E1F"
  },
  "agrivoltaics": {
    name: "\u0E17\u0E33\u0E40\u0E01\u0E29\u0E15\u0E23\u0E04\u0E39\u0E48\u0E01\u0E31\u0E1A\u0E41\u0E1C\u0E07\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C\u0E40\u0E0B\u0E25\u0E25\u0E4C",
    sub: "Agrivoltaics",
    icon: "Sprout",
    oneLiner: "\u0E22\u0E01\u0E41\u0E1C\u0E07\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C\u0E2A\u0E39\u0E07\u0E02\u0E36\u0E49\u0E19 \u0E1B\u0E25\u0E39\u0E01\u0E1E\u0E37\u0E0A\u0E43\u0E15\u0E49\u0E23\u0E48\u0E21\u0E40\u0E07\u0E32\u0E15\u0E48\u0E2D\u0E44\u0E1B \u0E44\u0E14\u0E49\u0E17\u0E31\u0E49\u0E07\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E1E\u0E37\u0E0A\u0E41\u0E25\u0E30\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E44\u0E1F"
  },
  "grid-bess": {
    name: "\u0E23\u0E30\u0E1A\u0E1A\u0E41\u0E1A\u0E15\u0E40\u0E15\u0E2D\u0E23\u0E35\u0E48\u0E40\u0E01\u0E47\u0E1A\u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19",
    sub: "Battery Storage (BESS)",
    icon: "BatteryCharging",
    oneLiner: "\u0E15\u0E39\u0E49\u0E41\u0E1A\u0E15\u0E40\u0E15\u0E2D\u0E23\u0E35\u0E48\u0E02\u0E19\u0E32\u0E14\u0E43\u0E2B\u0E0D\u0E48\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E40\u0E01\u0E47\u0E1A-\u0E08\u0E48\u0E32\u0E22\u0E44\u0E1F \u0E40\u0E2B\u0E21\u0E32\u0E30\u0E01\u0E31\u0E1A\u0E01\u0E23\u0E13\u0E35\u0E18\u0E38\u0E23\u0E01\u0E34\u0E08\u0E17\u0E35\u0E48\u0E21\u0E35\u0E42\u0E2B\u0E25\u0E14\u0E44\u0E1F\u0E0A\u0E31\u0E14\u0E40\u0E08\u0E19"
  },
  "floating-solar": {
    name: "\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C\u0E40\u0E0B\u0E25\u0E25\u0E4C\u0E25\u0E2D\u0E22\u0E19\u0E49\u0E33",
    sub: "Floating Solar",
    icon: "Waves",
    oneLiner: "\u0E15\u0E34\u0E14\u0E15\u0E31\u0E49\u0E07\u0E41\u0E1C\u0E07\u0E1A\u0E19\u0E17\u0E38\u0E48\u0E19\u0E25\u0E2D\u0E22\u0E43\u0E19\u0E1A\u0E48\u0E2D\u0E19\u0E49\u0E33\u0E2B\u0E23\u0E37\u0E2D\u0E2D\u0E48\u0E32\u0E07\u0E40\u0E01\u0E47\u0E1A\u0E19\u0E49\u0E33 \u0E43\u0E0A\u0E49\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E19\u0E49\u0E33\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E43\u0E0A\u0E49\u0E2D\u0E22\u0E39\u0E48"
  },
  "biomass-biogas": {
    name: "\u0E44\u0E1F\u0E1F\u0E49\u0E32\u0E08\u0E32\u0E01\u0E01\u0E4A\u0E32\u0E0B\u0E0A\u0E35\u0E27\u0E20\u0E32\u0E1E",
    sub: "Biogas / Biomass",
    icon: "Flame",
    oneLiner: "\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E02\u0E2D\u0E07\u0E40\u0E2A\u0E35\u0E22\u0E40\u0E01\u0E29\u0E15\u0E23\u0E2B\u0E23\u0E37\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E31\u0E15\u0E27\u0E4C\u0E40\u0E1B\u0E47\u0E19\u0E01\u0E4A\u0E32\u0E0B\u0E1B\u0E31\u0E48\u0E19\u0E44\u0E1F \u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E27\u0E31\u0E15\u0E16\u0E38\u0E14\u0E34\u0E1A\u0E15\u0E48\u0E2D\u0E40\u0E19\u0E37\u0E48\u0E2D\u0E07"
  }
};
function reasonsFor(projectId, land2) {
  const areaRai = land2.areaSqM / 1600;
  const ghi = land2.provinceData?.ghi || 5;
  const reasons = [];
  const cautions = [];
  switch (projectId) {
    case "solar-farm":
      if (ghi >= 5.1) reasons.push(`\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E19\u0E35\u0E49\u0E21\u0E35\u0E41\u0E14\u0E14\u0E14\u0E35 (\u0E23\u0E31\u0E07\u0E2A\u0E35\u0E40\u0E09\u0E25\u0E35\u0E48\u0E22 ${ghi} kWh/\u0E15\u0E23.\u0E21./\u0E27\u0E31\u0E19) \u0E40\u0E2B\u0E21\u0E32\u0E30\u0E01\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E1C\u0E25\u0E34\u0E15\u0E44\u0E1F\u0E08\u0E32\u0E01\u0E41\u0E2A\u0E07\u0E2D\u0E32\u0E17\u0E34\u0E15\u0E22\u0E4C`);
      if (areaRai >= 2) reasons.push(`\u0E02\u0E19\u0E32\u0E14\u0E17\u0E35\u0E48\u0E14\u0E34\u0E19 ${areaRai.toFixed(1)} \u0E44\u0E23\u0E48 \u0E40\u0E1E\u0E35\u0E22\u0E07\u0E1E\u0E2D\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E27\u0E32\u0E07\u0E41\u0E1C\u0E07\u0E41\u0E25\u0E30\u0E17\u0E32\u0E07\u0E40\u0E14\u0E34\u0E19\u0E1A\u0E33\u0E23\u0E38\u0E07\u0E23\u0E31\u0E01\u0E29\u0E32`);
      if (land2.landType === "flat") reasons.push("\u0E08\u0E32\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E04\u0E38\u0E13\u0E23\u0E30\u0E1A\u0E38\u0E27\u0E48\u0E32\u0E40\u0E1B\u0E47\u0E19\u0E17\u0E35\u0E48\u0E23\u0E32\u0E1A/\u0E42\u0E25\u0E48\u0E07 \u0E40\u0E2B\u0E21\u0E32\u0E30\u0E01\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E27\u0E32\u0E07\u0E41\u0E1C\u0E07 (\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E40\u0E07\u0E32\u0E1A\u0E14\u0E1A\u0E31\u0E07\u0E20\u0E32\u0E04\u0E2A\u0E19\u0E32\u0E21)");
      if (land2.hasShading === null) cautions.push("\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E17\u0E23\u0E32\u0E1A\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E40\u0E07\u0E32\u0E1A\u0E14\u0E1A\u0E31\u0E07 (\u0E15\u0E49\u0E19\u0E44\u0E21\u0E49/\u0E2D\u0E32\u0E04\u0E32\u0E23) \u2014 \u0E1C\u0E25\u0E1C\u0E25\u0E34\u0E15\u0E41\u0E25\u0E30\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E27\u0E32\u0E07\u0E41\u0E1C\u0E07\u0E08\u0E23\u0E34\u0E07\u0E2D\u0E32\u0E08\u0E15\u0E48\u0E33\u0E01\u0E27\u0E48\u0E32\u0E17\u0E35\u0E48\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19");
      if (land2.gridDistanceMeters > 500) cautions.push(`\u0E08\u0E38\u0E14\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D\u0E44\u0E1F\u0E1F\u0E49\u0E32\u0E2D\u0E22\u0E39\u0E48\u0E44\u0E01\u0E25 (~${land2.gridDistanceMeters} \u0E21.) \u0E2D\u0E32\u0E08\u0E21\u0E35\u0E04\u0E48\u0E32\u0E02\u0E22\u0E32\u0E22\u0E40\u0E02\u0E15\u0E2A\u0E32\u0E22\u0E44\u0E1F\u0E40\u0E1E\u0E34\u0E48\u0E21`);
      if (areaRai < 2) cautions.push("\u0E17\u0E35\u0E48\u0E14\u0E34\u0E19\u0E41\u0E1B\u0E25\u0E07\u0E40\u0E25\u0E47\u0E01 \u0E02\u0E19\u0E32\u0E14\u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E30\u0E08\u0E33\u0E01\u0E31\u0E14 \u0E40\u0E2B\u0E21\u0E32\u0E30\u0E17\u0E33\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E43\u0E0A\u0E49\u0E44\u0E1F\u0E40\u0E2D\u0E07\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32\u0E02\u0E32\u0E22\u0E44\u0E1F\u0E40\u0E0A\u0E34\u0E07\u0E1E\u0E32\u0E13\u0E34\u0E0A\u0E22\u0E4C");
      cautions.push("\u0E01\u0E32\u0E23\u0E02\u0E32\u0E22\u0E44\u0E1F\u0E43\u0E2B\u0E49\u0E01\u0E32\u0E23\u0E44\u0E1F\u0E1F\u0E49\u0E32\u0E15\u0E49\u0E2D\u0E07\u0E1C\u0E48\u0E32\u0E19\u0E01\u0E32\u0E23\u0E22\u0E37\u0E48\u0E19\u0E02\u0E2D\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D\u0E23\u0E30\u0E1A\u0E1A\u0E41\u0E25\u0E30\u0E2D\u0E32\u0E08\u0E21\u0E35\u0E42\u0E04\u0E27\u0E15\u0E49\u0E32\u0E08\u0E33\u0E01\u0E31\u0E14");
      break;
    case "ev-charging-hub":
      if (land2.roadType === "main") reasons.push("\u0E17\u0E35\u0E48\u0E14\u0E34\u0E19\u0E15\u0E34\u0E14\u0E16\u0E19\u0E19\u0E2A\u0E32\u0E22\u0E2B\u0E25\u0E31\u0E01 \u0E23\u0E16\u0E1C\u0E48\u0E32\u0E19\u0E2A\u0E30\u0E14\u0E27\u0E01 \u0E40\u0E2B\u0E21\u0E32\u0E30\u0E01\u0E31\u0E1A\u0E2A\u0E16\u0E32\u0E19\u0E35\u0E0A\u0E32\u0E23\u0E4C\u0E08");
      if (land2.roadWidthMeters >= 10) reasons.push("\u0E16\u0E19\u0E19\u0E2B\u0E19\u0E49\u0E32\u0E41\u0E1B\u0E25\u0E07\u0E01\u0E27\u0E49\u0E32\u0E07 \u0E23\u0E16\u0E40\u0E02\u0E49\u0E32\u0E2D\u0E2D\u0E01\u0E07\u0E48\u0E32\u0E22 \u0E27\u0E32\u0E07\u0E17\u0E32\u0E07\u0E27\u0E34\u0E48\u0E07\u0E23\u0E16\u0E44\u0E14\u0E49\u0E14\u0E35");
      if ((land2.provinceData?.evPotential || 0) >= 0.85) reasons.push(`\u0E08\u0E31\u0E07\u0E2B\u0E27\u0E31\u0E14${land2.provinceData?.name} \u0E21\u0E35\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E23\u0E16\u0E44\u0E1F\u0E1F\u0E49\u0E32\u0E04\u0E48\u0E2D\u0E19\u0E02\u0E49\u0E32\u0E07\u0E2A\u0E39\u0E07`);
      if (areaRai >= 1) reasons.push("\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E40\u0E1E\u0E35\u0E22\u0E07\u0E1E\u0E2D\u0E27\u0E32\u0E07\u0E08\u0E38\u0E14\u0E0A\u0E32\u0E23\u0E4C\u0E08 \u0E17\u0E35\u0E48\u0E08\u0E2D\u0E14 \u0E41\u0E25\u0E30\u0E21\u0E38\u0E21\u0E1E\u0E31\u0E01\u0E1C\u0E48\u0E2D\u0E19");
      cautions.push("\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E02\u0E36\u0E49\u0E19\u0E01\u0E31\u0E1A\u0E08\u0E33\u0E19\u0E27\u0E19\u0E23\u0E16\u0E17\u0E35\u0E48\u0E40\u0E02\u0E49\u0E32\u0E43\u0E0A\u0E49\u0E08\u0E23\u0E34\u0E07 \u0E04\u0E27\u0E23\u0E2A\u0E33\u0E23\u0E27\u0E08\u0E1B\u0E23\u0E34\u0E21\u0E32\u0E13\u0E23\u0E16\u0E2B\u0E19\u0E49\u0E32\u0E41\u0E1B\u0E25\u0E07\u0E01\u0E48\u0E2D\u0E19\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E43\u0E08");
      cautions.push("\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E0A\u0E32\u0E23\u0E4C\u0E08\u0E41\u0E25\u0E30\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E23\u0E31\u0E1A\u0E01\u0E33\u0E25\u0E31\u0E07\u0E02\u0E2D\u0E07\u0E42\u0E04\u0E23\u0E07\u0E02\u0E48\u0E32\u0E22\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19 \u2014 \u0E23\u0E30\u0E22\u0E30\u0E2A\u0E32\u0E22\u0E44\u0E1F\u0E17\u0E35\u0E48\u0E01\u0E23\u0E2D\u0E01\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E1E\u0E35\u0E22\u0E07\u0E04\u0E48\u0E32\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E34\u0E14\u0E15\u0E48\u0E2D\u0E01\u0E32\u0E23\u0E44\u0E1F\u0E1F\u0E49\u0E32");
      if (land2.roadType !== "main") cautions.push("\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E15\u0E34\u0E14\u0E16\u0E19\u0E19\u0E2A\u0E32\u0E22\u0E2B\u0E25\u0E31\u0E01 \u0E2D\u0E32\u0E08\u0E15\u0E49\u0E2D\u0E07\u0E1E\u0E34\u0E08\u0E32\u0E23\u0E13\u0E32\u0E17\u0E33\u0E40\u0E25\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32\u0E40\u0E1E\u0E34\u0E48\u0E21");
      break;
    case "agrivoltaics":
      if (land2.landType === "agri") reasons.push("\u0E17\u0E35\u0E48\u0E14\u0E34\u0E19\u0E40\u0E1B\u0E47\u0E19\u0E41\u0E1B\u0E25\u0E07\u0E40\u0E01\u0E29\u0E15\u0E23\u0E2D\u0E22\u0E39\u0E48\u0E41\u0E25\u0E49\u0E27 \u2014 \u0E25\u0E31\u0E01\u0E29\u0E13\u0E30\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E01\u0E31\u0E1A\u0E41\u0E19\u0E27\u0E04\u0E34\u0E14\u0E17\u0E33\u0E40\u0E01\u0E29\u0E15\u0E23\u0E04\u0E39\u0E48\u0E01\u0E31\u0E1A\u0E41\u0E1C\u0E07 (\u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E04\u0E27\u0E32\u0E21\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E02\u0E2D\u0E07\u0E1E\u0E37\u0E0A\u0E08\u0E23\u0E34\u0E07)");
      if (ghi >= 4.9) reasons.push("\u0E41\u0E14\u0E14\u0E40\u0E1E\u0E35\u0E22\u0E07\u0E1E\u0E2D\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E17\u0E31\u0E49\u0E07\u0E01\u0E32\u0E23\u0E1C\u0E25\u0E34\u0E15\u0E44\u0E1F\u0E41\u0E25\u0E30\u0E01\u0E32\u0E23\u0E40\u0E08\u0E23\u0E34\u0E0D\u0E40\u0E15\u0E34\u0E1A\u0E42\u0E15\u0E02\u0E2D\u0E07\u0E1E\u0E37\u0E0A\u0E43\u0E15\u0E49\u0E23\u0E48\u0E21");
      if (areaRai >= 1.5 && areaRai <= 20) reasons.push("\u0E02\u0E19\u0E32\u0E14\u0E41\u0E1B\u0E25\u0E07\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E40\u0E01\u0E29\u0E15\u0E23\u0E1C\u0E2A\u0E21\u0E1C\u0E2A\u0E32\u0E19");
      cautions.push("\u0E15\u0E49\u0E19\u0E17\u0E38\u0E19\u0E42\u0E04\u0E23\u0E07\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E22\u0E01\u0E2A\u0E39\u0E07\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C\u0E1A\u0E19\u0E14\u0E34\u0E19\u0E1B\u0E01\u0E15\u0E34 \u0E41\u0E25\u0E30\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E1E\u0E37\u0E0A\u0E17\u0E35\u0E48\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E01\u0E31\u0E1A\u0E23\u0E48\u0E21\u0E40\u0E07\u0E32");
      cautions.push("\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E1E\u0E37\u0E0A\u0E1C\u0E25\u0E02\u0E36\u0E49\u0E19\u0E01\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E14\u0E39\u0E41\u0E25\u0E41\u0E25\u0E30\u0E15\u0E25\u0E32\u0E14 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48\u0E23\u0E31\u0E1A\u0E1B\u0E23\u0E30\u0E01\u0E31\u0E19\u0E44\u0E14\u0E49");
      break;
    case "grid-bess":
      if (land2.gridDistanceMeters <= 200) reasons.push("\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E01\u0E25\u0E49\u0E41\u0E19\u0E27\u0E2A\u0E32\u0E22\u0E44\u0E1F \u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D\u0E23\u0E30\u0E1A\u0E1A\u0E2A\u0E30\u0E14\u0E27\u0E01");
      reasons.push("\u0E43\u0E0A\u0E49\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E19\u0E49\u0E2D\u0E22\u0E15\u0E48\u0E2D\u0E21\u0E39\u0E25\u0E04\u0E48\u0E32\u0E42\u0E04\u0E23\u0E07\u0E01\u0E32\u0E23\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E01\u0E31\u0E1A\u0E17\u0E32\u0E07\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E2D\u0E37\u0E48\u0E19");
      cautions.push("\u0E41\u0E1A\u0E15\u0E40\u0E15\u0E2D\u0E23\u0E35\u0E48\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E14\u0E35\u0E22\u0E27\u0E44\u0E21\u0E48\u0E1C\u0E25\u0E34\u0E15\u0E44\u0E1F\u0E40\u0E2D\u0E07 \u2014 \u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E41\u0E2B\u0E25\u0E48\u0E07\u0E44\u0E1F\u0E2B\u0E23\u0E37\u0E2D\u0E01\u0E23\u0E13\u0E35\u0E18\u0E38\u0E23\u0E01\u0E34\u0E08\u0E0A\u0E31\u0E14\u0E40\u0E08\u0E19 (\u0E40\u0E0A\u0E48\u0E19 \u0E2A\u0E33\u0E23\u0E2D\u0E07\u0E44\u0E1F, \u0E25\u0E14\u0E04\u0E48\u0E32 Peak)");
      cautions.push("\u0E23\u0E32\u0E22\u0E44\u0E14\u0E49\u0E08\u0E32\u0E01\u0E1A\u0E23\u0E34\u0E01\u0E32\u0E23\u0E23\u0E30\u0E1A\u0E1A\u0E44\u0E1F\u0E1F\u0E49\u0E32\u0E15\u0E49\u0E2D\u0E07\u0E2D\u0E32\u0E28\u0E31\u0E22\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E01\u0E31\u0E1A\u0E2B\u0E19\u0E48\u0E27\u0E22\u0E07\u0E32\u0E19/\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E01\u0E2D\u0E1A\u0E01\u0E32\u0E23 \u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E44\u0E14\u0E49\u0E08\u0E32\u0E01\u0E17\u0E35\u0E48\u0E14\u0E34\u0E19\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E14\u0E35\u0E22\u0E27");
      break;
    case "floating-solar":
      if (land2.hasWaterBody || land2.landType === "pond") reasons.push("\u0E21\u0E35\u0E41\u0E2B\u0E25\u0E48\u0E07\u0E19\u0E49\u0E33\u0E43\u0E19\u0E41\u0E1B\u0E25\u0E07 \u0E43\u0E0A\u0E49\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E1C\u0E34\u0E27\u0E19\u0E49\u0E33\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E43\u0E0A\u0E49\u0E1B\u0E23\u0E30\u0E42\u0E22\u0E0A\u0E19\u0E4C\u0E2D\u0E22\u0E39\u0E48");
      if (ghi >= 5) reasons.push("\u0E41\u0E14\u0E14\u0E14\u0E35 \u0E41\u0E25\u0E30\u0E1C\u0E34\u0E27\u0E19\u0E49\u0E33\u0E0A\u0E48\u0E27\u0E22\u0E23\u0E30\u0E1A\u0E32\u0E22\u0E04\u0E27\u0E32\u0E21\u0E23\u0E49\u0E2D\u0E19\u0E43\u0E2B\u0E49\u0E41\u0E1C\u0E07\u0E1C\u0E25\u0E34\u0E15\u0E44\u0E1F\u0E44\u0E14\u0E49\u0E21\u0E32\u0E01\u0E02\u0E36\u0E49\u0E19\u0E40\u0E25\u0E47\u0E01\u0E19\u0E49\u0E2D\u0E22");
      cautions.push("\u0E15\u0E49\u0E19\u0E17\u0E38\u0E19\u0E17\u0E38\u0E48\u0E19\u0E25\u0E2D\u0E22\u0E41\u0E25\u0E30\u0E23\u0E30\u0E1A\u0E1A\u0E22\u0E36\u0E14\u0E42\u0E22\u0E07\u0E2A\u0E39\u0E07\u0E01\u0E27\u0E48\u0E32\u0E41\u0E1A\u0E1A\u0E1A\u0E19\u0E14\u0E34\u0E19 \u0E41\u0E25\u0E30\u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E1C\u0E34\u0E27\u0E19\u0E49\u0E33");
      break;
    case "biomass-biogas":
      if (land2.hasAgriculturalWaste) reasons.push("\u0E08\u0E32\u0E01\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E04\u0E38\u0E13\u0E23\u0E30\u0E1A\u0E38\u0E27\u0E48\u0E32\u0E21\u0E35\u0E02\u0E2D\u0E07\u0E40\u0E2A\u0E35\u0E22\u0E40\u0E01\u0E29\u0E15\u0E23 \u2014 \u0E2D\u0E32\u0E08\u0E21\u0E35\u0E27\u0E31\u0E15\u0E16\u0E38\u0E14\u0E34\u0E1A\u0E43\u0E0A\u0E49\u0E44\u0E14\u0E49 \u0E41\u0E15\u0E48\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E1B\u0E23\u0E34\u0E21\u0E32\u0E13\u0E41\u0E25\u0E30\u0E04\u0E27\u0E32\u0E21\u0E15\u0E48\u0E2D\u0E40\u0E19\u0E37\u0E48\u0E2D\u0E07\u0E08\u0E23\u0E34\u0E07");
      reasons.push("\u0E1C\u0E25\u0E34\u0E15\u0E44\u0E1F\u0E44\u0E14\u0E49\u0E15\u0E48\u0E2D\u0E40\u0E19\u0E37\u0E48\u0E2D\u0E07\u0E15\u0E25\u0E2D\u0E14\u0E27\u0E31\u0E19 \u0E44\u0E21\u0E48\u0E02\u0E36\u0E49\u0E19\u0E01\u0E31\u0E1A\u0E2A\u0E20\u0E32\u0E1E\u0E2D\u0E32\u0E01\u0E32\u0E28 (\u0E2B\u0E32\u0E01\u0E27\u0E31\u0E15\u0E16\u0E38\u0E14\u0E34\u0E1A\u0E40\u0E1E\u0E35\u0E22\u0E07\u0E1E\u0E2D)");
      cautions.push("\u0E15\u0E49\u0E2D\u0E07\u0E2A\u0E33\u0E23\u0E27\u0E08\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E41\u0E2B\u0E25\u0E48\u0E07\u0E27\u0E31\u0E15\u0E16\u0E38\u0E14\u0E34\u0E1A\u0E08\u0E23\u0E34\u0E07 \u0E1B\u0E23\u0E34\u0E21\u0E32\u0E13\u0E15\u0E48\u0E2D\u0E27\u0E31\u0E19 \u0E41\u0E25\u0E30\u0E04\u0E27\u0E32\u0E21\u0E15\u0E48\u0E2D\u0E40\u0E19\u0E37\u0E48\u0E2D\u0E07\u0E15\u0E25\u0E2D\u0E14\u0E1B\u0E35 \u0E23\u0E27\u0E21\u0E16\u0E36\u0E07\u0E04\u0E48\u0E32\u0E02\u0E19\u0E2A\u0E48\u0E07\u0E40\u0E02\u0E49\u0E32\u0E41\u0E1B\u0E25\u0E07 \u0E01\u0E48\u0E2D\u0E19\u0E2A\u0E23\u0E38\u0E1B\u0E04\u0E27\u0E32\u0E21\u0E40\u0E1B\u0E47\u0E19\u0E44\u0E1B\u0E44\u0E14\u0E49");
      cautions.push("\u0E21\u0E35\u0E40\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E01\u0E32\u0E23\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E01\u0E25\u0E34\u0E48\u0E19\u0E41\u0E25\u0E30\u0E43\u0E1A\u0E2D\u0E19\u0E38\u0E0D\u0E32\u0E15\u0E42\u0E23\u0E07\u0E07\u0E32\u0E19\u0E17\u0E35\u0E48\u0E15\u0E49\u0E2D\u0E07\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23");
      break;
  }
  return { reasons, cautions };
}
function screening(projectId, land2, goals) {
  const areaRai = land2.areaSqM / 1600;
  const aims = goals?.aims || [];
  switch (projectId) {
    case "floating-solar":
      if (!land2.hasWaterBody && land2.landType !== "pond")
        return { status: "no", blockReason: "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E41\u0E2B\u0E25\u0E48\u0E07\u0E19\u0E49\u0E33\u0E43\u0E19\u0E41\u0E1B\u0E25\u0E07 \u2014 \u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C\u0E25\u0E2D\u0E22\u0E19\u0E49\u0E33\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E1A\u0E48\u0E2D\u0E19\u0E49\u0E33\u0E2B\u0E23\u0E37\u0E2D\u0E2D\u0E48\u0E32\u0E07\u0E40\u0E01\u0E47\u0E1A\u0E19\u0E49\u0E33" };
      return null;
    case "biomass-biogas":
      if (!land2.hasAgriculturalWaste)
        return { status: "insufficient", blockReason: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E27\u0E31\u0E15\u0E16\u0E38\u0E14\u0E34\u0E1A\u0E0A\u0E35\u0E27\u0E20\u0E32\u0E1E (\u0E02\u0E2D\u0E07\u0E40\u0E2A\u0E35\u0E22\u0E40\u0E01\u0E29\u0E15\u0E23/\u0E21\u0E39\u0E25\u0E2A\u0E31\u0E15\u0E27\u0E4C) \u0E17\u0E35\u0E48\u0E15\u0E48\u0E2D\u0E40\u0E19\u0E37\u0E48\u0E2D\u0E07\u0E1E\u0E2D\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1B\u0E31\u0E48\u0E19\u0E44\u0E1F" };
      return null;
    case "ev-charging-hub":
      if (land2.roadType === "dirt")
        return { status: "no", blockReason: "\u0E17\u0E32\u0E07\u0E40\u0E02\u0E49\u0E32\u0E40\u0E1B\u0E47\u0E19\u0E16\u0E19\u0E19\u0E25\u0E39\u0E01\u0E23\u0E31\u0E07/\u0E17\u0E32\u0E07\u0E22\u0E48\u0E2D\u0E22 \u0E23\u0E16\u0E17\u0E31\u0E48\u0E27\u0E44\u0E1B\u0E40\u0E02\u0E49\u0E32\u0E16\u0E36\u0E07\u0E22\u0E32\u0E01 \u0E44\u0E21\u0E48\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E17\u0E33\u0E2A\u0E16\u0E32\u0E19\u0E35\u0E0A\u0E32\u0E23\u0E4C\u0E08" };
      if (areaRai < 0.3)
        return { status: "no", blockReason: "\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E40\u0E25\u0E47\u0E01\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E08\u0E38\u0E14\u0E0A\u0E32\u0E23\u0E4C\u0E08 \u0E17\u0E35\u0E48\u0E08\u0E2D\u0E14 \u0E41\u0E25\u0E30\u0E17\u0E32\u0E07\u0E27\u0E34\u0E48\u0E07\u0E23\u0E16" };
      if (land2.landType === "pond")
        return { status: "insufficient", blockReason: "\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E2A\u0E48\u0E27\u0E19\u0E43\u0E2B\u0E0D\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E41\u0E2B\u0E25\u0E48\u0E07\u0E19\u0E49\u0E33 \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E41\u0E2B\u0E49\u0E07\u0E17\u0E35\u0E48\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E01\u0E48\u0E2D\u0E19" };
      return null;
    case "grid-bess":
      if (!aims.includes("backup") && !aims.includes("income"))
        return { status: "insufficient", blockReason: "\u0E41\u0E1A\u0E15\u0E40\u0E15\u0E2D\u0E23\u0E35\u0E48\u0E25\u0E49\u0E27\u0E19\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E01\u0E23\u0E13\u0E35\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E0A\u0E31\u0E14\u0E40\u0E08\u0E19 (\u0E2A\u0E33\u0E23\u0E2D\u0E07\u0E44\u0E1F/\u0E18\u0E38\u0E23\u0E01\u0E34\u0E08\u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19) \u2014 \u0E40\u0E25\u0E37\u0E2D\u0E01\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E17\u0E35\u0E48\u0E40\u0E01\u0E35\u0E48\u0E22\u0E27\u0E02\u0E49\u0E2D\u0E07\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E40\u0E1E\u0E34\u0E48\u0E21" };
      if (land2.gridDistanceMeters > 800)
        return { status: "insufficient", blockReason: "\u0E2D\u0E22\u0E39\u0E48\u0E44\u0E01\u0E25\u0E23\u0E30\u0E1A\u0E1A\u0E2A\u0E32\u0E22\u0E44\u0E1F\u0E21\u0E32\u0E01 \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E01\u0E32\u0E23\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D\u0E01\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E44\u0E1F\u0E1F\u0E49\u0E32\u0E01\u0E48\u0E2D\u0E19" };
      return null;
    case "solar-farm":
      if (areaRai < 0.5)
        return { status: "no", blockReason: "\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E40\u0E25\u0E47\u0E01\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E15\u0E34\u0E14\u0E15\u0E31\u0E49\u0E07\u0E41\u0E1C\u0E07\u0E1A\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E14\u0E34\u0E19\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E21\u0E35\u0E19\u0E31\u0E22\u0E2A\u0E33\u0E04\u0E31\u0E0D" };
      return null;
    case "agrivoltaics":
      if (areaRai < 0.5)
        return { status: "no", blockReason: "\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E40\u0E25\u0E47\u0E01\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E17\u0E33\u0E40\u0E01\u0E29\u0E15\u0E23\u0E04\u0E39\u0E48\u0E41\u0E1C\u0E07\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C" };
      if (land2.landType === "pond")
        return { status: "no", blockReason: "\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E2A\u0E48\u0E27\u0E19\u0E43\u0E2B\u0E0D\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E41\u0E2B\u0E25\u0E48\u0E07\u0E19\u0E49\u0E33 \u0E44\u0E21\u0E48\u0E40\u0E2B\u0E21\u0E32\u0E30\u0E01\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E1B\u0E25\u0E39\u0E01\u0E1E\u0E37\u0E0A\u0E04\u0E39\u0E48\u0E41\u0E1C\u0E07" };
      return null;
  }
  return null;
}
function goalBoost(projectId, aims) {
  const map = {
    "solar-farm": ["income", "save", "unsure"],
    "ev-charging-hub": ["ev", "income"],
    "agrivoltaics": ["farm", "income"],
    "grid-bess": ["backup"],
    "floating-solar": ["income"],
    "biomass-biogas": ["farm", "income"]
  };
  if (!aims.length) return 0;
  const matched = (map[projectId] || []).some((a) => aims.includes(a));
  return matched ? 12 : -8;
}
function dataConfidence(land2) {
  const missing = [];
  if (!land2.provinceId) missing.push("\u0E17\u0E35\u0E48\u0E15\u0E31\u0E49\u0E07\u0E17\u0E35\u0E48\u0E14\u0E34\u0E19");
  if (!land2.areaSqM || land2.areaSqM <= 0) missing.push("\u0E02\u0E19\u0E32\u0E14\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48");
  if (land2.landTypeUnknown) missing.push("\u0E25\u0E31\u0E01\u0E29\u0E13\u0E30\u0E17\u0E35\u0E48\u0E14\u0E34\u0E19");
  if (land2.gridUnknown) missing.push("\u0E23\u0E30\u0E22\u0E30\u0E2B\u0E48\u0E32\u0E07\u0E08\u0E32\u0E01\u0E2A\u0E32\u0E22\u0E44\u0E1F");
  if (land2.roadType == null) missing.push("\u0E01\u0E32\u0E23\u0E40\u0E02\u0E49\u0E32\u0E16\u0E36\u0E07\u0E16\u0E19\u0E19");
  const level = missing.length === 0 ? "\u0E2A\u0E39\u0E07" : missing.length <= 2 ? "\u0E1B\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07" : "\u0E15\u0E48\u0E33";
  return { level, missing };
}
function recommendProjects(land2, goals) {
  const raw = evaluateLandFeasibility({ ...land2, provinceData: land2.provinceData || {} });
  const aims = goals?.aims || [];
  const confidence = dataConfidence(land2);
  const results = Object.keys(PROJECT_FRIENDLY).map((id) => {
    const screened = screening(id, land2, goals);
    let score = Math.round(Math.min(98, Math.max(10, (raw[id] || 50) + goalBoost(id, aims))));
    const scoreCap = confidence.level === "\u0E15\u0E48\u0E33" ? 70 : confidence.level === "\u0E1B\u0E32\u0E19\u0E01\u0E25\u0E32\u0E07" ? 85 : 98;
    score = Math.min(score, scoreCap);
    let status = screened?.status || (score >= 72 ? "great" : score >= 52 ? "worth" : score >= 38 ? "insufficient" : "no");
    if (confidence.level === "\u0E15\u0E48\u0E33" && status === "great") status = "worth";
    const { reasons, cautions } = reasonsFor(id, land2);
    if (screened?.blockReason) reasons.unshift(screened.blockReason);
    return { id, score, status, reasons, cautions, confidence };
  }).sort((a, b) => {
    const order = { great: 0, worth: 1, insufficient: 2, no: 3 };
    return order[a.status] - order[b.status] || b.score - a.score || a.id.localeCompare(b.id);
  });
  return results;
}

// src/engine/storage.js
var DEFAULT_LAND = {
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
var DEFAULT_GOALS = {
  aims: [],
  budget: "unsure",
  monthlyBill: null,
  // ค่าไฟ/เดือน (บาท) ถ้าเลือกเป้าหมายประหยัด
  evTraffic: null
  // 'high'|'medium'|'low'|'unknown'
};

// tests/formulas.test.mjs
var near = (a, b, tol = 0.01) => assert.ok(Math.abs(a - b) <= tol, `${a} \u2248 ${b}`);
var land = { ...DEFAULT_LAND, areaSqM: 6552, landType: "flat", provinceData: { ghi: 5.1 } };
assert.equal(6552 / 1600, 4.095);
var s1 = calculateSolarFarmSpecs(land);
var s2 = calculateSolarFarmSpecs({ ...land, excludedAreaSqM: 500 });
assert.ok(s2.stringDesign.installedPanelCount < s1.stringDesign.installedPanelCount);
assert.equal(s1.stringDesign.stringSize * s1.stringDesign.stringCount, s1.stringDesign.installedPanelCount);
assert.ok(s1.stringDesign.stringSize <= s1.stringDesign.nsMax && s1.stringDesign.stringSize >= s1.stringDesign.nsMin);
var s3 = calculateSolarFarmSpecs({ areaSqM: 8e3, excludedAreaSqM: 0, provinceData: { ghi: 5.1 } });
assert.equal(s3.stringDesign.installedPanelCount, 1560);
near(parseFloat(s3.dcCapacityMWp), 0.9672, 5e-4);
assert.equal(s1.cashFlows.length, 26);
assert.ok(s1.cashFlows[0] < 0);
var cum = s1.cashFlows[0];
var pb = null;
s1.cashFlows.forEach((cf, y) => {
  if (y > 0 && pb === null) {
    cum += cf;
    if (cum >= 0) pb = y;
  }
});
assert.equal(String(pb), s1.financials.paybackYears);
var ev = calculateEVHubSpecs({ ...land, areaSqM: 8e3 });
var evAc = parseInt(ev.dcChargersCount) * 180 / 0.95;
var needKVA = (evAc * 0.7 - ev.bessKWh / 2) / 0.98;
assert.ok(parseInt(ev.transformerRating) >= needKVA, `${ev.transformerRating} covers ${needKVA.toFixed(0)} kVA`);
var fix = calculateSolarFarmSpecs({ areaSqM: 1470, excludedAreaSqM: 0, provinceData: { ghi: 5.1 } });
assert.equal(fix.stringDesign.installedPanelCount, 280);
assert.equal(fix.stringDesign.stringCount * fix.stringDesign.stringSize, 280);
near(parseFloat(fix.dcCapacityMWp), 0.1736, 1e-3);
near(fix.dcCapacityKWp, 173.6, 0.5);
assert.equal(fix.inverterCount, 1);
near(parseFloat(fix.acCapacityMW), 0.3, 1e-9);
near(parseFloat(fix.actualDcAcRatio), 0.5787, 1e-3);
var ag = calculateAgrivoltaicsSpecs({ areaSqM: 1470, excludedAreaSqM: 0, provinceData: { ghi: 5.1 } });
assert.equal(ag.stringDesign.installedPanelCount, 180);
near(parseFloat(ag.dcCapacityMWp), 0.1116, 1e-3);
near(parseFloat(ag.actualDcAcRatio), ag.stringDesign.installedPanelCount * 620 / 1e3 / (ag.inverterCount * 300), 1e-3);
near(parseFloat(ag.acCapacityMW) * 1e3, ag.inverterCount * 300, 1e-9);
var gold = calculateAgrivoltaicsSpecs({ areaSqM: 2072, excludedAreaSqM: 0, provinceData: { ghi: 5.28 } });
near(2072 / 1600, 1.295, 1e-4);
near((2072 - 0) * 0.78, 1616.16, 0.01);
assert.equal(gold.areaCandidatePanelCount, "404");
assert.equal(gold.stringDesign.installedPanelCount, 280);
assert.equal(gold.stringDesign.stringCount, 14);
assert.equal(gold.stringDesign.stringCount * gold.stringDesign.stringSize, 280);
near(gold.stringDesign.installedPanelCount * 620 / 1e3, 173.6, 1e-9);
assert.equal(gold.dcCapacityKWp, 174);
near(parseFloat(gold.dcCapacityMWp), 0.1736, 1e-3);
assert.equal(gold.inverterCount, 1);
near(parseFloat(gold.acCapacityMW) * 1e3, 300, 1e-9);
near(parseFloat(gold.actualDcAcRatio), 0.5787, 1e-3);
near(parseFloat(gold.stringDesign.vocCold), 46.895, 0.01);
near(20 * parseFloat(gold.stringDesign.vocCold), 937.9, 0.3);
near(parseFloat(gold.stringDesign.vmpHot), 34.0995, 0.01);
near(20 * parseFloat(gold.stringDesign.vmpHot), 681.99, 0.3);
near(parseFloat(gold.annualEnergyMWh.replace(/,/g, "")), 267.65, 1);
near(parseFloat(gold.financials.totalCapexMillionTHB), 4.34, 0.01);
near(parseFloat(gold.dualIncome.powerRevenueMillionTHB) * 1e6, 580237, 500);
var bigger = calculateSolarFarmSpecs({ areaSqM: 2394, excludedAreaSqM: 0, provinceData: { ghi: 5.28 } });
assert.ok(parseInt(bigger.areaCandidatePanelCount) !== 404, "candidate \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E15\u0E32\u0E21\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48");
assert.equal(bigger.stringDesign.installedPanelCount, bigger.stringDesign.stringCount * bigger.stringDesign.stringSize);
var excl = calculateSolarFarmSpecs({ areaSqM: 2072, excludedAreaSqM: 100, provinceData: { ghi: 5.28 } });
assert.equal(parseInt(excl.areaCandidatePanelCount), Math.floor((2072 - 100) * 0.78 / 4));
var cfDiff = gold.cashFlows[1] - gold.cashFlows[2];
assert.ok(cfDiff > 0 && cfDiff < 5e3, `degradation \u0E44\u0E1F\u0E1F\u0E49\u0E32\u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19: diff ${cfDiff.toFixed(0)}`);
assert.equal(gold.cashFlows[0], -parseFloat(gold.financials.totalCapexMillionTHB) * 1e6);
assert.deepEqual(recommendProjects(land, DEFAULT_GOALS), recommendProjects(land, DEFAULT_GOALS));
var evSrc = readFileSync(new URL("../src/components/EngineeringView.jsx", import.meta.url), "utf8");
var fidCalls = [...evSrc.matchAll(/fid="(F-[0-9A-Z]+)"/g)].map((m) => m[1]);
assert.ok(fidCalls.length >= 9, `\u0E1E\u0E1A\u0E01\u0E32\u0E23\u0E4C\u0E14 ${fidCalls.length} \u0E43\u0E1A`);
for (const fid of fidCalls) {
  const at = evSrc.indexOf(`fid="${fid}"`);
  const slice = evSrc.slice(at, at + 300);
  assert.ok(slice.includes("status="), `${fid} \u0E02\u0E32\u0E14 status prop`);
}
assert.ok(evSrc.includes("aria-expanded"), "\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35 aria-expanded \u0E1A\u0E19\u0E1B\u0E38\u0E48\u0E21\u0E02\u0E22\u0E32\u0E22");
assert.ok(evSrc.includes("aria-controls"), "\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35 aria-controls");
assert.ok(evSrc.includes("\u0E21\u0E35\u0E01\u0E33\u0E25\u0E31\u0E07\u0E15\u0E34\u0E14\u0E15\u0E31\u0E49\u0E07\u0E23\u0E27\u0E21\u0E40\u0E17\u0E48\u0E32\u0E44\u0E23"), "F-04 \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E2B\u0E31\u0E27\u0E02\u0E49\u0E2D\u0E04\u0E33\u0E16\u0E32\u0E21\u0E01\u0E33\u0E25\u0E31\u0E07\u0E15\u0E34\u0E14\u0E15\u0E31\u0E49\u0E07");
var chartSrc = readFileSync(new URL("../src/components/FinancialYieldChart.jsx", import.meta.url), "utf8");
assert.ok(chartSrc.includes("specs.cashFlows"), "\u0E01\u0E23\u0E32\u0E1F\u0E15\u0E49\u0E2D\u0E07\u0E2D\u0E48\u0E32\u0E19 specs.cashFlows \u0E44\u0E21\u0E48\u0E04\u0E33\u0E19\u0E27\u0E13\u0E41\u0E22\u0E01");
console.log("ALL FORMULA TESTS PASS");
