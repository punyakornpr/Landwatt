import React, { useMemo } from 'react';
import { navigate } from '../router';
import { useApp } from '../state/AppState';
import { recommendProjects, PROJECT_FRIENDLY } from '../engine/recommend';
import { getSpecs, friendlySummary, realityChecklist } from '../engine/specs';
import { EE_PROJECTS } from '../data/eeProjects';
import { fmtTHB } from '../components/ui';
import { ArrowLeft, Printer, CheckCircle2, AlertTriangle } from 'lucide-react';

const STATUS_TH = { great: 'เหมาะมาก', worth: 'น่าศึกษาต่อ', insufficient: 'ต้องมีข้อมูลเพิ่ม', no: 'ยังไม่แนะนำ' };
const LAND_KIND = { flat: 'ที่ราบ/ที่โล่ง', agri: 'พื้นที่เกษตร', pond: 'มีบ่อน้ำ', slope: 'ที่ลาดเอียง' };

export default function Report({ projectId }) {
  const { land, goals, chosenPlanId } = useApp();
  const id = projectId || chosenPlanId || 'solar-farm';
  const project = EE_PROJECTS.find(p => p.id === id) || EE_PROJECTS[0];
  const meta = PROJECT_FRIENDLY[id];
  const specs = useMemo(() => getSpecs(id, land), [id, land]);
  const summary = useMemo(() => friendlySummary(id, specs, land), [id, specs, land]);
  const rec = useMemo(() => recommendProjects(land, goals).find(r => r.id === id), [land, goals, id]);
  const checklist = realityChecklist(id);
  const today = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 print-page">
      <div className="no-print flex items-center justify-between mb-6">
        <button onClick={() => navigate(`/plan/${id}`)} className="btn-ghost text-sm -ml-2">
          <ArrowLeft className="w-4 h-4" /> กลับไปหน้าแผน
        </button>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer className="w-4 h-4" /> พิมพ์ / บันทึกเป็น PDF
        </button>
      </div>

      <div className="bg-white border border-[#E7E5DD] rounded-2xl p-6 sm:p-10 print:border-0 print:p-0">
        {/* Letterhead */}
        <div className="flex items-start justify-between border-b-2 border-brand-700 pb-5 mb-6">
          <div>
            <div className="text-lg font-bold text-brand-800">LandWatt</div>
            <div className="text-xs text-ink-faint">ผู้ช่วยวางแผนใช้ประโยชน์ที่ดินด้านพลังงาน</div>
          </div>
          <div className="text-right text-xs text-ink-faint">
            <div>รายงานสรุปเบื้องต้น</div>
            <div>วันที่ {today}</div>
            <div>เวอร์ชันคำนวณ 1.0</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold">สรุปแผน: {meta.name}</h1>
        <p className="text-sm text-ink-soft mt-1">{meta.oneLiner}</p>

        {/* Land */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint mb-2">1. ข้อมูลที่ดินและเป้าหมาย</h2>
          <table className="w-full text-sm">
            <tbody>
              {[
                ['ที่ตั้ง', `${land.provinceData?.name || 'ตำแหน่งที่ปักหมุด'} (${land.coordinates?.lat?.toFixed(4)}, ${land.coordinates?.lng?.toFixed(4)})`],
                ['ขนาด', `${(land.areaSqM / 1600).toFixed(2)} ไร่ ≈ ${land.areaSqM.toLocaleString()} ตร.ม.`],
                ['ลักษณะที่ดิน', `${LAND_KIND[land.landType] || 'ไม่ระบุ'}${land.landTypeUnknown ? ' (ผู้ใช้ระบุว่ายังไม่แน่ใจ)' : ''}`],
                ['การเข้าถึง', land.roadType === 'main' ? 'ติดถนนใหญ่' : land.roadType === 'dirt' ? 'ทางเข้าลำบาก' : 'ถนนรอง/ลาดยาง'],
                ['ระยะห่างสายไฟ (ประมาณ)', land.gridUnknown ? 'ไม่ทราบ — ใช้ค่าประมาณ' : `~${land.gridDistanceMeters} เมตร`],
                ['เป้าหมาย', goals.aims.length ? goals.aims.join(', ') : 'ให้ระบบช่วยแนะนำ'],
                ['งบที่ตั้งไว้', goals.budget === 'unsure' ? 'ยังไม่แน่ใจ' : goals.budget],
              ].map(([k, v], i) => (
                <tr key={i} className="border-b border-[#F7F5EF]">
                  <td className="py-2 text-ink-faint w-40">{k}</td>
                  <td className="py-2">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Plan */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint mb-2">2. แผนที่เลือกและผลประเมิน</h2>
          <div className="rounded-xl border border-[#E7E5DD] p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{meta.name} <span className="text-xs font-normal text-ink-faint">({meta.sub})</span></span>
              {rec && <span className="text-sm font-medium">{STATUS_TH[rec.status]} · คะแนน {rec.score}/100</span>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
              <div><div className="text-[11px] text-ink-faint">เงินลงทุน (ประมาณ)</div><div className="font-bold mt-0.5">{summary.capex ? `${fmtTHB(summary.capex.low)}–${fmtTHB(summary.capex.high)}` : 'ยังประเมินไม่ได้'}</div></div>
              <div><div className="text-[11px] text-ink-faint">พื้นที่ใช้</div><div className="font-bold mt-0.5">{summary.areaUsed.split('(')[0]}</div></div>
              <div><div className="text-[11px] text-ink-faint">รายได้/ปี (ประมาณ)</div><div className="font-bold mt-0.5">{specs.financials?.annualRevenueMillionTHB ? fmtTHB(specs.financials.annualRevenueMillionTHB) : 'ยังประเมินไม่ได้'}</div></div>
              <div><div className="text-[11px] text-ink-faint">คืนทุน (ประมาณ)</div><div className="font-bold mt-0.5">{summary.payback}</div></div>
            </div>
            <p className="text-sm mt-3 text-ink-soft">{summary.benefit}</p>
          </div>
        </section>

        {/* Reasons & cautions */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint mb-2">3. เหตุผลและข้อควรระวัง</h2>
          <ul className="space-y-1.5 text-sm">
            {(rec?.reasons || []).map((t, i) => (
              <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-energy-600 flex-shrink-0 mt-0.5" />{t}</li>
            ))}
            {(rec?.cautions || []).map((t, i) => (
              <li key={`c${i}`} className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-volt-600 flex-shrink-0 mt-0.5" />{t}</li>
            ))}
            {(rec?.confidence?.missing || []).map((t, i) => (
              <li key={`m${i}`} className="flex items-start gap-2 text-ink-soft"><AlertTriangle className="w-4 h-4 text-ink-faint flex-shrink-0 mt-0.5" />ยังไม่มีข้อมูลเรื่อง{t}</li>
            ))}
          </ul>
        </section>

        {/* Checklist */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint mb-2">4. สิ่งที่ควรตรวจสอบหรือทำต่อ</h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm">
            {checklist.map((t, i) => <li key={i}>{t}</li>)}
          </ol>
        </section>

        {/* Tech numbers */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint mb-2">5. ตัวเลขทางเทคนิคที่ใช้คำนวณ</h2>
          <table className="w-full text-xs font-mono">
            <tbody>
              {[
                ['ขนาดระบบ DC', specs.dcCapacityMWp ? `${specs.dcCapacityMWp} MWp (${specs.dcCapacityKWp} kWp)` : '—'],
                ['กำลัง AC', specs.acCapacityMW ? `${specs.acCapacityMW} MWac` : '—'],
                ['DC/AC จริง', specs.actualDcAcRatio || '—'],
                ['ผลิตไฟ/ปี', specs.annualEnergyMWh ? `${specs.annualEnergyMWh} MWh` : '—'],
                ['หม้อแปลง', specs.transformerRating || '—'],
                ['CAPEX กลาง', summary.capex ? fmtTHB(summary.capex.mid) : '—'],
                ['IRR ประมาณการ', specs.financials?.irrPercent ? `${specs.financials.irrPercent}%` : '—'],
              ].map(([k, v], i) => (
                <tr key={i} className="border-b border-[#F7F5EF]">
                  <td className="py-1.5 text-ink-faint font-sans w-40">{k}</td>
                  <td className="py-1.5">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="mt-8 rounded-xl bg-[#F3F1EA] px-4 py-3 text-xs text-ink-soft leading-relaxed">
          <strong>ข้อจำกัดของรายงาน:</strong> เอกสารนี้เป็นการประเมินความเป็นไปได้เบื้องต้นจากข้อมูลที่ผู้ใช้ให้และสมมติฐานของระบบ LandWatt
          ไม่ใช่การรับรองสิทธิ์ที่ดิน ใบอนุญาต การเชื่อมต่อไฟฟ้า แบบก่อสร้าง หรือรับประกันรายได้
          ตัวเลขเงินลงทุนและผลตอบแทนเป็นประมาณการ ผลจริงขึ้นกับราคาติดตั้ง พฤติกรรมใช้ไฟ และเงื่อนไขของหน่วยงานที่เกี่ยวข้อง
        </div>
      </div>
    </div>
  );
}
