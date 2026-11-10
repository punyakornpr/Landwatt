import React from 'react';
import { navigate } from '../router';
import { useApp } from '../state/AppState';
import { PROVINCES_DATA } from '../data/provinces';
import {
  ArrowRight, MapPin, ListChecks, FileText, Sun, Sprout, Zap,
  HelpCircle, CheckCircle2, PlayCircle,
} from 'lucide-react';
import { DisclaimerStrip } from '../components/ui';

const EXAMPLES = [
  {
    id: 'ex-rural',
    label: 'ที่ดินต่างจังหวัด',
    desc: 'นครราชสีมา 10 ไร่ ที่ราบโล่ง เหมาะทดลองโซลาร์',
    patch: {
      land: {
        areaSqM: 16000, provinceId: 'korat', provinceData: PROVINCES_DATA.find(p => p.id === 'korat'),
        coordinates: { lat: 14.9799, lng: 102.0977 }, roadType: 'secondary', roadWidthMeters: 8,
        gridDistanceMeters: 200, landType: 'flat', hasWaterBody: false, hasAgriculturalWaste: false,
      },
      goals: { aims: ['income'], budget: 'unsure' },
    },
  },
  {
    id: 'ex-roadside',
    label: 'ที่ดินติดถนน',
    desc: 'ชลบุรี 2 ไร่ ติดถนนใหญ่ เหมาะทดลองจุดชาร์จรถไฟฟ้า',
    patch: {
      land: {
        areaSqM: 3200, provinceId: 'chonburi', provinceData: PROVINCES_DATA.find(p => p.id === 'chonburi'),
        coordinates: { lat: 13.3611, lng: 100.9847 }, roadType: 'main', roadWidthMeters: 14,
        gridDistanceMeters: 100, landType: 'flat', hasWaterBody: false, hasAgriculturalWaste: false,
      },
      goals: { aims: ['ev'], budget: 'unsure' },
    },
  },
  {
    id: 'ex-farm',
    label: 'พื้นที่สวนหรือเกษตร',
    desc: 'สระบุรี 5 ไร่ แปลงเกษตรเดิม เหมาะทดลองเกษตรคู่โซลาร์',
    patch: {
      land: {
        areaSqM: 8000, provinceId: 'saraburi', provinceData: PROVINCES_DATA.find(p => p.id === 'saraburi'),
        coordinates: { lat: 14.5289, lng: 100.9101 }, roadType: 'secondary', roadWidthMeters: 6,
        gridDistanceMeters: 200, landType: 'agri', hasWaterBody: false, hasAgriculturalWaste: true,
      },
      goals: { aims: ['farm', 'income'], budget: 'unsure' },
    },
  },
];

const FAQS = [
  { q: 'ไม่รู้พิกัดที่ดินแน่ชัด ใช้ได้ไหม?', a: 'ได้ครับ เลือกจังหวัดหรือปักหมุดบนแผนที่คร่าว ๆ ก็เริ่มประเมินได้ ยิ่งตำแหน่งแม่น ผลเกี่ยวกับแดดและการไฟฟ้ายิ่งใกล้จริง' },
  { q: 'ยังไม่มีงบแน่นอนทำได้ไหม?', a: 'ได้ ระบบจะแสดงช่วงเงินลงทุนโดยประมาณของแต่ละทางเลือกให้เทียบก่อน แล้วค่อยกรองตามงบทีหลัง' },
  { q: 'ต้องจ่ายเงินใช้งานไหม?', a: 'ตัวประเมินบนเว็บนี้ใช้งานได้โดยไม่มีค่าใช้จ่าย ข้อมูลที่กรอกจะถูกเก็บไว้ในเครื่องของคุณเท่านั้น' },
  { q: 'ตัวเลขเงินลงทุนและรายได้เป็นราคาจริงไหม?', a: 'เป็นการประมาณการจากสมมติฐานกลางของระบบ ไม่ใช่ใบเสนอราคา ราคาจริงขึ้นกับผู้รับเหมา อุปกรณ์ และเงื่อนไขการเชื่อมต่อไฟฟ้า ณ เวลานั้น' },
  { q: 'ข้อมูลที่กรอกถูกส่งไปไหนบ้าง?', a: 'ข้อมูลอยู่ในเบราว์เซอร์ของคุณ (บันทึกผ่าน localStorage) ไม่ได้ส่งไปเก็บบนเซิร์ฟเวอร์' },
];

export default function Landing() {
  const { updateLand, updateGoals } = useApp();

  const useExample = (ex) => {
    updateLand(ex.patch.land);
    updateGoals(ex.patch.goals);
    navigate('/start?step=2');
  };

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/80 via-paper to-paper pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-14 text-center">
          <span className="chip bg-white border border-brand-200 text-brand-800 mb-5">
            <Sun className="w-3.5 h-3.5" /> ผู้ช่วยวางแผนใช้ประโยชน์ที่ดินด้านพลังงาน
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            ที่ดินว่างของคุณ<br className="sm:hidden" /> ทำอะไรได้มากกว่าที่คิด
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed">
            แค่บอกว่าที่ดินอยู่ที่ไหนและอยากใช้ทำอะไร LandWatt จะช่วยเปรียบเทียบทางเลือกด้านพลังงาน
            พร้อมประเมินพื้นที่ เงินลงทุน และความคุ้มค่าเบื้องต้นให้เข้าใจง่าย
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate('/start')} className="btn-primary text-base px-7 py-3.5 w-full sm:w-auto">
              เริ่มวางแผนที่ดินของฉัน <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => useExample(EXAMPLES[0])} className="btn-secondary text-base px-7 py-3.5 w-full sm:w-auto">
              <PlayCircle className="w-4 h-4" /> ลองดูตัวอย่าง
            </button>
          </div>
          <p className="mt-4 text-xs text-ink-faint">ไม่ต้องสมัครสมาชิก · ไม่ต้องรู้เรื่องไฟฟ้า · ใช้เวลาไม่ถึง 2 นาที</p>
        </div>
      </section>

      {/* Why LandWatt */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: MapPin, title: 'รู้ว่าที่ดินเหมาะกับอะไร', desc: 'ตอบคำถามง่าย ๆ เกี่ยวกับที่ดิน แล้วเห็นทางเลือกที่เหมาะพร้อมเหตุผล' },
            { icon: ListChecks, title: 'เห็นภาพก่อนลงทุน', desc: 'ภาพจำลองการจัดวางบนแปลง พื้นที่ที่ใช้ เงินลงทุน และสิ่งที่ต้องระวัง' },
            { icon: FileText, title: 'เปรียบเทียบต้นทุนและความคุ้มค่า', desc: 'เทียบ 2–3 แผนเคียงกัน แล้วดาวน์โหลดสรุปไปใช้ตัดสินใจต่อ' },
          ].map((c, i) => (
            <div key={i} className="card p-6">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-4">
                <c.icon className="w-5.5 h-5.5 w-6 h-6" />
              </div>
              <h3 className="font-semibold">{c.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-center">ใช้งานยังไง?</h2>
        <p className="text-sm text-ink-faint text-center mt-1">4 ขั้นตอนง่าย ๆ จบในไม่กี่นาที</p>
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: MapPin, t: 'บอกข้อมูลที่ดิน', d: 'ตำแหน่ง ขนาด และลักษณะพื้นที่' },
            { icon: Sun, t: 'รับคำแนะนำ', d: 'ระบบจัดอันดับทางเลือกพร้อมเหตุผล' },
            { icon: ListChecks, t: 'ดูแผนที่สนใจ', d: 'ภาพจำลอง เงินลงทุน และข้อควรระวัง' },
            { icon: FileText, t: 'ดาวน์โหลดสรุป', d: 'บันทึกแผนและพิมพ์รายงานฉบับย่อ' },
          ].map((s, i) => (
            <div key={i} className="relative card p-5 text-center">
              <span className="absolute top-3 left-4 text-xs font-bold text-brand-600">ขั้น {i + 1}</span>
              <div className="w-11 h-11 rounded-full bg-brand-700 text-white flex items-center justify-center mx-auto mt-2 mb-3">
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold">{s.t}</div>
              <div className="text-xs text-ink-faint mt-1 leading-relaxed">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Examples */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-center">ลองดูตัวอย่าง</h2>
        <p className="text-sm text-ink-faint text-center mt-1">กดเพื่อเติมข้อมูลตัวอย่างเข้าแบบฟอร์มจริง แล้วปรับได้ตามที่ดินของคุณ</p>
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {EXAMPLES.map((ex, i) => {
            const icons = [Sun, Zap, Sprout];
            const Icon = icons[i];
            return (
              <button key={ex.id} onClick={() => useExample(ex)}
                className="card p-6 text-left hover:border-brand-400 transition group">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F3F1EA] text-ink-soft flex items-center justify-center group-hover:bg-brand-700 group-hover:text-white transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="chip bg-volt-100 text-volt-800 border border-volt-200">ข้อมูลสาธิต</span>
                </div>
                <h3 className="mt-4 font-semibold">{ex.label}</h3>
                <p className="mt-1 text-sm text-ink-soft leading-relaxed">{ex.desc}</p>
                <span className="mt-3 inline-flex items-center text-sm font-medium text-brand-700">
                  ลองใช้ตัวอย่างนี้ <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <DisclaimerStrip />
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">คำถามที่พบบ่อย</h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <details key={i} className="card group open:bg-white">
              <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none">
                <span className="flex items-center gap-2.5 text-sm font-medium">
                  <HelpCircle className="w-4 h-4 text-brand-600 flex-shrink-0" /> {f.q}
                </span>
                <span className="text-ink-faint group-open:rotate-45 transition text-lg leading-none">+</span>
              </summary>
              <p className="px-5 pb-4 pl-[42px] text-sm text-ink-soft leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="text-center mt-10">
          <button onClick={() => navigate('/start')} className="btn-primary px-8 py-3.5">
            เริ่มวิเคราะห์ที่ดินของฉัน <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
