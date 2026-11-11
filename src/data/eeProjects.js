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
  },
  {
    id: 'small-solar',
    title: 'Small-Scale Solar (Self-Consumption)',
    shortTitle: 'Small Solar',
    category: 'renewable',
    icon: 'Sun',
    accentColor: 'amber',
    tagline: 'A few panels on a roof or a corner of the land — sized to a modest budget',
    suitableAreaMinRai: 0.05,
    preferredZoning: ['green', 'yellow', 'purple', 'light_green'],
    standards: ['PEA/MEA small-producer notification rules', 'EIT wiring standards (Wiring Code)'],
    description: 'Install a small PV array (one to a few kilowatts) on a rooftop, shed or backyard frame to offset the household or on-site electricity bill directly at the retail tariff. The system connects at the low-voltage main distribution board — no medium-voltage interconnection needed — and can be expanded later as budget allows',
    keyBenefits: [
      'Entry-level investment — one small string starts around a hundred-thousand baht',
      'Offsets the retail tariff (~4–5 THB/kWh) instead of selling at a lower FiT',
      'Simple low-voltage connection to the existing meter/board',
      'Modular — add more strings later when budget allows'
    ],
    technicalHighlights: [
      'N-Type TOPCon 620W modules in short strings of 6 (≈3.7 kWp each)',
      'Residential string inverter ~5 kW, MPPT 80–500V, 97%+ efficiency',
      'MCB + Type-B RCD and Class II surge protection on the LV board',
      'Aluminium rail mounting on roof or light ground frame — no piling needed'
    ]
  },
  {
    id: 'solar-utility-kit',
    title: 'Off-Grid Solar Utility Kit',
    shortTitle: 'Solar Kit (off-grid)',
    category: 'renewable',
    icon: 'BatteryCharging',
    accentColor: 'amber',
    tagline: 'Panels + battery + inverter in one small kit — light and a pump where there is no power line',
    suitableAreaMinRai: 0.01,
    preferredZoning: ['green', 'yellow', 'light_green', 'rural'],
    standards: ['EIT low-voltage wiring practices', 'Manufacturer install manuals (no utility notification needed — no grid tie)'],
    description: 'A standalone power kit: 1–8 units of a 620W panel + 1.2 kWh LiFePO4 battery feeding an all-in-one off-grid inverter (1.5–3 kW). It runs lights, fans, phone charging and small DC/AC pumps without any utility connection — ideal for remote plots far from a power line or for the smallest budgets, and expandable unit-by-unit later',
    keyBenefits: [
      'Cheapest real entry — a single unit starts around 35,000 THB',
      'No grid connection, no paperwork — works far from any power line',
      'Modular: add panel+battery units one at a time as budget allows',
      'Doubles as backup power during outages'
    ],
    technicalHighlights: [
      '620W panels in standalone units (~12 m² each incl. frame)',
      'LiFePO4 battery 1.2 kWh per unit — ~10-year cycle life',
      'All-in-one off-grid inverter 1.5–3 kW with built-in MPPT charger',
      'DC fuse, battery breaker and Class II surge protection'
    ]
  },
  {
    id: 'ev-moto-swap',
    title: 'E-Motorcycle Battery Swap Kiosk',
    shortTitle: 'Swap Kiosk',
    category: 'business',
    icon: 'Store',
    accentColor: 'violet',
    tagline: 'Small road-frontage kiosk where e-motorcycles swap batteries — a fee per swap',
    suitableAreaMinRai: 0.02,
    preferredZoning: ['yellow', 'red', 'rural'],
    standards: ['Low-voltage supply + kiosk electrical safety', 'Swap-network operator requirements (cabinet spec, payment, branding)'],
    description: 'A compact battery-swap kiosk for electric motorcycles: 1–4 twelve-slot cabinets on a small canopy with a 3 kW solar top-up. Riders pull in, swap a flat battery for a charged one in under a minute, and pay per swap — a genuine per-transaction micro-business for a road frontage',
    keyBenefits: [
      'Real recurring revenue — a fee on every swap, not just power sales',
      'Fits a frontage corner (~40 m² per cabinet incl. queuing)',
      'Scales cabinet-by-cabinet as rider demand proves out',
      'Solar canopy trims the cabinet charging load'
    ],
    technicalHighlights: [
      '12-slot swap cabinet (~350k THB installed) with canopy and queuing space',
      '3 kWp solar top-up per cabinet trims grid draw',
      'Small hybrid inverter + cabinet PSU — no MV works needed',
      'Cabinet refresh provisioned at ~50% cost in years 8/16'
    ]
  },
  {
    id: 'solar-coldroom',
    title: 'Solar Cold Room Rental',
    shortTitle: 'Cold Room Rental',
    category: 'business',
    icon: 'Snowflake',
    accentColor: 'cyan',
    tagline: 'Cold rooms farmers rent to keep produce fresh — solar covers the compressor, your biggest cost',
    suitableAreaMinRai: 0.05,
    preferredZoning: ['green', 'light_green', 'yellow', 'rural'],
    standards: ['Food-contact room hygiene basics', 'Refrigeration contractor warranty and service terms'],
    description: 'One to three 20 m³ cold rooms plus ~10 kWp solar each. Growers nearby rent space to keep fruit, vegetables or flowers fresh between harvest and market. The compressor is the dominant running cost, so the PV system directly widens the margin',
    keyBenefits: [
      'Recurring rental income — demand spikes every harvest season',
      'PV offsets the compressor, the main operating expense',
      'Adds local value: less post-harvest loss for neighbors',
      'Expandable room-by-room as occupancy proves out'
    ],
    technicalHighlights: [
      '20 m³ insulated room (~520k THB) + 8–10 kW compressor',
      '~10 kWp PV per room feeding a grid-tied string inverter',
      'Compressor overhaul provisioned in years 10/20',
      '~70 m² footprint per room including plant and access'
    ]
  },
  {
    id: 'solar-dryer',
    title: 'Solar Crop Drying Service',
    shortTitle: 'Crop Drying Service',
    category: 'business',
    icon: 'Package',
    accentColor: 'orange',
    tagline: 'Dry chili, herbs and fruit for neighboring farms — the cheapest business entry on this list',
    suitableAreaMinRai: 0.06,
    preferredZoning: ['green', 'light_green', 'rural'],
    standards: ['Food-grade hygiene for premium produce markets', 'Local small-enterprise registration'],
    description: 'Solar tunnel dryers (6×14 m) with DC ventilation fans dry up to ~600 kg of wet produce per day each. Neighboring farms pay a per-kilogram fee during harvest season — a working business even on the smallest plot, with the simplest engineering on the list',
    keyBenefits: [
      'Lowest startup cost of any plan here — ~400k THB per tunnel',
      'Service income during every harvest, no power-sale license needed',
      'Almost no moving parts — passive heat plus small DC fans',
      'Fast payback potential where drying demand exists'
    ],
    technicalHighlights: [
      'Tunnel dryer ~84 m² footprint + small PV for DC fans',
      '~600 kg/day wet capacity per tunnel, ~120 season days/yr',
      'Cover/fan refurbishment provisioned in years 8/16',
      'Up to 6 tunnels scale with plot and demand'
    ]
  },
  {
    id: 'solar-lease',
    title: 'Solar Land Lease (Developer Model)',
    shortTitle: 'Solar Land Lease',
    category: 'business',
    icon: 'Handshake',
    accentColor: 'amber',
    tagline: 'Lease your land to a solar developer — near-zero investment, fixed rent for 25+ years',
    suitableAreaMinRai: 1,
    preferredZoning: ['green', 'yellow', 'purple', 'light_green'],
    standards: ['Lease contract with PPA-backed developer', 'PEA interconnection terms handled by lessee'],
    description: 'Instead of building anything yourself, lease the plot to a solar developer under a 25-30 year land-lease agreement. The developer pays for all equipment, permits and interconnection — you receive fixed annual rent per rai with periodic escalation, and the land returns to you (or re-leases) at term end',
    keyBenefits: [
      'Almost no capital outlay — the developer funds the whole plant',
      'Fixed, predictable rent for 25+ years with step-up clauses',
      'No O&M, no permits, no power-sale paperwork on your side',
      'Land value preserved — the plot is not sold, only leased'
    ],
    technicalHighlights: [
      'Typical lease ~25-35k THB/rai/yr in solar-suitable provinces',
      'Escalation commonly ~10% every 5 years',
      'Developer carries capex ~30-40M THB/MWp and all utility risk',
      'End-of-term: re-lease, remove, or transfer per contract'
    ]
  },
  {
    id: 'data-center-lease',
    title: 'Data Center / Edge Site Lease',
    shortTitle: 'Data Center Lease',
    category: 'business',
    icon: 'Server',
    accentColor: 'indigo',
    tagline: 'The fastest-growing land business in Thailand — lease a plot to data center or telecom operators',
    suitableAreaMinRai: 1,
    preferredZoning: ['purple', 'red', 'orange', 'yellow'],
    standards: ['Near MV substation / high-capacity feeder', 'Fiber corridor access', 'EEC or urban-fringe location preferred'],
    description: 'Global cloud and AI demand is driving data center investment into Thailand (EEC corridor, Bangkok fringe, provincial hubs). Operators and tower/fiber companies lease well-located plots long-term — requirements are a robust power feed, fiber access, road frontage and appropriate zoning. You provide land; they build everything',
    keyBenefits: [
      'Premium lease rates — far above agricultural or solar land rent',
      '20-30 year leases with strong corporate counterparties',
      'Near-zero owner investment after due diligence',
      'Riding the largest infrastructure trend in Thai property'
    ],
    technicalHighlights: [
      'Edge/telecom sites lease ~60-120k THB/rai/yr where demand exists',
      'Hyperscale campuses need 5-20+ rai plus substation proximity',
      'Key gate: grid capacity and fiber — location decides everything',
      'Due diligence phase ~6-12 months before a signed lease'
    ]
  },
  {
    id: 'solar-warehouse',
    title: 'Warehouse for Rent + Rooftop Solar',
    shortTitle: 'Solar Warehouse',
    category: 'business',
    icon: 'Warehouse',
    accentColor: 'cyan',
    tagline: 'E-commerce logistics demand: a small warehouse earns rent, its roof earns solar savings',
    suitableAreaMinRai: 0.3,
    preferredZoning: ['yellow', 'red', 'orange', 'purple'],
    standards: ['Building permit + warehouse use under zoning', 'Road access for 4-6 wheel trucks'],
    description: 'Build a compact warehouse on a road-frontage plot and lease it to logistics, agricultural suppliers or e-commerce distributors — the fastest-growing commercial property segment in Thailand. Rooftop PV offsets common-area power or can be leased to a solar operator as a second income layer',
    keyBenefits: [
      'Two income streams: warehouse rent + rooftop PV/lease',
      'E-commerce and delivery demand keeps rental occupancy high',
      'Reusable asset — warehouse still holds resale/rental value',
      'Scales building-by-building as demand proves out'
    ],
    technicalHighlights: [
      'Warehouse shell ~8,000-10,000 THB/m² turnkey',
      'Rent ~120-180 THB/m²/month depending on location',
      'Roof structure pre-sized for ~0.5 kWp per 3.3 m² of roof',
      'Dock doors + turning apron sized for 4-6 wheel trucks'
    ]
  },
  {
    id: 'carbon-forest',
    title: 'Carbon Credit Forestry (T-VER)',
    shortTitle: 'Carbon Forestry',
    category: 'bioenergy',
    icon: 'Trees',
    accentColor: 'emerald',
    tagline: 'Plant fast-growing trees, register T-VER carbon credits — the lowest-capex land income on this list',
    suitableAreaMinRai: 1,
    preferredZoning: ['green', 'light_green', 'rural'],
    standards: ['T-VER registration via Thailand Greenhouse Gas Management Org (TGO)', 'Approved forestry methodology'],
    description: 'Plant fast-growing or native tree species (eucalyptus, acacia, teak mixes) and register the plantation under Thailand\'s T-VER voluntary carbon scheme. Sequestered CO2 is verified and sold as credits to companies offsetting emissions — plus a timber harvest at maturity. Minimal infrastructure: just land, seedlings and a small solar irrigation pump',
    keyBenefits: [
      'Lowest capital entry of any plan here — seedlings and labor',
      'Carbon credit demand rising with corporate net-zero pledges',
      'Improves the land: soil, shade and water retention recover',
      'Timber value at harvest is a bonus on top of credits'
    ],
    technicalHighlights: [
      '~200 trees/rai fast-growing species, 4-6 tCO2/rai/yr uptake',
      'T-VER credit prices ~150-300 THB/tCO2 (market-dependent)',
      'First verified credits typically from year 5 onward',
      'Small solar pump kit covers seedling irrigation off-grid'
    ]
  },
  {
    id: 'roadside-cafe',
    title: 'Roadside Café & Food Shop',
    shortTitle: 'Roadside Café',
    category: 'business',
    icon: 'Coffee',
    accentColor: 'orange',
    tagline: 'Coffee and simple food on a road frontage — the classic Thai land business',
    suitableAreaMinRai: 0.1,
    preferredZoning: ['yellow', 'red', 'orange', 'purple'],
    standards: ['Food-shop license (local authority)', 'Building permit for the shop structure'],
    description: 'Build a compact café selling coffee, drinks and simple meals to passing traffic and locals. The winning factor is location: visible frontage on a busy road with easy parking. A small rooftop PV array offsets the daytime espresso-machine and air-conditioning load',
    keyBenefits: [
      'Direct daily cash income — the most hands-on business on this list',
      'Scales from a kiosk to a full café as regulars build up',
      'Rooftop PV cuts the biggest fixed cost (air-con + machines)',
      'Adds a landmark — raises the whole plot\'s visibility and value'
    ],
    technicalHighlights: [
      'Compact shop ~80-120 m² fit-out ~14-18k THB/m²',
      'Traffic on the frontage decides daily customer count',
      'Espresso + air-con load ~5-8 kW — rooftop PV ~8-13 kWp offsets it',
      'Parking and U-turn ease matter as much as the menu'
    ]
  },
  {
    id: 'minimart',
    title: 'Community Mini-mart',
    shortTitle: 'Mini-mart',
    category: 'business',
    icon: 'ShoppingCart',
    accentColor: 'blue',
    tagline: 'A neighborhood convenience store — daily necessities for the surrounding community',
    suitableAreaMinRai: 0.1,
    preferredZoning: ['yellow', 'red', 'orange', 'purple'],
    standards: ['Retail license + tobacco/alcohol permits', 'Building permit'],
    description: 'Open a convenience store serving households within walking/driving distance. Revenue is volume-driven with thin margins — the store works when the community is underserved and the frontage is easy to stop at. Rooftop PV offsets refrigeration and air-con, the largest running costs',
    keyBenefits: [
      'Recession-resistant demand — people buy necessities daily',
      'Franchise options exist, or run independently for higher margin',
      'PV offsets 24/7 refrigeration — the dominant operating cost',
      'Combines well with parcel pickup, top-up and bill-pay services'
    ],
    technicalHighlights: [
      'Shop ~100-140 m² + initial stock ~0.7-1.1M THB',
      'Grocery margin is thin (~15-22%) — volume decides everything',
      'Fridges/freezers run 24h — PV covers the daytime share',
      'Underserved community radius is the real feasibility question'
    ]
  },
  {
    id: 'self-storage',
    title: 'Self-storage Rental Units',
    shortTitle: 'Self-storage',
    category: 'business',
    icon: 'Boxes',
    accentColor: 'violet',
    tagline: 'Container-style storage rooms for rent — the quiet property business with almost no staff',
    suitableAreaMinRai: 0.25,
    preferredZoning: ['yellow', 'orange', 'purple', 'red'],
    standards: ['Building permit for storage structures', 'Fire-access lane around units'],
    description: 'Install prefab storage units (3×6 m class) and rent them monthly to households, online sellers and small businesses. Demand follows e-commerce sellers and condo dwellers needing overflow space. Runs nearly staff-free: CCTV, a gate and monthly billing. Unit roofs carry PV for the common load',
    keyBenefits: [
      'Almost staff-free — gate, CCTV and billing, no shop hours',
      'E-commerce sellers drive steady unit demand',
      'Modular — add units row by row as occupancy proves out',
      'Secondary roads work fine; customers visit only occasionally'
    ],
    technicalHighlights: [
      'Prefab units ~3×6 m rent ~2,000-2,800 THB/month each',
      'Occupancy ~70-75% is the honest planning figure',
      'Unit roofs carry PV for lighting/CCTV/EV-cart charging',
      'Fire lanes and turning radius decide how many units fit'
    ]
  },
  {
    id: 'sports-court',
    title: 'Badminton / Futsal Court Rental',
    shortTitle: 'Sports Court',
    category: 'business',
    icon: 'Dumbbell',
    accentColor: 'teal',
    tagline: 'A covered court hall rented by the hour — evening income from the local community',
    suitableAreaMinRai: 0.3,
    preferredZoning: ['yellow', 'red', 'orange', 'purple'],
    standards: ['Building permit for the covered hall', 'Public-venue health permit (local authority)'],
    description: 'Build a covered badminton or futsal court and rent it by the hour — evenings and weekends are peak. Courts need a community of players nearby, not tourist traffic. The tall roof is a natural fit for a larger PV array covering the big lighting and ventilation load',
    keyBenefits: [
      'Hourly rental income, evenings and weekends — fits a day job',
      'Repeat customers — clubs book the same slot weekly',
      'Tall clear-span roof = excellent PV surface, big savings',
      'Community anchor — pairs naturally with drinks/gear sales'
    ],
    technicalHighlights: [
      'One badminton court needs ~170-190 m² incl. clearances',
      'Court rent ~120-200 THB/hour, peak after 17:00',
      'Sports flooring ~60-80k per court — quality matters to players',
      'Hall lighting ~10-15 W/m² — PV covers daytime bookings'
    ]
  },
  {
    id: 'homestay-camp',
    title: 'Homestay & Camping Ground',
    shortTitle: 'Homestay/Camp',
    category: 'business',
    icon: 'Tent',
    accentColor: 'green',
    tagline: 'Tents, cabins or a small homestay — income from scenery and quiet, not traffic',
    suitableAreaMinRai: 0.3,
    preferredZoning: ['green', 'light_green', 'yellow', 'rural'],
    standards: ['Homestay/ lodging rules per local authority (non-hotel class)', 'Wastewater and waste management basics'],
    description: 'Turn a scenic or quiet plot into a small homestay, glamping tents or a campground. This is the one business here where a main road matters less than atmosphere — trees, water views and quiet sell the booking. Solar water heating and small PV cut running costs in a low-density build',
    keyBenefits: [
      'Works where other businesses fail — quiet, scenic, off-main-road',
      'Low-density build keeps the land beautiful and flexible',
      'Weekend/holiday demand from Bangkok and nearby cities',
      'Pairs with camping, café or farm-stay experiences'
    ],
    technicalHighlights: [
      'Cabins/tents ~150-350k THB per key incl. fit-out',
      'Occupancy ~25-35% is honest for rural stays (weekend-heavy)',
      'ADR ~800-1,500 THB/night depending on view and finish',
      'Solar water heater + PV covers a low-density electrical load'
    ]
  },
  {
    id: 'laundry-shop',
    title: 'Coin Laundry Shop',
    shortTitle: 'Laundry Shop',
    category: 'business',
    icon: 'WashingMachine',
    accentColor: 'sky',
    tagline: 'Self-service washers and dryers — recurring income from renters, students and workers nearby',
    suitableAreaMinRai: 0.05,
    preferredZoning: ['yellow', 'red', 'orange', 'purple'],
    standards: ['Shop license + water supply/drainage connection'],
    description: 'Set up a row of coin/QR-operated washers and dryers. Demand is hyper-local: renters, dorm residents and workers within ~1 km who lack machines. Runs with a part-time attendant. The heavy water-heater and dryer loads make rooftop PV genuinely useful here',
    keyBenefits: [
      'Recurring weekly demand — everyone washes clothes',
      'Small plot works — even a 60-80 m² shopfront suffices',
      'Semi-passive — a part-time attendant, not full staffing',
      'PV trims the dryer/water-heater load — the main cost driver'
    ],
    technicalHighlights: [
      'Commercial washers ~35-45k THB each, 8-12 machines typical',
      'A machine earns ~9-11 loads/day at ~40-45 THB/load',
      'Water + power ~50-58% of revenue — the deciding cost line',
      'Catchment is ~1 km of renters/dorms — survey before building'
    ]
  },
  {
    id: 'car-wash',
    title: 'Self-service Car Wash',
    shortTitle: 'Car Wash',
    category: 'business',
    icon: 'Car',
    accentColor: 'cyan',
    tagline: 'Coin/QR wash bays plus vacuum — steady income on any busy road',
    suitableAreaMinRai: 0.15,
    preferredZoning: ['yellow', 'red', 'orange', 'purple'],
    standards: ['Wastewater drainage to a proper system', 'Shop/venue license per local authority'],
    description: 'Build 2-4 self-service wash bays with high-pressure machines, foam and vacuum stations. Customers serve themselves in 10-15 minutes — the model needs visible road frontage and easy in/out, but almost no staff. Water recycling and a PV canopy trim the two running costs',
    keyBenefits: [
      'Self-service — customers do the work, staff is minimal',
      'Steady demand wherever traffic and residences overlap',
      'Fast build — bays are simple structures, quick to open',
      'PV canopy over bays shades cars and cuts the power bill'
    ],
    technicalHighlights: [
      'A bay (equipment + structure) ~250-300k THB turnkey',
      'A busy bay grosses ~1,200-2,500 THB/day',
      'Water + power ~45-50% of revenue — recycling pays back',
      'Ingress/egress speed decides repeat visits'
    ]
  }
];
