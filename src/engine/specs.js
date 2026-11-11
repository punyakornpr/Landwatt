// Dispatch engineering calculations per project type + summarize in plain language
import {
  calculateSolarFarmSpecs,
  calculateAgrivoltaicsSpecs,
  calculateEVHubSpecs,
  calculateBESSFarmSpecs,
  calculateFloatingSolarSpecs,
  calculateBiogasSpecs,
} from '../utils/engineeringCalculations.js';

export function getSpecs(projectId, land) {
  const safeLand = { ...land, provinceData: land.provinceData || {} };
  switch (projectId) {
    case 'solar-farm': return calculateSolarFarmSpecs(safeLand);
    case 'agrivoltaics': return calculateAgrivoltaicsSpecs(safeLand);
    case 'ev-charging-hub': return calculateEVHubSpecs(safeLand);
    case 'grid-bess': return calculateBESSFarmSpecs(safeLand);
    case 'floating-solar': return calculateFloatingSolarSpecs(safeLand);
    case 'biomass-biogas': return calculateBiogasSpecs(safeLand);
    default: return calculateSolarFarmSpecs(safeLand);
  }
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
  const areaRai = land.areaSqM / 1600;
  const payback = fin.paybackYears && M(fin.paybackYears) > 0 && M(fin.paybackYears) < 60
    ? `${fin.paybackYears} yrs` : 'Cannot estimate yet';

  let areaUsed, benefit;
  switch (projectId) {
    case 'solar-farm':
    case 'agrivoltaics':
    case 'floating-solar':
      areaUsed = `Most of the plot (~${(areaRai * 0.78).toFixed(1)} rai usable)`;
      benefit = `Generates about ${specs.annualEnergyMWh} MWh/yr — equal to ~${Math.round(M(specs.annualEnergyMWh) * 1000 / 3000).toLocaleString()} homes`;
      break;
    case 'ev-charging-hub':
      areaUsed = `Most of the plot (chargers + parking + rest area)`;
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
    'ev-charging-hub': ['Survey real traffic and nearby competitors', 'Apply to install charging under utility standards'],
    'agrivoltaics': ['Trial shade-tolerant crops on a small patch first', 'Check rules for combining farmland with structures'],
    'grid-bess': ['Secure a service buyer / clear contract before investing', 'Verify battery safety standards with regulators'],
    'floating-solar': ['Verify water-use rights and actual pond depth', 'Assess year-round water level variation'],
    'biomass-biogas': ['Get contracted year-round feedstock volume', 'Obtain a factory license and manage odor with the community'],
  };
  return [...common, ...(per[projectId] || [])];
}
