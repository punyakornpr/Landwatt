// Recommendation Engine: screen by constraints → score by criteria → explain reasons
// The score indicates "initial suitability per system criteria", not odds of success or profit

import { evaluateLandFeasibility } from '../utils/engineeringCalculations.js';

export const STATUS = {
  great:        { label: 'Great fit',       labelTh: 'เหมาะมาก',        color: 'bg-energy-100 text-energy-800 border-energy-200', dot: 'bg-energy-500' },
  worth:        { label: 'Worth exploring', labelTh: 'น่าสนใจ',        color: 'bg-electric-100 text-electric-800 border-electric-200', dot: 'bg-electric-500' },
  insufficient: { label: 'Needs more data', labelTh: 'ต้องการข้อมูลเพิ่ม', color: 'bg-volt-100 text-volt-800 border-volt-200', dot: 'bg-volt-500' },
  no:           { label: 'Not recommended', labelTh: 'ไม่แนะนำ',        color: 'bg-mute-100 text-mute-500 border-mute-200', dot: 'bg-mute-400' },
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

// friendly meta per project type — *Th fields are the Thai display versions
export const PROJECT_FRIENDLY = {
  'solar-farm': {
    name: 'Solar power generation', nameTh: 'ผลิตไฟฟ้าโซลาร์ฟาร์ม',
    sub: 'Solar Farm', subTh: 'โซลาร์ฟาร์ม',
    icon: 'Sun',
    oneLiner: 'Ground-mounted panels to sell electricity or cut your power bills long-term',
    oneLinerTh: 'ติดแผงโซลาร์บนพื้นดิน ขายไฟหรือลดค่าไฟระยะยาว',
  },
  'small-solar': {
    name: 'Small solar for own use', nameTh: 'โซลาร์เล็กใช้เอง',
    sub: 'Rooftop / Backyard Solar', subTh: 'โซลาร์หลังคา/ข้างบ้าน',
    icon: 'Sun',
    oneLiner: 'A few panels sized to a modest budget — cuts your own power bill, expandable later',
    oneLinerTh: 'แผงไม่กี่แผงตามงบที่มี — ลดค่าไฟบ้านตัวเอง ขยายทีหลังได้',
  },
  'solar-utility-kit': {
    name: 'Off-grid solar power kit', nameTh: 'ชุดไฟโซลาร์ออฟกริด',
    sub: 'Solar Utility Kit', subTh: 'ชุดโซลาร์อเนกประสงค์',
    icon: 'BatteryCharging',
    oneLiner: 'Panels + battery for lights, fans or a small pump — works with no grid line, fits the smallest budget',
    oneLinerTh: 'แผง+แบตสำหรับไฟ  พัดลม หรือปั๊มเล็ก — ไม่ต้องมีสายไฟถึง งบน้อยสุดก็ทำได้',
  },
  'ev-moto-swap': {
    name: 'E-motorcycle swap kiosk', nameTh: 'ร้านสลับแบตมอไซค์ไฟฟ้า',
    sub: 'Battery Swap Business', subTh: 'ธุรกิจสลับแบตเตอรี่',
    icon: 'Store',
    oneLiner: 'A small kiosk where e-motorcycles swap batteries — earn a fee per swap on a road frontage',
    oneLinerTh: 'ร้านเล็กริมถนนให้มอไซค์ไฟฟ้าแลกแบต — เก็บค่าธรรมเนียมต่อครั้ง',
  },
  'solar-coldroom': {
    name: 'Solar cold room rental', nameTh: 'ห้องเย็นโซลาร์ให้เช่า',
    sub: 'Cold Storage Business', subTh: 'ธุรกิจห้องเย็น',
    icon: 'Snowflake',
    oneLiner: 'A cold room farmers rent to keep produce fresh — solar cuts your biggest running cost',
    oneLinerTh: 'ห้องเย็นให้เกษตรกรเช่าเก็บผลผลิต — โซลาร์ลดต้นทุนไฟที่ใหญ่สุด',
  },
  'solar-dryer': {
    name: 'Solar crop drying service', nameTh: 'รับอบแห้งพืชผลโซลาร์',
    sub: 'Agro Service Business', subTh: 'ธุรกิจบริการเกษตร',
    icon: 'Package',
    oneLiner: 'Dry chili, herbs or fruit for neighboring farms — low startup, earns during harvest season',
    oneLinerTh: 'อบพริก สมุนไพร ผลไม้ให้ชาวไร่ใกล้เคียง — ทุนต่ำ มีรายได้ช่วงเก็บเกี่ยว',
  },
  'ev-charging-hub': {
    name: 'EV charging station', nameTh: 'สถานีชาร์จรถไฟฟ้า',
    sub: 'EV Charging Station', subTh: 'สถานีชาร์จ EV',
    icon: 'Zap',
    oneLiner: 'Fast EV charging with a solar canopy and battery to trim electricity costs',
    oneLinerTh: 'ชาร์จเร็วรถไฟฟ้า พร้อมหลังคาโซลาร์และแบตลดค่าไฟ',
  },
  'agrivoltaics': {
    name: 'Farming under solar panels', nameTh: 'ทำเกษตรใต้แผงโซลาร์',
    sub: 'Agrivoltaics', subTh: 'โซลาร์ทับการเกษตร',
    icon: 'Sprout',
    oneLiner: 'Elevated panels let crops grow below — earning from both crops and power',
    oneLinerTh: 'ยกแผงสูงปลูกพืชใต้แผงได้ — มีรายได้ทั้งพืชและไฟฟ้า',
  },
  'grid-bess': {
    name: 'Battery energy storage', nameTh: 'แบตเตอรี่กักเก็บไฟขนาดใหญ่',
    sub: 'Battery Storage (BESS)', subTh: 'แบตเตอรี่สะสมพลังงาน (BESS)',
    icon: 'BatteryCharging',
    oneLiner: 'Large battery containers for storing and dispatching power — best with a clear business load',
    oneLinerTh: 'ตู้แบตขนาดใหญ่เก็บและจ่ายไฟ — เหมาะเมื่อมีธุรกิจใช้ไฟชัดเจน',
  },
  'floating-solar': {
    name: 'Floating solar', nameTh: 'โซลาร์ทุ่นลอยน้ำ',
    sub: 'Floating Solar', subTh: 'โซลาร์ลอยน้ำ',
    icon: 'Waves',
    oneLiner: 'Panels on floats over a pond or reservoir — puts unused water surface to work',
    oneLinerTh: 'แผงบนทุ่นเหนือบ่อ/อ่างเก็บน้ำ — ใช้ผิวน้ำที่ว่างอยู่ให้เกิดประโยชน์',
  },
  'biomass-biogas': {
    name: 'Biogas power', nameTh: 'ไฟฟ้าไบโอแก๊ส',
    sub: 'Biogas / Biomass', subTh: 'ไบโอแก๊ส/ชีวมวล',
    icon: 'Flame',
    oneLiner: 'Turns farm waste or manure into biogas for power — needs a steady feedstock supply',
    oneLinerTh: 'เปลี่ยนเศษเกษตรหรือมูลสัตว์เป็นไบโอแก๊สผลิตไฟ — ต้องมีวัตถุดิบต่อเนื่อง',
  },
  'solar-lease': {
    name: 'Solar land lease', nameTh: 'เช่าที่ดินทำโซลาร์ฟาร์ม',
    sub: 'Developer Land Lease', subTh: 'ให้เช่าที่ดินกับผู้พัฒนา',
    icon: 'Handshake',
    oneLiner: 'A solar developer leases your land and builds everything — you collect rent for 25+ years',
    oneLinerTh: 'ผู้พัฒนาเช่าที่ดินและลงทุนสร้างเองทั้งหมด — คุณเก็บค่าเช่ายาว 25+ ปี',
  },
  'data-center-lease': {
    name: 'Data center site lease', nameTh: 'เช่าที่ดินทำดาต้าเซ็นเตอร์',
    sub: 'Digital Infrastructure', subTh: 'โครงสร้างดิจิทัล',
    icon: 'Server',
    oneLiner: 'Premium land lease to data center or telecom operators — the hottest land business right now',
    oneLinerTh: 'เช่าที่ดินให้ผู้ประกอบการดาต้าเซ็นเตอร์/โทรคมนาคม — ธุรกิจที่ดินที่ร้อนแรงสุดตอนนี้',
  },
  'solar-warehouse': {
    name: 'Warehouse + rooftop solar', nameTh: 'โกดังให้เช่า + โซลาร์หลังคา',
    sub: 'Logistics Property', subTh: 'อสังหาโลจิสติกส์',
    icon: 'Warehouse',
    oneLiner: 'Build a small warehouse and rent it to logistics or e-commerce — the roof earns solar savings too',
    oneLinerTh: 'สร้างโกดังเล็กให้เช่าโลจิสติกส์/อีคอมเมิร์ซ — หลังคาทำโซลาร์เพิ่มรายได้',
  },
  'carbon-forest': {
    name: 'Carbon credit forestry', nameTh: 'ปลูกป่าคาร์บอนเครดิต',
    sub: 'T-VER Carbon Credits', subTh: 'คาร์บอนเครดิต T-VER',
    icon: 'Trees',
    oneLiner: 'Plant fast-growing trees, register T-VER credits — lowest capital entry, slow ESG income',
    oneLinerTh: 'ปลูกไม้โตเร็ว ขึ้นทะเบียนเครดิต T-VER — ลงทุนต่ำสุด รายได้ช้าแต่ยั่งยืน',
  },
  'roadside-cafe': {
    name: 'Roadside café & food', nameTh: 'ร้านกาแฟ/อาหารริมถนน',
    sub: 'F&B Business', subTh: 'ธุรกิจร้านอาหาร',
    icon: 'Coffee',
    oneLiner: 'Coffee and simple food for passing traffic — the classic frontage business, PV cuts the air-con bill',
    oneLinerTh: 'กาแฟและอาหารจานง่ายสำหรับรถผ่าน — ธุรกิจริมถนนคลาสสิก โซลาร์ช่วยค่าแอร์',
  },
  'minimart': {
    name: 'Community mini-mart', nameTh: 'ร้านสะดวกซื้อชุมชน',
    sub: 'Retail Business', subTh: 'ธุรกิจค้าปลีก',
    icon: 'ShoppingCart',
    oneLiner: 'A small convenience store for the surrounding community — thin margin, steady daily demand',
    oneLinerTh: 'ร้านขายของชำเล็กรับชุมชนรอบแปลง — กำไรบางแต่ความต้องการรายวัน',
  },
  'self-storage': {
    name: 'Self-storage rental', nameTh: 'ห้องเก็บของให้เช่า',
    sub: 'Storage Business', subTh: 'ธุรกิจห้องเก็บของ',
    icon: 'Boxes',
    oneLiner: 'Prefab storage rooms rented monthly — almost staff-free, e-commerce sellers drive demand',
    oneLinerTh: 'ห้องเก็บของสำเร็จรูปให้เช่ารายเดือน — แทบไม่ต้องมีพนักงาน ร้านออนไลน์คือลูกค้าหลัก',
  },
  'sports-court': {
    name: 'Badminton / futsal court', nameTh: 'สนามแบด/ฟุตซอลให้เช่า',
    sub: 'Sports Business', subTh: 'ธุรกิจกีฬา',
    icon: 'Dumbbell',
    oneLiner: 'A covered court hall rented by the hour — evening income from local players',
    oneLinerTh: 'โรงสนามในร่มให้เช่าเป็นรายชั่วโมง — รายได้ช่วงเย็นจากนักกีฬาในพื้นที่',
  },
  'homestay-camp': {
    name: 'Homestay & camping', nameTh: 'โฮมสเตย์/ที่พักแคมป์ปิ้ง',
    sub: 'Hospitality Business', subTh: 'ธุรกิจที่พัก',
    icon: 'Tent',
    oneLiner: 'Cabins or tents where scenery and quiet are the product — works off the main road',
    oneLinerTh: 'กระท่อมหรือเต็นท์ที่ขายบรรยากาศและความเงียบ — ใช้ได้แม้ไม่ติดถนนใหญ่',
  },
  'laundry-shop': {
    name: 'Coin laundry shop', nameTh: 'ร้านสะดวกซัก',
    sub: 'Laundry Business', subTh: 'ธุรกิจซักรีด',
    icon: 'WashingMachine',
    oneLiner: 'Self-service washers for renters and workers within ~1 km — recurring weekly demand',
    oneLinerTh: 'เครื่องซักบริการตนเองรับผู้เช่า/หอพักรัศมี ~1 กม. — ความต้องการซ้ำทุกสัปดาห์',
  },
  'car-wash': {
    name: 'Self-service car wash', nameTh: 'คาร์แคร์ล้างรถอัตโนมัติ',
    sub: 'Car Care Business', subTh: 'ธุรกิจดูแลรถ',
    icon: 'Car',
    oneLiner: 'Coin/QR wash bays on a busy frontage — customers do the work, minimal staff',
    oneLinerTh: 'ช่องล้างรถหยอดเหรียญ/QR บนหน้าทางคึกคัก — ลูกค้าบริการตัวเอง พนักงานน้อย',
  },
};

// Localized friendly meta: returns EN fields, or Th fields when lang==='th' (falls back to EN per field)
export function projectFriendly(id, lang = 'en') {
  const m = PROJECT_FRIENDLY[id] || {};
  if (lang !== 'th') return m;
  return { ...m, name: m.nameTh || m.name, sub: m.subTh || m.sub, oneLiner: m.oneLinerTh || m.oneLiner };
}

// Reasons/cautions derived from the actual land data — R() picks Thai when lang==='th'
function reasonsFor(projectId, land, lang = 'en') {
  const areaRai = land.areaSqM / 1600;
  const ghi = land.provinceData?.ghi || 5.0;
  const R = (en, th) => (lang === 'th' ? th : en);
  const reasons = [];
  const cautions = [];

  switch (projectId) {
    case 'solar-farm':
      if (ghi >= 5.1) reasons.push(R(`Good sun here (avg irradiance ${ghi} kWh/m²/day) — well suited to solar generation`, `แดดดีที่นี่ (เฉลี่ย ${ghi} kWh/ตร.ม./วัน) — เหมาะกับการผลิตไฟโซลาร์`));
      if (areaRai >= 2) reasons.push(R(`${areaRai.toFixed(1)} rai is enough for panels plus maintenance access`, `${areaRai.toFixed(1)} ไร่ เพียงพอสำหรับแผงและทางเดินบำรุงรักษา`));
      if (land.landType === 'flat') reasons.push(R('You described the land as flat/open — good for laying out arrays (on-site shading not yet surveyed)', 'ที่ดินเป็นที่โล่ง/ราบ — วางแผงได้ง่าย (ยังไม่ได้สำรวจเงาบังหน้างาน)'));
      if (land.hasShading === null) cautions.push(R('Shading (trees/buildings) not yet known — actual yield and usable area may be lower than estimated', 'ยังไม่ทราบเงาบัง (ต้นไม้/อาคาร) — ผลิตไฟและพื้นที่ใช้จริงอาจน้อยกว่าประเมิน'));
      if (land.gridDistanceMeters > 500) cautions.push(R(`The grid connection is far (~${land.gridDistanceMeters} m) — line-extension costs may apply`, `จุดเชื่อมต่อไฟไกล (~${land.gridDistanceMeters} ม.) — อาจมีค่าดึงสายเพิ่ม`));
      if (areaRai < 2) cautions.push(R('Small plot — system size will be limited; better for self-consumption than commercial power sales', 'แปลงเล็ก — ขนาดระบบจำกัด เหมาะใช้ไฟเองมากกว่าขายไฟเชิงพาณิชย์'));
      cautions.push(R('Selling power to the utility requires an interconnection application and may face quota limits', 'การขายไฟให้การไฟฟ้าต้องยื่นขอเชื่อมต่อ และอาจติดโควตา'));
      break;
    case 'small-solar':
      if (ghi >= 5.0) reasons.push(R(`Good sun here (avg irradiance ${ghi} kWh/m²/day) — even a few panels produce useful power`, `แดดดีที่นี่ (เฉลี่ย ${ghi} kWh/ตร.ม./วัน) — แผงไม่กี่แผงก็ได้ไฟใช้จริง`));
      reasons.push(R('The system is sized to your budget — start small and expand later if it works', 'ขนาดระบบตามงบของคุณ — เริ่มเล็กแล้วค่อยขยายถ้าเห็นผล'));
      if (areaRai < 0.5) reasons.push(R('Works on a small plot or rooftop where utility-scale options do not fit', 'ทำได้บนแปลงเล็กหรือหลังคา ที่โครงการใหญ่ลงไม่ได้'));
      cautions.push(R('Savings depend on how much power you actually use during daylight hours', 'ความคุ้มขึ้นกับว่าใช้ไฟช่วงกลางวันมากแค่ไหน'));
      cautions.push(R('Ask the utility (PEA/MEA) about rules for connecting a small system to the meter', 'ถามการไฟฟ้า (กฟภ./กฟน.) เรื่องกฎการต่อระบบเล็กเข้ามิเตอร์'));
      break;
    case 'solar-utility-kit':
      reasons.push(R('Standalone kit — works with no grid connection at all', 'ชุดสำเร็จอิสระ — ใช้ได้แม้ไม่มีสายไฟถึงเลย'));
      if (land.gridDistanceMeters > 500) reasons.push(R(`The power line is ~${land.gridDistanceMeters} m away — off-grid avoids line-extension cost`, `สายไฟห่าง ~${land.gridDistanceMeters} ม. — ออฟกริดช่วยเลี่ยงค่าดึงสาย`));
      reasons.push(R('Fits a very small budget — a single unit starts around 35,000 THB', 'งบน้อยมากก็เริ่มได้ — ชุดเดียวเริ่มราว 35,000 บาท'));
      cautions.push(R('Powers lights, fans, phone charging or a small pump — not heavy loads like air-con', 'ใช้กับหลอดไฟ พัดลม ชาร์จมือถือ หรือปั๊มเล็ก — ไม่ไหวกับแอร์/โหลดหนัก'));
      cautions.push(R('The battery needs replacing roughly every 10 years — already counted in the estimate', 'แบตต้องเปลี่ยนประมาณทุก 10 ปี — นับไว้ในงบประมาณแล้ว'));
      break;
    case 'ev-moto-swap':
      reasons.push(R('Small footprint — a road-frontage corner is enough for a swap kiosk', 'ใช้พื้นที่น้อย — มุมแปลงติดถนนก็วางตู้สลับแบตได้'));
      if (land.roadType === 'main') reasons.push(R('Passing traffic on a main road — where swap riders actually look for cabinets', 'รถผ่านบนถนนใหญ่ — จุดที่ผู้ขี่มอไซค์ไฟฟ้ามองหาตู้สลับจริง'));
      reasons.push(R('A real per-transaction business, not just power sales', 'เป็นธุรกิจเก็บเงินต่อครั้งจริง ไม่ใช่แค่ขายไฟ'));
      cautions.push(R('Revenue depends entirely on e-motorcycle riders nearby — count them before buying hardware', 'รายได้ขึ้นกับผู้ขี่มอไซค์ไฟฟ้าในละแวกนั้นล้วน ๆ — นับจริงก่อนซื้ออุปกรณ์'));
      cautions.push(R('Ask swap-network operators about partner/franchise terms — they set the fee per swap', 'ถามเงื่อนไขพาร์ตเนอร์/แฟรนไชส์จากผู้ให้บริการเครือข่ายสลับ — เขากำหนดค่าธรรมเนียมต่อครั้ง'));
      break;
    case 'solar-coldroom':
      reasons.push(R('Farmers pay to keep produce fresh — demand spikes around harvest', 'เกษตรกรยอมจ่ายเก็บผลผลิตให้สด — ความต้องการพุ่งช่วงเก็บเกี่ยว'));
      reasons.push(R('Solar covers the compressor — the biggest running cost of cold storage', 'โซลาร์ช่วยคอมเพรสเซอร์ — ต้นทุนไฟที่ใหญ่สุดของห้องเย็น'));
      if (land.landType === 'agri') reasons.push(R('Farm area — your customers are the growers around you', 'พื้นที่เกษตร — ลูกค้าคือเกษตรกรรอบตัวคุณ'));
      cautions.push(R('Rental demand is seasonal and very local — survey nearby growers first', 'ความต้องการเช่าตามฤดูและเฉพาะท้องถิ่นมาก — สำรวจเกษตรกรใกล้เคียงก่อน'));
      cautions.push(R('Insulation and compressor quality decide the power bill — get 2–3 quotes', 'ฉนวนและคุณภาพคอมเพรสเซอร์เป็นตัวกำหนดค่าไฟ — เทียบราคา 2–3 เจ้า'));
      break;
    case 'solar-dryer':
      reasons.push(R('A service business for neighboring farms — dry chili, herbs or fruit for a fee', 'ธุรกิจบริการให้ชาวไร่ใกล้เคียง — อบพริก สมุนไพร ผลไม้เก็บค่าบริการ'));
      reasons.push(R('The lowest-cost business entry on this list', 'ธุรกิจที่ทุนต่ำสุดในลิสต์นี้'));
      if (ghi >= 5.0) reasons.push(R(`Good drying weather here (avg irradiance ${ghi} kWh/m²/day)`, `อากาศเหมาะอบแห้ง (แดดเฉลี่ย ${ghi} kWh/ตร.ม./วัน)`));
      cautions.push(R('Income follows the local harvest calendar — it is seasonal', 'รายได้ตามปฏิทินเก็บเกี่ยวท้องถิ่น — เป็นฤดูกาล'));
      cautions.push(R('Food-grade hygiene matters if you want premium buyers', 'สุขลักษณะเกรดอาหารสำคัญถ้าอยากได้ลูกค้าราคาดี'));
      break;
    case 'ev-charging-hub':
      if (land.roadType === 'main') reasons.push(R('Frontage on a main road with easy traffic access — ideal for a charging station', 'หน้ากว้างติดถนนใหญ่ รถเข้าออกง่าย — เหมาะกับสถานีชาร์จ'));
      if (land.roadWidthMeters >= 10) reasons.push(R('Wide frontage road allows easy vehicle entry and drive aisles', 'ถนนหน้าแปลงกว้าง รถเลี้ยวเข้าและวงเวียนในแปลงได้สบาย'));
      if ((land.provinceData?.evPotential || 0) >= 0.85) reasons.push(R(`${land.provinceData?.nameEn || land.provinceData?.name} has relatively high EV adoption`, `${land.provinceData?.name || land.provinceData?.nameEn} มี EV ใช้งานค่อนข้างมาก`));
      if (areaRai >= 1) reasons.push(R('Enough space for chargers, parking and a rest area', 'พื้นที่พอสำหรับเครื่องชาร์จ ที่จอด และจุดพัก'));
      cautions.push(R('Revenue depends on actual traffic — survey vehicle counts at the site before deciding', 'รายได้ขึ้นกับรถจริงที่ผ่าน — นับปริมาณรถหน้างานก่อนตัดสินใจ'));
      cautions.push(R('Charging demand and grid hosting capacity are unverified — the entered line distance is only an estimate; contact the utility', 'ความต้องการชาร์จและกำลังรับของสายยังไม่ยืนยัน — ระยะสายที่กรอกเป็นแค่ประมาณการ ติดต่อการไฟฟ้าให้แน่ใจ'));
      if (land.roadType !== 'main') cautions.push(R('Not on a main road — customer location needs more thought', 'ไม่ได้อยู่บนถนนใหญ่ — ต้องคิดเรื่องหาลูกค้าเพิ่ม'));
      break;
    case 'agrivoltaics':
      if (land.landType === 'agri') reasons.push(R('The plot is already farmland — a natural fit for elevated panels (crop suitability must be verified)', 'แปลงเป็นที่เกษตรอยู่แล้ว — เข้ากับแผงยกสูงโดยธรรมชาติ (ต้องเช็คพืชที่เหมาะ)'));
      if (ghi >= 4.9) reasons.push(R('Enough sun for both power output and crop growth under partial shade', 'แดดพอสำหรับผลิตไฟและพืชโตในร่มบางส่วน'));
      if (areaRai >= 1.5 && areaRai <= 20) reasons.push(R('Plot size suits a mixed farming model', 'ขนาดแปลงเหมาะกับโมเดลเกษตรผสม'));
      cautions.push(R('Elevated structures cost more than ground-mount, and shade-tolerant crops must be chosen', 'โครงยกสูงแพงกว่าติดพื้น และต้องเลือกพืชทนร่ม'));
      cautions.push(R('Crop revenue depends on care and market prices — it is not a guaranteed figure', 'รายได้พืชขึ้นกับการดูแลและราคาตลาด — ไม่ใช่ตัวเลขการันตี'));
      break;
    case 'grid-bess':
      if (land.gridDistanceMeters <= 200) reasons.push(R('Close to the grid corridor — easy interconnection', 'ใกล้แนวสายไฟ — เชื่อมต่อง่าย'));
      reasons.push(R('Uses little land per project value compared to alternatives', 'ใช้ที่น้อยต่อมูลค่าโครงการเมื่อเทียบทางเลือกอื่น'));
      cautions.push(R('A battery alone generates no power — you need a source or clear business case (backup, peak shaving)', 'แบตอย่างเดียวไม่ผลิตไฟ — ต้องมีแหล่งไฟหรือธุรกิจชัดเจน (สำรอง/ตัดพีค)'));
      cautions.push(R('Grid-services revenue requires contracts with utilities/operators — cannot be estimated from land alone', 'รายได้บริการระบบไฟต้องมีสัญญากับการไฟฟ้า/ผู้ประกอบการ — ประเมินจากที่ดินอย่างเดียวไม่ได้'));
      break;
    case 'floating-solar':
      if (land.hasWaterBody || land.landType === 'pond') reasons.push(R('There is a water body on the plot — unused water surface can host arrays', 'มีแหล่งน้ำในแปลง — ผิวน้ำที่ว่างใช้วางแผงได้'));
      if (ghi >= 5.0) reasons.push(R('Good sun, and the water surface helps panels run slightly cooler', 'แดดดี และผิวน้ำช่วยให้แผงเย็นกว่าเล็กน้อย'));
      cautions.push(R('Floats and mooring cost more than ground-mount, and water-use rights must be checked', 'ทุ่นและสมอแพงกว่าติดพื้น และต้องเช็คสิทธิ์ใช้น้ำ'));
      break;
    case 'biomass-biogas':
      if (land.hasAgriculturalWaste) reasons.push(R('You indicated farm waste is available — potential feedstock, but volume and continuity are unverified', 'ระบุว่ามีเศษเกษตร — เป็นวัตถุดิบที่เป็นไปได้ แต่ปริมาณและความต่อเนื่องยังไม่ยืนยัน'));
      reasons.push(R('Produces power around the clock regardless of weather (if feedstock is sufficient)', 'ผลิตไฟได้ตลอดวันไม่ขึ้นอากาศ (ถ้าวัตถุดิบพอ)'));
      cautions.push(R('A real feedstock survey is required: daily volume, year-round continuity and transport cost before concluding feasibility', 'ต้องสำรวจวัตถุดิบจริง: ปริมาณต่อวัน ความต่อเนื่องทั้งปี และค่าขนส่ง ก่อนสรุปความเป็นไปได้'));
      cautions.push(R('Odor management and a factory license must be handled', 'ต้องจัดการกลิ่นและขอใบอนุญาตโรงงาน'));
      break;
    case 'solar-lease':
      reasons.push(R('Near-zero investment — the developer funds the plant, you collect rent', 'แทบไม่ต้องลงทุน — ผู้พัฒนาออกทุนสร้าง คุณเก็บค่าเช่า'));
      if (areaRai >= 2) reasons.push(R(`${areaRai.toFixed(1)} rai is the size solar developers actually look for`, `${areaRai.toFixed(1)} ไร่ เป็นขนาดที่ผู้พัฒนาโซลาร์ตามหาจริง`));
      if (ghi >= 5.1) reasons.push(R(`Good sun here (avg ${ghi} kWh/m²/day) — what makes land leasable`, `แดดดีที่นี่ (เฉลี่ย ${ghi} kWh/ตร.ม./วัน) — ปัจจัยที่ทำให้ที่ดินน่าเช่า`));
      if (land.gridDistanceMeters <= 500) reasons.push(R('Close to the grid — developers pay more for plots that interconnect cheaply', 'ใกล้สายไฟ — ผู้พัฒนาให้ราคาดีกับแปลงที่เชื่อมต่อถูก'));
      cautions.push(R('Lease offers vary a lot — get 2–3 developer quotes and a lawyer before signing', 'ข้อเสนอค่าเช่าต่างกันมาก — เทียบ 2–3 เจ้าและให้ทนายดูสัญญาก่อนเซ็น'));
      cautions.push(R('You give up use of the land for 25+ years — check end-of-term and decommission clauses', 'สูญสิทธิ์ใช้ที่ดิน 25+ ปี — เช็คเงื่อนไขสิ้นสัญญาและการรื้อถอน'));
      break;
    case 'data-center-lease':
      reasons.push(R('The hottest land trend in Thailand — cloud/AI demand is driving data center site deals', 'เทรนด์ที่ดินที่ร้อนแรงสุดในไทย — ดีมานด์ cloud/AI ดันดีลดาต้าเซ็นเตอร์'));
      if (land.roadType === 'main') reasons.push(R('Main-road access — operators need construction and service access', 'ติดถนนใหญ่ — ผู้ประกอบการต้องการทางเข้าสำหรับก่อสร้างและบริการ'));
      if (land.gridDistanceMeters <= 300) reasons.push(R('Very close to the grid/substation — the #1 site criterion for digital infrastructure', 'ใกล้สายไฟ/สถานีไฟฟ้ามาก — เกณฑ์อันดับหนึ่งของโครงสร้างดิจิทัล'));
      if (areaRai >= 1) reasons.push(R('Plot size fits an edge site or telecom facility', 'ขนาดแปลงพอสำหรับ edge site หรือสถานีโทรคมนาคม'));
      cautions.push(R('Demand is highly location-specific — most rural plots will not attract an operator', 'ดีมานด์เฉพาะทำเลมาก — ที่ดินชนบทส่วนใหญ่ไม่ดึงดูดผู้ประกอบการ'));
      cautions.push(R('Fiber routes and grid capacity must be verified — land alone tells only half the story', 'ต้องยืนยันเส้นทางไฟเบอร์และกำลังสาย — ที่ดินอย่างเดียวบอกได้ครึ่งเดียว'));
      break;
    case 'solar-warehouse':
      reasons.push(R('E-commerce logistics is the fastest-growing rental segment in Thailand', 'โลจิสติกส์อีคอมเมิร์ซเป็นตลาดเช่าที่โตเร็วสุดในไทย'));
      if (land.roadType === 'main') reasons.push(R('Road frontage for trucks — the core requirement for warehouse rent', 'หน้ากว้างติดถนนรถบรรทุกเข้าได้ — เงื่อนไขหลักของค่าเช่าโกดัง'));
      reasons.push(R('Two income layers: warehouse rent plus rooftop PV offset/lease', 'รายได้สองชั้น: ค่าเช่าโกดัง + โซลาร์หลังคาช่วยค่าไฟ/ให้เช่า'));
      cautions.push(R('Occupancy depends on local demand — the 85% rate used here is an assumption to verify', 'อัตราเข้าพักขึ้นกับดีมานด์ท้องถิ่น — 85% ที่ใช้คำนวณเป็นสมมติฐานต้องเช็ค'));
      cautions.push(R('Check zoning and building-permit feasibility for a warehouse before costing', 'เช็คผังเมืองและความเป็นไปได้ขออนุญาตก่อสร้างโกดังก่อนคิดต้นทุน'));
      break;
    case 'carbon-forest':
      reasons.push(R('Lowest capital entry on this list — seedlings, labor and a small solar pump', 'ลงทุนต่ำสุดในลิสต์ — ต้นกล้า แรงงาน และปั๊มโซลาร์เล็ก'));
      if (areaRai >= 5) reasons.push(R(`${areaRai.toFixed(1)} rai gives meaningful credit volume`, `${areaRai.toFixed(1)} ไร่ ให้ปริมาณเครดิตที่มีนัยสำคัญ`));
      if (land.landType === 'agri' || land.landType === 'flat') reasons.push(R('Open/farm land suits tree planting without major clearing', 'ที่โล่ง/ที่เกษตรปลูกป่าได้โดยไม่ต้องแปลงพื้นที่มาก'));
      cautions.push(R('Carbon credits alone pay little per rai — timber at harvest is the real return', 'คาร์บอนเครดิตอย่างเดียวให้เงินน้อยต่อไร่ — รายได้จริงอยู่ที่ไม้ตอนตัด'));
      cautions.push(R('T-VER registration and verification take years — talk to TGO or a verifier early', 'การขึ้นทะเบียนและรับรอง T-VER ใช้เวลาหลายปี — ปรึกษา TGO หรือผู้รับรองตั้งแต่เนิ่น'));
      break;
    case 'roadside-cafe':
      if (land.roadType === 'main') reasons.push(R('Main-road frontage — passing traffic is exactly what a café needs', 'หน้ากว้างติดถนนใหญ่ — รถผ่านคือลูกค้าของคาเฟ่เลย'));
      reasons.push(R('The classic land business — direct daily cash income, hands-on', 'ธุรกิจที่ดินคลาสสิก — เงินสดรายวัน บริหารเองได้'));
      reasons.push(R('Rooftop PV offsets espresso machines and air-con — the biggest fixed cost', 'โซลาร์หลังคาช่วยต้นทุนเครื่องชงกับแอร์ — ค่าใช้จ่ายหลักของร้าน'));
      if (land.roadType !== 'main') cautions.push(R('Not on a main road — daily customer count drops hard without passing traffic', 'ไม่ติดถนนใหญ่ — ลูกค้ารายวันตกมากถ้าไม่มีรถผ่าน'));
      cautions.push(R('F&B is staffing-heavy — someone must run it daily; count your own time honestly', 'ร้านอาหารต้องมีคนดูแลทุกวัน — นับเวลาตัวเองให้ครบ'));
      cautions.push(R('Customer estimate assumes visible frontage and easy parking — verify on site', 'ประมาณลูกค้าสมมติหน้าร้านเห็นชัดและจอดง่าย — เช็คหน้างานจริง'));
      break;
    case 'minimart':
      reasons.push(R('Daily necessities sell through any economy — recession-resistant demand', 'ของใช้จำเป็นขายได้ทุกสภาพเศรษฐกิจ — ดีมานด์ทนภาวะชะลอ'));
      if (land.roadType !== 'dirt') reasons.push(R('Reachable road — customers can stop and park easily', 'ถนนเข้าถึงได้ — ลูกค้าจอดแวะง่าย'));
      reasons.push(R('Rooftop PV offsets 24/7 refrigeration — the dominant operating cost', 'โซลาร์หลังคาช่วยตู้เย็น 24 ชม. — ค่าใช้จ่ายที่ใหญ่สุด'));
      cautions.push(R('Grocery margin is thin (~19%) — a nearby 7-Eleven or CJ More can halve your volume', 'กำไรข้ามชาบาง (~19%) — เซเว่นหรือซีเจใกล้ ๆ หารยอดขายครึ่งได้'));
      cautions.push(R('Needs real households/dorms around — count the catchment before building', 'ต้องมีครัวเรือน/หอพักรอบจริง — นับวงล้อมลูกค้าก่อนสร้าง'));
      break;
    case 'self-storage':
      reasons.push(R('E-commerce sellers and condo dwellers drive storage demand — a growing segment', 'ร้านออนไลน์กับคนคอนโดดันดีมานด์ห้องเก็บของ — ตลาดที่โตเรื่อย ๆ'));
      reasons.push(R('Nearly staff-free — gate, CCTV and billing; no shop hours, no daily operations', 'แทบไม่ต้องมีพนักงาน — ประตู กล้อง และเรียกเก็บเงิน ไม่ต้องเปิดร้านทุกวัน'));
      if (land.roadType !== 'dirt') reasons.push(R('Reachable road suffices — customers visit only occasionally', 'ถนนเข้าถึงได้ก็พอ — ลูกค้ามาใช้แค่เป็นครั้งคราว'));
      if (areaRai < 0.5) cautions.push(R('Small plot limits unit count — income scales directly with units', 'แปลงเล็กจำกัดจำนวนห้อง — รายได้สเกลตามจำนวนห้องตรง ๆ'));
      cautions.push(R('70% occupancy is a planning assumption — survey local sellers and housing density', 'เข้าพัก 70% เป็นสมมติฐานวางแผน — สำรวจร้านออนไลน์และความหนาแน่นบ้านจริง'));
      break;
    case 'sports-court':
      reasons.push(R('Hourly rental with repeat weekly bookings — clubs reserve the same slots', 'เช่ารายชั่วโมง ลูกค้าซ้ำจองเวลาเดิมทุกสัปดาห์'));
      reasons.push(R('Big clear-span roof = excellent PV surface — lights and fans are the main load', 'หลังคาโปร่งสูงเป็นผิวโซลาร์ดีเยี่ยม — ไฟและพัดลมคือโหลดหลัก'));
      if (land.areaSqM >= 800) reasons.push(R('Plot fits multiple courts plus parking', 'แปลงรองรับหลายคอร์ทพร้อมที่จอด'));
      cautions.push(R('Needs a player base within ~5 km — no community, no bookings', 'ต้องมีฐานผู้เล่นในรัศมี ~5 กม. — ไม่มีชุมชนก็ไม่มีการจอง'));
      cautions.push(R('Evening-heavy income — daytime slots sit empty; model assumes ~3.5h/day per court', 'รายได้หนักช่วงเย็น — ช่วงกลางวันว่าง โมเดลสมมติ ~3.5 ชม./วัน/คอร์ท'));
      break;
    case 'homestay-camp':
      reasons.push(R('The one business where quiet beats traffic — scenery and atmosphere sell the booking', 'ธุรกิจเดียวที่ความเงียบชนะรถผ่าน — บรรยากาศคือสิ่งที่ขาย'));
      if (land.landType === 'agri' || land.landType === 'slope') reasons.push(R('Farm or hill views add real booking appeal', 'วิวไร่หรือวิวเขาเพิ่มเสน่ห์การจองจริง'));
      reasons.push(R('Low-density build keeps the land flexible — easy to add or remove keys', 'สร้างห่าง ๆ ที่ดินยังยืดหยุ่น — เพิ่มหรือถอดหลังพักง่าย'));
      cautions.push(R('Weekend-heavy income — ~26% occupancy is honest for rural stays, not guaranteed', 'รายได้หนักวันหยุด — เข้าพัก ~26% คือตัวเลขซื่อสัตย์สำหรับที่พักชนบท ไม่ใช่การันตี'));
      cautions.push(R('Platform fees (Airbnb/Agoda ~15-18%) and cleaning costs are already thin-margin items', 'ค่าแพลตฟอร์ม (Airbnb/Agoda ~15-18%) และค่าทำความสะอาดเป็นรายจ่ายที่กินกำไรบาง ๆ'));
      break;
    case 'laundry-shop':
      reasons.push(R('Everyone washes clothes weekly — the most recurring demand on this list', 'ทุกคนซักผ้าทุกสัปดาห์ — ดีมานด์ซ้ำที่สุดในลิสต์นี้'));
      if (land.areaSqM < 400) reasons.push(R('Works on a small plot — a 60-80 m² shopfront suffices', 'ใช้แปลงเล็กได้ — หน้าร้าน 60-80 ตร.ม. ก็พอ'));
      reasons.push(R('Semi-passive — part-time attendant, machines do the work', 'กึ่งพาสซีฟ — พนักงานพาร์ทไทม์ เครื่องทำงานแทน'));
      cautions.push(R('Zero renters or dorms within ~1 km = zero business — verify the catchment first', 'ไม่มีผู้เช่า/หอพักในรัศมี ~1 กม. = ไม่มีธุรกิจ — เช็ควงล้อมก่อน'));
      cautions.push(R('Water + power eat ~55% of revenue — PV helps but check water supply capacity too', 'น้ำ+ไฟกิน ~55% ของยอดขาย — โซลาร์ช่วย แต่เช็คน้ำประปาด้วย'));
      break;
    case 'car-wash':
      if (land.roadType === 'main') reasons.push(R('Busy frontage — cars already pass; they just need a reason to pull in', 'หน้าทางคึกคัก — รถผ่านอยู่แล้ว แค่ให้เหตุผลแวะ'));
      reasons.push(R('Self-service — customers wash their own cars, staffing is minimal', 'บริการตนเอง — ลูกค้าล้างเอง พนักงานน้อยมาก'));
      reasons.push(R('PV canopy shades the bays and cuts the pump/equipment load', 'หลังคาโซลาร์บังแดดช่องล้างและช่วยค่าไฟปั๊ม/อุปกรณ์'));
      if (land.roadType !== 'main') cautions.push(R('Off the main road, bay utilization falls fast — this is a visibility business', 'ออกจากถนนใหญ่ ช่องล้างว่างเร็ว — ธุรกิจนี้ขายการมองเห็น'));
      cautions.push(R('Wastewater drainage and oil traps are enforced — budget for a proper system', 'น้ำเสียและดักคราบน้ำมันถูกบังคับใช้ — ตั้งงบระบบจัดการให้ถูก'));
      break;
  }
  return { reasons, cautions };
}

// Hard screening before scoring — R() picks Thai when lang==='th'
function screening(projectId, land, goals, lang = 'en') {
  const areaRai = land.areaSqM / 1600;
  const aims = goals?.aims || [];
  const R = (en, th) => (lang === 'th' ? th : en);

  switch (projectId) {
    case 'floating-solar':
      if (!land.hasWaterBody && land.landType !== 'pond')
        return { status: 'no', blockReason: R('No water body on the plot — floating solar needs a pond or reservoir', 'ไม่มีแหล่งน้ำในแปลง — โซลาร์ลอยน้ำต้องมีบ่อหรืออ่างเก็บน้ำ') };
      return null;
    case 'biomass-biogas':
      if (!land.hasAgriculturalWaste)
        return { status: 'insufficient', blockReason: R('No continuous biomass feedstock data (farm waste/manure) for generation', 'ไม่มีข้อมูลวัตถุดิบชีวมวลต่อเนื่อง (เศษเกษตร/มูลสัตว์) สำหรับผลิตไฟ') };
      return null;
    case 'ev-charging-hub':
      if (land.roadType === 'dirt')
        return { status: 'no', blockReason: R('Access is a dirt/track road — hard for ordinary cars; not suitable for a charging station', 'ทางเข้าเป็นถนนดิน — รถยนต์ทั่วไปเข้ายาก ไม่เหมาะทำสถานีชาร์จ') };
      if (areaRai < 0.3)
        return { status: 'no', blockReason: R('Too small for chargers, parking and drive aisles', 'แปลงเล็กเกินสำหรับเครื่องชาร์จ ที่จอด และทางวิ่งรถ') };
      if (land.landType === 'pond')
        return { status: 'insufficient', blockReason: R('Most of the plot is water — remaining dry land must be checked first', 'แปลงส่วนใหญ่เป็นน้ำ — ต้องเช็คพื้นดินที่เหลือก่อน') };
      return null;
    case 'grid-bess':
      if (!aims.includes('backup') && !aims.includes('income'))
        return { status: 'insufficient', blockReason: R('A standalone battery needs a clear use case (backup/energy business) — pick a related goal to evaluate further', 'แบตเดี่ยว ๆ ต้องมีการใช้งานชัดเจน (สำรองไฟ/ธุรกิจพลังงาน) — เลือกเป้าหมายที่เกี่ยวเพื่อประเมินต่อ') };
      if (land.gridDistanceMeters > 800)
        return { status: 'insufficient', blockReason: R('Very far from the grid — interconnection must be checked with the utility first', 'ไกลสายไฟมาก — ต้องเช็คการเชื่อมต่อกับการไฟฟ้าก่อน') };
      return null;
    case 'small-solar':
      if (land.landType === 'pond')
        return { status: 'insufficient', blockReason: R('Mostly water — panels would need a roof or a structure on dry land', 'ส่วนใหญ่เป็นน้ำ — แผงต้องอยู่บนหลังคาหรือโครงบนพื้นแห้ง') };
      if (areaRai < 0.03)
        return { status: 'no', blockReason: R('Too small even for a few panels', 'เล็กเกินแม้แต่แผงไม่กี่แผง') };
      return null;
    case 'solar-utility-kit':
      if (land.landType === 'pond')
        return { status: 'insufficient', blockReason: R('Mostly water — the kit needs a frame or roof on dry land', 'ส่วนใหญ่เป็นน้ำ — ชุดต้องอยู่บนโครงหรือหลังคาบนพื้นแห้ง') };
      if (land.areaSqM < 15)
        return { status: 'no', blockReason: R('No space for even a single-panel kit', 'ไม่มีที่แม้แต่ชุดแผงเดียว') };
      return null;
    case 'ev-moto-swap':
      if (land.landType === 'pond')
        return { status: 'insufficient', blockReason: R('Mostly water — a swap kiosk needs dry roadside land', 'ส่วนใหญ่เป็นน้ำ — ร้านสลับแบตต้องอยู่บนที่แห้งติดถนน') };
      if (land.roadType === 'dirt')
        return { status: 'insufficient', blockReason: R('Swap riders will not detour down a dirt track', 'ผู้ขี่สลับแบตจะไม่อ้อมเข้าถนนดิน') };
      if (land.areaSqM < 40)
        return { status: 'no', blockReason: R('Too small for a swap cabinet plus queuing space', 'เล็กเกินสำหรับตู้สลับบวกที่รอคิว') };
      return null;
    case 'solar-coldroom':
      if (land.landType === 'pond')
        return { status: 'insufficient', blockReason: R('Mostly water — the room needs dry land and produce access', 'ส่วนใหญ่เป็นน้ำ — ห้องเย็นต้องอยู่บนที่แห้งและรถผลผลิตเข้าถึงได้') };
      if (land.roadType === 'dirt')
        return { status: 'insufficient', blockReason: R('Produce trucks need a reachable road', 'รถขนผลผลิตต้องเข้าถึงได้') };
      if (land.areaSqM < 70)
        return { status: 'no', blockReason: R('Too small for a cold room plus working space', 'เล็กเกินสำหรับห้องเย็นบวกพื้นที่ทำงาน') };
      return null;
    case 'solar-dryer':
      if (land.landType === 'pond')
        return { status: 'insufficient', blockReason: R('Mostly water — drying tunnels need open, dry ground', 'ส่วนใหญ่เป็นน้ำ — อุโมงค์อบแห้งต้องอยู่บนที่โล่งแห้ง') };
      if (land.areaSqM < 100)
        return { status: 'no', blockReason: R('Too small for even one drying tunnel', 'เล็กเกินแม้แต่อุโมงค์เดียว') };
      return null;
    case 'solar-farm':
      if (areaRai < 0.5)
        return { status: 'no', blockReason: R('Too small for a meaningful ground-mounted array', 'เล็กเกินสำหรับแผงพื้นดินที่มีนัยสำคัญ') };
      return null;
    case 'agrivoltaics':
      if (areaRai < 0.5)
        return { status: 'no', blockReason: R('Too small for combined farming and solar', 'เล็กเกินสำหรับทำเกษตรร่วมกับโซลาร์') };
      if (land.landType === 'pond')
        return { status: 'no', blockReason: R('Most of the plot is water — unsuitable for under-panel crops', 'แปลงส่วนใหญ่เป็นน้ำ — ไม่เหมาะปลูกพืชใต้แผง') };
      return null;
    case 'solar-lease':
      if (land.landType === 'pond')
        return { status: 'insufficient', blockReason: R('Mostly water — a developer cannot build on a pond', 'ส่วนใหญ่เป็นน้ำ — ผู้พัฒนาสร้างบนบ่อไม่ได้') };
      if (areaRai < 1)
        return { status: 'no', blockReason: R('Under 1 rai — developers generally need at least 1–2 rai of usable land', 'น้อยกว่า 1 ไร่ — ผู้พัฒนามักต้องการที่ดินใช้ได้อย่างน้อย 1–2 ไร่') };
      return null;
    case 'data-center-lease':
      if (land.landType === 'pond')
        return { status: 'no', blockReason: R('Mostly water — no operator builds on a pond', 'ส่วนใหญ่เป็นน้ำ — ไม่มีผู้ประกอบการสร้างบนบ่อ') };
      if (land.roadType === 'dirt')
        return { status: 'insufficient', blockReason: R('No proper road — digital sites need construction and service access', 'ไม่มีถนนดี — โครงสร้างดิจิทัลต้องการทางเข้าก่อสร้างและบริการ') };
      if (land.gridDistanceMeters > 800)
        return { status: 'insufficient', blockReason: R('Far from a substation/strong feeder — robust power is the #1 site requirement', 'ไกลสถานีไฟฟ้า/สายป้อน — ไฟที่มั่นคงคือเงื่อนไขอันดับหนึ่ง') };
      if (areaRai < 1)
        return { status: 'insufficient', blockReason: R('Under 1 rai — most operators need more space', 'น้อยกว่า 1 ไร่ — ผู้ประกอบการส่วนใหญ่ต้องการพื้นที่มากกว่านี้') };
      return null;
    case 'solar-warehouse':
      if (land.landType === 'pond')
        return { status: 'no', blockReason: R('Mostly water — a warehouse needs dry buildable land', 'ส่วนใหญ่เป็นน้ำ — โกดังต้องอยู่บนที่แห้ง') };
      if (land.roadType === 'dirt')
        return { status: 'insufficient', blockReason: R('Trucks cannot rely on a dirt track — a warehouse needs proper road access', 'รถบรรทุกเข้าทางดินไม่ได้ — โกดังต้องอยู่บนถนนที่ใช้งานจริง') };
      if (land.areaSqM < 300)
        return { status: 'no', blockReason: R('Too small for a warehouse plus truck apron', 'เล็กเกินสำหรับโกดังบวกลานรถบรรทุก') };
      return null;
    case 'carbon-forest':
      if (land.landType === 'pond')
        return { status: 'no', blockReason: R('Mostly water — no room to plant trees', 'ส่วนใหญ่เป็นน้ำ — ไม่มีที่ปลูกต้นไม้') };
      if (areaRai < 1)
        return { status: 'insufficient', blockReason: R('Under 1 rai — credit volume too small to justify T-VER registration', 'น้อยกว่า 1 ไร่ — ปริมาณเครดิตน้อยเกินไปสำหรับการขึ้นทะเบียน T-VER') };
      return null;
    case 'roadside-cafe':
      if (land.landType === 'pond')
        return { status: 'insufficient', blockReason: R('Mostly water — a café needs dry buildable frontage', 'ส่วนใหญ่เป็นน้ำ — คาเฟ่ต้องอยู่บนหน้าทางแห้ง') };
      if (land.roadType === 'dirt')
        return { status: 'no', blockReason: R('Dirt/track road — customers will not detour for coffee', 'ถนนดิน — ลูกค้าไม่อ้อมมาหากาแฟ') };
      if (land.areaSqM < 120)
        return { status: 'no', blockReason: R('Too small for a shop plus parking', 'เล็กเกินสำหรับร้านบวกที่จอด') };
      return null;
    case 'minimart':
      if (land.landType === 'pond')
        return { status: 'insufficient', blockReason: R('Mostly water — a store needs dry buildable land', 'ส่วนใหญ่เป็นน้ำ — ร้านต้องอยู่บนที่แห้ง') };
      if (land.roadType === 'dirt')
        return { status: 'insufficient', blockReason: R('Dirt road cuts daily footfall badly — a minimart needs passing trade', 'ถนนดินตัดลูกค้ารายวันมาก — ร้านชำต้องการคนผ่านหน้าร้าน') };
      if (land.areaSqM < 100)
        return { status: 'no', blockReason: R('Too small for a store plus parking', 'เล็กเกินสำหรับร้านบวกที่จอด') };
      return null;
    case 'self-storage':
      if (land.landType === 'pond')
        return { status: 'no', blockReason: R('Mostly water — storage units need dry land and drainage', 'ส่วนใหญ่เป็นน้ำ — ห้องเก็บของต้องอยู่บนที่แห้งและระบายน้ำได้') };
      if (land.roadType === 'dirt')
        return { status: 'insufficient', blockReason: R('Dirt road — customers hauling goods need a decent route', 'ถนนดิน — ลูกค้าขนของต้องการทางที่ดี') };
      if (land.areaSqM < 300)
        return { status: 'insufficient', blockReason: R('Under 300 m² fits too few units to justify the gate/fence setup', 'น้อยกว่า 300 ตร.ม. วางห้องได้น้อยเกินไปสำหรับประตู/รั้ว/CCTV') };
      return null;
    case 'sports-court':
      if (land.landType === 'pond')
        return { status: 'no', blockReason: R('Mostly water — a court hall needs dry land', 'ส่วนใหญ่เป็นน้ำ — โรงสนามต้องอยู่บนที่แห้ง') };
      if (land.roadType === 'dirt')
        return { status: 'insufficient', blockReason: R('Dirt road — evening players need decent access', 'ถนนดิน — นักกีฬาตอนเย็นต้องการทางเข้าที่ดี') };
      if (land.areaSqM < 300)
        return { status: 'no', blockReason: R('Too small for even one court with parking', 'เล็กเกินแม้แต่คอร์ทเดียวกับที่จอด') };
      return null;
    case 'homestay-camp':
      if (land.landType === 'pond')
        return { status: 'insufficient', blockReason: R('Mostly water — views help but cabins need dry ground', 'ส่วนใหญ่เป็นน้ำ — วิวช่วยแต่ที่พักต้องอยู่บนที่แห้ง') };
      if (land.areaSqM < 300)
        return { status: 'insufficient', blockReason: R('Under 300 m² — too few keys to run as a stay', 'น้อยกว่า 300 ตร.ม. — หลังพักน้อยเกินไปสำหรับเปิดที่พัก') };
      return null;
    case 'laundry-shop':
      if (land.landType === 'pond')
        return { status: 'insufficient', blockReason: R('Mostly water — the shop needs dry land and drainage', 'ส่วนใหญ่เป็นน้ำ — ร้านต้องอยู่บนที่แห้งและระบายน้ำได้') };
      if (land.roadType === 'dirt')
        return { status: 'insufficient', blockReason: R('Dirt road — customers carry laundry bags; access matters', 'ถนนดิน — ลูกค้าหิ้วผ้ามาซัก ทางเข้าสำคัญ') };
      if (land.areaSqM < 60)
        return { status: 'no', blockReason: R('Too small for even a compact laundry row', 'เล็กเกินแม้แต่แถวเครื่องซักเล็ก') };
      return null;
    case 'car-wash':
      if (land.landType === 'pond')
        return { status: 'no', blockReason: R('Mostly water — wash bays need dry paved ground', 'ส่วนใหญ่เป็นน้ำ — ช่องล้างต้องอยู่บนพื้นแห้ง') };
      if (land.roadType === 'dirt')
        return { status: 'no', blockReason: R('Dirt road — nobody washes a car after driving a dirt track', 'ถนนดิน — ไม่มีใครล้างรถหลังขับทางดิน') };
      if (land.areaSqM < 150)
        return { status: 'no', blockReason: R('Too small for a wash bay plus queuing', 'เล็กเกินสำหรับช่องล้างบวกที่รอคิว') };
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
    'ev-moto-swap': ['income', 'ev', 'unsure', 'shop'],
    'solar-coldroom': ['income', 'farm', 'unsure'],
    'solar-dryer': ['income', 'farm', 'unsure'],
    'ev-charging-hub': ['ev', 'income'],
    'agrivoltaics': ['farm', 'income'],
    'grid-bess': ['backup'],
    'floating-solar': ['income'],
    'biomass-biogas': ['farm', 'income'],
    'solar-lease': ['income', 'unsure', 'rental'],
    'data-center-lease': ['income', 'rental'],
    'solar-warehouse': ['income', 'ev', 'rental'],
    'carbon-forest': ['income', 'farm', 'unsure'],
    'roadside-cafe': ['business', 'shop', 'income'],
    'minimart': ['business', 'shop', 'income'],
    'self-storage': ['business', 'rental', 'income', 'unsure'],
    'sports-court': ['business', 'rental', 'income'],
    'homestay-camp': ['business', 'stay', 'income', 'unsure'],
    'laundry-shop': ['business', 'shop', 'income'],
    'car-wash': ['business', 'shop', 'income'],
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

export function recommendProjects(land, goals, lang = 'en') {
  const raw = evaluateLandFeasibility({ ...land, provinceData: land.provinceData || {} });
  const aims = goals?.aims || [];
  const confidence = dataConfidence(land);

  const results = Object.keys(PROJECT_FRIENDLY).map(id => {
    const screened = screening(id, land, goals, lang);
    let score = Math.round(Math.min(98, Math.max(10, (raw[id] || 50) + goalBoost(id, aims))));
    // Missing data keeps scores under a confidence ceiling — soft-compressed
    // instead of flat-clamped so relative ranking survives
    const scoreCap = confidence.level === 'Low' ? 70 : confidence.level === 'Medium' ? 85 : 98;
    if (score > scoreCap) score = scoreCap + Math.round((score - scoreCap) * 0.25);
    let status = screened?.status || (score >= 72 ? 'great' : score >= 52 ? 'worth' : score >= 38 ? 'insufficient' : 'no');
    if (confidence.level === 'Low' && status === 'great') status = 'worth';
    const { reasons, cautions } = reasonsFor(id, land, lang);
    if (screened?.blockReason) reasons.unshift(screened.blockReason);
    return { id, score, status, reasons, cautions, confidence };
  }).sort((a, b) => {
    const order = { great: 0, worth: 1, insufficient: 2, no: 3 };
    return order[a.status] - order[b.status] || b.score - a.score || a.id.localeCompare(b.id); // tie-break deterministic
  });

  return results;
}

export const GOAL_OPTIONS = [
  { id: 'income', label: 'Earn income from my land', labelTh: 'หารายได้จากที่ดิน', icon: 'TrendingUp' },
  { id: 'save', label: 'Cut electricity bills for home or business', labelTh: 'ลดค่าไฟบ้านหรือกิจการ', icon: 'PiggyBank' },
  { id: 'ev', label: 'EV charging or e-vehicle services', labelTh: 'จุดชาร์จ EV / บริการรถไฟฟ้า', icon: 'Zap' },
  { id: 'shop', label: 'Open a shop, café or service storefront', labelTh: 'เปิดร้านค้า คาเฟ่ หรือบริการหน้าร้าน', icon: 'Store' },
  { id: 'rental', label: 'Build rentable space — storage, warehouse, courts', labelTh: 'สร้างที่เช่า — ห้องเก็บของ โกดัง สนาม', icon: 'Warehouse' },
  { id: 'stay', label: 'Lodging or camping for travelers', labelTh: 'ทำที่พัก/แคมป์ รับนักท่องเที่ยว', icon: 'Tent' },
  { id: 'farm', label: 'Keep farming the land too', labelTh: 'ยังอยากทำเกษตรควบไปด้วย', icon: 'Sprout' },
  { id: 'backup', label: 'Have my own power / backup supply', labelTh: 'มีไฟใช้เอง/สำรอง', icon: 'BatteryCharging' },
  { id: 'unsure', label: 'No idea yet — show me options', labelTh: 'ยังไม่มีไอเดีย — ให้ระบบแนะนำ', icon: 'Lightbulb' },
];

export const BUDGET_OPTIONS = [
  { id: 'under-50k', label: 'Under 50,000 THB', labelTh: 'ต่ำกว่า 50,000 บาท' },
  { id: '50-150k', label: '50,000 – 150,000 THB', labelTh: '50,000 – 150,000 บาท' },
  { id: '150-500k', label: '150,000 – 500,000 THB', labelTh: '150,000 – 500,000 บาท' },
  { id: '0.5-2m', label: '500,000 – 2 million THB', labelTh: '5 แสน – 2 ล้านบาท' },
  { id: '2-5m', label: '2 – 5 million THB', labelTh: '2 – 5 ล้านบาท' },
  { id: '5-10m', label: '5 – 10 million THB', labelTh: '5 – 10 ล้านบาท' },
  { id: '10-20m', label: '10 – 20 million THB', labelTh: '10 – 20 ล้านบาท' },
  { id: '20-50m', label: '20 – 50 million THB', labelTh: '20 – 50 ล้านบาท' },
  { id: 'over-50m', label: 'Over 50 million THB', labelTh: 'มากกว่า 50 ล้านบาท' },
  { id: 'unsure', label: 'Not sure yet', labelTh: 'ยังไม่แน่ใจ' },
];

export function budgetCaution(projectId, budgetId, capexTHB, lang = 'en') {
  const max = BUDGET_MAX_THB[budgetId];
  if (max == null || !isFinite(max) || !capexTHB) return null;
  if (capexTHB > max * 1.2) return lang === 'th'
    ? 'เงินลงทุนโดยประมาณของแผนนี้เกินงบที่ระบุ — อาจต้องลดขนาดหรือแบ่งเฟส'
    : `This plan's estimated investment is above your stated budget — it may need resizing or staging`;
  return null;
}
