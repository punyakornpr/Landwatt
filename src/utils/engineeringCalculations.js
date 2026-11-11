// Electrical engineering & techno-economics calculation functions

// --- Thai land unit conversion ---
export function convertToSqMeters(rai = 0, ngan = 0, sqWah = 0) {
  const r = parseFloat(rai) || 0;
  const n = parseFloat(ngan) || 0;
  const w = parseFloat(sqWah) || 0;
  return (r * 1600) + (n * 400) + (w * 4);
}

export function convertSqMetersToThai(sqMeters = 0) {
  const m = parseFloat(sqMeters) || 0;
  const rai = Math.floor(m / 1600);
  const remRai = m % 1600;
  const ngan = Math.floor(remRai / 400);
  const remNgan = remRai % 400;
  const sqWah = (remNgan / 4).toFixed(1);
  return { rai, ngan, sqWah: parseFloat(sqWah), totalSqM: m };
}

// Polygon area from Lat/Lng coordinates in square meters (m²)
export function calculatePolygonAreaSqM(coords) {
  if (!coords || coords.length < 3) return 0;
  const R = 6378137; // WGS84 Earth radius in meters
  const len = coords.length;
  // Mean latitude in radians to scale the longitude axis
  const meanLat = (coords.reduce((sum, c) => sum + c.lat, 0) / len) * (Math.PI / 180);
  
  // Convert geographic coordinates to planar Cartesian (x, y) in meters
  const xy = coords.map(c => ({
    x: (c.lng * (Math.PI / 180)) * R * Math.cos(meanLat),
    y: (c.lat * (Math.PI / 180)) * R
  }));

  // Shoelace formula (Gauss's area formula)
  let area = 0;
  for (let i = 0; i < len; i++) {
    const j = (i + 1) % len;
    area += (xy[i].x * xy[j].y) - (xy[j].x * xy[i].y);
  }
  return Math.abs(area / 2);
}

// Land-plot perimeter length in meters
export function calculatePolygonPerimeterMeters(coords) {
  if (!coords || coords.length < 2) return 0;
  const R = 6378137;
  let perimeter = 0;
  const len = coords.length;
  for (let i = 0; i < len; i++) {
    const j = (i + 1) % len;
    const lat1 = coords[i].lat * (Math.PI / 180);
    const lat2 = coords[j].lat * (Math.PI / 180);
    const dLat = lat2 - lat1;
    const dLon = (coords[j].lng - coords[i].lng) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    perimeter += R * c;
  }
  return perimeter;
}

// --- Suitability scoring engine ---
export function evaluateLandFeasibility(landData) {
  const {
    areaSqM = 0,
    provinceData = {},
    roadType = 'main', // 'main' (highway/main road), 'secondary' (minor road/soi), 'dirt' (dirt track/no public road)
    roadWidthMeters = 8,
    gridDistanceMeters = 100, // distance to 22kV/33kV medium-voltage line
    landType = 'flat', // 'flat', 'slope', 'pond' (water body), 'agri' (existing farmland)
    hasWaterBody = false,
    waterBodyAreaSqM = 0,
    hasAgriculturalWaste = false, // livestock farm / agricultural waste nearby
    soilStability = 'good', // 'good', 'medium', 'soft'
    zoningColor = 'green' // 'green' (rural-agri), 'yellow' (community), 'purple' (industrial), 'orange' (commercial)
  } = landData;

  const areaRai = areaSqM / 1600;
  const ghi = provinceData.ghi || 5.1;
  const evPot = provinceData.evPotential || 0.8;
  const isMea = provinceData.grid === 'MEA';

  const scores = {};

  // 1. Solar Farm (Ground-Mounted)
  let solarScore = 65;
  if (areaRai >= 5) solarScore += 15;
  else if (areaRai >= 2) solarScore += 10;
  else solarScore -= 20;

  if (ghi >= 5.2) solarScore += 15;
  else if (ghi >= 4.9) solarScore += 10;

  if (gridDistanceMeters <= 200) solarScore += 10;
  else if (gridDistanceMeters > 1000) solarScore -= 20;

  if (landType === 'flat') solarScore += 10;
  else if (landType === 'slope') solarScore += 5;
  else if (landType === 'pond') solarScore -= 25;

  if (roadWidthMeters >= 6) solarScore += 5;
  scores['solar-farm'] = Math.min(Math.max(solarScore, 10), 98);

  // 1b. Small Solar for own use (rooftop/backyard — modest budgets)
  let smallScore = 55;
  if (ghi >= 5.2) smallScore += 15;
  else if (ghi >= 4.9) smallScore += 10;
  if (areaSqM < 40) smallScore -= 30; // not even one small string
  else if (areaRai < 0.5) smallScore += 10; // fits small plots the big options can't use
  if (landType === 'pond') smallScore -= 20;
  if (roadWidthMeters >= 6) smallScore += 5;
  scores['small-solar'] = Math.min(Math.max(smallScore, 10), 90);

  // 1c. Off-grid solar utility kit — standalone power, no grid tie needed
  let kitScore = 50;
  if (ghi >= 5.0) kitScore += 10;
  else if (ghi >= 4.7) kitScore += 5;
  if (gridDistanceMeters > 500) kitScore += 20; // far from the line — off-grid wins
  else if (gridDistanceMeters > 200) kitScore += 5;
  if (areaSqM < 15) kitScore -= 30;
  if (landType === 'pond') kitScore -= 15;
  scores['solar-utility-kit'] = Math.min(Math.max(kitScore, 10), 88);

  // 2. Agrivoltaics
  let agriScore = 60;
  if (areaRai >= 2 && areaRai <= 20) agriScore += 20;
  else if (areaRai > 20) agriScore += 10;

  if (landType === 'agri' || zoningColor === 'green') agriScore += 20;
  if (ghi >= 4.9) agriScore += 10;
  if (gridDistanceMeters <= 500) agriScore += 5;
  scores['agrivoltaics'] = Math.min(Math.max(agriScore, 10), 96);

  // 3. EV Charging Plaza
  let evScore = 40;
  if (roadType === 'main') evScore += 35;
  else if (roadType === 'secondary') evScore += 15;
  else evScore -= 30;

  if (roadWidthMeters >= 12) evScore += 15;
  else if (roadWidthMeters >= 8) evScore += 8;

  if (areaRai >= 1 && areaRai <= 5) evScore += 15;
  else if (areaRai < 0.5) evScore -= 10;

  if (gridDistanceMeters <= 100) evScore += 15;
  else if (gridDistanceMeters > 500) evScore -= 25;

  evScore += (evPot * 15);
  scores['ev-charging-hub'] = Math.min(Math.max(Math.round(evScore), 10), 99);

  // 4. Grid-Scale BESS
  let bessScore = 55;
  if (gridDistanceMeters <= 150) bessScore += 25;
  else if (gridDistanceMeters <= 500) bessScore += 10;
  else bessScore -= 30;

  if (areaRai >= 1 && areaRai <= 10) bessScore += 15;
  if (zoningColor === 'purple' || zoningColor === 'yellow') bessScore += 10;
  scores['grid-bess'] = Math.min(Math.max(bessScore, 10), 95);

  // 5. Floating Solar
  let floatScore = 20;
  if (hasWaterBody || landType === 'pond' || waterBodyAreaSqM > 800) {
    floatScore += 65;
    if (gridDistanceMeters <= 500) floatScore += 15;
    if (ghi >= 5.0) floatScore += 10;
  } else {
    floatScore = 15; // no water body — not recommended
  }
  scores['floating-solar'] = Math.min(Math.max(floatScore, 10), 97);

  // 6. Biogas / Biomass
  let bioScore = 30;
  if (hasAgriculturalWaste) bioScore += 45;
  if (areaRai >= 5) bioScore += 15;
  if (landType === 'agri' || zoningColor === 'green') bioScore += 10;
  if (roadType !== 'dirt') bioScore += 5;
  scores['biomass-biogas'] = Math.min(Math.max(bioScore, 10), 94);

  return scores;
}

// --- Deep engineering sizing per project type ---

// 1. Solar Farm (Ground-Mounted)
export function calculateSolarFarmSpecs(landData) {
  const { areaSqM = 1600, provinceData = {} } = landData;
  const ghi = provinceData.ghi || 5.1; // kWh/m2/day

  // [F-02] Net usable area = total − user-declared exclusions (buildings/pond/trees)
  // then apply 78% utilization after setbacks / internal roads / equipment pads
  const excludedAreaSqM = Math.max(0, landData.excludedAreaSqM || 0);
  const usableArea = Math.max(0, areaSqM - excludedAreaSqM) * 0.78;

  // Industrial-grade module: N-Type TOPCon Bifacial 620W
  // Module size ~2.278m x 1.134m = 2.583 m2
  // Engineering pitch (15° tilt facing south to avoid 9:00–15:00 self-shading) ≈ 4.0 m2 per module
  const areaPerModule = 4.0;
  const moduleCount = Math.floor(usableArea / areaPerModule); // area-based candidate (before string check)
  const moduleWatt = 620; // Watts

  // [F-05] PV string check against voltage shift with temperature (linear approx per datasheet)
  // Module catalog (Demo): Voc_STC 45.2V, Vmp_STC 38.1V, beta_Voc -0.0025/°C, beta_Vmp -0.0030/°C
  // Inverter catalog (Demo): Vdc,max 1100V, MPPT range 200–1000V
  const PV = { voc: 45.2, vmp: 38.1, betaVoc: -0.0025, betaVmp: -0.0030 };
  const INV = { vdcMax: 1100, mpptMin: 200, mpptMax: 1000 };
  const T_MIN = 10, T_HIGH = 60; // design bounds °C
  const vocCold = PV.voc * (1 + PV.betaVoc * (T_MIN - 25));
  const vmpHot = PV.vmp * (1 + PV.betaVmp * (T_HIGH - 25));
  const nsMax = Math.floor(INV.vdcMax / vocCold);
  const nsMin = Math.ceil(INV.mpptMin / vmpHot);
  const stringSize = Math.min(nsMax, 20); // string size per voltage constraints (≤ nsMax, ≥ nsMin)
  const stringValid = nsMin <= nsMax;
  const stringCount = stringValid ? Math.floor(moduleCount / stringSize) : 0;
  const installedPanelCount = stringCount * stringSize; // [F-03] actually installed panels (whole strings)
  const leftoverPanels = moduleCount - installedPanelCount;

  const dcCapacityKWp = (installedPanelCount * moduleWatt) / 1000;
  const dcCapacityMWp = dcCapacityKWp / 1000;

  // Inverter Sizing: standard design DC/AC ratio (ILR) of 1.25
  const ilr = 1.25;
  const acRequiredKW = dcCapacityKWp / ilr; // required AC per ILR (not nameplate)

  // String inverter 300 kW each (98.8% efficiency)
  const inverterCount = Math.max(1, Math.round(acRequiredKW / 300));
  // [F-06] actual AC rating = sum of selected inverter nameplates
  const acCapacityMW = (inverterCount * 300) / 1000;
  // Actual DC/AC after rounding inverter count, e.g. 967.2 kWp / 900 kWac = 1.075
  const actualDcAcRatio = dcCapacityKWp / (inverterCount * 300);

  // Performance Ratio (PR) = 80% (cable loss, temp coefficient -0.30%/°C, inverter loss, soiling)
  const pr = 0.80;
  // Annual energy yield (MWh/year)
  const annualEnergyMWh = (dcCapacityKWp * ghi * 365 * pr) / 1000;

  // Step-up transformer (0.8 kV to 22 kV or 33 kV)
  // S = P / pf (pf = 0.95 lagging to allow reactive support)
  const requiredKVA = ((inverterCount * 300) / 0.95); // [F-14] S = P/PF from actual AC rating
  // Round up to standard transformer sizes (kVA)
  const standardTransformerKVA = getNextStandardTransformer(requiredKVA);

  // MV cable and switchgear sizing
  const mvVoltageKV = provinceData.grid === 'MEA' ? 24 : 22; // kV
  const ratedMVCurrentA = ((inverterCount * 300) / (Math.sqrt(3) * mvVoltageKV * 0.95)).toFixed(1);
  const recommendedMvCable = ratedMVCurrentA > 200 
    ? 'XLPE 24kV 1x300 sq.mm Al (or Cu 185 sq.mm)' 
    : 'XLPE 24kV 1x185 sq.mm Al (or Cu 95 sq.mm)';

  // Techno-economics
  // Reference FiT 2.1679 THB/kWh — a hypothetical scenario, not a confirmed power-purchase right
  const tariffPerKWh = 2.1679;
  const capexPerMWp = 21500000;
  const totalCapex = dcCapacityMWp * capexPerMWp;
  const annualRevenue = annualEnergyMWh * 1000 * tariffPerKWh;
  const opexPerYear = totalCapex * 0.015;

  // [F-24]+[F-26] annual cash flow over 25 yrs (unlevered pre-tax) with 0.4%/yr degradation [F-11]
  const DEG = 0.004;
  const cashFlows = [-totalCapex];
  for (let y = 1; y <= 25; y++) {
    cashFlows.push(annualRevenue * Math.pow(1 - DEG, y - 1) - opexPerYear);
  }
  // [F-26]/[F-27]/[F-28] all derived from the same cashFlows array as the chart/table
  const cfFin = financeFromCashFlows(cashFlows);
  const netAnnualCashflow = annualRevenue - opexPerYear;

  // ESG metrics
  // Thai grid emission factor ~0.4999 kgCO2/kWh
  const co2AvoidedTonsPerYear = (annualEnergyMWh * 1000 * 0.4999) / 1000;
  const treeEquivalent = Math.round(co2AvoidedTonsPerYear * 60);

  return {
    dcCapacityMWp: dcCapacityMWp.toFixed(3),
    dcCapacityKWp: Math.round(dcCapacityKWp),
    acCapacityMW: acCapacityMW.toFixed(3),
    areaCandidatePanelCount: moduleCount.toLocaleString(),
    moduleCount: installedPanelCount.toLocaleString(),
    stringDesign: {
      stringSize, stringCount, installedPanelCount, leftoverPanels, stringValid,
      nsMin, nsMax, vocCold: vocCold.toFixed(1), vmpHot: vmpHot.toFixed(1),
      vdcMax: INV.vdcMax, mpptMin: INV.mpptMin, mpptMax: INV.mpptMax,
      catalogStatus: 'demo', // demo-catalog equipment, not a real datasheet
    },
    excludedAreaSqM,
    tariffStatus: 'scenario',
    capexPerMWpMillionTHB: (capexPerMWp / 1000000).toFixed(1),
    cashFlows,
    moduleType: 'N-Type TOPCon Bifacial 620W (Half-cut cells)',
    inverterCount,
    inverterModel: 'String Inverter 300kW Grid-Tie 1500Vdc (Eff 98.8%)',
    actualDcAcRatio: actualDcAcRatio.toFixed(3),
    annualEnergyMWh: Math.round(annualEnergyMWh).toLocaleString(),
    transformerKVA: standardTransformerKVA,
    transformerRating: `${standardTransformerKVA} kVA, 0.8/${mvVoltageKV} kV, Dyn11, ONAN`,
    mvCurrentAmp: ratedMVCurrentA,
    mvCable: recommendedMvCable,
    protectionRelays: ['Overcurrent/Earth Fault (50/51/51N)', 'Under/Over Voltage (27/59)', 'Frequency Protection (81O/U)', 'Reverse Power (32R)', 'Differential Relay (87T)'],
    financials: {
      totalCapexTHB: Math.round(totalCapex), // unrounded — display value above loses ≤5k at 2 decimals
      totalCapexMillionTHB: (totalCapex / 1000000).toFixed(2),
      annualRevenueMillionTHB: (annualRevenue / 1000000).toFixed(2),
      netAnnualCashflowMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      paybackYears: cfFin.paybackYears,
      paybackInterpolated: cfFin.paybackInterpolated,
      irrPercent: cfFin.irrPercent,
      npv25YrMillionTHB: cfFin.npv25YrMillionTHB
    },
    cashFlowModel: 'CF_y = R_PV,1×(1−0.004)^(y−1) − OPEX — PV revenue degrades 0.4%/yr with panel degradation',
    esg: {
      co2TonsYear: Math.round(co2AvoidedTonsPerYear).toLocaleString(),
      treesEquivalent: treeEquivalent.toLocaleString()
    }
  };
}

// 1b. Small Solar for own use — rooftop/backyard scale, self-consumption (not power sales)
export function calculateSmallSolarSpecs(landData) {
  const { areaSqM = 1600, provinceData = {} } = landData;
  const ghi = provinceData.ghi || 5.1; // kWh/m2/day
  const excludedAreaSqM = Math.max(0, landData.excludedAreaSqM || 0);
  const usableArea = Math.max(0, areaSqM - excludedAreaSqM) * 0.78;

  // Same demo module; small systems still get the 4.0 m²/panel layout density.
  // Cap ~160 panels (≈100 kWp) — beyond that it is no longer a self-consumption system.
  const areaPerModule = 4.0;
  const moduleCount = Math.min(Math.floor(usableArea / areaPerModule), 160);
  const moduleWatt = 620;

  // Residential string inverter (demo catalog): Vdc,max 600V, MPPT 80–500V → 6-module strings
  const PV = { voc: 45.2, vmp: 38.1, betaVoc: -0.0025, betaVmp: -0.0030 };
  const INV = { vdcMax: 600, mpptMin: 80, mpptMax: 500 };
  const T_MIN = 10, T_HIGH = 60;
  const vocCold = PV.voc * (1 + PV.betaVoc * (T_MIN - 25));
  const vmpHot = PV.vmp * (1 + PV.betaVmp * (T_HIGH - 25));
  const nsMax = Math.floor(INV.vdcMax / vocCold);
  const nsMin = Math.ceil(INV.mpptMin / vmpHot);
  const stringSize = Math.min(nsMax, 6);
  const stringValid = nsMin <= nsMax;
  const stringCount = stringValid ? Math.floor(moduleCount / stringSize) : 0;
  const installedPanelCount = stringCount * stringSize;
  const leftoverPanels = moduleCount - installedPanelCount;

  const dcCapacityKWp = (installedPanelCount * moduleWatt) / 1000;
  const dcCapacityMWp = dcCapacityKWp / 1000;

  // 5 kW residential string inverters, design DC/AC ~1.1
  const inverterUnitKW = 5;
  const inverterCount = Math.max(1, Math.round((dcCapacityKWp / 1.1) / inverterUnitKW));
  const acCapacityKW = inverterCount * inverterUnitKW;
  const actualDcAcRatio = acCapacityKW ? dcCapacityKWp / acCapacityKW : 0;

  const pr = 0.80;
  const annualEnergyMWh = (dcCapacityKWp * ghi * 365 * pr) / 1000;

  // Techno-economics: offsets the retail bill (~4.5 THB/kWh), not FiT power sales.
  // Small-install premium ~40,000 THB/kWp incl. inverter, mounting, wiring, VAT.
  const retailTHBPerKWh = 4.5;
  const capexPerKWp = 40000;
  const totalCapex = dcCapacityKWp * capexPerKWp;
  const annualSavings = annualEnergyMWh * 1000 * retailTHBPerKWh;
  const opexPerYear = totalCapex * 0.015;

  const DEG = 0.004;
  const cashFlows = [-totalCapex];
  for (let y = 1; y <= 25; y++) {
    cashFlows.push(annualSavings * Math.pow(1 - DEG, y - 1) - opexPerYear);
  }
  const cfFin = financeFromCashFlows(cashFlows);
  const netAnnualCashflow = annualSavings - opexPerYear;
  const co2AvoidedTonsPerYear = (annualEnergyMWh * 1000 * 0.4999) / 1000;

  return {
    dcCapacityKWp: Math.round(dcCapacityKWp),
    dcCapacityMWp: dcCapacityMWp.toFixed(3),
    acCapacityKW,
    areaCandidatePanelCount: moduleCount.toLocaleString(),
    moduleCount: installedPanelCount.toLocaleString(),
    stringDesign: {
      stringSize, stringCount, installedPanelCount, leftoverPanels, stringValid,
      nsMin, nsMax, vocCold: vocCold.toFixed(1), vmpHot: vmpHot.toFixed(1),
      vdcMax: INV.vdcMax, mpptMin: INV.mpptMin, mpptMax: INV.mpptMax,
      catalogStatus: 'demo', // demo-catalog equipment, not a real datasheet
    },
    excludedAreaSqM,
    tariffStatus: 'scenario',
    retailRateTHB: retailTHBPerKWh,
    cashFlows,
    moduleType: 'N-Type TOPCon Bifacial 620W (Half-cut cells)',
    inverterCount,
    inverterUnitKW,
    inverterModel: 'Residential String Inverter 5kW 1-Phase (MPPT 80–500V, Eff 97.6%)',
    actualDcAcRatio: actualDcAcRatio.toFixed(3),
    annualEnergyMWh: Math.round(annualEnergyMWh).toLocaleString(),
    protectionRelays: ['MCB + Type-B RCD on LV board', 'Surge protection Class II'],
    financials: {
      totalCapexTHB: Math.round(totalCapex), // unrounded — display value above loses ≤5k at 2 decimals
      totalCapexMillionTHB: (totalCapex / 1000000).toFixed(2),
      annualRevenueMillionTHB: (annualSavings / 1000000).toFixed(2),
      netAnnualCashflowMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      paybackYears: cfFin.paybackYears,
      paybackInterpolated: cfFin.paybackInterpolated,
      irrPercent: cfFin.irrPercent,
      npv25YrMillionTHB: cfFin.npv25YrMillionTHB
    },
    cashFlowModel: 'CF_y = S_retail,1×(1−0.004)^(y−1) − OPEX — bill savings degrade 0.4%/yr with panel degradation (self-consumption, no FiT revenue)',
    esg: {
      co2TonsYear: Math.round(co2AvoidedTonsPerYear).toLocaleString(),
      treesEquivalent: Math.round(co2AvoidedTonsPerYear * 60).toLocaleString()
    }
  };
}

// 1c. Off-grid Solar Utility Kit — standalone panel+battery+inverter for lights/fans/a small pump
export function calculateSolarKitSpecs(landData) {
  const { areaSqM = 1600, provinceData = {} } = landData;
  const ghi = provinceData.ghi || 5.1;
  const excludedAreaSqM = Math.max(0, landData.excludedAreaSqM || 0);
  const usableArea = Math.max(0, areaSqM - excludedAreaSqM) * 0.78;

  // Kit unit: 1× 620W panel + frame + 1.2 kWh LiFePO4 — needs ~12 m² per unit.
  // Cap 8 units (~5 kWp / 9.6 kWh) — beyond that a grid-tied system is a better answer.
  const kitUnits = Math.min(Math.max(1, Math.floor(usableArea / 12)), 8);
  const pvKWp = kitUnits * 0.62;
  const batteryKWh = kitUnits * 1.2;
  const inverterKW = kitUnits <= 2 ? 1.5 : 3;

  // Daily usable energy = min(PV harvest at 75% off-grid efficiency, battery 90% DoD)
  const dailyPvKWh = pvKWp * ghi * 0.75;
  const dailyUsableKWh = Math.min(dailyPvKWh, batteryKWh * 0.9);
  // ~70% self-consumption — small kits rarely run at full load every day
  const annualUsefulKWh = dailyUsableKWh * 365 * 0.7;

  // CAPEX: per unit (panel+frame+battery 17.5k) + all-in-one inverter (~9k/kW) + BOS 5k
  const totalCapex = kitUnits * 17500 + inverterKW * 9000 + 5000;

  // Value = retail bill offset ~4.5 THB/kWh (worth more where it replaces a genset)
  const retailTHBPerKWh = 4.5;
  const annualSavings = annualUsefulKWh * retailTHBPerKWh;
  const opexPerYear = totalCapex * 0.02;

  // Cash flow: savings (0.4%/yr panel degradation) − opex − battery refresh ~y10 & y20
  const battShare = (kitUnits * 10000) / totalCapex;
  const cashFlows = [-totalCapex];
  for (let y = 1; y <= 25; y++) {
    const battReplace = (y === 10 || y === 20) ? totalCapex * battShare * 0.6 : 0;
    cashFlows.push(annualSavings * Math.pow(0.996, y - 1) - opexPerYear - battReplace);
  }
  const cfFin = financeFromCashFlows(cashFlows);
  const netAnnualCashflow = annualSavings - opexPerYear;
  const co2AvoidedTonsPerYear = (annualUsefulKWh * 0.4999) / 1000;

  return {
    kitUnits,
    offGrid: true,
    dcCapacityKWp: parseFloat(pvKWp.toFixed(2)),
    dcCapacityMWp: (pvKWp / 1000).toFixed(3),
    acCapacityKW: inverterKW,
    moduleCount: kitUnits,
    inverterCount: 1,
    inverterUnitKW: inverterKW,
    inverterModel: `All-in-one off-grid inverter ${inverterKW} kW (MPPT built-in)`,
    bessKWh: batteryKWh,
    dailyUsableKWh: dailyUsableKWh.toFixed(1),
    annualUsefulKWh: Math.round(annualUsefulKWh).toLocaleString(),
    annualEnergyMWh: (annualUsefulKWh / 1000).toFixed(2),
    excludedAreaSqM,
    tariffStatus: 'scenario',
    retailRateTHB: retailTHBPerKWh,
    moduleType: 'N-Type TOPCon 620W (demo)',
    protectionRelays: ['DC fuse + battery breaker', 'SPD Class II surge protection'],
    cashFlows,
    financials: {
      totalCapexTHB: Math.round(totalCapex), // unrounded — display value above loses ≤5k at 2 decimals
      totalCapexMillionTHB: (totalCapex / 1000000).toFixed(2),
      annualRevenueMillionTHB: (annualSavings / 1000000).toFixed(2),
      netAnnualCashflowMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      paybackYears: cfFin.paybackYears,
      paybackInterpolated: cfFin.paybackInterpolated,
      irrPercent: cfFin.irrPercent,
      npv25YrMillionTHB: cfFin.npv25YrMillionTHB
    },
    cashFlowModel: 'CF_y = S_retail,1×0.996^(y−1) − OPEX − Batt(y10,y20) — off-grid savings (retail offset), LFP refresh ~60% of battery share at years 10/20',
    esg: {
      co2TonsYear: co2AvoidedTonsPerYear.toFixed(1),
      treesEquivalent: Math.round(co2AvoidedTonsPerYear * 60).toLocaleString()
    }
  };
}

// 2. Agrivoltaics (farming + solar)
export function calculateAgrivoltaicsSpecs(landData) {
  const baseSolar = calculateSolarFarmSpecs(landData);
  const areaRai = landData.areaSqM / 1600;

  // Row spacing +40% and 3.0 m clearance → string count drops to 70% (same string size)
  const sd = baseSolar.stringDesign;
  const agriStringCount = Math.floor(sd.stringCount * 0.70);
  const agriInstalledPanels = agriStringCount * sd.stringSize;
  const dcCapacityMWp = (agriInstalledPanels * 620 / 1e6).toFixed(3); // [F-04] from actually installed panels
  const dcCapacityKWp = agriInstalledPanels * 620 / 1000;
  const dcRatio = parseFloat(dcCapacityMWp) / parseFloat(baseSolar.dcCapacityMWp);
  const annualEnergyMWh = Math.round(parseFloat(baseSolar.annualEnergyMWh.replace(/,/g, '')) * dcRatio); // F-09A same path as solar — no extra microclimate factor

  // [F-06]/[F-07] inverters recomputed from real agrivoltaics DC (must not reuse solar farm's)
  const agriInverterCount = Math.max(1, Math.round((dcCapacityKWp / 1.25) / 300));
  const agriAcCapacityMW = (agriInverterCount * 300) / 1000;
  const agriDcAcRatio = dcCapacityKWp / (agriInverterCount * 300);
  const agriTransformerKVA = getNextStandardTransformer((agriInverterCount * 300) / 0.95); // [F-14]
  const agriMvCurrentA = ((agriInverterCount * 300) / (Math.sqrt(3) * 22 * 0.95)).toFixed(1);

  // Cost of 3.0 m elevated structure with heavier hot-dip galvanized posts +25%
  const capexPerMWp = 25000000;
  const totalCapex = (dcCapacityKWp / 1000) * capexPerMWp; // use full kWp, not rounded MWp
  
  // Electricity revenue (FiT 2.1679 THB)
  const powerRevenue = annualEnergyMWh * 1000 * 2.1679;
  // Under-panel crop revenue (e.g., vanilla, andrographis, lingzhi, organic greens) ~160,000 THB/rai/yr
  const agriRevenue = areaRai * 160000;
  const totalAnnualRevenue = powerRevenue + agriRevenue;
  const opexPerYear = (totalCapex * 0.018) + (areaRai * 30000); // OPEX incl. crop care
  const netAnnualCashflow = totalAnnualRevenue - opexPerYear;

  // [F-24] split-mechanism cash flow: PV revenue degrades 0.4%/yr, crop revenue flat — no degradation on crops
  const AGRI_DEG = 0.004;
  const cashFlows = [-totalCapex];
  for (let y = 1; y <= 25; y++) {
    cashFlows.push(powerRevenue * Math.pow(1 - AGRI_DEG, y - 1) + agriRevenue - opexPerYear);
  }
  const cfFin = financeFromCashFlows(cashFlows);

  return {
    ...baseSolar,
    dcCapacityMWp,
    dcCapacityKWp: Math.round(dcCapacityKWp),
    acCapacityMW: agriAcCapacityMW.toFixed(3),
    inverterCount: agriInverterCount,
    actualDcAcRatio: agriDcAcRatio.toFixed(3),
    transformerRating: `${agriTransformerKVA} kVA, 22kV/0.4kV, Dyn11, ONAN (preliminary)`,
    transformerKVA: agriTransformerKVA,
    mvCurrentAmp: agriMvCurrentA,
    moduleCount: agriInstalledPanels.toLocaleString(),
    areaCandidatePanelCount: baseSolar.areaCandidatePanelCount,
    baseStringCount: sd.stringCount, // string count before agri reduction — used in F-03
    panelSpacingFactor: 0.70, // agrivoltaics layout assumption (crop not yet verified)
    stringDesign: { ...sd, stringCount: agriStringCount, installedPanelCount: agriInstalledPanels, leftoverPanels: 0 },
    annualEnergyMWh: annualEnergyMWh.toLocaleString(),
    capexPerMWpMillionTHB: (capexPerMWp / 1000000).toFixed(1),
    mountingStructure: 'Elevated mounting structure (3.0 m clearance) for tractors and crop work',
    cropsRecommended: 'Vanilla, andrographis, turmeric, mushrooms, hydroponic greens under shade',
    dualIncome: {
      powerRevenueMillionTHB: (powerRevenue / 1000000).toFixed(2),
      agriRevenueMillionTHB: (agriRevenue / 1000000).toFixed(2),
      totalRevenueMillionTHB: (totalAnnualRevenue / 1000000).toFixed(2)
    },
    financials: {
      totalCapexTHB: Math.round(totalCapex), // unrounded — display value above loses ≤5k at 2 decimals
      totalCapexMillionTHB: (totalCapex / 1000000).toFixed(2),
      annualRevenueMillionTHB: (totalAnnualRevenue / 1000000).toFixed(2),
      netAnnualCashflowMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      paybackYears: cfFin.paybackYears,
      paybackInterpolated: cfFin.paybackInterpolated,
      irrPercent: cfFin.irrPercent,
      npv25YrMillionTHB: cfFin.npv25YrMillionTHB
    },
    cashFlowModel: 'CF_y = R_PV,1×(1−0.004)^(y−1) + R_crop − OPEX — only PV revenue degrades; crop revenue flat (demo assumption)',
    cashFlows,
  };
}

// 3. EV Charging Plaza & Solar Canopy & BESS
export function calculateEVHubSpecs(landData) {
  const { areaSqM = 1600, roadWidthMeters = 8, provinceData = {} } = landData;
  const areaRai = areaSqM / 1600;

  // Charger count sized by area
  let dcFastChargerCount = 4; // base 4 cabinets (8 guns)
  if (areaRai >= 2) dcFastChargerCount = 8; // 16 guns
  if (areaRai >= 4) dcFastChargerCount = 12; // 24 guns

  // DC Superfast 180kW dual-gun cabinets (CCS2 + CCS2)
  const chargerPowerKW = 180;
  // [F-12] DC charger output → AC input via η=0.95
  const totalPeakEVLoadKW = (dcFastChargerCount * chargerPowerKW) / 0.95;

  // Solar canopy over parking (1 bay ~15 m² fits ~2.5 kWp)
  const parkingBays = dcFastChargerCount * 2 + 10; // incl. rest bays
  const solarCanopyKWp = Math.round(parkingBays * 2.8);

  // Co-located BESS for peak shaving and demand-charge reduction (~200–500 kWh)
  const bessKWh = dcFastChargerCount >= 8 ? 500 : 250;
  const bessPowerKW = bessKWh / 2; // C-rate 0.5C

  // Station transformer (diversity factor 0.70 — cars rarely charge at full power simultaneously, plus BESS support)
  // [F-13] DF 0.70 diversity assumption; [F-14] S = P/PF, PF=0.98
  const transformerKVA = getNextStandardTransformer(((totalPeakEVLoadKW * 0.70) - bessPowerKW) / 0.98);

  // Financial estimate (avg 6–8 cars per gun per day)
  const dailyCars = (dcFastChargerCount * 2) * 7;
  const avgKWhPerSession = 40; // 40 kWh per session (10% → 80%)
  const dailyKWhSold = dailyCars * avgKWhPerSession;
  const annualKWhSold = dailyKWhSold * 365;

  // Charging tariff (avg 7.50 THB/kWh)
  const sellRate = 7.50;
  // TOU electricity cost avg 4.30 THB/kWh with BESS + canopy management
  const costRate = 4.30;
  const marginPerKWh = sellRate - costRate;

  const annualChargingRevenue = annualKWhSold * sellRate;
  const annualElectricityCost = annualKWhSold * costRate;
  // Extra rent income from coffee shop / convenience store ~35,000 THB/month
  const commercialRentalRevenue = 35000 * 12;
  const netAnnualCashflow = (annualKWhSold * marginPerKWh) + commercialRentalRevenue - 450000; // less O&M

  // CAPEX: 180kW chargers (~1.1M THB each) + solar carport + BESS + transformer + controls
  const chargersCost = dcFastChargerCount * 1100000;
  const canopyCost = solarCanopyKWp * 28000;
  const bessCost = bessKWh * 9500;
  const transformerAndCivil = 1800000 + (dcFastChargerCount * 150000);
  const totalCapex = chargersCost + canopyCost + bessCost + transformerAndCivil;

  // [F-24] cash flow per charging-business nature: utilization ramp years 1–5
  // (EV market grows — 60→100% assumption) rather than generation degradation
  // + power-module refresh in year 10 (~10 yr life, ~25% of charger cost)
  const UTIL_RAMP = [0.60, 0.70, 0.80, 0.90, 1.00];
  const chargerMarginYear1 = annualKWhSold * marginPerKWh;
  const opexFixed = 450000;
  const cashFlows = [-totalCapex];
  for (let y = 1; y <= 25; y++) {
    const util = UTIL_RAMP[Math.min(y, UTIL_RAMP.length) - 1];
    const moduleRefresh = (y === 10) ? chargersCost * 0.25 : 0;
    cashFlows.push(chargerMarginYear1 * util + commercialRentalRevenue - opexFixed - moduleRefresh);
  }
  const cfFin = financeFromCashFlows(cashFlows);

  return {
    dcChargersCount: dcFastChargerCount,
    totalGuns: dcFastChargerCount * 2,
    chargerModel: 'DC Superfast 180kW Dual Gun (CCS2) Liquid-Cooled Ready',
    solarCanopyKWp,
    bessKWh,
    transformerRating: `${transformerKVA} kVA, 22kV / 400V, 3-Phase, Oil-immersed`,
    dailyCarsServiced: dailyCars,
    annualEnergyDispensedMWh: Math.round(annualKWhSold / 1000),
    utilizationRamp: UTIL_RAMP,
    financials: {
      totalCapexTHB: Math.round(totalCapex), // unrounded — display value above loses ≤5k at 2 decimals
      totalCapexMillionTHB: (totalCapex / 1000000).toFixed(2),
      annualRevenueMillionTHB: (annualChargingRevenue / 1000000).toFixed(2),
      netAnnualCashflowMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      netAnnualProfitMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      paybackYears: cfFin.paybackYears,
      paybackInterpolated: cfFin.paybackInterpolated,
      irrPercent: cfFin.irrPercent,
      npv25YrMillionTHB: cfFin.npv25YrMillionTHB
    },
    cashFlowModel: 'CF_y = M_charge×U_y + R_rent − OPEX − Refresh(yr10) — U_y = utilization 60→100% in years 1–5 (EV-market-growth assumption), not degradation',
    cashFlows,
    electricalFeatures: [
      'Dynamic Load Management (DLM) power control',
      'Type-B RCD shock/leakage protection and Class I+II surge protection',
      'OCPP 1.6J / 2.0.1 payment-ready — works with all charging apps'
    ]
  };
}

// 4. Grid-Scale BESS Farm
export function calculateBESSFarmSpecs(landData) {
  const { areaSqM = 1600 } = landData;
  const areaRai = areaSqM / 1600;

  // 40 ft LFP containers ~3.72 MWh each
  // ~2–4 containers per rai incl. NFPA 855 3 m safety clearance
  const containerCount = Math.min(Math.max(1, Math.floor(areaRai * 2)), 8);
  const capacityMWh = containerCount * 3.72;
  const powerMW = capacityMWh / 2; // Duration 2 hours (0.5C)

  // Grid-scale BESS CAPEX ~10,500,000 THB/MWh
  const totalCapex = capacityMWh * 10500000;
  // Revenue from capacity availability + arbitrage ~1.8M THB/MWh/yr
  const annualRevenue = capacityMWh * 1800000;
  const opexPerYear = totalCapex * 0.02;
  const netAnnualCashflow = annualRevenue - opexPerYear;

  // [F-24] cash flow per BESS nature: revenue fades with LFP cell capacity fade
  // (~2%/yr assumption, unlike PV degradation) + year-15 augmentation
  // (~35% of original CAPEX to maintain capacity — declared assumption)
  const BESS_FADE = 0.02;
  const cashFlows = [-totalCapex];
  for (let y = 1; y <= 25; y++) {
    const augment = (y === 15) ? totalCapex * 0.35 : 0;
    cashFlows.push(annualRevenue * Math.pow(1 - BESS_FADE, y - 1) - opexPerYear - augment);
  }
  const cfFin = financeFromCashFlows(cashFlows);

  return {
    containerCount,
    capacityMWh: capacityMWh.toFixed(1),
    powerMW: powerMW.toFixed(1),
    batteryType: 'Lithium Iron Phosphate (LFP) Grade-A Prism Cells',
    coolingSystem: 'Liquid Cooling Thermal Management System (keeps cell ΔT < 2.5°C)',
    fireSuppression: 'Novec 1230 / Aerosol with 3-stage smoke and gas detection',
    pcsInverter: `Bi-directional PCS ${powerMW.toFixed(1)} MW (Eff > 98.9%)`,
    financials: {
      totalCapexTHB: Math.round(totalCapex), // unrounded — display value above loses ≤5k at 2 decimals
      totalCapexMillionTHB: (totalCapex / 1000000).toFixed(2),
      annualRevenueMillionTHB: (annualRevenue / 1000000).toFixed(2),
      netAnnualCashflowMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      netAnnualProfitMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      paybackYears: cfFin.paybackYears,
      paybackInterpolated: cfFin.paybackInterpolated,
      irrPercent: cfFin.irrPercent,
      npv25YrMillionTHB: cfFin.npv25YrMillionTHB
    },
    cashFlowModel: 'CF_y = R_cap×(1−0.02)^(y−1) − OPEX − Augmentation(yr15 ~35% CAPEX) — 2%/yr fade from LFP cell capacity fade, not PV degradation',
    cashFlows,
  };
}

// 5. Floating Solar
export function calculateFloatingSolarSpecs(landData) {
  const base = calculateSolarFarmSpecs(landData);
  // Water-surface cooling effect lifts panel yield ~8%
  const annualEnergyMWh = Math.round(parseFloat(base.annualEnergyMWh.replace(/,/g, '')) * 1.08);
  const totalCapex = parseFloat(base.financials.totalCapexMillionTHB) * 1.15 * 1000000; // floats and underwater cable +15%
  const annualRevenue = annualEnergyMWh * 1000 * 2.1679;
  const opexPerYear = totalCapex * 0.016;
  const netAnnualCashflow = annualRevenue - opexPerYear;

  // [F-24] floating's own cash flow — must not reuse solar base (different CAPEX/revenue)
  // 0.4%/yr degradation same as solar since it uses identical PV modules (reasoned, not a random default)
  const cashFlows = [-totalCapex];
  for (let y = 1; y <= 25; y++) {
    cashFlows.push(annualRevenue * Math.pow(1 - 0.004, y - 1) - opexPerYear);
  }
  const cfFin = financeFromCashFlows(cashFlows);

  // Evaporation saving ~1,200 m³/rai/yr
  const waterSavedCubicMeters = Math.round((landData.areaSqM / 1600) * 1200);

  return {
    ...base,
    annualEnergyMWh: annualEnergyMWh.toLocaleString(),
    pontoonType: 'HDPE Food-grade UV Stabilized (25-yr warranty)',
    waterSavedM3Year: waterSavedCubicMeters.toLocaleString(),
    financials: {
      totalCapexTHB: Math.round(totalCapex), // unrounded — display value above loses ≤5k at 2 decimals
      totalCapexMillionTHB: (totalCapex / 1000000).toFixed(2),
      annualRevenueMillionTHB: (annualRevenue / 1000000).toFixed(2),
      netAnnualCashflowMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      paybackYears: cfFin.paybackYears,
      paybackInterpolated: cfFin.paybackInterpolated,
      irrPercent: cfFin.irrPercent,
      npv25YrMillionTHB: cfFin.npv25YrMillionTHB
    },
    cashFlowModel: 'CF_y = R_PV,1×(1−0.004)^(y−1) − OPEX — same PV degradation as solar but computed from floating-solar CAPEX/revenue (higher float cost)',
    cashFlows,
  };
}

// 6. Biogas / Biomass
export function calculateBiogasSpecs(landData) {
  const areaRai = landData.areaSqM / 1600;
  // ~1.0 MW plant (or size to fit)
  const generatorCapacityKW = Math.min(Math.max(500, Math.round(areaRai * 200)), 2000);
  const generatorCapacityMW = (generatorCapacityKW / 1000).toFixed(2);
  
  // 24/7 generation (85% capacity factor)
  const annualEnergyMWh = Math.round(generatorCapacityKW * 8760 * 0.85 / 1000);
  // ERC biogas/biomass FiT avg ~3.13 THB/kWh (with FiT premium)
  const fitRate = 3.13;
  const capexPerKW = 65000; // ~65,000 THB/kW
  const totalCapex = generatorCapacityKW * capexPerKW;
  const annualRevenue = annualEnergyMWh * 1000 * fitRate;
  const opexPerYear = totalCapex * 0.07; // gas-engine maintenance and feedstock
  const netAnnualCashflow = annualRevenue - opexPerYear;

  // [F-24] baseload-plant cash flow: flat output over life (no PV-style
  // degradation — engines hold output while maintained) but major gas-engine
  // overhauls every ~8 yrs (≈60,000 run-hours, assumed ~8% CAPEX each)
  const OVERHAUL_YEARS = new Set([8, 16, 24]);
  const cashFlows = [-totalCapex];
  for (let y = 1; y <= 25; y++) {
    const overhaul = OVERHAUL_YEARS.has(y) ? totalCapex * 0.08 : 0;
    cashFlows.push(annualRevenue - opexPerYear - overhaul);
  }
  const cfFin = financeFromCashFlows(cashFlows);

  return {
    generatorCapacityKW,
    generatorCapacityMW,
    generatorType: 'Biogas Lean-Burn Synchronous Gas Engine Generator 1500 RPM',
    digesterVolumeM3: Math.round(generatorCapacityKW * 4.5).toLocaleString(),
    annualEnergyMWh: annualEnergyMWh.toLocaleString(),
    capacityFactor: '85% (continuous 24h output as a baseload plant)',
    financials: {
      totalCapexTHB: Math.round(totalCapex), // unrounded — display value above loses ≤5k at 2 decimals
      totalCapexMillionTHB: (totalCapex / 1000000).toFixed(2),
      annualRevenueMillionTHB: (annualRevenue / 1000000).toFixed(2),
      netAnnualCashflowMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      netAnnualProfitMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      paybackYears: cfFin.paybackYears,
      paybackInterpolated: cfFin.paybackInterpolated,
      irrPercent: cfFin.irrPercent,
      npv25YrMillionTHB: cfFin.npv25YrMillionTHB
    },
    cashFlowModel: 'CF_y = R_FiT − OPEX − Overhaul(yrs 8/16/24 ~8% CAPEX) — flat baseload output, no PV-style degradation, periodic engine overhauls',
    cashFlows,
  };
}

// --- Engineering & finance helpers ---
function getNextStandardTransformer(requiredKVA) {
  const standardRatings = [160, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000];
  for (const rating of standardRatings) {
    if (rating >= requiredKVA) return rating;
  }
  return Math.ceil(requiredKVA / 1000) * 1000;
}

// NPV from the actual cash-flow array [F-27] — same basis as chart/report
function npvFromCashFlows(cashFlows, discountRate = 0.06) {
  let npv = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    npv += cashFlows[t] / Math.pow(1 + discountRate, t);
  }
  return npv;
}

// IRR from the actual cash-flow array [F-28] — bisection; null if no sign change
function irrFromCashFlows(cashFlows) {
  const npv = r => cashFlows.reduce((s, cf, t) => s + cf / Math.pow(1 + r, t), 0);
  if (npv(-0.99) * npv(10) >= 0) return null;
  let lo = -0.99, hi = 10;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    npv(mid) > 0 ? lo = mid : hi = mid;
  }
  return (lo + hi) / 2 * 100;
}

// [F-26/27/28] all financial indicators from one cash-flow array — shared with chart/table
function financeFromCashFlows(cashFlows) {
  let cum = cashFlows[0], paybackYear = null;
  for (let y = 1; y < cashFlows.length && paybackYear === null; y++) {
    cum += cashFlows[y];
    if (cum >= 0) paybackYear = y;
  }
  // interpolated payback (linear within the year — assumes steady cash)
  let paybackInterp = null;
  if (paybackYear !== null && paybackYear > 0 && cashFlows[paybackYear] > 0) {
    const prevCcf = cashFlows.slice(0, paybackYear).reduce((a, b) => a + b, 0);
    paybackInterp = (paybackYear - 1) + Math.abs(prevCcf) / cashFlows[paybackYear];
  }
  const npvValue = npvFromCashFlows(cashFlows);
  const irrValue = irrFromCashFlows(cashFlows);
  return {
    paybackYears: paybackYear !== null ? String(paybackYear) : 'No payback within 25 yrs',
    paybackInterpolated: paybackInterp !== null ? paybackInterp.toFixed(1) : '—',
    npv25YrMillionTHB: (npvValue / 1000000).toFixed(2),
    irrPercent: irrValue === null ? 'N/A' : irrValue.toFixed(1),
  };
}
