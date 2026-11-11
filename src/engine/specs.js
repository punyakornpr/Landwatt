// Dispatch engineering calculations per project type + summarize in plain language
import {
  calculateSolarFarmSpecs,
  calculateSmallSolarSpecs,
  calculateSolarKitSpecs,
  calculateAgrivoltaicsSpecs,
  calculateEVHubSpecs,
  calculateBESSFarmSpecs,
  calculateFloatingSolarSpecs,
  calculateBiogasSpecs,
} from '../utils/engineeringCalculations.js';

function computeSpecs(projectId, safeLand) {
  switch (projectId) {
    case 'solar-farm': return calculateSolarFarmSpecs(safeLand);
    case 'small-solar': return calculateSmallSolarSpecs(safeLand);
    case 'solar-utility-kit': return calculateSolarKitSpecs(safeLand);
    case 'agrivoltaics': return calculateAgrivoltaicsSpecs(safeLand);
    case 'ev-charging-hub': return calculateEVHubSpecs(safeLand);
    case 'grid-bess': return calculateBESSFarmSpecs(safeLand);
    case 'floating-solar': return calculateFloatingSolarSpecs(safeLand);
    case 'biomass-biogas': return calculateBiogasSpecs(safeLand);
    default: return calculateSolarFarmSpecs(safeLand);
  }
}

export function getSpecs(projectId, land, budgetMaxTHB = null) {
  const safeLand = { ...land, provinceData: land.provinceData || {} };
  const specs = computeSpecs(projectId, safeLand);
  if (!budgetMaxTHB || !isFinite(budgetMaxTHB)) return specs;
  const rawCapex = (f) => f?.totalCapexTHB ?? parseFloat(f?.totalCapexMillionTHB) * 1e6;
  const capex = rawCapex(specs?.financials);
  if (!capex || capex <= budgetMaxTHB) return specs;
  // All designs size from land area — shrink the working area until the build fits the budget.
  // Iterate (≤16 passes): quantization and size caps make CAPEX non-proportional, so one
  // linear guess can overshoot. 0.92 margin per pass; floor ≈ the smallest area that
  // still yields a nonzero build per design (agrivoltaics drops 30% of base strings,
  // so it needs ≥2 base strings ≈ 220 m²).
  const minAreaSqM = { 'small-solar': 34, 'agrivoltaics': 220, 'solar-utility-kit': 15 }[projectId] || 120;
  let areaSqM = safeLand.areaSqM, specs2 = specs, capex2 = capex, prevCapex = Infinity;
  for (let i = 0; i < 16 && capex2 > budgetMaxTHB; i++) {
    // Stuck at a size cap → CAPEX flat → budget ratio shrinks too slowly; halve instead.
    const ratio = capex2 === prevCapex ? 0.5 : (budgetMaxTHB / capex2) * 0.92;
    prevCapex = capex2;
    areaSqM = Math.max(minAreaSqM, areaSqM * ratio);
    specs2 = computeSpecs(projectId, { ...safeLand, areaSqM });
    if (!specs2?.financials) return specs;
    capex2 = rawCapex(specs2.financials);
  }
  specs2.budgetFit = {
    resized: true,
    usedAreaSqM: Math.round(areaSqM),
    usedAreaRai: (areaSqM / 1600).toFixed(2),
    originalCapexMillionTHB: (capex / 1e6).toFixed(2),
    stillOverBudget: !(capex2 > 0) || capex2 > budgetMaxTHB,
  };
  return specs2;
}

const M = (v) => parseFloat(String(v).replace(/,/g, '')) || 0;

function capexRange(fin) {
  const capex = M(fin?.totalCapexMillionTHB);
  if (!capex) return null;
  return { low: capex * 0.85, high: capex * 1.2, mid: capex };
}

// The 4 main cards on the plan page: investment / land used / benefit / payback
export function friendlySummary(projectId, specs, land) {
  const fin = specs.financials || {};
  const capex = capexRange(fin);
  const areaRai = (specs.budgetFit?.resized ? specs.budgetFit.usedAreaSqM : land.areaSqM) / 1600;
  const plotShare = specs.budgetFit?.resized ? 'Part of the plot' : 'Most of the plot';
  const payback = fin.paybackYears && M(fin.paybackYears) > 0 && M(fin.paybackYears) < 60
    ? `${fin.paybackYears} yrs` : 'Cannot estimate yet';

  let areaUsed, benefit;
  switch (projectId) {
    case 'solar-farm':
    case 'agrivoltaics':
    case 'floating-solar':
      areaUsed = `${plotShare} (~${(areaRai * 0.78).toFixed(1)} rai usable)`;
      benefit = `Generates about ${specs.annualEnergyMWh} MWh/yr — equal to ~${Math.round(M(specs.annualEnergyMWh) * 1000 / 3000).toLocaleString()} homes`;
      break;
    case 'small-solar':
      areaUsed = `~${((specs.stringDesign?.installedPanelCount || 0) * 4 / 1600).toFixed(2)} rai (rooftop or a land corner)`;
      benefit = `Offsets your own power bill — generates ~${specs.annualEnergyMWh} MWh/yr`;
      break;
    case 'solar-utility-kit':
      areaUsed = `~${((specs.kitUnits || 1) * 12 / 1600).toFixed(2)} rai (a small frame or roof)`;
      benefit = `Powers lights/fans/a small pump — ~${specs.dailyUsableKWh} kWh usable per day`;
      break;
    case 'ev-charging-hub':
      areaUsed = `${plotShare} (chargers + parking + rest area)`;
      benefit = `Serves ~${specs.dailyCarsServiced} cars/day or sells ~${specs.annualEnergyDispensedMWh} MWh/yr`;
      break;
    case 'grid-bess':
      areaUsed = `About ${(areaRai * 0.5).toFixed(1)} rai (containers + clearances)`;
      benefit = `Stores ${specs.capacityMWh} MWh, delivers ${specs.powerMW} MW`;
      break;
    case 'biomass-biogas':
      areaUsed = `About ${(areaRai * 0.4).toFixed(1)} rai (digesters + powerhouse)`;
      benefit = `Continuous output ~${specs.annualEnergyMWh} MWh/yr`;
      break;
    default:
      areaUsed = '—'; benefit = '—';
  }

  return { capex, areaUsed, benefit, payback };
}

// Pre-investment checklist in plain language
export function realityChecklist(projectId) {
  const common = [
    'Survey the site and verify the title deed / land-use rights',
    'Ask the local utility (PEA/MEA) about the interconnection point and conditions',
  ];
  const per = {
    'solar-farm': ['Check zoning / land-use rules with the local authority', 'Apply for construction / land-grading permits under local law'],
    'small-solar': ['Check the roof/structure can bear panel weight and has no daytime shading', 'Ask the utility (PEA/MEA) about small-system connection rules and metering'],
    'solar-utility-kit': ['List the loads it must run (lights, fans, pump) — that sets the kit size', 'Keep the battery shaded and ventilated; plan a replacement around year 10'],
    'ev-charging-hub': ['Survey real traffic and nearby competitors', 'Apply to install charging under utility standards'],
    'agrivoltaics': ['Trial shade-tolerant crops on a small patch first', 'Check rules for combining farmland with structures'],
    'grid-bess': ['Secure a service buyer / clear contract before investing', 'Verify battery safety standards with regulators'],
    'floating-solar': ['Verify water-use rights and actual pond depth', 'Assess year-round water level variation'],
    'biomass-biogas': ['Get contracted year-round feedstock volume', 'Obtain a factory license and manage odor with the community'],
  };
  return [...common, ...(per[projectId] || [])];
}
