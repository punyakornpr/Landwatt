import React, { useMemo } from 'react';
import { navigate } from '../router';
import { useApp } from '../state/AppState';
import { recommendProjects, PROJECT_FRIENDLY } from '../engine/recommend';
import { getSpecs, friendlySummary, realityChecklist } from '../engine/specs';
import { EE_PROJECTS } from '../data/eeProjects';
import { fmtTHB } from '../components/ui';
import { ArrowLeft, Printer, CheckCircle2, AlertTriangle } from 'lucide-react';

const STATUS_EN = { great: 'Great fit', worth: 'Worth exploring', insufficient: 'Needs more data', no: 'Not recommended' };
const LAND_KIND = { flat: 'flat/open land', agri: 'farmland', pond: 'has a pond', slope: 'sloped land' };

export default function Report({ projectId }) {
  const { land, goals, chosenPlanId } = useApp();
  const id = projectId || chosenPlanId || 'solar-farm';
  const project = EE_PROJECTS.find(p => p.id === id) || EE_PROJECTS[0];
  const meta = PROJECT_FRIENDLY[id];
  const specs = useMemo(() => getSpecs(id, land), [id, land]);
  const summary = useMemo(() => friendlySummary(id, specs, land), [id, specs, land]);
  const rec = useMemo(() => recommendProjects(land, goals).find(r => r.id === id), [land, goals, id]);
  const checklist = realityChecklist(id);
  const today = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 print-page">
      <div className="no-print flex items-center justify-between mb-6">
        <button onClick={() => navigate(`/plan/${id}`)} className="btn-ghost text-sm -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back to plan
        </button>
        <button onClick={() => window.print()} className="btn-primary">
          <Printer className="w-4 h-4" /> Print / save as PDF
        </button>
      </div>

      <div className="bg-white border border-[#E7E5DD] rounded-2xl p-6 sm:p-10 print:border-0 print:p-0">
        {/* Letterhead */}
        <div className="flex items-start justify-between border-b-2 border-brand-700 pb-5 mb-6">
          <div>
            <div className="text-lg font-bold text-brand-800">LandWatt</div>
            <div className="text-xs text-ink-faint">Land-use energy planning assistant</div>
          </div>
          <div className="text-right text-xs text-ink-faint">
            <div>Preliminary summary report</div>
            <div>Date {today}</div>
            <div>Calculation version 1.0</div>
          </div>
        </div>

        <h1 className="text-2xl font-bold">Plan summary: {meta.name}</h1>
        <p className="text-sm text-ink-soft mt-1">{meta.oneLiner}</p>

        {/* Land */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint mb-2">1. Land & goals</h2>
          <table className="w-full text-sm">
            <tbody>
              {[
                ['Location', `${land.provinceData?.nameEn || land.provinceData?.name || 'Pinned location'} (${land.coordinates?.lat?.toFixed(4)}, ${land.coordinates?.lng?.toFixed(4)})`],
                ['Size', `${(land.areaSqM / 1600).toFixed(2)} rai ≈ ${land.areaSqM.toLocaleString()} m²`],
                ['Land type', `${LAND_KIND[land.landType] || 'unspecified'}${land.landTypeUnknown ? ' (user was unsure)' : ''}`],
                ['Access', land.roadType === 'main' ? 'main road' : land.roadType === 'dirt' ? 'hard to reach' : 'secondary/paved road'],
                ['Distance to power line (approx.)', land.gridUnknown ? 'unknown — estimated' : `~${land.gridDistanceMeters} m`],
                ['Goals', goals.aims.length ? goals.aims.join(', ') : 'let the system suggest'],
                ['Budget', goals.budget === 'unsure' ? 'not sure yet' : goals.budget],
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
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint mb-2">2. Selected plan & assessment</h2>
          <div className="rounded-xl border border-[#E7E5DD] p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{meta.name} <span className="text-xs font-normal text-ink-faint">({meta.sub})</span></span>
              {rec && <span className="text-sm font-medium">{STATUS_EN[rec.status]} · score {rec.score}/100</span>}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
              <div><div className="text-[11px] text-ink-faint">Investment (approx.)</div><div className="font-bold mt-0.5">{summary.capex ? `${fmtTHB(summary.capex.low)}–${fmtTHB(summary.capex.high)}` : 'not estimable'}</div></div>
              <div><div className="text-[11px] text-ink-faint">Area used</div><div className="font-bold mt-0.5">{summary.areaUsed.split('(')[0]}</div></div>
              <div><div className="text-[11px] text-ink-faint">Revenue/yr (approx.)</div><div className="font-bold mt-0.5">{specs.financials?.annualRevenueMillionTHB ? fmtTHB(specs.financials.annualRevenueMillionTHB) : 'not estimable'}</div></div>
              <div><div className="text-[11px] text-ink-faint">Payback (approx.)</div><div className="font-bold mt-0.5">{summary.payback}</div></div>
            </div>
            <p className="text-sm mt-3 text-ink-soft">{summary.benefit}</p>
          </div>
        </section>

        {/* Reasons & cautions */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint mb-2">3. Reasons & cautions</h2>
          <ul className="space-y-1.5 text-sm">
            {(rec?.reasons || []).map((t, i) => (
              <li key={i} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-energy-600 flex-shrink-0 mt-0.5" />{t}</li>
            ))}
            {(rec?.cautions || []).map((t, i) => (
              <li key={`c${i}`} className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-volt-600 flex-shrink-0 mt-0.5" />{t}</li>
            ))}
            {(rec?.confidence?.missing || []).map((t, i) => (
              <li key={`m${i}`} className="flex items-start gap-2 text-ink-soft"><AlertTriangle className="w-4 h-4 text-ink-faint flex-shrink-0 mt-0.5" />No data on {t}</li>
            ))}
          </ul>
        </section>

        {/* Checklist */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint mb-2">4. What to check or do next</h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-sm">
            {checklist.map((t, i) => <li key={i}>{t}</li>)}
          </ol>
        </section>

        {/* Tech numbers */}
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-ink-faint mb-2">5. Technical numbers used</h2>
          <table className="w-full text-xs font-mono">
            <tbody>
              {[
                ['DC system size', specs.dcCapacityMWp ? `${specs.dcCapacityMWp} MWp (${specs.dcCapacityKWp} kWp)` : '—'],
                ['AC capacity', specs.acCapacityMW ? `${specs.acCapacityMW} MWac` : '—'],
                ['Actual DC/AC', specs.actualDcAcRatio || '—'],
                ['Generation/yr', specs.annualEnergyMWh ? `${specs.annualEnergyMWh} MWh` : '—'],
                ['Transformer', specs.transformerRating || '—'],
                ['Mid CAPEX', summary.capex ? fmtTHB(summary.capex.mid) : '—'],
                ['Est. IRR', specs.financials?.irrPercent ? `${specs.financials.irrPercent}%` : '—'],
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
          <strong>Report limitations:</strong> This document is a preliminary feasibility estimate from user inputs and LandWatt system assumptions.
          It is not a certification of land rights, permits, grid connection, construction documents, or guaranteed income.
          Investment and return figures are estimates; actuals depend on installation prices, usage behavior and the relevant authorities
        </div>
      </div>
    </div>
  );
}
