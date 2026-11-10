// Recommendation Engine: คัดกรองเงื่อนไข → ให้คะแนนตามเกณฑ์ → อธิบายเหตุผล
// คะแนนเป็นตัวชี้ "ความเหมาะสมในเบื้องต้นตามเกณฑ์ของระบบ" ไม่ใช่โอกาสสำเร็จหรือกำไร

import { evaluateLandFeasibility } from '../utils/engineeringCalculations';

export const STATUS = {
  great:        { label: 'เหมาะมาก',       color: 'bg-energy-100 text-energy-800 border-energy-200', dot: 'bg-energy-500' },
  worth:        { label: 'น่าศึกษาต่อ',    color: 'bg-electric-100 text-electric-800 border-electric-200', dot: 'bg-electric-500' },
  insufficient: { label: 'ต้องมีข้อมูลเพิ่ม', color: 'bg-volt-100 text-volt-800 border-volt-200', dot: 'bg-volt-500' },
  no:           { label: 'ยังไม่แนะนำ',     color: 'bg-zinc-100 text-zinc-500 border-zinc-200', dot: 'bg-zinc-400' },
};

const BUDGET_MAX_THB = {
  'under-500k': 500000,
  '0.5-2m': 2000000,
  '2-5m': 5000000,
  '5-10m': 10000000,
  'over-10m': Infinity,
  unsure: Infinity,
};

// friendly meta per project type
export const PROJECT_FRIENDLY = {
  'solar-farm': {
    name: 'ทำโซลาร์เซลล์ผลิตไฟฟ้า',
    sub: 'Solar Farm',
    icon: 'Sun',
    oneLiner: 'ติดตั้งแผงรับแสงอาทิตย์บนพื้นดิน เพื่อขายไฟหรือลดค่าไฟในระยะยาว',
  },
  'ev-charging-hub': {
    name: 'จุดชาร์จรถไฟฟ้า',
    sub: 'EV Charging Station',
    icon: 'Zap',
    oneLiner: 'สถานีชาร์จรถไฟฟ้าความเร็วสูง พร้อมหลังคาโซลาร์และแบตเตอรี่ช่วยลดต้นทุนไฟ',
  },
  'agrivoltaics': {
    name: 'ทำเกษตรคู่กับแผงโซลาร์เซลล์',
    sub: 'Agrivoltaics',
    icon: 'Sprout',
    oneLiner: 'ยกแผงโซลาร์สูงขึ้น ปลูกพืชใต้ร่มเงาต่อไป ได้ทั้งรายได้พืชและรายได้ไฟ',
  },
  'grid-bess': {
    name: 'ระบบแบตเตอรี่เก็บพลังงาน',
    sub: 'Battery Storage (BESS)',
    icon: 'BatteryCharging',
    oneLiner: 'ตู้แบตเตอรี่ขนาดใหญ่สำหรับเก็บ-จ่ายไฟ เหมาะกับกรณีธุรกิจที่มีโหลดไฟชัดเจน',
  },
  'floating-solar': {
    name: 'โซลาร์เซลล์ลอยน้ำ',
    sub: 'Floating Solar',
    icon: 'Waves',
    oneLiner: 'ติดตั้งแผงบนทุ่นลอยในบ่อน้ำหรืออ่างเก็บน้ำ ใช้พื้นที่น้ำที่ไม่ได้ใช้อยู่',
  },
  'biomass-biogas': {
    name: 'ไฟฟ้าจากก๊าซชีวภาพ',
    sub: 'Biogas / Biomass',
    icon: 'Flame',
    oneLiner: 'เปลี่ยนของเสียเกษตรหรือมูลสัตว์เป็นก๊าซปั่นไฟ ต้องมีวัตถุดิบต่อเนื่อง',
  },
};

// เหตุผล/ข้อควรระวัง จากข้อมูลจริงของแปลง
function reasonsFor(projectId, land) {
  const areaRai = land.areaSqM / 1600;
  const ghi = land.provinceData?.ghi || 5.0;
  const reasons = [];
  const cautions = [];

  switch (projectId) {
    case 'solar-farm':
      if (ghi >= 5.1) reasons.push(`พื้นที่นี้มีแดดดี (รังสีเฉลี่ย ${ghi} kWh/ตร.ม./วัน) เหมาะกับการผลิตไฟจากแสงอาทิตย์`);
      if (areaRai >= 2) reasons.push(`ขนาดที่ดิน ${areaRai.toFixed(1)} ไร่ เพียงพอสำหรับการวางแผงและทางเดินบำรุงรักษา`);
      if (land.landType === 'flat') reasons.push('จากข้อมูลที่คุณระบุว่าเป็นที่ราบ/โล่ง เหมาะกับการวางแผง (ยังไม่ได้ตรวจสอบเงาบดบังภาคสนาม)');
      if (land.hasShading === null) cautions.push('ยังไม่ทราบเรื่องเงาบดบัง (ต้นไม้/อาคาร) — ผลผลิตและพื้นที่วางแผงจริงอาจต่ำกว่าที่ประเมิน');
      if (land.gridDistanceMeters > 500) cautions.push(`จุดเชื่อมต่อไฟฟ้าอยู่ไกล (~${land.gridDistanceMeters} ม.) อาจมีค่าขยายเขตสายไฟเพิ่ม`);
      if (areaRai < 2) cautions.push('ที่ดินแปลงเล็ก ขนาดระบบจะจำกัด เหมาะทำเพื่อใช้ไฟเองมากกว่าขายไฟเชิงพาณิชย์');
      cautions.push('การขายไฟให้การไฟฟ้าต้องผ่านการยื่นขอเชื่อมต่อระบบและอาจมีโควต้าจำกัด');
      break;
    case 'ev-charging-hub':
      if (land.roadType === 'main') reasons.push('ที่ดินติดถนนสายหลัก รถผ่านสะดวก เหมาะกับสถานีชาร์จ');
      if (land.roadWidthMeters >= 10) reasons.push('ถนนหน้าแปลงกว้าง รถเข้าออกง่าย วางทางวิ่งรถได้ดี');
      if ((land.provinceData?.evPotential || 0) >= 0.85) reasons.push(`จังหวัด${land.provinceData?.name} มีการใช้รถไฟฟ้าค่อนข้างสูง`);
      if (areaRai >= 1) reasons.push('พื้นที่เพียงพอวางจุดชาร์จ ที่จอด และมุมพักผ่อน');
      cautions.push('รายได้ขึ้นกับจำนวนรถที่เข้าใช้จริง ควรสำรวจปริมาณรถหน้าแปลงก่อนตัดสินใจ');
      cautions.push('ความต้องการชาร์จและความสามารถรับกำลังของโครงข่ายยังไม่ได้ยืนยัน — ระยะสายไฟที่กรอกเป็นเพียงค่าประมาณ ต้องติดต่อการไฟฟ้า');
      if (land.roadType !== 'main') cautions.push('ไม่ได้ติดถนนสายหลัก อาจต้องพิจารณาทำเลลูกค้าเพิ่ม');
      break;
    case 'agrivoltaics':
      if (land.landType === 'agri') reasons.push('ที่ดินเป็นแปลงเกษตรอยู่แล้ว — ลักษณะเหมาะกับแนวคิดทำเกษตรคู่กับแผง (ต้องตรวจความเหมาะของพืชจริง)');
      if (ghi >= 4.9) reasons.push('แดดเพียงพอสำหรับทั้งการผลิตไฟและการเจริญเติบโตของพืชใต้ร่ม');
      if (areaRai >= 1.5 && areaRai <= 20) reasons.push('ขนาดแปลงเหมาะกับรูปแบบเกษตรผสมผสาน');
      cautions.push('ต้นทุนโครงสร้างยกสูงมากกว่าโซลาร์บนดินปกติ และต้องเลือกพืชที่เหมาะกับร่มเงา');
      cautions.push('รายได้พืชผลขึ้นกับการดูแลและตลาด ไม่ใช่ตัวเลขที่รับประกันได้');
      break;
    case 'grid-bess':
      if (land.gridDistanceMeters <= 200) reasons.push('อยู่ใกล้แนวสายไฟ เชื่อมต่อระบบสะดวก');
      reasons.push('ใช้พื้นที่น้อยต่อมูลค่าโครงการเมื่อเทียบกับทางเลือกอื่น');
      cautions.push('แบตเตอรี่อย่างเดียวไม่ผลิตไฟเอง — ต้องมีแหล่งไฟหรือกรณีธุรกิจชัดเจน (เช่น สำรองไฟ, ลดค่า Peak)');
      cautions.push('รายได้จากบริการระบบไฟฟ้าต้องอาศัยสัญญากับหน่วยงาน/ผู้ประกอบการ ไม่สามารถประเมินได้จากที่ดินอย่างเดียว');
      break;
    case 'floating-solar':
      if (land.hasWaterBody || land.landType === 'pond') reasons.push('มีแหล่งน้ำในแปลง ใช้พื้นที่ผิวน้ำที่ไม่ได้ใช้ประโยชน์อยู่');
      if (ghi >= 5.0) reasons.push('แดดดี และผิวน้ำช่วยระบายความร้อนให้แผงผลิตไฟได้มากขึ้นเล็กน้อย');
      cautions.push('ต้นทุนทุ่นลอยและระบบยึดโยงสูงกว่าแบบบนดิน และต้องตรวจสิทธิ์การใช้ผิวน้ำ');
      break;
    case 'biomass-biogas':
      if (land.hasAgriculturalWaste) reasons.push('จากข้อมูลที่คุณระบุว่ามีของเสียเกษตร — อาจมีวัตถุดิบใช้ได้ แต่ยังไม่ได้ยืนยันปริมาณและความต่อเนื่องจริง');
      reasons.push('ผลิตไฟได้ต่อเนื่องตลอดวัน ไม่ขึ้นกับสภาพอากาศ (หากวัตถุดิบเพียงพอ)');
      cautions.push('ต้องสำรวจยืนยันแหล่งวัตถุดิบจริง ปริมาณต่อวัน และความต่อเนื่องตลอดปี รวมถึงค่าขนส่งเข้าแปลง ก่อนสรุปความเป็นไปได้');
      cautions.push('มีเรื่องการจัดการกลิ่นและใบอนุญาตโรงงานที่ต้องดำเนินการ');
      break;
  }
  return { reasons, cautions };
}

// คัดกรองเชิงเงื่อนไขก่อนให้คะแนน (Hard screening)
function screening(projectId, land, goals) {
  const areaRai = land.areaSqM / 1600;
  const aims = goals?.aims || [];

  switch (projectId) {
    case 'floating-solar':
      if (!land.hasWaterBody && land.landType !== 'pond')
        return { status: 'no', blockReason: 'ไม่มีแหล่งน้ำในแปลง — โซลาร์ลอยน้ำต้องมีบ่อน้ำหรืออ่างเก็บน้ำ' };
      return null;
    case 'biomass-biogas':
      if (!land.hasAgriculturalWaste)
        return { status: 'insufficient', blockReason: 'ยังไม่มีข้อมูลวัตถุดิบชีวภาพ (ของเสียเกษตร/มูลสัตว์) ที่ต่อเนื่องพอสำหรับปั่นไฟ' };
      return null;
    case 'ev-charging-hub':
      if (land.roadType === 'dirt')
        return { status: 'no', blockReason: 'ทางเข้าเป็นถนนลูกรัง/ทางย่อย รถทั่วไปเข้าถึงยาก ไม่เหมาะทำสถานีชาร์จ' };
      if (areaRai < 0.3)
        return { status: 'no', blockReason: 'พื้นที่เล็กเกินไปสำหรับจุดชาร์จ ที่จอด และทางวิ่งรถ' };
      if (land.landType === 'pond')
        return { status: 'insufficient', blockReason: 'พื้นที่ส่วนใหญ่เป็นแหล่งน้ำ ต้องตรวจสอบพื้นที่แห้งที่เหลือก่อน' };
      return null;
    case 'grid-bess':
      if (!aims.includes('backup') && !aims.includes('income'))
        return { status: 'insufficient', blockReason: 'แบตเตอรี่ล้วนต้องมีกรณีใช้งานชัดเจน (สำรองไฟ/ธุรกิจพลังงาน) — เลือกเป้าหมายที่เกี่ยวข้องเพื่อประเมินเพิ่ม' };
      if (land.gridDistanceMeters > 800)
        return { status: 'insufficient', blockReason: 'อยู่ไกลระบบสายไฟมาก ต้องตรวจสอบการเชื่อมต่อกับการไฟฟ้าก่อน' };
      return null;
    case 'solar-farm':
      if (areaRai < 0.5)
        return { status: 'no', blockReason: 'พื้นที่เล็กเกินไปสำหรับติดตั้งแผงบนพื้นดินอย่างมีนัยสำคัญ' };
      return null;
    case 'agrivoltaics':
      if (areaRai < 0.5)
        return { status: 'no', blockReason: 'พื้นที่เล็กเกินไปสำหรับการทำเกษตรคู่แผงโซลาร์' };
      if (land.landType === 'pond')
        return { status: 'no', blockReason: 'พื้นที่ส่วนใหญ่เป็นแหล่งน้ำ ไม่เหมาะกับการปลูกพืชคู่แผง' };
      return null;
  }
  return null;
}

// ปรับคะแนนตามเป้าหมายผู้ใช้
function goalBoost(projectId, aims) {
  const map = {
    'solar-farm': ['income', 'save', 'unsure'],
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

// ระดับความมั่นใจของข้อมูลที่ใช้ประเมิน
export function dataConfidence(land) {
  const missing = [];
  if (!land.provinceId) missing.push('ที่ตั้งที่ดิน');
  if (!land.areaSqM || land.areaSqM <= 0) missing.push('ขนาดพื้นที่');
  if (land.landTypeUnknown) missing.push('ลักษณะที่ดิน');
  if (land.gridUnknown) missing.push('ระยะห่างจากสายไฟ');
  if (land.roadType == null) missing.push('การเข้าถึงถนน');
  const level = missing.length === 0 ? 'สูง' : missing.length <= 2 ? 'ปานกลาง' : 'ต่ำ';
  return { level, missing };
}

export function recommendProjects(land, goals) {
  const raw = evaluateLandFeasibility({ ...land, provinceData: land.provinceData || {} });
  const aims = goals?.aims || [];
  const confidence = dataConfidence(land);

  const results = Object.keys(PROJECT_FRIENDLY).map(id => {
    const screened = screening(id, land, goals);
    let score = Math.round(Math.min(98, Math.max(10, (raw[id] || 50) + goalBoost(id, aims))));
    // ข้อมูลขาดมาก → จำกัดคะแนน ไม่ให้คะแนนสูงเกินความเชื่อมั่นของข้อมูล
    const scoreCap = confidence.level === 'ต่ำ' ? 70 : confidence.level === 'ปานกลาง' ? 85 : 98;
    score = Math.min(score, scoreCap);
    let status = screened?.status || (score >= 72 ? 'great' : score >= 52 ? 'worth' : score >= 38 ? 'insufficient' : 'no');
    if (confidence.level === 'ต่ำ' && status === 'great') status = 'worth';
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
  { id: 'income', label: 'สร้างรายได้จากที่ดิน', icon: 'TrendingUp' },
  { id: 'save', label: 'ช่วยประหยัดค่าไฟของบ้านหรือธุรกิจ', icon: 'PiggyBank' },
  { id: 'ev', label: 'ทำธุรกิจใหม่ เช่น จุดชาร์จรถไฟฟ้า', icon: 'Zap' },
  { id: 'farm', label: 'ใช้พื้นที่ทำเกษตรต่อไปด้วย', icon: 'Sprout' },
  { id: 'backup', label: 'อยากมีไฟฟ้าใช้เอง / สำรองไฟ', icon: 'BatteryCharging' },
  { id: 'unsure', label: 'ยังไม่มีไอเดีย อยากให้ช่วยแนะนำ', icon: 'Lightbulb' },
];

export const BUDGET_OPTIONS = [
  { id: 'under-500k', label: 'ต่ำกว่า 500,000 บาท' },
  { id: '0.5-2m', label: '500,000 – 2 ล้านบาท' },
  { id: '2-5m', label: '2 – 5 ล้านบาท' },
  { id: '5-10m', label: '5 – 10 ล้านบาท' },
  { id: 'over-10m', label: 'มากกว่า 10 ล้านบาท' },
  { id: 'unsure', label: 'ยังไม่แน่ใจ' },
];

export function budgetCaution(projectId, budgetId, capexTHB) {
  const max = BUDGET_MAX_THB[budgetId];
  if (max == null || !isFinite(max) || !capexTHB) return null;
  if (capexTHB > max * 1.2) return `เงินลงทุนโดยประมาณของแผนนี้สูงกว่าช่วงงบที่ตั้งไว้ อาจต้องปรับขนาดหรือทยอยทำ`;
  return null;
}
