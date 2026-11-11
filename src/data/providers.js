// Example Thai companies working in each project type — reference list for comparison only.
// Not an endorsement; users must verify licenses and compare quotes themselves.
// scale: 'National' (works across Thailand), 'Regional' (main areas), 'Local' (generic category)
// website/contact: public info verified at time of writing — generic categories intentionally have none.

export const PROVIDERS = {
  'solar-farm': [
    { name: 'B.Grimm Power', scale: 'National', focus: 'IPP/EPC for utility-scale solar farms and industrial rooftops', note: 'SET-listed — suits larger plots with grid access', website: 'https://www.bgrimmpower.com/en/home', contact: 'Tel +66 2 710 3400' },
    { name: 'SPCG', scale: 'National', focus: 'Pioneering Thai solar-farm developer with own EPC arm', note: 'Long track record of utility-scale projects', website: 'https://www.spcg.co.th', contact: 'Tel 02-011-8111 · info@spcg.co.th' },
    { name: 'Solartron', scale: 'National', focus: 'Thai solar-cell/module manufacturer offering EPC', note: 'Domestic modules — easier spare parts and warranty claims', website: 'https://www.solartron.co.th', contact: 'Tel 02-055-9101' },
    { name: 'Banpu NEXT', scale: 'National', focus: 'Full energy solutions: solar farms, rooftops and storage', note: 'Also handles financing/design packages', website: 'https://www.banpunext.co.th', contact: 'Tel 02-095-6599 · contact@banpunext.co.th' },
    { name: 'Demco Power', scale: 'National', focus: 'Electrical EPC covering PV plants and substations', note: 'Strong on grid interconnection work', website: 'https://www.demco.co.th/en/home', contact: 'Tel 02-959-5811 · marketing@demco.co.th' },
  ],
  'small-solar': [
    { name: 'SCG Solar Roof Solutions', scale: 'National', focus: 'Residential and SME rooftop solar packages', note: 'Standardized packages with after-sales service', website: 'https://www.scgsmartliving.com/th/service/solar-roof-factory', contact: 'Tel 02-586-2222 · contact@scg.com' },
    { name: 'Banpu NEXT', scale: 'National', focus: 'Rooftop solar plus storage and financing options', note: 'Offers install-plus-finance bundles', website: 'https://www.banpunext.co.th', contact: 'Tel 02-095-6599 · contact@banpunext.co.th' },
    { name: 'Gunkul Engineering', scale: 'National', focus: 'Electrical EPC for rooftop and ground systems', note: 'SET-listed electrical contractor', website: 'https://www.gunkul.com', contact: 'Tel 02-242-5800' },
    { name: 'Local licensed installer', scale: 'Local', focus: 'Independent residential installers in your province', note: 'Compare 2–3 quotes — ask about PEA/MEA notification experience' },
  ],
  'solar-utility-kit': [
    { name: 'Local licensed installer', scale: 'Local', focus: 'Independent installers of off-grid kits and solar pumps', note: 'Compare 2–3 quotes — ask for LiFePO4 (not lead-acid) batteries' },
    { name: 'Agri-equipment shops', scale: 'Regional', focus: 'Farm-supply shops selling solar pump and lighting kits', note: 'Convenient for rural plots — check warranty and after-sales' },
    { name: 'SCG Solar Roof Solutions', scale: 'National', focus: 'Residential solar packages with service network', note: 'Better for permanent installs — ask about off-grid/battery options', website: 'https://www.scgsmartliving.com/th/service/solar-roof-factory', contact: 'Tel 02-586-2222 · contact@scg.com' },
  ],
  'agrivoltaics': [
    { name: 'Banpu NEXT', scale: 'National', focus: 'Solar solutions including elevated/integrated structures', note: 'Ask specifically about elevated-structure experience', website: 'https://www.banpunext.co.th', contact: 'Tel 02-095-6599 · contact@banpunext.co.th' },
    { name: 'B.Grimm Power', scale: 'National', focus: 'Large PV projects that can adapt layouts for dual land use', note: 'Suited to bigger plots (≥2 rai)', website: 'https://www.bgrimmpower.com/en/home', contact: 'Tel +66 2 710 3400' },
    { name: 'SPCG', scale: 'National', focus: 'Solar-farm developer able to customize structure and pitch', note: 'Verify crop-clearance design in the quote', website: 'https://www.spcg.co.th', contact: 'Tel 02-011-8111 · info@spcg.co.th' },
    { name: 'Regional solar EPC', scale: 'Regional', focus: 'Mid-size EPCs with agrivoltaics or canopy projects', note: 'Agrivoltaics specialists are still rare — ask for reference sites' },
  ],
  'floating-solar': [
    { name: 'Banpu NEXT', scale: 'National', focus: 'Floating solar is a stated business line — built projects in Thailand', note: 'Handles float supply + EPC as one package', website: 'https://www.banpunext.co.th', contact: 'Tel 02-095-6599 · contact@banpunext.co.th' },
    { name: 'SCG Cleanergy', scale: 'National', focus: 'Renewable developer with floating-solar experience', note: 'Industrial-estate and reservoir projects', website: 'https://www.scg.com', contact: 'SCG Contact Center 02-586-2222' },
    { name: 'SPCG', scale: 'National', focus: 'Utility-scale PV developer; can add floating systems', note: 'Check float/mooring references for your water body type', website: 'https://www.spcg.co.th', contact: 'Tel 02-011-8111 · info@spcg.co.th' },
    { name: 'Float-supplier + local EPC', scale: 'Regional', focus: 'Pontoon suppliers working with regional electrical contractors', note: 'Often cheaper — but verify anchoring design carefully' },
  ],
  'ev-charging-hub': [
    { name: 'EV Station PluZ (PTT OR)', scale: 'National', focus: 'Charging network operator — partners with site hosts', note: 'Good for roadside plots near highways', website: 'https://evstationpluz.pttor.com', contact: 'Call center 02-239-9998 · evstationpluzcare@pttor.com' },
    { name: 'Evolt', scale: 'National', focus: 'Thai EV-charging solution provider: hardware + software', note: 'Full turnkey from design to operation', website: 'https://evolt.co.th', contact: 'Tel 02-114-7343 · Line @evolt_th' },
    { name: 'PEA VOLTA', scale: 'National', focus: 'PEA charging network — offers business platform for site hosts', note: 'State utility network — ask about host-site partnership', website: 'https://peavoltaev.pea.co.th', contact: 'PEA Contact Center 1129' },
    { name: 'SHARGE', scale: 'National', focus: 'Charging-management platform and station build-out', note: 'Strong on payment/app/backend systems', website: 'https://www.sharge.co.th', contact: 'Tel 02-114-7571 · shargesupport@shargemgmt.com' },
  ],
  'grid-bess': [
    { name: 'Energy Absolute (EA)', scale: 'National', focus: 'Thai battery manufacturer with storage projects', note: 'Domestic cell production — check current service terms', website: 'https://www.energyabsolute.co.th', contact: 'Tel +66 2 248 2488 · PR@energyabsolute.co.th' },
    { name: 'Banpu NEXT', scale: 'National', focus: 'Energy-storage solutions integrated with solar', note: 'Hybrid PV+BESS packages', website: 'https://www.banpunext.co.th', contact: 'Tel 02-095-6599 · contact@banpunext.co.th' },
    { name: 'Delta Electronics Thailand', scale: 'National', focus: 'Power electronics and commercial ESS systems', note: 'Major manufacturer with local engineering support', website: 'https://www.deltathailand.com', contact: 'Tel 02-709-2800' },
    { name: 'Gunkul Engineering', scale: 'National', focus: 'Electrical EPC covering substation-scale equipment', note: 'Strong on MV interconnection and protection', website: 'https://www.gunkul.com', contact: 'Tel 02-242-5800' },
  ],
  'biomass-biogas': [
    { name: 'Asia Biogas', scale: 'National', focus: 'Thai biogas engineering — digesters for farm/industrial waste', note: 'Specialist in lagoon/CSTR digester design', website: 'https://www.asiabiogas.com', contact: 'Tel +66 2 651 9900' },
    { name: 'EnviTec Biogas', scale: 'National', focus: 'International biogas plant builder with Thai projects', note: 'SE-Asia office is in Jakarta — check for a Thai representative', website: 'https://www.envitec-biogas.com', contact: 'asia@envitec-biogas.com (SE-Asia office)' },
    { name: 'Regional agro-EPC', scale: 'Regional', focus: 'Local contractors near feedstock clusters (cassava, palm, livestock)', note: 'Essential to visit a working reference plant first' },
  ],
  'ev-moto-swap': [
    { name: 'Battery-swap network operator', scale: 'National', focus: 'Swap networks supply cabinets, payment app and branding under partner terms', note: 'They set the fee per swap — compare partner agreements before buying any hardware' },
    { name: 'Local licensed installer', scale: 'Local', focus: 'Kiosk electrical supply, canopy and grounding work', note: 'Standard low-voltage work — compare 2–3 quotes' },
  ],
  'solar-coldroom': [
    { name: 'Local refrigeration contractor', scale: 'Local', focus: 'Insulated cold rooms, compressors and maintenance contracts', note: 'After-sales service distance matters more than price — pick someone within ~100 km' },
    { name: 'SCG Solar Roof Solutions', scale: 'National', focus: 'PV system for the compressor load — the largest running cost', note: 'Standardized packages with after-sales service', website: 'https://www.scgsmartliving.com/th/service/solar-roof-factory', contact: 'Tel 02-586-2222 · contact@scg.com' },
    { name: 'Banpu NEXT', scale: 'National', focus: 'Solar plus storage — useful if the room must stay cold through the night', note: 'Ask about PV+BESS sizing for refrigeration duty', website: 'https://www.banpunext.co.th', contact: 'Tel 02-095-6599 · contact@banpunext.co.th' },
  ],
  'solar-dryer': [
    { name: 'Agri-equipment fabricator', scale: 'Regional', focus: 'Tunnel dryers, racks and food-grade covers built locally', note: 'Ask the DOAE regional office for approved solar-dryer designs before building' },
    { name: 'Local licensed installer', scale: 'Local', focus: 'Small PV + DC fans for tunnel ventilation', note: 'Only a few kW — any competent installer can do it' },
  ],
  'solar-lease': [
    { name: 'B.Grimm Power', scale: 'National', focus: 'Utility-scale developer that leases land for solar farms', note: 'SET-listed — established land-lease process', website: 'https://www.bgrimmpower.com/en/home', contact: 'Tel +66 2 710 3400' },
    { name: 'SPCG', scale: 'National', focus: 'Solar-farm developer — leases suitable plots long-term', note: 'Owns and operates its farms — pays lease plus handles everything', website: 'https://www.spcg.co.th', contact: 'Tel 02-011-8111 · info@spcg.co.th' },
    { name: 'Banpu NEXT', scale: 'National', focus: 'Energy solutions company expanding PV capacity', note: 'Ask their land-sourcing team about lease terms', website: 'https://www.banpunext.co.th', contact: 'Tel 02-095-6599 · contact@banpunext.co.th' },
    { name: 'Local developer / land broker', scale: 'Regional', focus: 'Provincial solar developers and lease brokers', note: 'Often faster — but verify their PPA/funding track record before signing' },
  ],
  'data-center-lease': [
    { name: 'True IDC / SUPERNAP', scale: 'National', focus: 'Thailand\'s largest data-center operator (True Group)', note: 'Expanding edge and hyperscale sites — contact their real-estate/site team', website: 'https://www.trueidc.com', contact: 'True IDC sales via trueidc.com' },
    { name: 'STT GDC Thailand', scale: 'National', focus: 'Regional data-center operator (ST Telemedia)', note: 'Multiple Bangkok sites — expanding footprint', website: 'https://www.sttelemediagdc.com', contact: 'Via sttelemediagdc.com contact form' },
    { name: 'AIS CS (fiber/tower)', scale: 'National', focus: 'Telecom infrastructure — edge sites and tower land leases', note: 'Smaller plots work for tower/edge leases', website: 'https://www.ais.th', contact: 'AIS business contact' },
    { name: 'Industrial-estate broker', scale: 'Regional', focus: 'Agents placing digital-infrastructure sites (EEC especially)', note: 'A broker who knows the corridor is worth the fee' },
  ],
  'solar-warehouse': [
    { name: 'Local design-build contractor', scale: 'Local', focus: 'Small steel-frame warehouses — turnkey shell + permit', note: 'Compare 2–3 quotes including piling and fire protection' },
    { name: 'WHA / Frasers (reference)', scale: 'National', focus: 'Large logistics developers — study their spec sheet as a quality benchmark', note: 'They do not build for you, but their spec shows what tenants expect', website: 'https://www.wha.co.th' },
    { name: 'SCG Solar Roof Solutions', scale: 'National', focus: 'Rooftop PV package sized to the warehouse roof', note: 'Ask about structural load check before panel layout', website: 'https://www.scgsmartliving.com/th/service/solar-roof-factory', contact: 'Tel 02-586-2222 · contact@scg.com' },
  ],
  'carbon-forest': [
    { name: 'TGO (Thailand Greenhouse Gas Mgmt Org)', scale: 'National', focus: 'T-VER registry and approved methodologies — the mandatory starting point', note: 'Check current forestry methodologies and registered verifiers', website: 'https://ghgreduction.tgo.or.th' },
    { name: 'Forest Industry Organization (FIO)', scale: 'National', focus: 'State enterprise for commercial forestry — seedlings and planting know-how', note: 'Cheap certified seedlings for fast-growing species', website: 'https://www.fio.co.th' },
    { name: 'Carbon project developer / VNV Advisory', scale: 'Regional', focus: 'Carbon-credit project developers who co-develop and share revenue', note: 'They handle verification paperwork for a revenue share — compare terms' },
    { name: 'Local forestry office', scale: 'Local', focus: 'Royal Forest Dept / provincial office — species advice and land-use rules', note: 'Confirm the plot can legally be planted as forestry' },
  ],
};
