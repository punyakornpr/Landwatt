// เรียกฟังก์ชันคำนวณวิศวกรรมตามประเภทโครงการ + สรุปผลเป็นภาษาคนทั่วไป
import {
  calculateSolarFarmSpecs,
  calculateAgrivoltaicsSpecs,
  calculateEVHubSpecs,
  calculateBESSFarmSpecs,
  calculateFloatingSolarSpecs,
  calculateBiogasSpecs,
} from '../utils/engineeringCalculations';

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

// สรุป 4 การ์ดหลักของหน้าแผน: เงินลงทุน / พื้นที่ใช้ / ประโยชน์ / คืนทุน
export function friendlySummary(projectId, specs, land) {
  const fin = specs.financials || {};
  const capex = capexRange(fin);
  const areaRai = land.areaSqM / 1600;
  const payback = fin.paybackYears && M(fin.paybackYears) > 0 && M(fin.paybackYears) < 60
    ? `${fin.paybackYears} ปี` : 'ยังประเมินไม่ได้';

  let areaUsed, benefit;
  switch (projectId) {
    case 'solar-farm':
    case 'agrivoltaics':
    case 'floating-solar':
      areaUsed = `เกือบทั้งแปลง (~${(areaRai * 0.78).toFixed(1)} ไร่ใช้จริง)`;
      benefit = `ผลิตไฟได้ประมาณ ${specs.annualEnergyMWh} MWh/ปี เทียบเท่าไฟบ้าน ~${Math.round(M(specs.annualEnergyMWh) * 1000 / 3000).toLocaleString()} หลัง`;
      break;
    case 'ev-charging-hub':
      areaUsed = `ส่วนใหญ่ของแปลง (จุดชาร์จ + ที่จอด + มุมพัก)`;
      benefit = `รองรับรถชาร์จได้ราว ${specs.dailyCarsServiced} คัน/วัน หรือขายไฟ ~${specs.annualEnergyDispensedMWh} MWh/ปี`;
      break;
    case 'grid-bess':
      areaUsed = `ประมาณ ${(areaRai * 0.5).toFixed(1)} ไร่ (ตู้แบตเตอรี่ + ระยะปลอดภัย)`;
      benefit = `เก็บพลังงานได้ ${specs.capacityMWh} MWh จ่ายกำลัง ${specs.powerMW} MW`;
      break;
    case 'biomass-biogas':
      areaUsed = `ประมาณ ${(areaRai * 0.4).toFixed(1)} ไร่ (บ่อหมัก + โรงกำเนิด)`;
      benefit = `ผลิตไฟต่อเนื่อง ~${specs.annualEnergyMWh} MWh/ปี`;
      break;
    default:
      areaUsed = '—'; benefit = '—';
  }

  return { capex, areaUsed, benefit, payback };
}

// เช็กลิสต์ก่อนลงทุนจริง (ภาษาคนทั่วไป)
export function realityChecklist(projectId) {
  const common = [
    'สำรวจหน้างานจริงและตรวจโฉนด/สิทธิ์การใช้ที่ดิน',
    'สอบถามการไฟฟ้าพื้นที่ (กฟภ./กฟน.) เรื่องจุดเชื่อมต่อและเงื่อนไข',
  ];
  const per = {
    'solar-farm': ['ตรวจผังเมือง/การใช้ประโยชน์ที่ดินกับองค์กรปกครองส่วนท้องถิ่น', 'ขอใบอนุญาตก่อสร้าง/ปรับพื้นที่ตามกฎหมายท้องถิ่น'],
    'ev-charging-hub': ['สำรวจปริมาณรถและคู่แข่งรอบพื้นที่จริง', 'ยื่นขอติดตั้งสถานีอัดประจุตามมาตรฐานการไฟฟ้า'],
    'agrivoltaics': ['ทดลองปลูกพืชใต้ร่มเงาในพื้นที่เล็กก่อน', 'ตรวจสอบเงื่อนไขการใช้ที่ดินเกษตรร่วมกับโครงสร้าง'],
    'grid-bess': ['หาผู้ซื้อบริการ/สัญญาชัดเจนก่อนลงทุน', 'ตรวจมาตรฐานความปลอดภัยแบตเตอรี่กับหน่วยงานที่เกี่ยวข้อง'],
    'floating-solar': ['ตรวจสิทธิ์การใช้ผิวน้ำและความลึกบ่อจริง', 'ประเมินระดับน้ำเปลี่ยนแปลงตลอดปี'],
    'biomass-biogas': ['ยืนยันปริมาณวัตถุดิบต่อเนื่องทั้งปีเป็นสัญญา', 'ขอใบอนุญาตโรงงานและจัดการเรื่องกลิ่นกับชุมชน'],
  };
  return [...common, ...(per[projectId] || [])];
}
