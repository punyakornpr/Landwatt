// ข้อมูลภูมิภาคและศักยภาพพลังงานแสงอาทิตย์/พลังงานลมและโครงข่ายไฟฟ้ารายจังหวัดในประเทศไทย
// พร้อมพิกัดภูมิศาสตร์ (Latitude, Longitude) สำหรับระบบปักหมุดแผนที่ดาวเทียม

export const PROVINCES_DATA = [
  // ภาคกลาง / กรุงเทพมหานครและปริมณฑล
  { id: 'bkk', name: 'กรุงเทพมหานคร', region: 'central', ghi: 4.95, grid: 'MEA', voltage: '24kV / 69kV / 115kV', wind: 2.1, evPotential: 0.98, agriPotential: 0.15, lat: 13.7563, lng: 100.5018 },
  { id: 'nonthaburi', name: 'นนทบุรี', region: 'central', ghi: 4.92, grid: 'MEA', voltage: '24kV / 115kV', wind: 2.0, evPotential: 0.95, agriPotential: 0.25, lat: 13.8591, lng: 100.5217 },
  { id: 'samutprakan', name: 'สมุทรปราการ', region: 'central', ghi: 5.05, grid: 'MEA', voltage: '24kV / 115kV', wind: 3.2, evPotential: 0.92, agriPotential: 0.20, lat: 13.5991, lng: 100.5998 },
  { id: 'pathumthani', name: 'ปทุมธานี', region: 'central', ghi: 4.98, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.2, evPotential: 0.92, agriPotential: 0.50, lat: 14.0208, lng: 100.5250 },
  { id: 'ayutthaya', name: 'พระนครศรีอยุธยา', region: 'central', ghi: 5.12, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.5, evPotential: 0.88, agriPotential: 0.85, lat: 14.3532, lng: 100.5684 },
  { id: 'saraburi', name: 'สระบุรี', region: 'central', ghi: 5.18, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.7, evPotential: 0.85, agriPotential: 0.75, lat: 14.5289, lng: 100.9101 },
  { id: 'lopburi', name: 'ลพบุรี', region: 'central', ghi: 5.25, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.8, evPotential: 0.70, agriPotential: 0.90, lat: 14.7995, lng: 100.6534 },
  { id: 'nakhonsawan', name: 'นครสวรรค์', region: 'central', ghi: 5.22, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.6, evPotential: 0.75, agriPotential: 0.90, lat: 15.6987, lng: 100.1199 },
  { id: 'suphanburi', name: 'สุพรรณบุรี', region: 'central', ghi: 5.15, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.4, evPotential: 0.70, agriPotential: 0.92, lat: 14.4745, lng: 100.1177 },
  { id: 'nakhonpathom', name: 'นครปฐม', region: 'central', ghi: 5.08, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.3, evPotential: 0.85, agriPotential: 0.80, lat: 13.8196, lng: 100.0443 },

  // ภาคตะวันออกเฉียงเหนือ (อีสาน) - ศักยภาพรังสีอาทิตย์สูงสุด
  { id: 'korat', name: 'นครราชสีมา', region: 'northeast', ghi: 5.35, grid: 'PEA', voltage: '22kV / 115kV', wind: 3.5, evPotential: 0.82, agriPotential: 0.95, lat: 14.9799, lng: 102.0977 },
  { id: 'khonkaen', name: 'ขอนแก่น', region: 'northeast', ghi: 5.28, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.9, evPotential: 0.80, agriPotential: 0.92, lat: 16.4419, lng: 102.8360 },
  { id: 'udonthani', name: 'อุดรธานี', region: 'northeast', ghi: 5.25, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.8, evPotential: 0.78, agriPotential: 0.88, lat: 17.4138, lng: 102.7872 },
  { id: 'ubon', name: 'อุบลราชธานี', region: 'northeast', ghi: 5.30, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.7, evPotential: 0.75, agriPotential: 0.90, lat: 15.2287, lng: 104.8594 },
  { id: 'buriram', name: 'บุรีรัมย์', region: 'northeast', ghi: 5.32, grid: 'PEA', voltage: '22kV / 115kV', wind: 3.0, evPotential: 0.72, agriPotential: 0.92, lat: 14.9930, lng: 103.1029 },
  { id: 'surin', name: 'สุรินทร์', region: 'northeast', ghi: 5.29, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.8, evPotential: 0.68, agriPotential: 0.90, lat: 14.8818, lng: 103.4936 },
  { id: 'roiet', name: 'ร้อยเอ็ด', region: 'northeast', ghi: 5.27, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.7, evPotential: 0.65, agriPotential: 0.92, lat: 16.0538, lng: 103.6520 },
  { id: 'chaiphum', name: 'ชัยภูมิ', region: 'northeast', ghi: 5.30, grid: 'PEA', voltage: '22kV / 115kV', wind: 3.8, evPotential: 0.65, agriPotential: 0.88, lat: 15.8063, lng: 102.0315 },

  // ภาคเหนือ
  { id: 'chiangmai', name: 'เชียงใหม่', region: 'north', ghi: 4.88, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.0, evPotential: 0.85, agriPotential: 0.82, lat: 18.7883, lng: 98.9853 },
  { id: 'chiangrai', name: 'เชียงราย', region: 'north', ghi: 4.80, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.1, evPotential: 0.75, agriPotential: 0.85, lat: 19.9072, lng: 99.8325 },
  { id: 'phitsanulok', name: 'พิษณุโลก', region: 'north', ghi: 5.15, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.4, evPotential: 0.75, agriPotential: 0.85, lat: 16.8211, lng: 100.2659 },
  { id: 'lampang', name: 'ลำปาง', region: 'north', ghi: 4.95, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.3, evPotential: 0.70, agriPotential: 0.80, lat: 18.2888, lng: 99.4928 },
  { id: 'tak', name: 'ตาก', region: 'north', ghi: 5.10, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.9, evPotential: 0.68, agriPotential: 0.75, lat: 16.8837, lng: 99.1258 },

  // ภาคตะวันออก - EEC และอุตสาหกรรม
  { id: 'chonburi', name: 'ชลบุรี (EEC)', region: 'east', ghi: 5.15, grid: 'PEA', voltage: '22kV / 115kV', wind: 3.4, evPotential: 0.96, agriPotential: 0.55, lat: 13.3611, lng: 100.9847 },
  { id: 'rayong', name: 'ระยอง (EEC)', region: 'east', ghi: 5.10, grid: 'PEA', voltage: '22kV / 115kV', wind: 3.5, evPotential: 0.94, agriPotential: 0.65, lat: 12.6814, lng: 101.2816 },
  { id: 'chachoengsao', name: 'ฉะเชิงเทรา (EEC)', region: 'east', ghi: 5.12, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.8, evPotential: 0.88, agriAgri: 0.78, lat: 13.6904, lng: 101.0779 },
  { id: 'prachinburi', name: 'ปราจีนบุรี', region: 'east', ghi: 5.08, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.5, evPotential: 0.75, agriPotential: 0.85, lat: 14.0509, lng: 101.3716 },
  { id: 'chanthaburi', name: 'จันทบุรี', region: 'east', ghi: 4.85, grid: 'PEA', voltage: '22kV / 115kV', wind: 3.0, evPotential: 0.72, agriPotential: 0.92, lat: 12.6114, lng: 102.1039 },

  // ภาคตะวันตก
  { id: 'kanchanaburi', name: 'กาญจนบุรี', region: 'west', ghi: 5.20, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.6, evPotential: 0.72, agriPotential: 0.85, lat: 14.0228, lng: 99.5328 },
  { id: 'ratchaburi', name: 'ราชบุรี', region: 'west', ghi: 5.18, grid: 'PEA', voltage: '22kV / 115kV', wind: 2.7, evPotential: 0.78, agriPotential: 0.88, lat: 13.5283, lng: 99.8134 },
  { id: 'phetchaburi', name: 'เพชรบุรี', region: 'west', ghi: 5.22, grid: 'PEA', voltage: '22kV / 115kV', wind: 3.3, evPotential: 0.82, agriPotential: 0.75, lat: 13.1114, lng: 99.9398 },
  { id: 'prachuap', name: 'ประจวบคีรีขันธ์', region: 'west', ghi: 5.25, grid: 'PEA', voltage: '22kV / 115kV', wind: 3.6, evPotential: 0.84, agriPotential: 0.78, lat: 11.8124, lng: 99.7972 },

  // ภาคใต้
  { id: 'suratthani', name: 'สุราษฎร์ธานี', region: 'south', ghi: 4.90, grid: 'PEA', voltage: '33kV / 115kV', wind: 3.4, evPotential: 0.80, agriPotential: 0.90, lat: 9.1382, lng: 99.3215 },
  { id: 'nakhonsithammarat', name: 'นครศรีธรรมราช', region: 'south', ghi: 4.85, grid: 'PEA', voltage: '33kV / 115kV', wind: 3.8, evPotential: 0.75, agriPotential: 0.92, lat: 8.4304, lng: 99.9631 },
  { id: 'songkhla', name: 'สงขลา / หาดใหญ่', region: 'south', ghi: 4.88, grid: 'PEA', voltage: '33kV / 115kV', wind: 3.9, evPotential: 0.86, agriPotential: 0.85, lat: 7.1756, lng: 100.6143 },
  { id: 'phuket', name: 'ภูเก็ต', region: 'south', ghi: 4.85, grid: 'PEA', voltage: '33kV / 115kV', wind: 3.5, evPotential: 0.95, agriPotential: 0.20, lat: 7.8804, lng: 98.3923 },
  { id: 'krabi', name: 'กระบี่', region: 'south', ghi: 4.82, grid: 'PEA', voltage: '33kV / 115kV', wind: 3.2, evPotential: 0.82, agriPotential: 0.88, lat: 8.0863, lng: 98.9063 }
];

export const REGIONS_INFO = {
  central: { name: 'ภาคกลาง / กรุงเทพฯ', avgGHI: 5.08, desc: 'ระบบสายส่งสมบูรณ์ ใกล้ศูนย์กลางโหลด ไฟฟ้ามีเสถียรภาพสูง' },
  northeast: { name: 'ภาคตะวันออกเฉียงเหนือ', avgGHI: 5.30, desc: 'ค่าความเข้มรังสีอาทิตย์เฉลี่ยสูงสุดในประเทศ เหมาะสมที่สุดกับ Solar Farm ขนาดใหญ่' },
  north: { name: 'ภาคเหนือ', avgGHI: 4.98, desc: 'ภูมิประเทศภูเขาบางจุด อากาศเย็นช่วยประสิทธิภาพแผงช่วงฤดูหนาว' },
  east: { name: 'ภาคตะวันออก (EEC)', avgGHI: 5.10, desc: 'ความต้องการใช้ไฟฟ้าอุตสาหกรรมสูงมาก เหมาะสมกับทั้ง Solar, BESS และ EV Hub' },
  west: { name: 'ภาคตะวันตก', avgGHI: 5.21, desc: 'รังสีอาทิตย์สูง แนวสายส่งกฟผ.เชื่อมต่อสะดวก เหมาะกับพลังงานแสงอาทิตย์และลมบางพื้นที่' },
  south: { name: 'ภาคใต้', avgGHI: 4.86, desc: 'ระบบ 33kV แดดและฝนสลับ มีศักยภาพก๊าซชีวภาพจากปาล์ม/ยาง และพลังงานลมชายฝั่ง' }
};

// คำนวณหาระยะทางระหว่าง 2 พิกัด (Haversine Formula) ในหน่วยกิโลเมตร
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // รัศมีโลกเป็นกิโลเมตร
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ค้นหาจังหวัดที่ใกล้พิกัดที่ปักหมุดมากที่สุด
export function findClosestProvince(lat, lng) {
  let closest = PROVINCES_DATA[0];
  let minDistance = Infinity;

  for (const prov of PROVINCES_DATA) {
    if (prov.lat && prov.lng) {
      const dist = calculateDistanceKm(lat, lng, prov.lat, prov.lng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = prov;
      }
    }
  }

  return { province: closest, distanceKm: minDistance };
}
