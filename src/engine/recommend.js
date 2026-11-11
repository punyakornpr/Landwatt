// Recommendation Engine: screen by constraints → score by criteria → explain reasons
// The score indicates "initial suitability per system criteria", not odds of success or profit

import { evaluateLandFeasibility } from '../utils/engineeringCalculations.js';

export const STATUS = {
  great:        { label: 'Great fit',       color: 'bg-energy-100 text-energy-800 border-energy-200', dot: 'bg-energy-500' },
  worth:        { label: 'Worth exploring', color: 'bg-electric-100 text-electric-800 border-electric-200', dot: 'bg-electric-500' },
  insufficient: { label: 'Needs more data', color: 'bg-volt-100 text-volt-800 border-volt-200', dot: 'bg-volt-500' },
  no:           { label: 'Not recommended', color: 'bg-zinc-100 text-zinc-500 border-zinc-200', dot: 'bg-zinc-400' },
};

export const BUDGET_MAX_THB = {
  'under-50k': 50000,
  '50-150k': 150000,
  '150-500k': 500000,
  'under-500k': 500000, // legacy id from older saves — same cap as 150-500k
  '0.5-2m': 2000000,
  '2-5m': 5000000,
  '5-10m': 10000000,
  '10-20m': 20000000,
  '20-50m': 50000000,
  'over-50m': Infinity,
  'over-10m': Infinity, // legacy id from older saves — same as over-50m
  unsure: Infinity,
};

// friendly meta per project type
export const PROJECT_FRIENDLY = {
  'solar-farm': {
    name: 'Solar power generation',
    sub: 'Solar Farm',
    icon: 'Sun',
    oneLiner: 'Ground-mounted panels to sell electricity or cut your power bills long-term',
  },
  'small-solar': {
    name: 'Small solar for own use',
    sub: 'Rooftop / Backyard Solar',
    icon: 'Sun',
    oneLiner: 'A few panels sized to a modest budget — cuts your own power bill, expandable later',
  },
  'solar-utility-kit': {
    name: 'Off-grid solar power kit',
    sub: 'Solar Utility Kit',
    icon: 'BatteryCharging',
    oneLiner: 'Panels + battery for lights, fans or a small pump — works with no grid line, fits the smallest budget',
  },
  'ev-charging-hub': {
    name: 'EV charging station',
    sub: 'EV Charging Station',
    icon: 'Zap',
    oneLiner: 'Fast EV charging with a solar canopy and battery to trim electricity costs',
  },
  'agrivoltaics': {
    name: 'Farming under solar panels',
    sub: 'Agrivoltaics',
    icon: 'Sprout',
    oneLiner: 'Elevated panels let crops grow below — earning from both crops and power',
  },
  'grid-bess': {
    name: 'Battery energy storage',
    sub: 'Battery Storage (BESS)',
    icon: 'BatteryCharging',
    oneLiner: 'Large battery containers for storing and dispatching power — best with a clear business load',
  },
  'floating-solar': {
    name: 'Floating solar',
    sub: 'Floating Solar',
    icon: 'Waves',
    oneLiner: 'Panels on floats over a pond or reservoir — puts unused water surface to work',
  },
  'biomass-biogas': {
    name: 'Biogas power',
    sub: 'Biogas / Biomass',
    icon: 'Flame',
    oneLiner: 'Turns farm waste or manure into biogas for power — needs a steady feedstock supply',
  },
};

// Reasons/cautions derived from the actual land data
function reasonsFor(projectId, land) {
  const areaRai = land.areaSqM / 1600;
  const ghi = land.provinceData?.ghi || 5.0;
  const reasons = [];
  const cautions = [];

  switch (projectId) {
    case 'solar-farm':
      if (ghi >= 5.1) reasons.push(`Good sun here (avg irradiance ${ghi} kWh/m²/day) — well suited to solar generation`);
      if (areaRai >= 2) reasons.push(`${areaRai.toFixed(1)} rai is enough for panels plus maintenance access`);
      if (land.landType === 'flat') reasons.push('You described the land as flat/open — good for laying out arrays (on-site shading not yet surveyed)');
      if (land.hasShading === null) cautions.push('Shading (trees/buildings) not yet known — actual yield and usable area may be lower than estimated');
      if (land.gridDistanceMeters > 500) cautions.push(`The grid connection is far (~${land.gridDistanceMeters} m) — line-extension costs may apply`);
      if (areaRai < 2) cautions.push('Small plot — system size will be limited; better for self-consumption than commercial power sales');
      cautions.push('Selling power to the utility requires an interconnection application and may face quota limits');
      break;
    case 'small-solar':
      if (ghi >= 5.0) reasons.push(`Good sun here (avg irradiance ${ghi} kWh/m²/day) — even a few panels produce useful power`);
      reasons.push('The system is sized to your budget — start small and expand later if it works');
      if (areaRai < 0.5) reasons.push('Works on a small plot or rooftop where utility-scale options do not fit');
      cautions.push('Savings depend on how much power you actually use during daylight hours');
      cautions.push('Ask the utility (PEA/MEA) about rules for connecting a small system to the meter');
      break;
    case 'solar-utility-kit':
      reasons.push('Standalone kit — works with no grid connection at all');
      if (land.gridDistanceMeters > 500) reasons.push(`The power line is ~${land.gridDistanceMeters} m away — off-grid avoids line-extension cost`);
      reasons.push('Fits a very small budget — a single unit starts around 35,000 THB');
      cautions.push('Powers lights, fans, phone charging or a small pump — not heavy loads like air-con');
      cautions.push('The battery needs replacing roughly every 10 years — already counted in the estimate');
      break;
    case 'ev-charging-hub':
      if (land.roadType === 'main') reasons.push('Frontage on a main road with easy traffic access — ideal for a charging station');
      if (land.roadWidthMeters >= 10) reasons.push('Wide frontage road allows easy vehicle entry and drive aisles');
      if ((land.provinceData?.evPotential || 0) >= 0.85) reasons.push(`${land.provinceData?.nameEn || land.provinceData?.name} has relatively high EV adoption`);
      if (areaRai >= 1) reasons.push('Enough space for chargers, parking and a rest area');
      cautions.push('Revenue depends on actual traffic — survey vehicle counts at the site before deciding');
      cautions.push('Charging demand and grid hosting capacity are unverified — the entered line distance is only an estimate; contact the utility');
      if (land.roadType !== 'main') cautions.push('Not on a main road — customer location needs more thought');
      break;
    case 'agrivoltaics':
      if (land.landType === 'agri') reasons.push('The plot is already farmland — a natural fit for elevated panels (crop suitability must be verified)');
      if (ghi >= 4.9) reasons.push('Enough sun for both power output and crop growth under partial shade');
      if (areaRai >= 1.5 && areaRai <= 20) reasons.push('Plot size suits a mixed farming model');
      cautions.push('Elevated structures cost more than ground-mount, and shade-tolerant crops must be chosen');
      cautions.push('Crop revenue depends on care and market prices — it is not a guaranteed figure');
      break;
    case 'grid-bess':
      if (land.gridDistanceMeters <= 200) reasons.push('Close to the grid corridor — easy interconnection');
      reasons.push('Uses little land per project value compared to alternatives');
      cautions.push('A battery alone generates no power — you need a source or clear business case (backup, peak shaving)');
      cautions.push('Grid-services revenue requires contracts with utilities/operators — cannot be estimated from land alone');
      break;
    case 'floating-solar':
      if (land.hasWaterBody || land.landType === 'pond') reasons.push('There is a water body on the plot — unused water surface can host arrays');
      if (ghi >= 5.0) reasons.push('Good sun, and the water surface helps panels run slightly cooler');
      cautions.push('Floats and mooring cost more than ground-mount, and water-use rights must be checked');
      break;
    case 'biomass-biogas':
      if (land.hasAgriculturalWaste) reasons.push('You indicated farm waste is available — potential feedstock, but volume and continuity are unverified');
      reasons.push('Produces power around the clock regardless of weather (if feedstock is sufficient)');
      cautions.push('A real feedstock survey is required: daily volume, year-round continuity and transport cost before concluding feasibility');
      cautions.push('Odor management and a factory license must be handled');
      break;
  }
  return { reasons, cautions };
}

// Hard screening before scoring
function screening(projectId, land, goals) {
  const areaRai = land.areaSqM / 1600;
  const aims = goals?.aims || [];

  switch (projectId) {
    case 'floating-solar':
      if (!land.hasWaterBody && land.landType !== 'pond')
        return { status: 'no', blockReason: 'No water body on the plot — floating solar needs a pond or reservoir' };
      return null;
    case 'biomass-biogas':
      if (!land.hasAgriculturalWaste)
        return { status: 'insufficient', blockReason: 'No continuous biomass feedstock data (farm waste/manure) for generation' };
      return null;
    case 'ev-charging-hub':
      if (land.roadType === 'dirt')
        return { status: 'no', blockReason: 'Access is a dirt/track road — hard for ordinary cars; not suitable for a charging station' };
      if (areaRai < 0.3)
        return { status: 'no', blockReason: 'Too small for chargers, parking and drive aisles' };
      if (land.landType === 'pond')
        return { status: 'insufficient', blockReason: 'Most of the plot is water — remaining dry land must be checked first' };
      return null;
    case 'grid-bess':
      if (!aims.includes('backup') && !aims.includes('income'))
        return { status: 'insufficient', blockReason: 'A standalone battery needs a clear use case (backup/energy business) — pick a related goal to evaluate further' };
      if (land.gridDistanceMeters > 800)
        return { status: 'insufficient', blockReason: 'Very far from the grid — interconnection must be checked with the utility first' };
      return null;
    case 'small-solar':
      if (land.landType === 'pond')
        return { status: 'insufficient', blockReason: 'Mostly water — panels would need a roof or a structure on dry land' };
      if (areaRai < 0.03)
        return { status: 'no', blockReason: 'Too small even for a few panels' };
      return null;
    case 'solar-utility-kit':
      if (land.landType === 'pond')
        return { status: 'insufficient', blockReason: 'Mostly water — the kit needs a frame or roof on dry land' };
      if (land.areaSqM < 15)
        return { status: 'no', blockReason: 'No space for even a single-panel kit' };
      return null;
    case 'solar-farm':
      if (areaRai < 0.5)
        return { status: 'no', blockReason: 'Too small for a meaningful ground-mounted array' };
      return null;
    case 'agrivoltaics':
      if (areaRai < 0.5)
        return { status: 'no', blockReason: 'Too small for combined farming and solar' };
      if (land.landType === 'pond')
        return { status: 'no', blockReason: 'Most of the plot is water — unsuitable for under-panel crops' };
      return null;
  }
  return null;
}

// Score adjustment by user goals
function goalBoost(projectId, aims) {
  const map = {
    'solar-farm': ['income', 'save', 'unsure'],
    'small-solar': ['save', 'backup', 'income', 'unsure'],
    'solar-utility-kit': ['backup', 'save', 'unsure'],
    'ev-charging-hub': ['ev', 'income'],
    'agrivoltaics': ['farm', 'income'],
    'grid-bess': ['backup'],
    'floating-solar': ['income'],
    'biomass-biogas': ['farm', 'income'],
  };
  if (!aims.length) return 0;
  const matched = (map[projectId] || []).some(a => aims.includes(a));
  return matched ? 12 : -8;
}

// Confidence level of the data used for evaluation
export function dataConfidence(land) {
  const missing = [];
  if (!land.provinceId) missing.push('land location');
  if (!land.areaSqM || land.areaSqM <= 0) missing.push('land size');
  if (land.landTypeUnknown) missing.push('land type');
  if (land.gridUnknown) missing.push('distance to power line');
  if (land.roadType == null) missing.push('road access');
  const level = missing.length === 0 ? 'High' : missing.length <= 2 ? 'Medium' : 'Low';
  return { level, missing };
}

export function recommendProjects(land, goals) {
  const raw = evaluateLandFeasibility({ ...land, provinceData: land.provinceData || {} });
  const aims = goals?.aims || [];
  const confidence = dataConfidence(land);

  const results = Object.keys(PROJECT_FRIENDLY).map(id => {
    const screened = screening(id, land, goals);
    let score = Math.round(Math.min(98, Math.max(10, (raw[id] || 50) + goalBoost(id, aims))));
    // Heavy missing data caps the score so it can't exceed data confidence
    const scoreCap = confidence.level === 'Low' ? 70 : confidence.level === 'Medium' ? 85 : 98;
    score = Math.min(score, scoreCap);
    let status = screened?.status || (score >= 72 ? 'great' : score >= 52 ? 'worth' : score >= 38 ? 'insufficient' : 'no');
    if (confidence.level === 'Low' && status === 'great') status = 'worth';
    const { reasons, cautions } = reasonsFor(id, land);
    if (screened?.blockReason) reasons.unshift(screened.blockReason);
    return { id, score, status, reasons, cautions, confidence };
  }).sort((a, b) => {
    const order = { great: 0, worth: 1, insufficient: 2, no: 3 };
    return order[a.status] - order[b.status] || b.score - a.score || a.id.localeCompare(b.id); // tie-break deterministic
  });

  return results;
}

export const GOAL_OPTIONS = [
  { id: 'income', label: 'Earn income from my land', icon: 'TrendingUp' },
  { id: 'save', label: 'Cut electricity bills for home or business', icon: 'PiggyBank' },
  { id: 'ev', label: 'Start a new business like EV charging', icon: 'Zap' },
  { id: 'farm', label: 'Keep farming the land too', icon: 'Sprout' },
  { id: 'backup', label: 'Have my own power / backup supply', icon: 'BatteryCharging' },
  { id: 'unsure', label: 'No idea yet — show me options', icon: 'Lightbulb' },
];

export const BUDGET_OPTIONS = [
  { id: 'under-50k', label: 'Under 50,000 THB' },
  { id: '50-150k', label: '50,000 – 150,000 THB' },
  { id: '150-500k', label: '150,000 – 500,000 THB' },
  { id: '0.5-2m', label: '500,000 – 2 million THB' },
  { id: '2-5m', label: '2 – 5 million THB' },
  { id: '5-10m', label: '5 – 10 million THB' },
  { id: '10-20m', label: '10 – 20 million THB' },
  { id: '20-50m', label: '20 – 50 million THB' },
  { id: 'over-50m', label: 'Over 50 million THB' },
  { id: 'unsure', label: 'Not sure yet' },
];

export function budgetCaution(projectId, budgetId, capexTHB) {
  const max = BUDGET_MAX_THB[budgetId];
  if (max == null || !isFinite(max) || !capexTHB) return null;
  if (capexTHB > max * 1.2) return `This plan's estimated investment is above your stated budget — it may need resizing or staging`;
  return null;
}
