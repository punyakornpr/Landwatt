import React, { useEffect, useMemo, useState } from 'react';
import { navigate } from '../router';
import { useApp } from '../state/AppState';
import { recommendProjects, dataConfidence, PROJECT_FRIENDLY, budgetCaution } from '../engine/recommend';
import { getSpecs } from '../engine/specs';
import { StepProgress, StatusBadge, ProjectIcon, Note, Collapsible, fmtTHB, DisclaimerStrip } from '../components/ui';
import {
  MapPin, Pencil, ArrowRight, Scale, CheckCircle2, AlertTriangle,
  Info, GitCompareArrows,
} from 'lucide-react';

const JOURNEY_STEPS = ['ที่ดินของคุณ', 'เป้าหมายและงบ', 'ทางเลือกแนะนำ', 'ดูแผน', 'เก็บแผน/รายงาน'];

export default function Results() {
  const { land, goals, compareIds, toggleCompare, setChosenPlan } = useApp();
  const [analyzing, setAnalyzing] = useState(true);
  const [analyzeMsg, setAnalyzeMsg] = useState(0);
  const [whyOpen, setWhyOpen] = useState(null);

  const msgs = ['กำลังตรวจสอบขนาดและลักษณะพื้นที่', 'กำลังเปรียบเทียบทางเลือกที่เป็นไปได้', 'กำลังคำนวณเงินลงทุนเบื้องต้น'];
  useEffect(() => {
    const t1 = setInterval(() => setAnalyzeMsg(m => Math.min(m + 1, msgs.length - 1)), 550);
    const t2 = setTimeout(() => setAnalyzing(false), 1500);
    return () => { clearInterval(t1); clearTimeout(t2); };
  }, []);

  const results = useMemo(() => recommendProjects(land, goals), [land, goals]);
  const confidence = dataConfidence(land);
  const top = results.slice(0, 3);
  const rest = results.slice(3);

  const specsCache = useMemo(() => {
    const m = {};
    results.forEach(r => { try { m[r.id] = getSpecs(r.id, land); } catch { m[r.id] = null; } });
    return m;
  }, [results, land]);

  if (analyzing) {
    return (
      <div className="max-w-md mx-auto px-4 py-28 text-center">
        <div className="w-14 h-14 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin mx-auto" />
        <p className="mt-6 text-sm text-ink-soft font-medium">{msgs[analyzeMsg]}…</p>
        <p className="mt-1 text-xs text-ink-faint">วิเคราะห์จากข้อมูลที่คุณให้ไว้ ใช้เวลาสั้น ๆ</p>
      </div>
    );
  }

  const landKindLabel = { flat: 'ที่ราบ/ที่โล่ง', agri: 'พื้นที่เกษตร', pond: 'มีบ่อน้ำ', slope: 'ที่ลาดเอียง' }[land.landType] || 'ไม่ระบุ';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <StepProgress steps={JOURNEY_STEPS} current={2} />
      </div>

      {/* Land summary */}
      <div className="card p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold">
                {land.provinceData?.name || 'ตำแหน่งที่ปักหมุด'} · {(land.areaSqM / 1600).toFixed(2)} ไร่
              </div>
              <div className="text-xs text-ink-faint mt-0.5">
                {landKindLabel}
                {land.roadType === 'main' ? ' · ติดถนนใหญ่' : land.roadType === 'dirt' ? ' · ทางเข้าลำบาก' : ' · ถนนรอง'}
                {goals.budget && goals.budget !== 'unsure' ? ` · งบที่ตั้งไว้: ${{ 'under-500k': 'ต่ำกว่า 5 แสน', '0.5-2m': '0.5–2 ล้าน', '2-5m': '2–5 ล้าน', '5-10m': '5–10 ล้าน', 'over-10m': 'มากกว่า 10 ล้าน' }[goals.budget]}` : ''}
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/start')} className="btn-ghost text-xs self-start sm:self-auto">
            <Pencil className="w-3.5 h-3.5" /> แก้ข้อมูล
          </button>
        </div>
        {confidence.missing.length > 0 && (
          <div className="mt-3 flex items-start gap-2 text-xs text-volt-800 bg-volt-50 border border-volt-200 rounded-xl px-3.5 py-2.5">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>ความมั่นใจของข้อมูล: <strong>{confidence.level}</strong> — ยังไม่ได้ให้ข้อมูลเรื่อง{confidence.missing.join(' ')} ผลจึงเป็นการประมาณกว้างขึ้น</span>
          </div>
        )}
      </div>

      <h1 className="text-xl sm:text-2xl font-bold">
        {top.length >= 3 ? 'เราพบ 3 ทางเลือกที่น่าศึกษาต่อสำหรับที่ดินของคุณ' : `พบ ${top.length} ทางเลือกที่ผ่านการคัดกรองเบื้องต้น`}
      </h1>
      <p className="text-sm text-ink-soft mt-1.5 mb-6">
        คะแนนความเหมาะสมเป็นคะแนนตามเกณฑ์ของระบบจากข้อมูลที่ให้มา — ไม่ใช่โอกาสทำกำไรหรือความสำเร็จ
      </p>

      <div className="space-y-4">
        {top.map((r, idx) => {
          const meta = PROJECT_FRIENDLY[r.id];
          const specs = specsCache[r.id];
          const capexM = specs?.financials?.totalCapexMillionTHB;
          const budgetWarn = budgetCaution(r.id, goals.budget, capexM ? capexM * 1e6 : null);
          const isCompared = compareIds.includes(r.id);
          return (
            <div key={r.id} className={`card p-5 sm:p-6 ${idx === 0 ? 'border-brand-300 ring-1 ring-brand-100' : ''}`}>
              <div className="flex flex-col sm:flex-row gap-4">
                <ProjectIcon id={r.id} size="lg" active={idx === 0} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{meta.name}</h2>
                    <span className="text-xs text-ink-faint font-normal">{meta.sub}</span>
                    {idx === 0 && <span className="chip bg-brand-700 text-white">เหมาะสุดในตอนนี้</span>}
                  </div>
                  <p className="text-sm text-ink-soft mt-0.5">{meta.oneLiner}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <StatusBadge status={r.status} />
                    <span className="text-xs text-ink-faint">คะแนนความเหมาะสม {r.score}/100 <button className="underline decoration-dotted" onClick={() => setWhyOpen(whyOpen === r.id ? null : r.id)}>ทำไมได้คะแนนนี้?</button></span>
                  </div>

                  {whyOpen === r.id && (
                    <div className="mt-3 rounded-xl bg-paper border border-[#E7E5DD] p-4 text-xs text-ink-soft space-y-1.5">
                      <div className="font-medium text-ink">ปัจจัยที่ใช้ให้คะแนน (น้ำหนักต้นแบบ)</div>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>ความเหมาะสมของพื้นที่และลักษณะภูมิประเทศ</li>
                        <li>ความพร้อมด้านไฟฟ้า (แดด / ระยะห่างสายไฟ / เขตการไฟฟ้า)</li>
                        <li>การเข้าถึงถนนและความต้องการใช้งาน</li>
                        <li>ความสอดคล้องกับเป้าหมายและงบที่เลือก</li>
                      </ul>
                      <p>คะแนนปรับตามข้อมูลจริงที่กรอก และจะเปลี่ยนเมื่อคุณแก้ข้อมูล</p>
                    </div>
                  )}

                  <ul className="mt-3 space-y-1.5">
                    {r.reasons.slice(0, 3).map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink">
                        <CheckCircle2 className="w-4 h-4 text-energy-600 flex-shrink-0 mt-0.5" /> {t}
                      </li>
                    ))}
                    {r.cautions.slice(0, 2).map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                        <AlertTriangle className="w-4 h-4 text-volt-600 flex-shrink-0 mt-0.5" /> {t}
                      </li>
                    ))}
                  </ul>

                  {budgetWarn && <div className="mt-3"><Note type="warn">{budgetWarn}</Note></div>}

                  <div className="mt-3 text-sm">
                    <span className="text-ink-faint">เงินลงทุนโดยประมาณ: </span>
                    {capexM ? (
                      <span className="font-semibold">{fmtTHB(capexM * 0.85)} – {fmtTHB(capexM * 1.2)}</span>
                    ) : (
                      <span className="text-ink-faint">ยังประเมินไม่ได้</span>
                    )}
                    <span className="text-xs text-ink-faint ml-1">(ประมาณการ ไม่ใช่ราคาจริง)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#F0EEE7] flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => { setChosenPlan(r.id); navigate(`/plan/${r.id}`); }}
                  className="btn-primary flex-1">
                  ดูแผนนี้ <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleCompare(r.id)}
                  className={`btn-secondary flex-1 ${isCompared ? 'border-brand-600 text-brand-800 bg-brand-50' : ''}`}>
                  <GitCompareArrows className="w-4 h-4" />
                  {isCompared ? 'อยู่ในรายการเปรียบเทียบ' : 'เพิ่มเพื่อเปรียบเทียบ'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <Collapsible title="ทางเลือกอื่นที่ยังไม่เหมาะในตอนนี้" sub="ยังมีเงื่อนไขขาดหรือความเสี่ยงสูงกว่า ดูเหตุผลได้" defaultOpen={false}>
          <div className="space-y-3 pt-3">
            {rest.map(r => {
              const meta = PROJECT_FRIENDLY[r.id];
              return (
                <div key={r.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E7E5DD] bg-paper/60">
                  <ProjectIcon id={r.id} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{meta.name}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-ink-soft mt-1 leading-relaxed">{r.reasons[0] || meta.oneLiner}</p>
                  </div>
                  <button onClick={() => { setChosenPlan(r.id); navigate(`/plan/${r.id}`); }}
                    className="text-xs font-medium text-brand-700 hover:underline flex-shrink-0 mt-1">
                    ดูรายละเอียด
                  </button>
                </div>
              );
            })}
          </div>
        </Collapsible>
      )}

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
        {compareIds.length >= 2 && (
          <button onClick={() => navigate('/compare')} className="btn-secondary w-full sm:w-auto">
            <Scale className="w-4 h-4" /> เปรียบเทียบ {compareIds.length} แผนที่เลือก
          </button>
        )}
        <div className="flex-1" />
        <button onClick={() => navigate('/start?step=2')} className="btn-ghost text-sm">
          <Pencil className="w-3.5 h-3.5" /> ปรับเป้าหมายหรืองบ
        </button>
      </div>

      <div className="mt-8">
        <DisclaimerStrip />
      </div>
    </div>
  );
}
