// Electrical-engineering land-use project profiles for vacant-land development
// Comprehensive Electrical Engineering Land-Use Project Profiles

export const EE_PROJECTS = [
  {
    id: 'solar-farm',
    title: 'Ground-Mounted Solar Farm',
    shortTitle: 'Solar Farm (ground)',
    category: 'renewable',
    icon: 'Sun',
    accentColor: 'amber',
    tagline: 'Turn vacant land into a clean power source sold to PEA/MEA or an industrial estate',
    suitableAreaMinRai: 2, // from ~2 rai (scalable)
    preferredZoning: ['green', 'yellow', 'purple', 'light_green'],
    standards: ['EIT 022013-64 (solar installation standard)', 'PEA Interconnection Code 2021', 'ERC Regulations 2022-2030'],
    description: 'Develop the site for a ground-mounted solar PV system interconnected to the medium-voltage distribution network (22kV / 33kV) or higher, selling power via Utility Green Tariff (UGT), Feed-in Tariff (FiT) or a Private PPA with neighboring factories',
    keyBenefits: [
      'Steady cash flow for 20-25 years (PPA/FiT)',
      'Cost per watt keeps falling with N-Type TOPCon / Bifacial technology',
      'Low O&M compared to other generation types',
      'Cuts greenhouse-gas emissions and earns carbon credits (T-VER)'
    ],
    technicalHighlights: [
      'Bifacial 620W+ N-Type modules harvesting both sides (+5-15% albedo gain)',
      'String inverters (grid-tie) 250-330 kW at >98.8% efficiency',
      'Step-up transformer 0.8kV / 22kV (or 33kV) with VCB / 50-51 protection relays',
      'SCADA / weather station monitoring module temperature and irradiance (pyranometer)'
    ]
  },
  {
    id: 'agrivoltaics',
    title: 'Agrivoltaics / Dual-Use Solar',
    shortTitle: 'Agrivoltaics',
    category: 'hybrid',
    icon: 'Sprout',
    accentColor: 'emerald',
    tagline: 'Double-use the same land: organic shade crops alongside solar generation',
    suitableAreaMinRai: 1.5,
    preferredZoning: ['green', 'light_green', 'rural'],
    standards: ['EIT 022013-64', 'PEA VSPP Code', 'Dept. of Agriculture (shade crops)'],
    description: 'Design elevated PV structures at 2.5-3.5 m clearance with row pitch that lets sunlight reach crops below. Soil moisture cools the panels for slightly better yield while the site earns twice: crop income (vanilla, andrographis, mushrooms, salad greens) plus electricity revenue',
    keyBenefits: [
      'No zoning change needed — avoids farmland tax issues',
      'Crop microclimate cools panels, lifting conversion efficiency ~2-4%',
      'Two income streams: premium produce + electricity cash flow',
      'Top-tier ESG image — wins community and lender support'
    ],
    technicalHighlights: [
      'Extra-tall galvanized steel structure (clearance > 2.8 m) fits small tractors',
      'Wide 6-8 m row pitch controls shading and ground irradiance',
      'Smart micro-irrigation powered directly by the PV array',
      'Strict RCD/GFCI earth-leakage protection for farm-worker safety'
    ]
  },
  {
    id: 'ev-charging-hub',
    title: 'EV Supercharging Plaza + Solar Canopy + BESS',
    shortTitle: 'EV Charging Plaza',
    category: 'infrastructure',
    icon: 'Zap',
    accentColor: 'cyan',
    tagline: 'Ride the 100% EV transition on a road-side site, with BESS to cut demand charges',
    suitableAreaMinRai: 0.5,
    preferredZoning: ['red', 'orange', 'yellow', 'purple'],
    standards: ['EIT 022026-63 (EV charging installation standard)', 'PEA/MEA EV Charger Regulations', 'IEC 61851 / ISO 15118'],
    description: 'Develop roadside land into a DC fast-charging plaza (120-360 kW) with a solar carport and BESS for peak shaving to avoid utility demand charges — plus a cafe, convenience store and rest area',
    keyBenefits: [
      'High revenue per square wah from charging plus retail/cafe rent',
      'BESS trims demand charges — big savings on daytime peak rates',
      'Aligned with Thailand\'s EV 30@30 roadmap as EVs grow fast',
      'Chargers expand modularly as traffic grows'
    ],
    technicalHighlights: [
      'DC superfast liquid-cooled 180-360 kW chargers, CCS2 / CHAdeMO',
      'Dedicated station transformer 500-1500 kVA, 22kV/400V',
      'Dynamic Load Management (DLM) sharing power across active guns',
      '200-500 kWh BESS for peak shaving and emergency backup'
    ]
  },
  {
    id: 'grid-bess',
    title: 'Utility-Scale BESS Farm',
    shortTitle: 'Grid-Scale BESS',
    category: 'storage',
    icon: 'BatteryCharging',
    accentColor: 'indigo',
    tagline: 'New-era infrastructure that stabilizes the EGAT/PEA transmission and distribution grid',
    suitableAreaMinRai: 1,
    preferredZoning: ['purple', 'industrial', 'yellow', 'green'],
    standards: ['IEEE 1547-2018', 'NFPA 855 (ESS installation standard)', 'PEA Grid Ancillary Services Code'],
    description: 'Install grid-scale LFP battery containers on a small plot near a transmission corridor or substation, providing ancillary services such as frequency regulation and spinning reserve, plus energy arbitrage (charge off-peak, sell at peak)',
    keyBenefits: [
      'Little land for very high engineering value (high power density)',
      'The future of Thailand\'s grid (modernization & smart grid)',
      'Long-term site lease possible with major energy companies',
      'High safety via liquid cooling and Aerosol/Novec suppression'
    ],
    technicalHighlights: [
      '20 ft / 40 ft LFP storage containers (2-5 MWh each)',
      'Bi-directional Power Conversion System (PCS) at >98.5% efficiency',
      'Energy Management System (EMS) over IEC 60870-5-104 / Modbus TCP',
      'Liquid-cooled thermal management for >6,000 cycle life'
    ]
  },
  {
    id: 'floating-solar',
    title: 'Floating Solar (Hydro-Floating PV)',
    shortTitle: 'Floating Solar',
    category: 'renewable',
    icon: 'Waves',
    accentColor: 'blue',
    tagline: 'For land with a pond or reservoir — water cooling lifts panel yield',
    suitableAreaMinRai: 1.5,
    preferredZoning: ['green', 'yellow', 'water_body', 'rural'],
    standards: ['EIT floating-PV standard', 'DEDE floating PV guideline', 'PEA/EGAT Interconnection'],
    description: 'For plots with a pond, old borrow pit or reservoir where buildings cannot go, food-grade HDPE floats carry PV modules. Water cooling lifts output roughly 5-10% over ground-mount while cutting evaporation and suppressing algae',
    keyBenefits: [
      'Uses water surface that has no other commercial use',
      '5-10% higher yield from the water cooling effect',
      'Cuts pond evaporation by over 70% — keeps water for dry season',
      'Food-grade HDPE floats are non-toxic to aquatic life'
    ],
    technicalHighlights: [
      'Main and walkway HDPE floats, UV-resistant, >25 yr life',
      'Anchoring & mooring system tolerates water-level swings',
      'IP68 underwater DC cable, UV-proof double-insulated solar cable',
      'C5-M corrosion- and humidity-rated inverters'
    ]
  },
  {
    id: 'biomass-biogas',
    title: 'Biogas & Biomass Renewable Plant',
    shortTitle: 'Biogas / Biomass',
    category: 'bioenergy',
    icon: 'Flame',
    accentColor: 'orange',
    tagline: 'Turn farm waste/manure around the land into baseload renewable power',
    suitableAreaMinRai: 5,
    preferredZoning: ['green', 'rural', 'purple'],
    standards: ['EIT biogas plant safety standard', 'Dept. of Industrial Works', 'PEA VSPP'],
    description: 'If the land sits in a farming area or near livestock/agro-processing facilities, develop a biogas plant (anaerobic digester) fermenting organic waste into methane to drive a gas-engine generator — delivering continuous 24-hour baseload renewable power',
    keyBenefits: [
      'Steady 24h output regardless of weather (capacity factor >85%)',
      'Extra income from concentrated bio-fertilizer digestate sold to farmers',
      'Solves odor and wastewater issues — good community relations (CSR)',
      'Biogas/biomass FiT usually carries an attractive premium'
    ],
    technicalHighlights: [
      'CSTR or covered-lagoon digester with H2S scrubber',
      'Biogas engine synchronous generator at ~40% electrical efficiency',
      'Automated gas-leak detection, flame arrester and safety flare',
      'Step-up transformer 400V / 22kV with MV VCB switchgear'
    ]
  }
];
