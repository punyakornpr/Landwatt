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

const JOURNEY_STEPS = ['Your land', 'Goals & budget', 'Suggested options', 'Review plan', 'Save/report'];

export default function PlanDetail({ projectId }) {
  const { land, goals, toggleCompare, compareIds, saveCurrent, setChosenPlan, chosenPlanId } = useApp();
  const id = projectId || chosenPlanId || 'solar-farm';
  const project = EE_PROJECTS.find(p => p.id === id) || EE_PROJECTS[0];
  const meta = PROJECT_FRIENDLY[id];
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState('general'); // default = general user view

  const specs = useMemo(() => getSpecs(id, land), [id, land]);
  const summary = useMemo(() => friendlySummary(id, specs, land), [id, specs, land]);
  const rec = useMemo(() => recommendProjects(land, goals).find(r => r.id === id), [land, goals, id]);
  const checklist = realityChecklist(id);
  const isCompared = compareIds.includes(id);

  const handleSave = () => {
    const name = window.prompt('Name this plan', `${meta.name} — ${land.provinceData?.nameEn || land.provinceData?.name || 'My land'}`);
    if (name === null) return;
    setChosenPlan(id);
    saveCurrent(name || undefined);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const summaryCards = [
    {
      icon: Banknote, label: 'Initial investment',
      value: summary.capex ? `${fmtTHB(summary.capex.low)} – ${fmtTHB(summary.capex.high)}` : 'Not estimable yet',
      sub: 'Estimated range from base assumptions',
    },
    { icon: Ruler, label: 'Area used', value: summary.areaUsed.split('(')[0], sub: summary.areaUsed.includes('(') ? `(${summary.areaUsed.split('(')[1]}` : '' },
    { icon: Zap, label: 'Energy benefit', value: summary.benefit.split(' ').slice(0, 4).join(' ') + '…', sub: 'Details below' },
    { icon: Clock, label: 'Rough payback', value: summary.payback, sub: 'From the assumptions shown below' },
  ];

  const equipmentBullets = [
    specs.moduleCount && `~${specs.moduleCount} solar panels`,
    specs.inverterCount && `${specs.inverterCount} inverters`,
    specs.dcChargersCount && `${specs.dcChargersCount} fast chargers (${specs.totalGuns} guns)`,
    specs.bessKWh && `${specs.bessKWh} kWh backup battery`,
    specs.solarCanopyKWp && `~${specs.solarCanopyKWp} kWp solar canopy over parking`,
    specs.containerCount && `${specs.containerCount} battery containers`,
    specs.transformerRating && `Transformer ${specs.transformerRating.split(',')[0]}`,
    specs.digesterVolumeM3 && `~${specs.digesterVolumeM3} m³ biogas digester`,
    specs.pontoonType && `Floating pontoons ${specs.pontoonType.split('(')[0]}`,
    specs.mountingStructure && `Raised structure for farming under panels`,
  ].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <StepProgress steps={JOURNEY_STEPS} current={3} />
      </div>

      <button onClick={() => navigate('/results')} className="btn-ghost text-sm mb-4 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Back to options
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
              This is the plan LandWatt suggests for your land — {meta.oneLiner}
            </p>
            {rec && (
              <p className="text-xs text-ink-faint mt-1">
                On {land.provinceData?.nameEn || land.provinceData?.name || 'the pinned land'} {(land.areaSqM / 1600).toFixed(2)} rai · feasibility: {rec.status === 'great' ? 'great fit' : rec.status === 'worth' ? 'worth exploring' : rec.status === 'insufficient' ? 'needs more data' : 'not recommended'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Display-mode switch — top of page after the project name */}
      <div className="card p-1.5 mb-6 grid grid-cols-2 gap-1.5" role="tablist" aria-label="Display mode">
        {[
          ['general', 'General user view', 'Simple'],
          ['engineering', 'Engineering details', 'Technical'],
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
          <h2 className="text-lg font-bold mb-1">What would the land look like if built?</h2>
          <p className="text-sm text-ink-soft mb-3">Simulated layout scaled to your plot</p>
          <SiteLayoutCanvas project={project} specs={specs} landData={land} />
          <div className="mt-2"><Note>This is a <strong>schematic simulation</strong> for a rough picture — not construction drawings and not measured positions on the plot</Note></div>
        </section>

        {/* Equipment */}
        <section>
          <h2 className="text-lg font-bold mb-1">What are the main components?</h2>
          <div className="card p-5">
            <ul className="space-y-2.5">
              {equipmentBullets.map((t, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <Wrench className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" /> {t}
                </li>
              ))}
            </ul>
            <p className="text-xs text-ink-faint mt-4">Counts and sizes are computed from the area you gave — they change if the land size changes</p>
          </div>
        </section>

        {/* Money */}
        <section>
          <h2 className="text-lg font-bold mb-1">How much money is needed and is it worth it?</h2>
          <div className="card p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-paper border border-[#E8E8ED] p-4">
                <div className="text-xs text-ink-faint">Initial investment</div>
                <div className="text-lg font-bold mt-0.5">{summary.capex ? fmtTHB(summary.capex.mid) : '—'}</div>
              </div>
              <div className="rounded-xl bg-paper border border-[#E8E8ED] p-4">
                <div className="text-xs text-ink-faint">Revenue/savings per year (approx.)</div>
                <div className="text-lg font-bold mt-0.5">
                  {specs.financials?.annualRevenueMillionTHB ? fmtTHB(specs.financials.annualRevenueMillionTHB) : 'Not estimable yet'}
                </div>
                {specs.dualIncome && (
                  <div className="text-[11px] text-ink-soft mt-1 leading-snug">
                    = power {fmtTHB(specs.dualIncome.powerRevenueMillionTHB)} (assumed FiT)
                    + crops {fmtTHB(specs.dualIncome.agriRevenueMillionTHB)} (estimate, crop unspecified)
                  </div>
                )}
                {specs.tariffStatus === 'scenario' && (
                  <div className="text-[11px] text-volt-800 mt-1">Power revenue uses an assumed rate, not a confirmed power-purchase entitlement</div>
                )}
              </div>
              <div className="rounded-xl bg-paper border border-[#E8E8ED] p-4">
                <div className="text-xs text-ink-faint">Rough payback</div>
                <div className="text-lg font-bold mt-0.5">{summary.payback}</div>
              </div>
            </div>
            <FinancialYieldChart project={project} specs={specs} landData={land} />
            <Note>These numbers are <strong>preliminary estimates</strong> — actuals depend on installation prices, usage behavior and utility interconnection terms; not a guaranteed price</Note>
            <Collapsible title="Return details (advanced)" sub="NPV, IRR and financial assumptions">
              <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {[
                  ['IRR (return rate)', specs.financials?.irrPercent ? `${specs.financials.irrPercent}%` : '—'],
                  ['NPV 25 yrs', specs.financials?.npv25YrMillionTHB ? `${fmtTHB(specs.financials.npv25YrMillionTHB)}` : '—'],
                  ['Net cash flow/yr', specs.financials?.netAnnualCashflowMillionTHB ? fmtTHB(specs.financials.netAnnualCashflowMillionTHB) : specs.financials?.netAnnualProfitMillionTHB ? fmtTHB(specs.financials.netAnnualProfitMillionTHB) : '—'],
                  ['Actual DC/AC ratio', specs.actualDcAcRatio || '—'],
                ].map(([k, v], i) => (
                  <div key={i} className="rounded-xl border border-[#E8E8ED] p-3">
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
          <h2 className="text-lg font-bold mb-3">Strengths and things to watch out for?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-energy-800 mb-3">Plan strengths</h3>
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
              <h3 className="text-sm font-semibold text-volt-800 mb-3">Cautions / unknowns</h3>
              <ul className="space-y-2">
                {(rec?.cautions || []).map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm"><AlertTriangle className="w-4 h-4 text-volt-600 flex-shrink-0 mt-0.5" />{t}</li>
                ))}
                {(rec?.confidence?.missing || []).map((t, i) => (
                  <li key={`m${i}`} className="flex items-start gap-2 text-sm text-ink-soft"><Info className="w-4 h-4 text-electric-600 flex-shrink-0 mt-0.5" />No data on {t} yet — add it later for better accuracy</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section>
          <h2 className="text-lg font-bold mb-3">What to do before real investment?</h2>
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

      {/* Actions — shared by both modes */}
      <div className="card p-5 mt-8">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button onClick={() => navigate('/start')} className="btn-secondary flex-1">Adjust plan to budget</button>
          <button onClick={() => toggleCompare(id)} className={`btn-secondary flex-1 ${isCompared ? 'border-brand-600 text-brand-800 bg-brand-50' : ''}`}>
            <GitCompareArrows className="w-4 h-4" /> {isCompared ? 'Remove from compare' : 'Compare with other plans'}
          </button>
          <button onClick={handleSave} className="btn-primary flex-1">
            <Save className="w-4 h-4" /> {saved ? 'Saved ✓' : 'Save plan'}
          </button>
        </div>
        <button onClick={() => { setChosenPlan(id); navigate(`/report/${id}`); }}
          className="mt-2.5 w-full text-center text-sm font-medium text-brand-700 hover:underline py-2">
          <FileText className="w-4 h-4 inline -mt-0.5 mr-1" /> View & print the summary report for this plan
        </button>
      </div>

      <DisclaimerStrip />
    </div>
  );
}
