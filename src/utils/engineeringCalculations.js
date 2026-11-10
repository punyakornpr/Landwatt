// ฟังก์ชันคำนวณและประเมินทางวิศวกรรมไฟฟ้าและการเงิน (Electrical Engineering & Techno-Economics)

// --- การแปลงหน่วยที่ดิน (Thai Land Units) ---
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

// คำนวณพื้นที่รูปหลายเหลี่ยม (Polygon Area) จากพิกัด Lat/Lng ในหน่วยตารางเมตร (m²)
export function calculatePolygonAreaSqM(coords) {
  if (!coords || coords.length < 3) return 0;
  const R = 6378137; // รัศมีโลก WGS84 ในหน่วยเมตร
  const len = coords.length;
  // คำนวณละติจูดเฉลี่ยเป็นเรเดียนเพื่อปรับสเกลแกนลองจิจูด
  const meanLat = (coords.reduce((sum, c) => sum + c.lat, 0) / len) * (Math.PI / 180);
  
  // แปลงพิกัดภูมิศาสตร์เป็น Cartesian Planar Coordinates (x, y) ในหน่วยเมตร
  const xy = coords.map(c => ({
    x: (c.lng * (Math.PI / 180)) * R * Math.cos(meanLat),
    y: (c.lat * (Math.PI / 180)) * R
  }));

  // สูตร Shoelace Formula (Gauss's Area Formula)
  let area = 0;
  for (let i = 0; i < len; i++) {
    const j = (i + 1) % len;
    area += (xy[i].x * xy[j].y) - (xy[j].x * xy[i].y);
  }
  return Math.abs(area / 2);
}

// คำนวณความยาวเส้นรอบรูป (Perimeter) ของแปลงที่ดินในหน่วยเมตร
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

// --- การประเมินคะแนนความเหมาะสม (Suitability Scoring Engine) ---
export function evaluateLandFeasibility(landData) {
  const {
    areaSqM = 0,
    provinceData = {},
    roadType = 'main', // 'main' (ทางหลวง/ถนนใหญ่), 'secondary' (ถนนรอง/ซอย), 'dirt' (ถนนลูกรัง/ไม่มีทางสาธารณะ)
    roadWidthMeters = 8,
    gridDistanceMeters = 100, // ระยะห่างถึงสายส่งแรงกลาง 22kV/33kV
    landType = 'flat', // 'flat' (ที่ราบ), 'slope' (ที่ลาดเอียง), 'pond' (มีบ่อน้ำ/แอ่งน้ำ), 'agri' (ที่ดินเกษตรเดิม)
    hasWaterBody = false,
    waterBodyAreaSqM = 0,
    hasAgriculturalWaste = false, // มีฟาร์มปศุสัตว์/ของเสียเกษตรใกล้เคียง
    soilStability = 'good', // 'good', 'medium', 'soft'
    zoningColor = 'green' // 'green' (ชนบทเกษตรกรรม), 'yellow' (ชุมชน), 'purple' (อุตสาหกรรม), 'orange' (การค้า)
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

  // 2. Agrivoltaics (เกษตร+โซลาร์)
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
    floatScore = 15; // ไม่มีบ่อน้ำ ไม่แนะนำ
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

// --- คำนวณรายละเอียดทางวิศวกรรมไฟฟ้าเฉพาะของแต่ละโครงการ (Deep Engineering Sizing) ---

// 1. คำนวณ Solar Farm (Ground-Mounted)
export function calculateSolarFarmSpecs(landData) {
  const { areaSqM = 1600, provinceData = {} } = landData;
  const ghi = provinceData.ghi || 5.1; // kWh/m2/day

  // [F-02] พื้นที่ใช้ประโยชน์สุทธิ = พื้นที่รวม − พื้นที่ยกเว้น (อาคาร/บ่อ/ต้นไม้ ที่ผู้ใช้ระบุ)
  // แล้วคิดสัดส่วนใช้งานจริงหลังหักระยะร่น/ถนนภายใน/ลานอุปกรณ์ = 78%
  const excludedAreaSqM = Math.max(0, landData.excludedAreaSqM || 0);
  const usableArea = Math.max(0, areaSqM - excludedAreaSqM) * 0.78;

  // แผงโซลาร์เซลล์เกรดอุตสาหกรรม: N-Type TOPCon Bifacial 620W
  // ขนาดแผง ~2.278m x 1.134m = 2.583 m2
  // ระยะ Pitch ทางวิศวกรรม (Tilt 15° หันไปทางทิศใต้ เพื่อหลบเงา Shading ช่วง 9:00 - 15:00) = ต้องใช้พื้นที่ ~4.0 m2 ต่อแผง
  const areaPerModule = 4.0;
  const moduleCount = Math.floor(usableArea / areaPerModule); // candidate จากพื้นที่ (ยังไม่ผ่าน string check)
  const moduleWatt = 620; // Watts

  // [F-05] ตรวจ PV String ตามแรงดันเมื่ออุณหภูมิเปลี่ยน (linear approx ตาม datasheet)
  // Module catalog (Demo): Voc_STC 45.2V, Vmp_STC 38.1V, beta_Voc -0.0025/°C, beta_Vmp -0.0030/°C
  // Inverter catalog (Demo): Vdc,max 1100V, MPPT range 200–1000V
  const PV = { voc: 45.2, vmp: 38.1, betaVoc: -0.0025, betaVmp: -0.0030 };
  const INV = { vdcMax: 1100, mpptMin: 200, mpptMax: 1000 };
  const T_MIN = 10, T_HIGH = 60; // °C ขอบเขตออกแบบ
  const vocCold = PV.voc * (1 + PV.betaVoc * (T_MIN - 25));
  const vmpHot = PV.vmp * (1 + PV.betaVmp * (T_HIGH - 25));
  const nsMax = Math.floor(INV.vdcMax / vocCold);
  const nsMin = Math.ceil(INV.mpptMin / vmpHot);
  const stringSize = Math.min(nsMax, 20); // เลือกขนาดสตริงตาม constraint แรงดัน (≤ nsMax, ≥ nsMin)
  const stringValid = nsMin <= nsMax;
  const stringCount = stringValid ? Math.floor(moduleCount / stringSize) : 0;
  const installedPanelCount = stringCount * stringSize; // [F-03] จำนวนแผงติดตั้งจริง (เต็มสตริง)
  const leftoverPanels = moduleCount - installedPanelCount;

  const dcCapacityKWp = (installedPanelCount * moduleWatt) / 1000;
  const dcCapacityMWp = dcCapacityKWp / 1000;

  // Inverter Sizing: DC/AC Ratio (ILR) ออกแบบมาตรฐานที่ 1.25
  const ilr = 1.25;
  const acRequiredKW = dcCapacityKWp / ilr; // กำลัง AC ที่ต้องการตาม ILR (ไม่ใช่ nameplate)

  // อินเวอร์เตอร์ String Inverter ขนาด 300 kW ต่อตัว (ประสิทธิภาพ 98.8%)
  const inverterCount = Math.max(1, Math.round(acRequiredKW / 300));
  // [F-06] พิกัด AC จริง = ผลรวม nameplate อินเวอร์เตอร์ที่เลือก
  const acCapacityMW = (inverterCount * 300) / 1000;
  // DC/AC จริงหลังปัดจำนวนอินเวอร์เตอร์ เช่น 967.2 kWp / 900 kWac = 1.075
  const actualDcAcRatio = dcCapacityKWp / (inverterCount * 300);

  // Performance Ratio (PR) = 80% (พิจารณา Cable loss, Temp coefficient -0.30%/°C, Inverter loss, Soiling)
  const pr = 0.80;
  // ผลิตไฟฟ้าต่อปี (MWh/year)
  const annualEnergyMWh = (dcCapacityKWp * ghi * 365 * pr) / 1000;

  // หม้อแปลงไฟฟ้า Step-Up Transformer (0.8 kV to 22 kV หรือ 33 kV)
  // S = P / pf (คิด pf = 0.95 lagging เผื่อ reactive power support)
  const requiredKVA = ((inverterCount * 300) / 0.95); // [F-14] S = P/PF จากพิกัด AC จริง
  // ปัดขึ้นตามขนาดมาตรฐานหม้อแปลง (kVA): 500, 1000, 1250, 1600, 2000, 2500, 3150
  const standardTransformerKVA = getNextStandardTransformer(requiredKVA);

  // การคำนวณสายส่งและสวิตช์เกียร์
  const mvVoltageKV = provinceData.grid === 'MEA' ? 24 : 22; // kV
  const ratedMVCurrentA = ((inverterCount * 300) / (Math.sqrt(3) * mvVoltageKV * 0.95)).toFixed(1);
  const recommendedMvCable = ratedMVCurrentA > 200 
    ? 'XLPE 24kV 1x300 sq.mm Al (หรือ Cu 185 sq.mm)' 
    : 'XLPE 24kV 1x185 sq.mm Al (หรือ Cu 95 sq.mm)';

  // การคำนวณด้านเศรษฐศาสตร์ (Techno-Economics)
  // อัตรา FiT อ้างอิง 2.1679 บาท/หน่วย — เป็นสถานการณ์สมมติ ไม่ใช่สิทธิรับซื้อไฟที่ยืนยัน
  const tariffPerKWh = 2.1679;
  const capexPerMWp = 21500000;
  const totalCapex = dcCapacityMWp * capexPerMWp;
  const annualRevenue = annualEnergyMWh * 1000 * tariffPerKWh;
  const opexPerYear = totalCapex * 0.015;

  // [F-24]+[F-26] cash flow รายปี 25 ปี (unlevered pre-tax) พร้อม degradation 0.4%/ปี [F-11]
  const DEG = 0.004;
  const cashFlows = [-totalCapex];
  for (let y = 1; y <= 25; y++) {
    cashFlows.push(annualRevenue * Math.pow(1 - DEG, y - 1) - opexPerYear);
  }
  // [F-26] ปีแรกที่ CCF ≥ 0
  let cum = -totalCapex, paybackYear = null;
  for (let y = 1; y <= 25 && paybackYear === null; y++) {
    cum += cashFlows[y];
    if (cum >= 0) paybackYear = y;
  }
  const netAnnualCashflow = annualRevenue - opexPerYear;
  const simplePaybackYears = paybackYear !== null ? String(paybackYear) : 'ไม่คืนทุนภายใน 25 ปี';
  // [F-26] interpolated payback ระหว่างสองปี (linear, สมมติเงินสดสม่ำเสมอในปี)
  let paybackInterp = null;
  if (paybackYear !== null && paybackYear > 0) {
    const prevCcf = cashFlows.slice(0, paybackYear).reduce((a, b) => a + b, 0);
    paybackInterp = (paybackYear - 1) + Math.abs(prevCcf) / cashFlows[paybackYear];
  }
  // [F-27]/[F-28] คำนวณจาก cashFlows เดียวกับกราฟเสมอ
  const npvValue = npvFromCashFlows(cashFlows);
  const irrValue = irrFromCashFlows(cashFlows);
  const irrPercent = irrValue === null ? 'N/A' : irrValue.toFixed(1);

  // ตัวชี้วัดสิ่งแวดล้อม (ESG)
  // Grid Emission Factor ไทย ~0.4999 kgCO2/kWh
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
      catalogStatus: 'demo', // อุปกรณ์จาก Demo Catalog ไม่ใช่ datasheet จริง
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
      totalCapexMillionTHB: (totalCapex / 1000000).toFixed(2),
      annualRevenueMillionTHB: (annualRevenue / 1000000).toFixed(2),
      netAnnualCashflowMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      paybackYears: simplePaybackYears,
      paybackInterpolated: paybackInterp !== null ? paybackInterp.toFixed(1) : '—',
      irrPercent: irrPercent,
      npv25YrMillionTHB: (npvValue / 1000000).toFixed(2)
    },
    esg: {
      co2TonsYear: Math.round(co2AvoidedTonsPerYear).toLocaleString(),
      treesEquivalent: treeEquivalent.toLocaleString()
    }
  };
}

// 2. คำนวณ Agrivoltaics (เกษตร+โซลาร์)
export function calculateAgrivoltaicsSpecs(landData) {
  const baseSolar = calculateSolarFarmSpecs(landData);
  const areaRai = landData.areaSqM / 1600;

  // ระยะห่างแถวเพิ่มขึ้น 40% และยกสูง 3.0 เมตร → จำนวนสตริงลดเหลือ 70% (คงขนาดสตริงเดิม)
  const sd = baseSolar.stringDesign;
  const agriStringCount = Math.floor(sd.stringCount * 0.70);
  const agriInstalledPanels = agriStringCount * sd.stringSize;
  const dcCapacityMWp = (agriInstalledPanels * 620 / 1e6).toFixed(3); // [F-04] จากจำนวนแผงติดตั้งจริง
  const dcCapacityKWp = agriInstalledPanels * 620 / 1000;
  const dcRatio = parseFloat(dcCapacityMWp) / parseFloat(baseSolar.dcCapacityMWp);
  const annualEnergyMWh = Math.round(parseFloat(baseSolar.annualEnergyMWh.replace(/,/g, '')) * dcRatio); // F-09A เส้นทางเดียวกับ solar — ไม่คูณ microclimate เพิ่ม

  // [F-06]/[F-07] คำนวณอินเวอร์เตอร์ใหม่จาก DC ของ agrivoltaics จริง (ห้ามใช้ของ solar farm เดิม)
  const agriInverterCount = Math.max(1, Math.round((dcCapacityKWp / 1.25) / 300));
  const agriAcCapacityMW = (agriInverterCount * 300) / 1000;
  const agriDcAcRatio = dcCapacityKWp / (agriInverterCount * 300);
  const agriTransformerKVA = getNextStandardTransformer((agriInverterCount * 300) / 0.95); // [F-14]
  const agriMvCurrentA = ((agriInverterCount * 300) / (Math.sqrt(3) * 22 * 0.95)).toFixed(1);

  // ต้นทุนโครงสร้างยกสูง 3.0m เสาหนาพิเศษชุบ Hot-Dip Galvanized +25%
  const capexPerMWp = 25000000;
  const totalCapex = (dcCapacityKWp / 1000) * capexPerMWp; // ใช้ kWp เต็ม ไม่ใช้ MWp ที่ปัดแล้ว
  
  // รายได้ค่าไฟฟ้า (FiT 2.1679 บาท)
  const powerRevenue = annualEnergyMWh * 1000 * 2.1679;
  // รายได้ผลผลิตการเกษตรใต้ร่มเงา (เช่น วานิลลา, ฟ้าทะลายโจร, เห็ดหลินจือ, ผักสลัดออร์แกนิก) ~150,000 บาท/ไร่/ปี
  const agriRevenue = areaRai * 160000;
  const totalAnnualRevenue = powerRevenue + agriRevenue;
  const opexPerYear = (totalCapex * 0.018) + (areaRai * 30000); // OPEX รวมดูแลพืช
  const netAnnualCashflow = totalAnnualRevenue - opexPerYear;

  // [F-24] cash flow แยกกลไก: รายได้ไฟฟ้าเสื่อมตามแผง (0.4%/ปี) รายได้พืชคงที่ — ไม่หัก degradation กับพืชผล
  const AGRI_DEG = 0.004;
  const cashFlows = [-totalCapex];
  for (let y = 1; y <= 25; y++) {
    cashFlows.push(powerRevenue * Math.pow(1 - AGRI_DEG, y - 1) + agriRevenue - opexPerYear);
  }
  let cum = -totalCapex, paybackYear = null;
  for (let y = 1; y <= 25 && paybackYear === null; y++) {
    cum += cashFlows[y];
    if (cum >= 0) paybackYear = y;
  }
  const paybackYears = paybackYear !== null ? String(paybackYear) : 'ไม่คืนทุนภายใน 25 ปี';
  const npvValue = npvFromCashFlows(cashFlows);
  const irrValue = irrFromCashFlows(cashFlows);

  return {
    ...baseSolar,
    dcCapacityMWp,
    dcCapacityKWp: Math.round(dcCapacityKWp),
    acCapacityMW: agriAcCapacityMW.toFixed(3),
    inverterCount: agriInverterCount,
    actualDcAcRatio: agriDcAcRatio.toFixed(3),
    transformerRating: `${agriTransformerKVA} kVA, 22kV/0.4kV, Dyn11, ONAN (ประเมินเบื้องต้น)`,
    transformerKVA: agriTransformerKVA,
    mvCurrentAmp: agriMvCurrentA,
    moduleCount: agriInstalledPanels.toLocaleString(),
    areaCandidatePanelCount: baseSolar.areaCandidatePanelCount,
    baseStringCount: sd.stringCount, // จำนวนสตริงก่อนหักพื้นที่เกษตร — ใช้อธิบายใน F-03
    panelSpacingFactor: 0.70, // สมมติฐานการจัดวาง agrivoltaics (ยังไม่ยืนยันพืชจริง)
    stringDesign: { ...sd, stringCount: agriStringCount, installedPanelCount: agriInstalledPanels, leftoverPanels: 0 },
    annualEnergyMWh: annualEnergyMWh.toLocaleString(),
    capexPerMWpMillionTHB: (capexPerMWp / 1000000).toFixed(1),
    mountingStructure: 'โครงสร้างยกสูงพิเศษ (Clearance 3.0 m) รองรับรถแทรกเตอร์และการปลูกพืช',
    cropsRecommended: 'วานิลลา, ฟ้าทะลายโจร, ขมิ้นชัน, เห็ดตระกูลต่างๆ, ผักสลัดไฮโดรโปนิกส์ใต้ร่ม',
    dualIncome: {
      powerRevenueMillionTHB: (powerRevenue / 1000000).toFixed(2),
      agriRevenueMillionTHB: (agriRevenue / 1000000).toFixed(2),
      totalRevenueMillionTHB: (totalAnnualRevenue / 1000000).toFixed(2)
    },
    financials: {
      totalCapexMillionTHB: (totalCapex / 1000000).toFixed(2),
      annualRevenueMillionTHB: (totalAnnualRevenue / 1000000).toFixed(2),
      netAnnualCashflowMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      paybackYears,
      irrPercent: irrValue === null ? 'N/A' : irrValue.toFixed(1),
      npv25YrMillionTHB: (npvValue / 1000000).toFixed(2)
    },
    cashFlows,
  };
}

// 3. คำนวณ EV Charging Plaza & Solar Canopy & BESS
export function calculateEVHubSpecs(landData) {
  const { areaSqM = 1600, roadWidthMeters = 8, provinceData = {} } = landData;
  const areaRai = areaSqM / 1600;

  // กำหนดจำนวนช่องชาร์จตามขนาดพื้นที่
  let dcFastChargerCount = 4; // เริ่มต้น 4 ตู้ (8 หัวชาร์จ)
  if (areaRai >= 2) dcFastChargerCount = 8; // 16 หัวชาร์จ
  if (areaRai >= 4) dcFastChargerCount = 12; // 24 หัวชาร์จ

  // ตู้ชาร์จแบบ DC Superfast 180kW Dual-gun (CCS2 + CCS2)
  const chargerPowerKW = 180;
  // [F-12] DC charger output → AC input ผ่าน η=0.95
  const totalPeakEVLoadKW = (dcFastChargerCount * chargerPowerKW) / 0.95;

  // Solar Canopy บนหลังคาที่จอดรถ (1 คัน ~ 15 m2 ติดตั้งได้ ~2.5 kWp)
  const parkingBays = dcFastChargerCount * 2 + 10; // รวมที่จอดพัก
  const solarCanopyKWp = Math.round(parkingBays * 2.8);

  // BESS ติดตั้งร่วมเพื่อ Shave Peak Load และลดค่า Demand Charge (ขนาด ~200 - 500 kWh)
  const bessKWh = dcFastChargerCount >= 8 ? 500 : 250;
  const bessPowerKW = bessKWh / 2; // C-rate 0.5C

  // หม้อแปลงไฟฟ้าสำหรับสถานีชาร์จ (คิด Diversity factor = 0.70 เนื่องจากรถไม่ได้ชาร์จเต็ม 100% พร้อมกันตลอดเวลา และมี BESS ช่วยเสริม)
  // [F-13] DF 0.70 = สมมติฐาน diversity; [F-14] S = P/PF, PF=0.98
  const transformerKVA = getNextStandardTransformer(((totalPeakEVLoadKW * 0.70) - bessPowerKW) / 0.98);

  // การประเมินทางการเงิน (จำนวนรถเข้าชาร์จเฉลี่ยต่อหัวชาร์จ 6-8 คัน/วัน)
  const dailyCars = (dcFastChargerCount * 2) * 7;
  const avgKWhPerSession = 40; // ชาร์จครั้งละ 40 หน่วย (10% -> 80%)
  const dailyKWhSold = dailyCars * avgKWhPerSession;
  const annualKWhSold = dailyKWhSold * 365;

  // อัตราค่าบริการชาร์จ (อัตราเฉลี่ย 7.50 บาท/หน่วย)
  const sellRate = 7.50;
  // ต้นทุนค่าไฟ TOU กฟภ./กฟน. เฉลี่ย 4.60 บาท/หน่วย (เมื่อบริหารจัดการผ่าน BESS และ Solar Canopy)
  const costRate = 4.30;
  const marginPerKWh = sellRate - costRate;

  const annualChargingRevenue = annualKWhSold * sellRate;
  const annualElectricityCost = annualKWhSold * costRate;
  // รายได้เสริมจากค่าเช่าร้านกาแฟ / 7-Eleven / ตู้จำหน่ายสินค้า ~35,000 บาท/เดือน
  const commercialRentalRevenue = 35000 * 12;
  const netAnnualCashflow = (annualKWhSold * marginPerKWh) + commercialRentalRevenue - 450000; // หักค่าบำรุงรักษา/ระบบ

  // CAPEX: ตู้ชาร์จ 180kW (~1.1 ลบ./ตู้) + Solar Carport + BESS + หม้อแปลง + ระบบควบคุม
  const chargersCost = dcFastChargerCount * 1100000;
  const canopyCost = solarCanopyKWp * 28000;
  const bessCost = bessKWh * 9500;
  const transformerAndCivil = 1800000 + (dcFastChargerCount * 150000);
  const totalCapex = chargersCost + canopyCost + bessCost + transformerAndCivil;

  const paybackYears = (totalCapex / netAnnualCashflow).toFixed(1);

  return {
    dcChargersCount: dcFastChargerCount,
    totalGuns: dcFastChargerCount * 2,
    chargerModel: 'DC Superfast 180kW Dual Gun (CCS2) Liquid-Cooled Ready',
    solarCanopyKWp,
    bessKWh,
    transformerRating: `${transformerKVA} kVA, 22kV / 400V, 3-Phase, Oil-immersed`,
    dailyCarsServiced: dailyCars,
    annualEnergyDispensedMWh: Math.round(annualKWhSold / 1000),
    financials: {
      totalCapexMillionTHB: (totalCapex / 1000000).toFixed(2),
      annualRevenueMillionTHB: (annualChargingRevenue / 1000000).toFixed(2),
      netAnnualProfitMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      paybackYears,
      irrPercent: calculateIRR(totalCapex, annualChargingRevenue, annualElectricityCost + 450000, 15, 0).toFixed(1)
    },
    electricalFeatures: [
      'ระบบบริหารจัดการกำลังไฟฟ้าอัจฉริยะ (Dynamic Load Management - DLM)',
      'ระบบตัดตอนป้องกันไฟดูด ไฟรั่ว Type B RCD และ Surge Protection Class I+II',
      'รองรับระบบชำระเงินมาตรฐาน OCPP 1.6J / 2.0.1 เชื่อมต่อแอปพลิเคชันทุกค่าย'
    ]
  };
}

// 4. คำนวณ Grid-Scale BESS Farm
export function calculateBESSFarmSpecs(landData) {
  const { areaSqM = 1600 } = landData;
  const areaRai = areaSqM / 1600;

  // ตู้คอนเทนเนอร์ 40ft LFP ความจุตู้ละ ~3.72 MWh
  // 1 ไร่ สามารถวางได้ประมาณ 2-4 ตู้ (รวมระยะปลอดภัย NFPA 855 ระยะเว้น 3 เมตร)
  const containerCount = Math.min(Math.max(1, Math.floor(areaRai * 2)), 8);
  const capacityMWh = containerCount * 3.72;
  const powerMW = capacityMWh / 2; // Duration 2 hours (0.5C)

  // CAPEX BESS ระดับกริด ~10,500,000 บาท/MWh
  const totalCapex = capacityMWh * 10500000;
  // Revenue จากสัญญาเช่าความจุ (Capacity Availability Payment) + ค่าทำ Arbitrage ~1.8 ล้านบาท/MWh/ปี
  const annualRevenue = capacityMWh * 1800000;
  const opexPerYear = totalCapex * 0.02;
  const netAnnualCashflow = annualRevenue - opexPerYear;

  return {
    containerCount,
    capacityMWh: capacityMWh.toFixed(1),
    powerMW: powerMW.toFixed(1),
    batteryType: 'Lithium Iron Phosphate (LFP) Grade-A Prism Cells',
    coolingSystem: 'Liquid Cooling Thermal Management System (รักษาอุณหภูมิ cell delta T < 2.5°C)',
    fireSuppression: 'Novec 1230 / Aerosol พร้อมระบบตรวจจับควันและแก๊สพิษ 3 ระดับ',
    pcsInverter: `Bi-directional PCS ${powerMW.toFixed(1)} MW (Eff > 98.9%)`,
    financials: {
      totalCapexMillionTHB: (totalCapex / 1000000).toFixed(2),
      annualRevenueMillionTHB: (annualRevenue / 1000000).toFixed(2),
      netAnnualProfitMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      paybackYears: (totalCapex / netAnnualCashflow).toFixed(1),
      irrPercent: calculateIRR(totalCapex, annualRevenue, opexPerYear, 15, 0.015).toFixed(1)
    }
  };
}

// 5. คำนวณ Floating Solar
export function calculateFloatingSolarSpecs(landData) {
  const base = calculateSolarFarmSpecs(landData);
  // ประสิทธิภาพแผงบนผิวน้ำสูงขึ้น 8% จากผลการระบายความร้อน (Cooling Effect)
  const annualEnergyMWh = Math.round(parseFloat(base.annualEnergyMWh.replace(/,/g, '')) * 1.08);
  const totalCapex = parseFloat(base.financials.totalCapexMillionTHB) * 1.15 * 1000000; // ทุ่นลอยน้ำและสายเคเบิลกันน้ำใต้น้ำเพิ่ม 15%
  const annualRevenue = annualEnergyMWh * 1000 * 2.1679;
  const opexPerYear = totalCapex * 0.016;
  const netAnnualCashflow = annualRevenue - opexPerYear;

  // การระเหยของน้ำลดลงเฉลี่ย ~1,200 ลบ.ม./ไร่/ปี
  const waterSavedCubicMeters = Math.round((landData.areaSqM / 1600) * 1200);

  return {
    ...base,
    annualEnergyMWh: annualEnergyMWh.toLocaleString(),
    pontoonType: 'HDPE Food-grade UV Stabilized (รับประกัน 25 ปี)',
    waterSavedM3Year: waterSavedCubicMeters.toLocaleString(),
    financials: {
      totalCapexMillionTHB: (totalCapex / 1000000).toFixed(2),
      annualRevenueMillionTHB: (annualRevenue / 1000000).toFixed(2),
      netAnnualCashflowMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      paybackYears: (totalCapex / netAnnualCashflow).toFixed(1),
      irrPercent: calculateIRR(totalCapex, annualRevenue, opexPerYear, 25, 0.004).toFixed(1)
    }
  };
}

// 6. คำนวณ Biogas / Biomass
export function calculateBiogasSpecs(landData) {
  const areaRai = landData.areaSqM / 1600;
  // โรงไฟฟ้าขนาด 1.0 MW (หรือตามขนาดที่เหมาะสม)
  const generatorCapacityKW = Math.min(Math.max(500, Math.round(areaRai * 200)), 2000);
  const generatorCapacityMW = (generatorCapacityKW / 1000).toFixed(2);
  
  // ผลิตไฟฟ้า 24 ชั่วโมง (Capacity Factor 85%)
  const annualEnergyMWh = Math.round(generatorCapacityKW * 8760 * 0.85 / 1000);
  // ค่า FiT ชีวภาพ/ชีวมวล กกพ. เฉลี่ย ~3.13 บาท/หน่วย (มี FiT Premium)
  const fitRate = 3.13;
  const capexPerKW = 65000; // ~65,000 บาท/kW
  const totalCapex = generatorCapacityKW * capexPerKW;
  const annualRevenue = annualEnergyMWh * 1000 * fitRate;
  const opexPerYear = totalCapex * 0.07; // บำรุงรักษาเครื่องยนต์ก๊าซและวัตถุดิบ
  const netAnnualCashflow = annualRevenue - opexPerYear;

  return {
    generatorCapacityKW,
    generatorCapacityMW,
    generatorType: 'Biogas Lean-Burn Synchronous Gas Engine Generator 1500 RPM',
    digesterVolumeM3: Math.round(generatorCapacityKW * 4.5).toLocaleString(),
    annualEnergyMWh: annualEnergyMWh.toLocaleString(),
    capacityFactor: '85% (จ่ายไฟต่อเนื่อง 24 ชม. เป็นโรงไฟฟ้าฐาน)',
    financials: {
      totalCapexMillionTHB: (totalCapex / 1000000).toFixed(2),
      annualRevenueMillionTHB: (annualRevenue / 1000000).toFixed(2),
      netAnnualProfitMillionTHB: (netAnnualCashflow / 1000000).toFixed(2),
      paybackYears: (totalCapex / netAnnualCashflow).toFixed(1),
      irrPercent: calculateIRR(totalCapex, annualRevenue, opexPerYear, 20, 0.005).toFixed(1)
    }
  };
}

// --- ฟังก์ชันช่วยเหลือทางวิศวกรรมและการเงิน ---
function getNextStandardTransformer(requiredKVA) {
  const standardRatings = [160, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000];
  for (const rating of standardRatings) {
    if (rating >= requiredKVA) return rating;
  }
  return Math.ceil(requiredKVA / 1000) * 1000;
}

// NPV จากชุด cash flow จริง [F-27] — ใช้ฐานเดียวกับกราฟ/รายงานเสมอ
function npvFromCashFlows(cashFlows, discountRate = 0.06) {
  let npv = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    npv += cashFlows[t] / Math.pow(1 + discountRate, t);
  }
  return npv;
}

// IRR จากชุด cash flow จริง [F-28] — bisection; คืน null ถ้าไม่มี sign change
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

function calculateNPV(capex, netAnnualCashflow, years = 25, discountRate = 0.06) {
  let npv = -capex;
  for (let t = 1; t <= years; t++) {
    npv += netAnnualCashflow / Math.pow(1 + discountRate, t);
  }
  return npv / 1000000; // Return in Million THB
}

function calculateIRR(capex, revenue, opex, years = 25, degradation = 0.004) {
  // Approximate internal rate of return using Newton-Raphson
  let rate = 0.10;
  for (let iter = 0; iter < 20; iter++) {
    let npv = -capex;
    let dNpv = 0;
    for (let t = 1; t <= years; t++) {
      const yearRevenue = revenue * Math.pow(1 - degradation, t - 1);
      const cf = yearRevenue - opex;
      npv += cf / Math.pow(1 + rate, t);
      dNpv -= (t * cf) / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(npv) < 1000) break;
    if (dNpv === 0) break;
    rate = rate - npv / dNpv;
    if (rate < -0.5 || rate > 2.0) { rate = 0.08; break; }
  }
  return Math.max(0, rate * 100);
}
