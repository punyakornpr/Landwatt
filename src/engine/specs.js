// Dispatch engineering calculations per project type + summarize in plain language
import {
  calculateSolarFarmSpecs,
  calculateSmallSolarSpecs,
  calculateSolarKitSpecs,
  calculateMotoSwapSpecs,
  calculateColdroomSpecs,
  calculateSolarDryerSpecs,
  calculateAgrivoltaicsSpecs,
  calculateEVHubSpecs,
  calculateBESSFarmSpecs,
  calculateFloatingSolarSpecs,
  calculateBiogasSpecs,
  calculateSolarLeaseSpecs,
  calculateDataCenterLeaseSpecs,
  calculateSolarWarehouseSpecs,
  calculateCarbonForestSpecs,
  calculateRoadsideCafeSpecs,
  calculateMinimartSpecs,
  calculateSelfStorageSpecs,
  calculateSportsCourtSpecs,
  calculateHomestaySpecs,
  calculateLaundrySpecs,
  calculateCarWashSpecs,
} from '../utils/engineeringCalculations.js';

function computeSpecs(projectId, safeLand) {
  switch (projectId) {
    case 'solar-farm': return calculateSolarFarmSpecs(safeLand);
    case 'small-solar': return calculateSmallSolarSpecs(safeLand);
    case 'solar-utility-kit': return calculateSolarKitSpecs(safeLand);
    case 'ev-moto-swap': return calculateMotoSwapSpecs(safeLand);
    case 'solar-coldroom': return calculateColdroomSpecs(safeLand);
    case 'solar-dryer': return calculateSolarDryerSpecs(safeLand);
    case 'agrivoltaics': return calculateAgrivoltaicsSpecs(safeLand);
    case 'ev-charging-hub': return calculateEVHubSpecs(safeLand);
    case 'grid-bess': return calculateBESSFarmSpecs(safeLand);
    case 'floating-solar': return calculateFloatingSolarSpecs(safeLand);
    case 'biomass-biogas': return calculateBiogasSpecs(safeLand);
    case 'solar-lease': return calculateSolarLeaseSpecs(safeLand);
    case 'data-center-lease': return calculateDataCenterLeaseSpecs(safeLand);
    case 'solar-warehouse': return calculateSolarWarehouseSpecs(safeLand);
    case 'carbon-forest': return calculateCarbonForestSpecs(safeLand);
    case 'roadside-cafe': return calculateRoadsideCafeSpecs(safeLand);
    case 'minimart': return calculateMinimartSpecs(safeLand);
    case 'self-storage': return calculateSelfStorageSpecs(safeLand);
    case 'sports-court': return calculateSportsCourtSpecs(safeLand);
    case 'homestay-camp': return calculateHomestaySpecs(safeLand);
    case 'laundry-shop': return calculateLaundrySpecs(safeLand);
    case 'car-wash': return calculateCarWashSpecs(safeLand);
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
  const minAreaSqM = { 'small-solar': 34, 'agrivoltaics': 220, 'solar-utility-kit': 15, 'ev-moto-swap': 40, 'solar-coldroom': 70, 'solar-dryer': 100, 'solar-warehouse': 300, 'carbon-forest': 800, 'solar-lease': 1600, 'data-center-lease': 1600, 'roadside-cafe': 120, 'minimart': 100, 'self-storage': 300, 'sports-court': 400, 'homestay-camp': 300, 'laundry-shop': 60, 'car-wash': 150 }[projectId] || 120;
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
// R() picks Thai when lang==='th'
export function friendlySummary(projectId, specs, land, lang = 'en') {
  const R = (en, th) => (lang === 'th' ? th : en);
  const fin = specs.financials || {};
  const capex = capexRange(fin);
  const areaRai = (specs.budgetFit?.resized ? specs.budgetFit.usedAreaSqM : land.areaSqM) / 1600;
  const plotShare = specs.budgetFit?.resized ? R('Part of the plot', 'ส่วนหนึ่งของแปลง') : R('Most of the plot', 'แปลงส่วนใหญ่');
  const payback = fin.paybackYears && M(fin.paybackYears) > 0 && M(fin.paybackYears) < 60
    ? `${fin.paybackYears} ${R('yrs', 'ปี')}` : R('Cannot estimate yet', 'ยังประเมินไม่ได้');

  let areaUsed, benefit;
  switch (projectId) {
    case 'solar-farm':
    case 'agrivoltaics':
    case 'floating-solar':
      areaUsed = `${plotShare} (~${(areaRai * 0.78).toFixed(1)} ${R('rai usable', 'ไร่ที่ใช้ได้')})`;
      benefit = R(`Generates about ${specs.annualEnergyMWh} MWh/yr — equal to ~${Math.round(M(specs.annualEnergyMWh) * 1000 / 3000).toLocaleString()} homes`,
                  `ผลิตไฟราว ${specs.annualEnergyMWh} MWh/ปี — เทียบการใช้บ้าน ~${Math.round(M(specs.annualEnergyMWh) * 1000 / 3000).toLocaleString()} หลัง`);
      break;
    case 'small-solar':
      areaUsed = `~${((specs.stringDesign?.installedPanelCount || 0) * 4 / 1600).toFixed(2)} ${R('rai (rooftop or a land corner)', 'ไร่ (หลังคาหรือมุมแปลง)')}`;
      benefit = R(`Offsets your own power bill — generates ~${specs.annualEnergyMWh} MWh/yr`,
                  `ลดค่าไฟที่ใช้เอง — ผลิต ~${specs.annualEnergyMWh} MWh/ปี`);
      break;
    case 'solar-utility-kit':
      areaUsed = `~${((specs.kitUnits || 1) * 12 / 1600).toFixed(2)} ${R('rai (a small frame or roof)', 'ไร่ (โครงเล็กหรือหลังคา)')}`;
      benefit = R(`Powers lights/fans/a small pump — ~${specs.dailyUsableKWh} kWh usable per day`,
                  `ใช้กับไฟ/พัดลม/ปั๊มเล็ก — ใช้ได้ ~${specs.dailyUsableKWh} kWh ต่อวัน`);
      break;
    case 'ev-moto-swap':
      areaUsed = `${plotShare} (${R('kiosk + swap cabinets + queuing', 'ร้าน + ตู้สลับ + ที่รอคิว')})`;
      benefit = R(`${specs.swapCabinets} swap cabinet(s) — up to ~${specs.swapsPerDay} swaps/day potential`,
                  `ตู้สลับ ${specs.swapCabinets} ตู้ — รองรับได้ถึง ~${specs.swapsPerDay} ครั้ง/วัน`);
      break;
    case 'solar-coldroom':
      areaUsed = `${plotShare} (${R(`${specs.coldRooms} cold room(s) + plant area`, `ห้องเย็น ${specs.coldRooms} ห้อง + พื้นที่เครื่อง`)})`;
      benefit = R(`Rent ~${specs.coldStorageM3} m³ of cold storage to nearby growers`,
                  `ให้เช่าห้องเย็น ~${specs.coldStorageM3} ตร.ม. กับเกษตรกรใกล้เคียง`);
      break;
    case 'solar-dryer':
      areaUsed = `${plotShare} (${R(`${specs.dryerTunnels} drying tunnel(s)`, `อุโมงค์อบแห้ง ${specs.dryerTunnels} อัน`)})`;
      benefit = R(`Dry up to ~${specs.dryCapacityKgDay} kg/day of produce for a service fee`,
                  `อบผลผลิตได้ถึง ~${specs.dryCapacityKgDay} กก./วัน เก็บค่าบริการ`);
      break;
    case 'ev-charging-hub':
      areaUsed = `${plotShare} (${R('chargers + parking + rest area', 'เครื่องชาร์จ + ที่จอด + จุดพัก')})`;
      benefit = R(`Serves ~${specs.dailyCarsServiced} cars/day or sells ~${specs.annualEnergyDispensedMWh} MWh/yr`,
                  `บริการ ~${specs.dailyCarsServiced} คัน/วัน หรือขายไฟ ~${specs.annualEnergyDispensedMWh} MWh/ปี`);
      break;
    case 'grid-bess':
      areaUsed = R(`About ${(areaRai * 0.5).toFixed(1)} rai (containers + clearances)`, `ราว ${(areaRai * 0.5).toFixed(1)} ไร่ (ตู้แบต + ระยะห่าง)`);
      benefit = R(`Stores ${specs.capacityMWh} MWh, delivers ${specs.powerMW} MW`, `เก็บ ${specs.capacityMWh} MWh จ่าย ${specs.powerMW} MW`);
      break;
    case 'biomass-biogas':
      areaUsed = R(`About ${(areaRai * 0.4).toFixed(1)} rai (digesters + powerhouse)`, `ราว ${(areaRai * 0.4).toFixed(1)} ไร่ (ถังหมัก + โรงไฟฟ้า)`);
      benefit = R(`Continuous output ~${specs.annualEnergyMWh} MWh/yr`, `ผลิตต่อเนื่อง ~${specs.annualEnergyMWh} MWh/ปี`);
      break;
    case 'solar-lease':
      areaUsed = `${plotShare} (~${specs.leasableRai} ${R('rai leased', 'ไร่ให้เช่า')})`;
      benefit = R(`Rent ~${(specs.annualLeaseTHB || 0).toLocaleString()} THB/yr — the developer builds the plant`,
                  `ค่าเช่า ~${(specs.annualLeaseTHB || 0).toLocaleString()} บาท/ปี — ผู้พัฒนาลงทุนสร้างเอง`);
      break;
    case 'data-center-lease':
      areaUsed = `${plotShare} (~${specs.leasableRai} ${R('rai leased', 'ไร่ให้เช่า')})`;
      benefit = R(`Premium site rent ~${(specs.annualLeaseTHB || 0).toLocaleString()} THB/yr if an operator commits`,
                  `ค่าเช่าระดับพรีเมียม ~${(specs.annualLeaseTHB || 0).toLocaleString()} บาท/ปี ถ้ามีผู้ประกอบการสนใจ`);
      break;
    case 'solar-warehouse':
      areaUsed = `${plotShare} (${R(`${specs.warehouseM2} m² warehouse + yard`, `โกดัง ${specs.warehouseM2} ตร.ม. + ลานรถ`)})`;
      benefit = R(`Rent ~150 THB/m²/mo at ~85% occupancy + rooftop PV offsets`,
                  `ค่าเช่า ~150 บาท/ตร.ม./เดือน ที่เข้าพัก ~85% + โซลาร์หลังคาช่วยค่าไฟ`);
      break;
    case 'carbon-forest':
      areaUsed = `${plotShare} (~${specs.plantableRai} ${R('rai planted', 'ไร่ที่ปลูก')})`;
      benefit = R(`~${specs.treeCount.toLocaleString()} trees → ~${specs.creditTonsYr} tCO2/yr credits + timber`,
                  `ต้นไม้ ~${specs.treeCount.toLocaleString()} ต้น → คาร์บอนเครดิต ~${specs.creditTonsYr} ตัน/ปี + ไม้`);
      break;
    case 'roadside-cafe':
      areaUsed = `${plotShare} (${R(`café ~${specs.shopM2} m² + parking`, `คาเฟ่ ~${specs.shopM2} ตร.ม. + ที่จอด`)})`;
      benefit = R(`Serves ~${specs.dailyCustomers} customers/day at this frontage`,
                  `รองรับลูกค้า ~${specs.dailyCustomers} คน/วันบนหน้าทางนี้`);
      break;
    case 'minimart':
      areaUsed = `${plotShare} (${R(`store ~${specs.shopM2} m²`, `ร้าน ~${specs.shopM2} ตร.ม.`)})`;
      benefit = R(`Est. daily sales ~${(specs.dailyGrossTHB || 0).toLocaleString()} THB`,
                  `ยอดขายประเมิน ~${(specs.dailyGrossTHB || 0).toLocaleString()} บาท/วัน`);
      break;
    case 'self-storage':
      areaUsed = `${plotShare} (${R(`${specs.storageUnits} storage units`, `ห้องเก็บของ ${specs.storageUnits} ห้อง`)})`;
      benefit = R(`${specs.storageUnits} units × ~2,400 THB/mo at ~70% occupancy`,
                  `${specs.storageUnits} ห้อง × ~2,400 บาท/เดือน ที่เข้าพัก ~70%`);
      break;
    case 'sports-court':
      areaUsed = `${plotShare} (${R(`${specs.courtCount} court hall ~${specs.hallM2} m²`, `โรงสนาม ${specs.courtCount} คอร์ท ~${specs.hallM2} ตร.ม.`)})`;
      benefit = R(`${specs.courtCount} courts rented ~160 THB/hour, evenings peak`,
                  `${specs.courtCount} คอร์ทให้เช่า ~160 บาท/ชม. พีคช่วงเย็น`);
      break;
    case 'homestay-camp':
      areaUsed = `${plotShare} (${R(`${specs.roomCount} cabins/tents`, `กระท่อม/เต็นท์ ${specs.roomCount} หลัง`)})`;
      benefit = R(`~${specs.roomCount} keys at ~950 THB/night, ~${specs.occupancyPct}% occupancy`,
                  `~${specs.roomCount} หลัง คืนละ ~950 บาท เข้าพัก ~${specs.occupancyPct}%`);
      break;
    case 'laundry-shop':
      areaUsed = `${plotShare} (${R(`${specs.machineCount} machines`, `เครื่องซัก ${specs.machineCount} เครื่อง`)})`;
      benefit = R(`${specs.machineCount} washers × ~9 loads/day at ~45 THB`,
                  `เครื่องซัก ${specs.machineCount} เครื่อง × ~9 รอบ/วัน รอบละ ~45 บาท`);
      break;
    case 'car-wash':
      areaUsed = `${plotShare} (${R(`${specs.bayCount} wash bays`, `ช่องล้าง ${specs.bayCount} ช่อง`)})`;
      benefit = R(`${specs.bayCount} bays ~1,200 THB/day each + vacuum`,
                  `${specs.bayCount} ช่อง ~1,200 บาท/วันต่อช่อง + เครื่องดูดฝุ่น`);
      break;
    default:
      areaUsed = '—'; benefit = '—';
  }

  return { capex, areaUsed, benefit, payback };
}

// Pre-investment checklist in plain language — R() picks Thai when lang==='th'
export function realityChecklist(projectId, lang = 'en') {
  const th = lang === 'th';
  const common = th
    ? ['สำรวจหน้างานและตรวจโฉนด/สิทธิ์การใช้ที่ดิน', 'ถามการไฟฟ้าท้องถิ่น (กฟภ./กฟน.) เรื่องจุดเชื่อมต่อและเงื่อนไข']
    : ['Survey the site and verify the title deed / land-use rights', 'Ask the local utility (PEA/MEA) about the interconnection point and conditions'];
  const per = th ? {
    'solar-farm': ['เช็คเขตผังเมือง/กฎการใช้ที่ดินกับองค์กรปกครองท้องถิ่น', 'ขออนุญาตก่อสร้าง/ถมดินตามกฎหมายท้องถิ่น'],
    'small-solar': ['เช็คว่าหลังคา/โครงรับน้ำหนักแผงได้ และไม่มีเงาบังกลางวัน', 'ถามการไฟฟ้า (กฟภ./กฟน.) เรื่องกฎการต่อระบบเล็กและมิเตอร์'],
    'solar-utility-kit': ['เขียนรายการโหลดที่ต้องใช้ (ไฟ พัดลม ปั๊ม) — เป็นตัวกำหนดขนาดชุด', 'วางแบตในที่ร่มและระบายอากาศ วางแผนเปลี่ยนรอบปีที่ 10'],
    'ev-moto-swap': ['นับผู้ขี่มอไซค์ไฟฟ้าที่ผ่านหน้างาน — รายได้ขึ้นกับดีมานด์ 100%', 'ถามเงื่อนไขพาร์ตเนอร์จากผู้ให้บริการเครือข่ายสลับก่อนซื้อตู้'],
    'solar-coldroom': ['สำรวจเกษตรกรใกล้เคียง — ความต้องการเช่าเป็นฤดูและเฉพาะท้องถิ่น', 'ฉนวน+คุณภาพคอมเพรสเซอร์กำหนดค่าไฟ — เทียบราคา 2–3 เจ้า'],
    'solar-dryer': ['เช็คว่าใกล้เคียงปลูกพืชอะไร — ความต้องการตามฤดูเก็บเกี่ยว', 'สุขลักษณะเกรดอาหารสำคัญสำหรับลูกค้าราคาดี'],
    'ev-charging-hub': ['สำรวจปริมาณรถจริงและคู่แข่งใกล้เคียง', 'ยื่นขอติดตั้งจุดชาร์จตามมาตรฐานการไฟฟ้า'],
    'agrivoltaics': ['ทดลองปลูกพืชทนร่มแปลงเล็กก่อน', 'เช็คกฎการใช้ที่เกษตรร่วมกับโครงสร้าง'],
    'grid-bess': ['มีผู้ซื้อบริการ/สัญญาชัดเจนก่อนลงทุน', 'ตรวจมาตรฐานความปลอดภัยแบตเตอรี่กับหน่วยงานกำกับ'],
    'floating-solar': ['ยืนยันสิทธิ์ใช้น้ำและความลึกบ่อจริง', 'ประเมินระดับน้ำขึ้นลงตลอดปี'],
    'biomass-biogas': ['ทำสัญญาปริมาณวัตถุดิบตลอดปี', 'ขอใบอนุญาตโรงงานและจัดการกลิ่นกับชุมชน'],
    'solar-lease': ['เทียบข้อเสนอจากผู้พัฒนา 2–3 เจ้า — อัตราค่าเช่าและเงื่อนไขขึ้นค่าเช่าต่างกันมาก', 'ให้ทนายอ่านสัญญาเช่า โดยเฉพาะเงื่อนไขสิ้นสุดสัญญาและการรื้อถอน'],
    'data-center-lease': ['เช็คไฟเบอร์ออปติกและกำลังสายส่งใกล้แปลง — เป็นตัวชี้ขาดหลัก', 'คาดการณ์ 6–12 เดียวก่อนได้สัญญา — ไม่ใช่รายได้ทันที'],
    'solar-warehouse': ['สำรวจคู่แข่งและความต้องการเช่าในพื้นที่ — อัตราเข้าพัก 85% เป็นแค่สมมติ', 'เช็คผังเมืองให้สร้างโกดังได้และทางเข้ารถบรรทุก'],
    'carbon-forest': ['ปรึกษา TGO/ผู้ลงทะเบียน T-VER — ขั้นตอนรับรองใช้เวลาหลายปี', 'รายได้หลักคือไม้ตอนตัด — คาร์บอนเครดิตยังให้เงินน้อยต่อไร่'],
    'roadside-cafe': ['นับรถและคู่แข่งบนหน้าทางจริงทั้งเช้า/เที่ยง/เย็น — ตัวเลขลูกค้าเป็นตัวกำหนดทั้งหมด', 'ขออนุญาตร้านอาหารและเช็คที่จอด/ทางกลับรถก่อนเซ็นสัญญาผู้รับเหมา'],
    'minimart': ['สำรวจคู่แข่งในรัศมี 1 กม. — เซเว่นใกล้ ๆ ตัดยอดขายครึ่งหนึ่งได้', 'นับครัวเรือน/หอพักรอบแปลง กำไรข้ามชาติบางมาก ยอดขายคือทุกอย่าง'],
    'self-storage': ['สำรวจดีมานด์: ร้านออนไลน์ คอนโด หอพักใกล้เคียง — 70% เข้าพักคือสมมติ', 'วางแผนทางไฟและทางกลับรถก่อนซื้อยูนิต จำนวนห้องติดกฎระยะห่าง'],
    'sports-court': ['เช็คว่ามีชุมชน/โรงงาน/โรงเรียนที่เล่นแบดหรือฟุตซอลในรัศมี 3-5 กม.', 'คุณภาพพื้นสนามคือสิ่งที่นักกีฬาจ่าย — อย่าประหยัดตรงนี้'],
    'homestay-camp': ['ทดสอบลง Airbnb/Agoda ก่อนลงทุนหนัก — 26% เข้าพักคือตัวเลขพอใช้', 'เช็คน้ำประปา/น้ำบาดาลและระบบน้ำเสีย — จุดตายของที่พักชนบท'],
    'laundry-shop': ['นับหอพัก/ที่เช่าในรัศมี 1 กม. — ถ้าไม่มีกลุ่มผู้เช่า ร้านไม่รอด', 'เช็คน้ำประปาแรงดันและท่อระบาย — เครื่องซักใช้น้ำมาก'],
    'car-wash': ['ดูคู่แข่งล้างรถในรัศมี 3 กม. และปริมาณรถผ่านจริง', 'วางระบบน้ำเสีย/ดักตะกอนให้ถูก — เทศบาลเข้มเรื่องนี้'],
  } : {
    'solar-farm': ['Check zoning / land-use rules with the local authority', 'Apply for construction / land-grading permits under local law'],
    'small-solar': ['Check the roof/structure can bear panel weight and has no daytime shading', 'Ask the utility (PEA/MEA) about small-system connection rules and metering'],
    'solar-utility-kit': ['List the loads it must run (lights, fans, pump) — that sets the kit size', 'Keep the battery shaded and ventilated; plan a replacement around year 10'],
    'ev-moto-swap': ['Count e-motorcycle riders passing the site — revenue is 100% demand-driven', 'Ask swap-network operators about partner terms before buying cabinets'],
    'solar-coldroom': ['Survey nearby growers — rental demand is seasonal and very local', 'Insulation + compressor quality decide the power bill — get 2–3 quotes'],
    'solar-dryer': ['Check which crops grow nearby — demand follows the harvest calendar', 'Food-grade hygiene matters for premium buyers'],
    'ev-charging-hub': ['Survey real traffic and nearby competitors', 'Apply to install charging under utility standards'],
    'agrivoltaics': ['Trial shade-tolerant crops on a small patch first', 'Check rules for combining farmland with structures'],
    'grid-bess': ['Secure a service buyer / clear contract before investing', 'Verify battery safety standards with regulators'],
    'floating-solar': ['Verify water-use rights and actual pond depth', 'Assess year-round water level variation'],
    'biomass-biogas': ['Get contracted year-round feedstock volume', 'Obtain a factory license and manage odor with the community'],
    'solar-lease': ['Compare offers from 2–3 developers — lease rates and escalation terms vary widely', 'Have a lawyer read the lease — especially end-of-term and decommissioning clauses'],
    'data-center-lease': ['Check fiber routes and substation capacity near the plot — they decide feasibility', 'Expect 6–12 months of due diligence before any lease is signed'],
    'solar-warehouse': ['Survey local rental competition — the 85% occupancy is an assumption', 'Verify zoning allows a warehouse and that trucks can reach the site'],
    'carbon-forest': ['Talk to TGO / a T-VER verifier early — registration takes years', 'Timber is the real revenue — carbon credits still pay little per rai'],
    'roadside-cafe': ['Count real traffic and competitors morning/noon/evening — the customer estimate decides everything', 'Get the food-shop license path and parking/U-turn right before signing a contractor'],
    'minimart': ['Survey competitors within 1 km — a nearby 7-Eleven can halve sales', 'Count households/dorms around the plot — margins are thin, volume is everything'],
    'self-storage': ['Check demand drivers: online sellers, condos, dorms nearby — 70% occupancy is an assumption', 'Plan fire lanes and truck turning before ordering units — count depends on clearances'],
    'sports-court': ['Verify a player community within 3-5 km — factories, schools, neighborhoods', 'Players pay for floor quality — do not economize on the court surface'],
    'homestay-camp': ['List on Airbnb/Agoda before building big — 26% occupancy is a fair guess, not a promise', 'Verify water supply and wastewater handling — the rural-lodging killer'],
    'laundry-shop': ['Count dorms/rentals within 1 km — without a renter base the shop fails', 'Check water pressure and drainage capacity — machines are thirsty'],
    'car-wash': ['Watch competitor washes and real traffic within 3 km', 'Settle wastewater drainage/oil traps properly — municipalities enforce this'],
  };
  return [...common, ...(per[projectId] || [])];
}
