// ข้อมูลโครงการวิศวกรรมไฟฟ้าสำหรับการพัฒนาที่ดินว่างเปล่า
// Comprehensive Electrical Engineering Land-Use Project Profiles

export const EE_PROJECTS = [
  {
    id: 'solar-farm',
    title: 'โรงไฟฟ้าพลังงานแสงอาทิตย์บนดิน (Ground-Mounted Solar Farm)',
    shortTitle: 'Solar Farm (บนดิน)',
    category: 'renewable',
    icon: 'Sun',
    accentColor: 'amber',
    tagline: 'เปลี่ยนที่ดินว่างเปล่าเป็นแหล่งผลิตไฟฟ้าพลังงานสะอาด จำหน่ายให้ กฟภ./กฟน. หรือนิคมฯ',
    suitableAreaMinRai: 2, // เริ่มต้นตั้งแต่ 2 ไร่ขึ้นไป (หรือ scalable)
    preferredZoning: ['green', 'yellow', 'purple', 'light_green'],
    standards: ['วสท. 022013-64 (มาตรฐานการติดตั้งโซลาร์เซลล์)', 'PEA Interconnection Code 2021', 'ERC Regulations 2022-2030'],
    description: 'โครงการพัฒนาพื้นที่เพื่อติดตั้งระบบผลิตไฟฟ้าพลังงานแสงอาทิตย์แบบติดตั้งบนพื้นดิน (Ground-mounted Solar PV) เชื่อมต่อระบบโครงข่ายจำหน่ายไฟฟ้าแรงกลาง (Medium Voltage 22kV / 33kV) หรือแรงสูง เพื่อจำหน่ายไฟผ่านโครงการ Utility Green Tariff (UGT), Feed-in Tariff (FiT) หรือ Private PPA ให้กับโรงงานข้างเคียง',
    keyBenefits: [
      'สร้างกระแสเงินสดสม่ำเสมอยาวนาน 20-25 ปี (PPA/FiT)',
      'มูลค่าการลงทุนต่อวัตต์ลดลงอย่างมากด้วยเทคโนโลยี N-Type TOPCon / Bifacial',
      'ค่าบำรุงรักษาต่ำ (Low OPEX) เมื่อเทียบกับโรงไฟฟ้าประเภทอื่น',
      'ลดการปล่อยก๊าซเรือนกระจกและได้คาร์บอนเครดิต (T-VER)'
    ],
    technicalHighlights: [
      'ใช้แผง Bifacial 620W+ N-Type รับแสงทั้งสองด้าน (+5-15% Albedo gain)',
      'อินเวอร์เตอร์ String Inverter (Grid-tie) ขนาด 250-330 kW ประสิทธิภาพ >98.8%',
      'หม้อแปลง Step-up 0.8kV / 22kV (หรือ 33kV) พร้อมระบบตัดตอนและป้องกัน VCB/Relay 50/51',
      'ระบบควบคุม SCADA / Weather Station ตรวจวัดอุณหภูมิแผงและความเข้มแสง (Pyranometer)'
    ]
  },
  {
    id: 'agrivoltaics',
    title: 'เกษตรพลังงานแสงอาทิตย์ร่วม (Agrivoltaics / Dual-Use Solar)',
    shortTitle: 'Agrivoltaics (เกษตร+โซลาร์)',
    category: 'hybrid',
    icon: 'Sprout',
    accentColor: 'emerald',
    tagline: 'ใช้พื้นที่ผืนเดียวกัน 2 เท่า: ทำเกษตรอินทรีย์พืชใต้ร่มเงาควบคู่กับผลิตไฟฟ้าพลังงานแสงอาทิตย์',
    suitableAreaMinRai: 1.5,
    preferredZoning: ['green', 'light_green', 'rural'],
    standards: ['วสท. 022013-64', 'PEA VSPP Code', 'กรมวิชาการเกษตร (พืชใต้ร่มเงา)'],
    description: 'การออกแบบโครงสร้างค้ำยันแผงโซลาร์เซลล์ให้มีความสูงยกพื้น 2.5 - 3.5 เมตร และมีระยะห่างแถว (Pitch distance) เพื่อให้แสงส่องถึงพืชด้านล่างอย่างพอเหมาะ ช่วยลดอุณหภูมิของแผงโซลาร์จากความชื้นของดิน ทำให้แผงผลิตไฟได้ดีขึ้น ขณะเดียวกันก็สร้างรายได้ 2 ทาง ทั้งจากพืชผลการเกษตร (วานิลลา, ฟ้าทะลายโจร, เห็ด, ผักสลัด) และค่าไฟฟ้า',
    keyBenefits: [
      'ไม่ต้องเปลี่ยนการใช้ประโยชน์ที่ดินตามผังเมือง ลดปัญหาภาษีที่ดินเกษตรกรรม',
      'พืชช่วยลดอุณหภูมิใต้แผง (Microclimate) เพิ่มประสิทธิภาพการแปลงพลังงานไฟฟ้า ~2-4%',
      'รายได้ 2 ทาง: ผลผลิตทางการเกษตรเกรดพรีเมียม + กระแสเงินสดจากการขายไฟฟ้า',
      'ภาพลักษณ์ ESG และความยั่งยืนระดับสูงสุด ชนะใจชุมชนและสถาบันการเงิน'
    ],
    technicalHighlights: [
      'โครงสร้างเหล็กชุบกัลวาไนซ์สูงพิเศษ (Clearance > 2.8m) ให้รถแทรกเตอร์ขนาดเล็กเข้าได้',
      'ระยะ Row Pitch กว้าง 6-8 เมตรเพื่อป้องกันเงาบังและควบคุมปริมาณรังสีที่ส่องลงดิน',
      'ระบบ Smart Micro-Irrigation ควบคุมการให้น้ำพืชโดยใช้ไฟจากโซลาร์เซลล์โดยตรง',
      'ระบบป้องกันกระแสรั่วไหลลงดิน (RCD/GFCI) ระดับเข้มงวดเพื่อความปลอดภัยของเกษตรกร'
    ]
  },
  {
    id: 'ev-charging-hub',
    title: 'ศูนย์ชาร์จยานยนต์ไฟฟ้าความเร็วสูง + โซลาร์รูฟ + BESS (EV Supercharging Plaza)',
    shortTitle: 'EV Charging Plaza',
    category: 'infrastructure',
    icon: 'Zap',
    accentColor: 'cyan',
    tagline: 'รองรับการเติบโตของยานยนต์ไฟฟ้า 100% บนทำเลติดถนน พร้อมระบบกักเก็บพลังงาน BESS ลดค่า Peak',
    suitableAreaMinRai: 0.5,
    preferredZoning: ['red', 'orange', 'yellow', 'purple'],
    standards: ['วสท. 022026-63 (มาตรฐานการติดตั้งสถานีอัดประจุไฟฟ้า)', 'PEA/MEA EV Charger Regulations', 'IEC 61851 / ISO 15118'],
    description: 'พัฒนาที่ดินติดถนนสายหลักหรือทางผ่านให้เป็นสถานีอัดประจุไฟฟ้า DC Fast Charge (120kW - 360kW) ร่วมกับหลังคา Solar Carport และตู้แบตเตอรี่ BESS เพื่อช่วยโกนยอดโหลด (Peak Shaving) ป้องกันค่าตัดกระแสเกิน (Demand Charge) จากการไฟฟ้า พร้อมพื้นที่บริการคาเฟ่ ร้านสะดวกซื้อ และจุดพักผ่อน',
    keyBenefits: [
      'รายได้สูงต่อตารางวาจากการให้บริการชาร์จไฟฟ้าและค่าเช่าพื้นที่ร้านค้า/คาเฟ่',
      'BESS ช่วยลดค่า Demand Charge ประหยัดค่าไฟฟ้าจาก Peak ช่วงกลางวันได้มหาศาล',
      'ตอบโจทย์แผนแม่บท EV 30@30 ของประเทศไทย รถยนต์ไฟฟ้าเติบโตแบบก้าวกระโดด',
      'สามารถขยายขนาดแท่นชาร์จแบบโมดูลาร์ (Modular Expansion) ตามปริมาณรถที่เพิ่มขึ้น'
    ],
    technicalHighlights: [
      'แท่นชาร์จ DC Superfast Liquid-Cooled 180kW - 360kW CCS2 / CHAdeMO',
      'หม้อแปลงไฟฟ้าเฉพาะสถานีชาร์จ (Dedicated Transformer) ขนาด 500kVA - 1500kVA 22kV/400V',
      'ระบบ Dynamic Load Management (DLM) เฉลี่ยกำลังไฟตามจำนวนหัวชาร์จที่ใช้งานจริง',
      'BESS ขนาด 200kWh - 500kWh สำหรับ Peak Shaving และ Emergency Backup'
    ]
  },
  {
    id: 'grid-bess',
    title: 'ระบบกักเก็บพลังงานแบตเตอรี่ระดับโครงข่าย (Utility-Scale BESS Farm)',
    shortTitle: 'Grid-Scale BESS',
    category: 'storage',
    icon: 'BatteryCharging',
    accentColor: 'indigo',
    tagline: 'โครงสร้างพื้นฐานยุคใหม่เพื่อสร้างเสถียรภาพระบบไฟฟ้า เสริมความมั่นคงของสายส่ง กฟผ./กฟภ.',
    suitableAreaMinRai: 1,
    preferredZoning: ['purple', 'industrial', 'yellow', 'green'],
    standards: ['IEEE 1547-2018', 'NFPA 855 (Standard for Installation of ESS)', 'PEA Grid Ancillary Services Code'],
    description: 'การนำที่ดินแปลงย่อยหรือพื้นที่ใกล้แนวสายส่ง/สถานีไฟฟ้าแรงสูง (Substation) มาติดตั้งตู้คอนเทนเนอร์แบตเตอรี่ลิเธียมไอออนฟอสเฟต (LFP) ระดับ Grid-Scale เพื่อให้บริการ Ancillary Services แก่ระบบไฟฟ้า เช่น Frequency Regulation, Spinning Reserve, และการทำ Energy Arbitrage (ชาร์จไฟช่วงไฟถูก Off-Peak ขายช่วง Peak)',
    keyBenefits: [
      'ใช้พื้นที่ดินน้อยแต่สร้างมูลค่าทางวิศวกรรมไฟฟ้าสูงมาก (High Power Density)',
      'อนาคตของระบบโครงข่ายไฟฟ้าไทย (Grid Modernization & Smart Grid)',
      'สามารถทำสัญญาเช่าพื้นที่ระยะยาวกับบริษัทพลังงานชั้นนำ (Energy Conglomerates)',
      'ระบบปลอดภัยสูงด้วยมาตรฐาน Liquid Cooling และระบบดับเพลิงอัตโนมัติ Aerosol/Novec'
    ],
    technicalHighlights: [
      'ตู้คอนเทนเนอร์ 20ft / 40ft LFP Energy Storage (ความจุ 2MWh - 5MWh ต่อตู้)',
      'Power Conversion System (PCS) อินเวอร์เตอร์สองทาง (Bi-directional) ประสิทธิภาพ >98.5%',
      'ระบบควบคุม Energy Management System (EMS) สื่อสารโปรโตคอล IEC 60870-5-104 / Modbus TCP',
      'ระบบระบายความร้อนของเหลว (Liquid-Cooled Thermal Management) ยืดอายุรอบชาร์จ >6,000 Cycles'
    ]
  },
  {
    id: 'floating-solar',
    title: 'โรงไฟฟ้าพลังงานแสงอาทิตย์ลอยน้ำ (Floating Solar / Hydro-Floating PV)',
    shortTitle: 'Floating Solar (โซลาร์ลอยน้ำ)',
    category: 'renewable',
    icon: 'Waves',
    accentColor: 'blue',
    tagline: 'เหมาะกับที่ดินที่มีบ่อน้ำ อ่างเก็บน้ำ หรือบ่อดินเดิม เพิ่มประสิทธิภาพผลิตไฟด้วยไอน้ำหล่อเย็น',
    suitableAreaMinRai: 1.5,
    preferredZoning: ['green', 'yellow', 'water_body', 'rural'],
    standards: ['วสท. มาตรฐานโซลาร์ลอยน้ำ', 'DEDE Guideline for Floating PV', 'PEA/EGAT Interconnection'],
    description: 'สำหรับแปลงที่ดินที่มีบ่อน้ำ บ่อดินเก่า ขุมเหมืองเดิม หรืออ่างเก็บน้ำที่ไม่สามารถสร้างอาคารได้ ทุ่นลอยน้ำ HDPE คุณภาพสูงจะรองรับแผงโซลาร์เซลล์ ความเย็นของน้ำช่วยระบายความร้อนให้แผง ทำให้ผลิตไฟฟ้าได้มากกว่าแผงบนดินราว 5-10% พร้อมทั้งช่วยลดการระเหยของน้ำและยับยั้งการเจริญเติบโตของตะไคร่น้ำ',
    keyBenefits: [
      'ใช้ประโยชน์จากพื้นที่บ่อน้ำที่ปกติไม่สามารถใช้ประโยชน์เชิงพาณิชย์อื่นได้',
      'ประสิทธิภาพผลิตไฟสูงขึ้น 5-10% จาก Cooling Effect ของผิวน้ำ',
      'ช่วยลดการระเหยของน้ำในบ่อได้มากกว่า 70% รักษาปริมาณน้ำไว้ใช้ยามหน้าแล้ง',
      'ทุ่นลอยผลิตจาก Food-grade HDPE ไร้สารพิษ ไม่กระทบต่อระบบนิเวศสัตว์น้ำ'
    ],
    technicalHighlights: [
      'ทุ่นหลักและทุ่นทางเดิน HDPE UV-resistant อายุการใช้งานมากกว่า 25 ปี',
      'ระบบยึดโยง (Anchoring & Mooring System) ทนแรงดึงและรองรับการเปลี่ยนแปลงระดับน้ำ',
      'สายเคเบิล DC ใต้น้ำชนิดกันน้ำ IP68 และทนแสงแดด UV (Double insulated Solar Cable)',
      'อินเวอร์เตอร์แบบทนความชื้นและการกัดกร่อนระดับ C5-M'
    ]
  },
  {
    id: 'biomass-biogas',
    title: 'โรงไฟฟ้าก๊าซชีวภาพ / ชีวมวลชุมชน (Biogas & Biomass Renewable Plant)',
    shortTitle: 'Biogas / Biomass',
    category: 'bioenergy',
    icon: 'Flame',
    accentColor: 'orange',
    tagline: 'เปลี่ยนของเสียเกษตรกรรม/มูลสัตว์รอบที่ดิน เป็นพลังงานไฟฟ้าฐาน (Baseload Renewable)',
    suitableAreaMinRai: 5,
    preferredZoning: ['green', 'rural', 'purple'],
    standards: ['มาตรฐานความปลอดภัยโรงงานผลิตก๊าซชีวภาพ วสท.', 'กรมโรงงานอุตสาหกรรม', 'PEA VSPP'],
    description: 'หากที่ดินตั้งอยู่ในเขตเกษตรกรรมหรือใกล้เคียงฟาร์มปศุสัตว์/โรงงานแปรรูปเกษตร สามารถพัฒนาเป็นโรงไฟฟ้าก๊าซชีวภาพ (Anaerobic Digester) หมักของเสียอินทรีย์ผลิตก๊าซมีเทน ขับเคลื่อนเครื่องยนต์ก๊าซ (Gas Engine Generator) จ่ายไฟฟ้าได้ต่อเนื่อง 24 ชั่วโมง เป็นโรงไฟฟ้าพลังงานหมุนเวียนที่เป็นโรงไฟฟ้าฐาน (Baseload Power Plant)',
    keyBenefits: [
      'จ่ายไฟฟ้าได้สม่ำเสมอ 24 ชม. ไม่ขึ้นกับสภาพอากาศเหมือนแดดหรือลม (Capacity Factor >85%)',
      'ได้รายได้เสริมจากกากตะกอนปุ๋ยชีวภาพเข้มข้นหลังการหมัก จำหน่ายให้เกษตรกร',
      'แก้ปัญหากลิ่นและน้ำเสียในชุมชนรอบข้าง สร้างความสัมพันธ์อันดีกับชุมชน (CSR)',
      'อัตราค่าไฟฟ้า FiT สำหรับชีวภาพ/ชีวมวลมักมีราคารับซื้อที่จูงใจ (FiT Premium)'
    ],
    technicalHighlights: [
      'บ่อหมักก๊าซชีวภาพแบบ CSTR หรือ Covered Lagoon พร้อมระบบบำบัด H2S Scrubber',
      'เครื่องกำเนิดไฟฟ้าก๊าซชีวภาพ (Biogas Engine Synchronous Generator) ประสิทธิภาพทางไฟฟ้า ~40%',
      'ระบบควบคุมอัตโนมัติ Gas Leak Detection, Flame Arrester และ Safety Flare',
      'หม้อแปลง Step-up 400V / 22kV พร้อมตู้สวิตช์เกียร์ Medium Voltage VCB'
    ]
  }
];
