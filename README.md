# TerraWatt
### ผู้ช่วยวางแผนใช้ประโยชน์ที่ดินด้านพลังงาน — สำหรับเจ้าของที่ดินทั่วไป

> **"ที่ดินว่างของคุณ ทำอะไรได้มากกว่าที่คิด"**
> เว็บที่คนไม่มีความรู้วิศวกรรมไฟฟ้าใช้ได้เอง โดยมีการคำนวณทางวิศวกรรมไฟฟ้าที่ตรวจสอบได้ทำงานอยู่เบื้องหลัง

---

## วิธีรัน (How to Run)

```bash
npm install
npm run dev
# เปิด http://localhost:5173
```

```bash
npm run build   # production build -> dist/
npm run preview # ทดลอง build ที่สร้างเสร็จ
```

ไม่มีการตั้งค่า API key ใด ๆ — แผนที่ใช้ tile สาธารณะ (Esri/OSM/Google tiles) และข้อมูลทั้งหมดประมวลผลในเบราว์เซอร์

---

## โครงสร้างการใช้งาน (User Journey)

หน้าแรก → เริ่มวิเคราะห์ที่ดิน → ทางเลือกแนะนำ → ดูแผน → เก็บแผน/รายงาน

| หน้า | ไฟล์ | หน้าที่ |
|---|---|---|
| หน้าแรก | `src/pages/Landing.jsx` | Hero, ประโยชน์, วิธีใช้, ตัวอย่าง (ข้อมูลสาธิต), FAQ |
| Wizard | `src/pages/Wizard.jsx` | ขั้น 1: ตำแหน่ง/ขนาด/ลักษณะที่ดิน · ขั้น 2: เป้าหมายและงบ (มี "ไม่ทราบ"/"ข้ามได้") |
| ผลแนะนำ | `src/pages/Results.jsx` | Top 3 ทางเลือก + สถานะ เหมาะมาก/น่าศึกษาต่อ/ต้องมีข้อมูลเพิ่ม/ยังไม่แนะนำ + เหตุผล |
| หน้าแผน | `src/pages/PlanDetail.jsx` | สรุป 4 การ์ด, ภาพจำลอง, อุปกรณ์, การเงิน, เช็กลิสต์ + Technical View แบบพับได้ |
| เปรียบเทียบ | `src/pages/Compare.jsx` | เทียบ 2–3 แผน (ตาราง desktop / การ์ด mobile) |
| โครงการของฉัน | `src/pages/MyProjects.jsx` | บันทึก/เปิด/สำเนา/ลบ/ส่งออก-นำเข้า JSON (localStorage) |
| วิธีใช้งาน | `src/pages/Help.jsx` | คู่มือ + อภิธานศัพท์ภาษาคน |
| รายงาน | `src/pages/Report.jsx` | รายงานสรุปพิมพ์ได้ (Print → Save as PDF) |

## โครงสร้างโค้ด (Layers)

- **Presentation** — `src/pages/*`, `src/components/ui.jsx` (design tokens อยู่ใน `tailwind.config.js` + `src/index.css`)
- **Domain/Calculation** — `src/engine/recommend.js` (คัดกรองเงื่อนไข + คะแนน + เหตุผล + confidence), `src/engine/specs.js` (เรียกฟังก์ชันคำนวณ), `src/utils/engineeringCalculations.js` (สูตรวิศวกรรม/การเงินเดิมที่ตรวจสอบแล้ว)
- **Data/State** — `src/state/AppState.jsx` (context กลาง + autosave), `src/engine/storage.js` (localStorage: `terrawatt.draft.v1`, `terrawatt.projects.v1`), `src/data/*`
- **Routing** — `src/router.js` hash router เบา ๆ ไม่มี dependency เพิ่ม

## สิ่งที่คงไว้จากเวอร์ชันเดิม

- เครื่องคำนวณวิศวกรรมทั้งหมด (`engineeringCalculations.js`) — หน่วยที่ดินไทย, พื้นที่ polygon, คะแนนความเหมาะสม, สเปก Solar/EV/BESS/Floating/Biogas/Agrivoltaics, NPV/IRR
- `GoogleMapPicker` (Leaflet: ปักหมุด วาด polygon คำนวณไร่ ปักจุดสายไฟ)
- `SiteLayoutCanvas`, `SingleLineDiagram`, `FinancialYieldChart` — ย้ายไปอยู่ในหน้าแผน/ส่วน Technical View
- ข้อมูลจังหวัด/รังสีอาทิตย์ `provinces.js` และคำอธิบายโครงการ `eeProjects.js`

## สมมติฐานและข้อจำกัด (สำคัญ)

- ผลลัพธ์เป็น **การประเมินเบื้องต้น** ไม่ใช่การรับรองสิทธิ์ที่ดิน ใบอนุญาต การเชื่อมต่อไฟฟ้า หรือราคา/รายได้จริง
- ระบบ **ไม่ได้เชื่อม API ภายนอก** — ไม่มีตำแหน่งสายไฟจริง ราคาติดตั้งเรียลไทม์ หรือโควต้ารับซื้อไฟ ข้อมูลแดดใช้ค่าเฉลี่ยรายจังหวัดในตาราง `provinces.js`
- คะแนนความเหมาะสมเป็นคะแนนตามเกณฑ์ของระบบ (สูงสุด 98) ไม่ใช่โอกาสสำเร็จหรือกำไร
- สมมติฐานคำนวณหลัก: พื้นที่ใช้งานจริง 78%, แผง 620W @ ~4 ตร.ม./แผง, PR 80%, FiT อ้างอิง 2.1679 บาท/kWh, CAPEX ~21.5 ล้าน/MWp, OPEX ~1.5% — ปรับได้ใน `engineeringCalculations.js`
- ข้อมูลผู้ใช้เก็บใน localStorage เท่านั้น ล้างเบราว์เซอร์ = ข้อมูลหาย (ส่งออก JSON เพื่อสำรองได้)
- ยังไม่มี: บัญชีผู้ใช้, ข้อมูล GIS เชิงลึก, 3D preview, energy simulation รายชั่วโมง (P2 ตามแผนงาน)

## โครงการที่ระบบประเมินได้

1. โซลาร์เซลล์บนพื้นดิน (Ground-Mounted Solar PV)
2. จุดชาร์จรถไฟฟ้า + หลังคาโซลาร์ + แบตเตอรี่ (EV Charging + Solar + BESS)
3. เกษตรคู่แผงโซลาร์เซลล์ (Agrivoltaics)
4. แบตเตอรี่ระดับโครงข่าย (BESS) — ต้องมีกรณีใช้งานชัดเจน
5. โซลาร์ลอยน้ำ (Floating Solar) — เฉพาะแปลงที่มีแหล่งน้ำ
6. ไฟฟ้าจากก๊าซชีวภาพ (Biogas) — เฉพาะที่มีวัตถุดิบชีวภาพยืนยันได้
