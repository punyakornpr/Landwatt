import React, { useMemo } from 'react';
import { navigate } from '../router';
import { useApp } from '../state/AppState';
import { recommendProjects, projectFriendly, GOAL_OPTIONS, BUDGET_OPTIONS, BUDGET_MAX_THB } from '../engine/recommend';
import { getSpecs, friendlySummary, realityChecklist } from '../engine/specs';
import { EE_PROJECTS } from '../data/eeProjects';
import { fmtTHB } from '../components/ui';
import { useT } from '../i18n';
import { ArrowLeft, Printer, CheckCircle2, AlertTriangle } from 'lucide-react';

const STATUS_EN = { great: 'Great fit', worth: 'Worth exploring', insufficient: 'Needs more data', no: 'Not recommended' };
const LAND_KIND = { flat: 'flat/open land', agri: 'farmland', pond: 'has a pond', slope: 'sloped land' };

export default function Report({ projectId }) {
  const { land, goals, chosenPlanId, lang } = useApp();
  const t = useT();
  const id = projectId || chosenPlanId || 'solar-farm';
  const project = EE_PROJECTS.find(p => p.id === id) || EE_PROJECTS[0];
  const meta = projectFriendly(id, lang);
  const specs = useMemo(() => getSpecs(id, land, BUDGET_MAX_THB[goals?.budget]), [id, land, goals]);
  const summary = useMemo(() => friendlySummary(id, specs, land, lang), [id, specs, land, lang]);
  const rec = useMemo(() => recommendProjects(land, goals, lang).find(r => r.id === id), [land, goals, id, lang]);
  const checklist = realityChecklist(id, lang);
  const today = new Date().toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const goalLabel = id2 => (g => lang === 'th' ? g?.labelTh : g?.label)(GOAL_OPTIONS.find(g => g.id === id2)) || id2;
  const budgetLabel = (b => lang === 'th' ? b?.labelTh : b?.label)(BUDGET_OPTIONS.find(b => b.id === goals.budget)) || goals.budget;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 print-page">
      <div className="no-print flex items-center justify-between mb-6">
        <button onClick={() => navigate(`/plan/${id}`)} className="btn-ghost text-sm -ml-2">
          <ArrowLeft className="w-4 h-4" /> {t('Back to plan')}
        </button>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer className="w-4 h-4" /> {t('Print / save as PDF')}
        </button>
      </div>

      <div className="bg-white border border-[#E8E8ED] rounded-2xl p-6 sm:p-10 print:border-0 print:p-0">
        {/* Letterhead */}
        <div className="flex items-start justify-between border-b-2 border-brand-700 pb-5 mb-6">
          <div>
            <div className="text-lg font-bold text-brand-800">LandWatt</div>
            <div className="text-xs text-ink-faint">{t('Land-use energy planning assistant')}</div>
          </div>
          <div className="text-right text-xs text-ink-faint">
            <div>{t('Preliminary summary report')}</div>
            <div>{t('Date')} {today}</div>
            <div>{t('Calculation version 1.0')}</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold">{t('Plan summary:')} {meta.name}</h1>
        <p className="text-sm text-ink-soft mt-1">{meta.oneLiner}</p>

        {/* Land */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint mb-2">{t('1. Land & goals')}</h2>
          <table className="w-full text-sm">
            <tbody>
              {[
                [t('Location'), `${land.provinceData?.nameEn || land.provinceData?.name || t('Pinned location')} (${land.coordinates?.lat?.toFixed(4)}, ${land.coordinates?.lng?.toFixed(4)})`],
                [t('Size'), `${(land.areaSqM / 1600).toFixed(2)} ${t('rai')} ≈ ${land.areaSqM.toLocaleString()} m²`],
                [t('Land type'), `${t(LAND_KIND[land.landType] || 'unspecified')}${land.landTypeUnknown ? ' ' + t('(user was unsure)') : ''}`],
                [t('Access'), land.roadType === 'main' ? t('main road') : land.roadType === 'dirt' ? t('hard to reach') : t('secondary/paved road')],
                [t('Distance to power line (approx.)'), land.gridUnknown ? t('unknown — estimated') : `~${land.gridDistanceMeters} m`],
                [t('Goals'), goals.aims.length ? goals.aims.map(goalLabel).join(', ') : t('let the system suggest')],
                [t('Budget'), goals.budget === 'unsure' ? t('not sure yet') : budgetLabel],
              ].map(([k, v], i) => (
                <tr key={i} className="border-b border-[#f5f5f7]">
                  <td className="py-2 text-ink-faint w-40">{k}</td>
                  <td className="py-2">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Plan */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint mb-2">{t('2. Selected plan & assessment')}</h2>
          <div className="rounded-xl border border-[#E8E8ED] p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{meta.name} <span className="text-xs font-normal text-ink-faint">({meta.sub})</span></span>
              {rec && <span className="text-sm font-medium">{t(STATUS_EN[rec.status])} · {t('score')} {rec.score}/100</span>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
              <div><div className="text-[11px] text-ink-faint">{t('Investment (approx.)')}</div><div className="font-bold mt-0.5">{summary.capex ? `${fmtTHB(summary.capex.low)}–${fmtTHB(summary.capex.high)}` : t('not estimable')}</div></div>
              <div><div className="text-[11px] text-ink-faint">{t('Area used')}</div><div className="font-bold mt-0.5">{summary.areaUsed.split('(')[0]}</div></div>
              <div><div className="text-[11px] text-ink-faint">{t('Revenue/yr (approx.)')}</div><div className="font-bold mt-0.5">{specs.financials?.annualRevenueMillionTHB ? fmtTHB(specs.financials.annualRevenueMillionTHB) : t('not estimable')}</div></div>
              <div><div className="text-[11px] text-ink-faint">{t('Payback (approx.)')}</div><div className="font-bold mt-0.5">{summary.payback}</div></div>
            </div>
            <p className="text-sm mt-3 text-ink-soft">{summary.benefit}</p>
          </div>
        </section>

        {/* Reasons & cautions */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint mb-2">{t('3. Reasons & cautions')}</h2>
          <ul className="space-y-1.5 text-sm">
            {(rec?.reasons || []).map((s, i) => (
              <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-energy-600 flex-shrink-0 mt-0.5" />{s}</li>
            ))}
            {(rec?.cautions || []).map((s, i) => (
              <li key={`c${i}`} className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-volt-600 flex-shrink-0 mt-0.5" />{s}</li>
            ))}
            {(rec?.confidence?.missing || []).map((s, i) => (
              <li key={`m${i}`} className="flex items-start gap-2 text-ink-soft"><AlertTriangle className="w-4 h-4 text-ink-faint flex-shrink-0 mt-0.5" />{t('No data on')} {s}</li>
            ))}
          </ul>
        </section>

        {/* Checklist */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint mb-2">{t('4. What to check or do next')}</h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm">
            {checklist.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </section>

        {/* Tech numbers */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint mb-2">{t('5. Technical numbers used')}</h2>
          <table className="w-full text-xs font-mono">
            <tbody>
              {[
                [t('DC system size'), specs.dcCapacityMWp ? `${specs.dcCapacityMWp} MWp (${specs.dcCapacityKWp} kWp)` : '—'],
                [t('AC capacity'), specs.acCapacityMW ? `${specs.acCapacityMW} MWac` : '—'],
                [t('Actual DC/AC'), specs.actualDcAcRatio || '—'],
                [t('Generation/yr'), specs.annualEnergyMWh ? `${specs.annualEnergyMWh} MWh` : '—'],
                [t('Transformer'), specs.transformerRating || '—'],
                [t('Mid CAPEX'), summary.capex ? fmtTHB(summary.capex.mid) : '—'],
                [t('Est. IRR'), specs.financials?.irrPercent ? `${specs.financials.irrPercent}%` : '—'],
              ].map(([k, v], i) => (
                <tr key={i} className="border-b border-[#f5f5f7]">
                  <td className="py-1.5 text-ink-faint font-sans w-40">{k}</td>
                  <td className="py-1.5">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="mt-8 rounded-xl bg-[#F5F5F7] px-4 py-3 text-xs text-ink-soft leading-relaxed">
          <strong>{t('Report limitations:')}</strong> {t('This document is a preliminary feasibility estimate from user inputs and LandWatt system assumptions. It is not a certification of land rights, permits, grid connection, construction documents, or guaranteed income. Investment and return figures are estimates; actuals depend on installation prices, usage behavior and the relevant authorities')}
        </div>
      </div>
    </div>
  );
}
