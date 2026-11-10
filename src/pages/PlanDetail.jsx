import React, { useMemo, useState } from 'react';
import { navigate } from '../router';
import { useApp } from '../state/AppState';
import { recommendProjects, PROJECT_FRIENDLY } from '../engine/recommend';
import { getSpecs, friendlySummary, realityChecklist } from '../engine/specs';
import { EE_PROJECTS } from '../data/eeProjects';
import SiteLayoutCanvas from '../components/SiteLayoutCanvas';
import FinancialYieldChart from '../components/FinancialYieldChart';
import EngineeringView from '../components/EngineeringView';
import {
  StepProgress, StatusBadge, ProjectIcon, Note, Collapsible, fmtTHB, DisclaimerStrip,
} from '../components/ui';
import {
  ArrowLeft, Banknote, Ruler, Zap, Clock, GitCompareArrows,
  Save, FileText, CheckCircle2, AlertTriangle, Info, Wrench, ChevronRight,
} from 'lucide-react';

const JOURNEY_STEPS = ['ที่ดินของคุณ', 'เป้าหมายและงบ', 'ทางเลือกแนะนำ', 'ดูแผน', 'เก็บแผน/รายงาน'];

export default function PlanDetail({ projectId }) {
  const { land, goals, toggleCompare, compareIds, saveCurrent, setChosenPlan, chosenPlanId } = useApp();
  const id = projectId || chosenPlanId || 'solar-farm';
  const project = EE_PROJECTS.find(p => p.id === id) || EE_PROJECTS[0];
  const meta = PROJECT_FRIENDLY[id];
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState('general'); // ค่าเริ่มต้น = มุมมองผู้ใช้ทั่วไป

  const specs = useMemo(() => getSpecs(id, land), [id, land]);
  const summary = useMemo(() => friendlySummary(id, specs, land), [id, specs, land]);
  const rec = useMemo(() => recommendProjects(land, goals).find(r => r.id === id), [land, goals, id]);
  const checklist = realityChecklist(id);
  const isCompared = compareIds.includes(id);

  const handleSave = () => {
    const name = window.prompt('ตั้งชื่อแผนนี้', `${meta.name} — ${land.provinceData?.name || 'ที่ดินของฉัน'}`);
    if (name === null) return;
    setChosenPlan(id);
    saveCurrent(name || undefined);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const summaryCards = [
    {
      icon: Banknote, label: 'เงินลงทุนเบื้องต้น',
      value: summary.capex ? `${fmtTHB(summary.capex.low)} – ${fmtTHB(summary.capex.high)}` : 'ยังประเมินไม่ได้',
      sub: 'ช่วงประมาณการจากสมมติฐานกลาง',
    },
    { icon: Ruler, label: 'พื้นที่ที่ใช้', value: summary.areaUsed.split('(')[0], sub: summary.areaUsed.includes('(') ? `(${summary.areaUsed.split('(')[1]}` : '' },
    { icon: Zap, label: 'ประโยชน์ด้านพลังงาน', value: summary.benefit.split(' ').slice(0, 4).join(' ') + '…', sub: 'ดูรายละเอียดด้านล่าง' },
    { icon: Clock, label: 'ระยะคืนทุนโดยประมาณ', value: summary.payback, sub: 'จากสมมติฐานที่เปิดเผยด้านล่าง' },
  ];

  const equipmentBullets = [
    specs.moduleCount && `แผงรับแสงอาทิตย์ประมาณ ${specs.moduleCount} แผง`,
    specs.inverterCount && `เครื่องแปลงไฟ ${specs.inverterCount} ตัว`,
    specs.dcChargersCount && `ตู้ชาร์จเร็ว ${specs.dcChargersCount} ตู้ (${specs.totalGuns} หัวชาร์จ)`,
    specs.bessKWh && `แบตเตอรี่สำรอง ${specs.bessKWh} kWh`,
    specs.solarCanopyKWp && `หลังคาโซลาร์เหนือที่จอด ~${specs.solarCanopyKWp} kWp`,
    specs.containerCount && `ตู้แบตเตอรี่คอนเทนเนอร์ ${specs.containerCount} ตู้`,
    specs.transformerRating && `หม้อแปลงไฟฟ้า ${specs.transformerRating.split(',')[0]}`,
    specs.digesterVolumeM3 && `บ่อหมักก๊าซชีวภาพ ~${specs.digesterVolumeM3} ลบ.ม.`,
    specs.pontoonType && `ทุ่นลอยน้ำ ${specs.pontoonType.split('(')[0]}`,
    specs.mountingStructure && `โครงสร้างยกสูงสำหรับทำเกษตรใต้แผง`,
  ].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <StepProgress steps={JOURNEY_STEPS} current={3} />
      </div>

      <button onClick={() => navigate('/results')} className="btn-ghost text-sm mb-4 -ml-2">
        <ArrowLeft className="w-4 h-4" /> กลับไปดูทางเลือก
      </button>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <ProjectIcon id={id} size="lg" active />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">{meta.name}</h1>
              {rec && <StatusBadge status={rec.status} />}
            </div>
            <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">
              นี่คือแผนที่ LandWatt แนะนำสำหรับที่ดินของคุณ — {meta.oneLiner}
            </p>
            {rec && (
              <p className="text-xs text-ink-faint mt-1">
                บนที่ดิน {land.provinceData?.name || 'ที่ปักหมุด'} {(land.areaSqM / 1600).toFixed(2)} ไร่ · สถานะความเป็นไปได้: {rec.status === 'great' ? 'เหมาะมาก' : rec.status === 'worth' ? 'น่าศึกษาต่อ' : rec.status === 'insufficient' ? 'ต้องมีข้อมูลเพิ่ม' : 'ยังไม่แนะนำ'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* สวิตช์โหมดการแสดงผล — อยู่บนสุดหลังชื่อโครงการ */}
      <div className="card p-1.5 mb-6 grid grid-cols-2 gap-1.5" role="tablist" aria-label="โหมดการแสดงผล">
        {[
          ['general', 'สำหรับผู้ใช้ทั่วไป', 'General User'],
          ['engineering', 'รายละเอียดวิศวกรรม', 'Engineering Details'],
        ].map(([m, label, sub]) => (
          <button
            key={m}
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`rounded-xl px-4 py-3 text-center transition ${
              mode === m
                ? 'bg-brand-700 text-white shadow-sm'
                : 'text-ink-soft hover:bg-brand-50'
            }`}
          >
            <div className="text-sm font-semibold">{label}</div>
            <div className={`text-[10px] mt-0.5 ${mode === m ? 'text-white/70' : 'text-ink-faint'}`}>{sub}</div>
          </button>
        ))}
      </div>

      {mode === 'engineering' ? (
        <div className="space-y-8">
          <EngineeringView id={id} specs={specs} land={land} project={project} summary={summary} />
        </div>
      ) : (
      <>
      {/* 4 summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {summaryCards.map((c, i) => (
          <div key={i} className="card p-4">
            <c.icon className="w-5 h-5 text-brand-600 mb-2" />
            <div className="text-xs text-ink-faint">{c.label}</div>
            <div className="text-sm font-bold mt-1 leading-snug">{c.value}</div>
            <div className="text-[11px] text-ink-faint mt-1">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        {/* Layout */}
        <section>
          <h2 className="text-lg font-bold mb-1">ถ้าทำจริง ที่ดินจะหน้าตาประมาณไหน?</h2>
          <p className="text-sm text-ink-soft mb-3">ภาพจำลองการจัดวางบนแปลงตามสัดส่วนพื้นที่ของคุณ</p>
          <SiteLayoutCanvas project={project} specs={specs} landData={land} />
          <div className="mt-2"><Note>ภาพนี้เป็น<strong>ภาพจำลองสัดส่วน</strong>เพื่อให้เห็นภาพคร่าว ๆ — ไม่ใช่แบบก่อสร้างและไม่ได้วัดตำแหน่งจริงบนแปลง</Note></div>
        </section>

        {/* Equipment */}
        <section>
          <h2 className="text-lg font-bold mb-1">อุปกรณ์หลักมีอะไรบ้าง?</h2>
          <div className="card p-5">
            <ul className="space-y-2.5">
              {equipmentBullets.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <Wrench className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" /> {t}
                </li>
              ))}
            </ul>
            <p className="text-xs text-ink-faint mt-4">จำนวนและขนาดคำนวณจากพื้นที่ที่ให้มา หากเปลี่ยนขนาดที่ดินตัวเลขเหล่านี้จะเปลี่ยนตาม</p>
          </div>
        </section>

        {/* Money */}
        <section>
          <h2 className="text-lg font-bold mb-1">ต้องเตรียมเงินเท่าไร และคุ้มอย่างไร?</h2>
          <div className="card p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-paper border border-[#E7E5DD] p-4">
                <div className="text-xs text-ink-faint">เงินลงทุนเริ่มต้น</div>
                <div className="text-lg font-bold mt-0.5">{summary.capex ? fmtTHB(summary.capex.mid) : '—'}</div>
              </div>
              <div className="rounded-xl bg-paper border border-[#E7E5DD] p-4">
                <div className="text-xs text-ink-faint">รายได้/เงินประหยัดต่อปี (ประมาณ)</div>
                <div className="text-lg font-bold mt-0.5">
                  {specs.financials?.annualRevenueMillionTHB ? fmtTHB(specs.financials.annualRevenueMillionTHB) : 'ยังประเมินไม่ได้'}
                </div>
                {specs.dualIncome && (
                  <div className="text-[11px] text-ink-soft mt-1 leading-snug">
                    = ไฟฟ้า {fmtTHB(specs.dualIncome.powerRevenueMillionTHB)} (FiT สมมติฐาน)
                    + พืชผล {fmtTHB(specs.dualIncome.agriRevenueMillionTHB)} (ประมาณการ ยังไม่ได้ระบุพืช)
                  </div>
                )}
                {specs.tariffStatus === 'scenario' && (
                  <div className="text-[11px] text-volt-800 mt-1">รายได้ไฟฟ้าใช้อัตราสมมติฐาน ไม่ใช่สิทธิขายไฟที่ยืนยันแล้ว</div>
                )}
              </div>
              <div className="rounded-xl bg-paper border border-[#E7E5DD] p-4">
                <div className="text-xs text-ink-faint">คืนทุนโดยประมาณ</div>
                <div className="text-lg font-bold mt-0.5">{summary.payback}</div>
              </div>
            </div>
            <FinancialYieldChart project={project} specs={specs} landData={land} />
            <Note>ตัวเลขนี้เป็น<strong>การประมาณการเบื้องต้น</strong> — ผลจริงขึ้นกับราคาติดตั้ง พฤติกรรมใช้ไฟ และเงื่อนไขการเชื่อมต่อของการไฟฟ้า ไม่ใช่ราคาที่รับประกัน</Note>
            <Collapsible title="ดูรายละเอียดผลตอบแทน (ขั้นสูง)" sub="NPV, IRR และสมมติฐานทางการเงิน">
              <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {[
                  ['IRR (อัตราผลตอบแทน)', specs.financials?.irrPercent ? `${specs.financials.irrPercent}%` : '—'],
                  ['NPV 25 ปี', specs.financials?.npv25YrMillionTHB ? `${fmtTHB(specs.financials.npv25YrMillionTHB)}` : '—'],
                  ['กระแสเงินสดสุทธิ/ปี', specs.financials?.netAnnualCashflowMillionTHB ? fmtTHB(specs.financials.netAnnualCashflowMillionTHB) : specs.financials?.netAnnualProfitMillionTHB ? fmtTHB(specs.financials.netAnnualProfitMillionTHB) : '—'],
                  ['อัตราส่วน DC/AC จริง', specs.actualDcAcRatio || '—'],
                ].map(([k, v], i) => (
                  <div key={i} className="rounded-xl border border-[#E7E5DD] p-3">
                    <div className="text-[11px] text-ink-faint">{k}</div>
                    <div className="text-sm font-bold mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            </Collapsible>
          </div>
        </section>

        {/* Pros & cautions */}
        <section>
          <h2 className="text-lg font-bold mb-3">มีข้อดีและอะไรที่ต้องระวัง?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-energy-800 mb-3">จุดเด่นของแผนนี้</h3>
              <ul className="space-y-2">
                {(rec?.reasons || []).map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-energy-600 flex-shrink-0 mt-0.5" />{t}</li>
                ))}
                {project.keyBenefits?.slice(0, 2).map((t, i) => (
                  <li key={`b${i}`} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-energy-600 flex-shrink-0 mt-0.5" />{t}</li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-volt-800 mb-3">สิ่งที่ต้องระวัง / ยังไม่ทราบ</h3>
              <ul className="space-y-2">
                {(rec?.cautions || []).map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm"><AlertTriangle className="w-4 h-4 text-volt-600 flex-shrink-0 mt-0.5" />{t}</li>
                ))}
                {(rec?.confidence?.missing || []).map((t, i) => (
                  <li key={`m${i}`} className="flex items-start gap-2 text-sm text-ink-soft"><Info className="w-4 h-4 text-electric-600 flex-shrink-0 mt-0.5" />ยังไม่มีข้อมูลเรื่อง{t} — เพิ่มภายหลังเพื่อให้ผลแม่นขึ้น</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section>
          <h2 className="text-lg font-bold mb-3">ก่อนเริ่มลงทุนจริง ต้องทำอะไร?</h2>
          <div className="card p-5">
            <ul className="space-y-3">
              {checklist.map((t, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </section>

      </div>
      </>
      )}

      {/* Actions — ใช้ร่วมทั้งสองโหมด */}
      <div className="card p-5 mt-8">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button onClick={() => navigate('/start')} className="btn-secondary flex-1">ปรับแผนให้เหมาะกับงบ</button>
          <button onClick={() => toggleCompare(id)} className={`btn-secondary flex-1 ${isCompared ? 'border-brand-600 text-brand-800 bg-brand-50' : ''}`}>
            <GitCompareArrows className="w-4 h-4" /> {isCompared ? 'นำออกจากการเปรียบเทียบ' : 'เปรียบเทียบกับแผนอื่น'}
          </button>
          <button onClick={handleSave} className="btn-primary flex-1">
            <Save className="w-4 h-4" /> {saved ? 'บันทึกแล้ว ✓' : 'บันทึกแผน'}
          </button>
        </div>
        <button onClick={() => { setChosenPlan(id); navigate(`/report/${id}`); }}
          className="mt-2.5 w-full text-center text-sm font-medium text-brand-700 hover:underline py-2">
          <FileText className="w-4 h-4 inline -mt-0.5 mr-1" /> ดูและพิมพ์รายงานสรุปของแผนนี้
        </button>
      </div>

      <DisclaimerStrip />
    </div>
  );
}
