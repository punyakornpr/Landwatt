import React, { useEffect, useMemo, useState } from 'react';
import { navigate } from '../router';
import { useApp } from '../state/AppState';
import { recommendProjects, dataConfidence, PROJECT_FRIENDLY, budgetCaution, BUDGET_MAX_THB } from '../engine/recommend';
import { getSpecs } from '../engine/specs';
import { StepProgress, StatusBadge, ProjectIcon, Note, Collapsible, fmtTHB, DisclaimerStrip } from '../components/ui';
import {
  MapPin, Pencil, ArrowRight, Scale, CheckCircle2, AlertTriangle,
  Info, GitCompareArrows,
} from 'lucide-react';

const JOURNEY_STEPS = ['Your land', 'Goals & budget', 'Suggested options', 'Review plan', 'Save/report'];

export default function Results() {
  const { land, goals, compareIds, toggleCompare, setChosenPlan } = useApp();
  const [analyzing, setAnalyzing] = useState(true);
  const [analyzeMsg, setAnalyzeMsg] = useState(0);
  const [whyOpen, setWhyOpen] = useState(null);

  const msgs = ['Checking land size and terrain', 'Comparing possible options', 'Estimating initial investment'];
  useEffect(() => {
    const t1 = setInterval(() => setAnalyzeMsg(m => Math.min(m + 1, msgs.length - 1)), 550);
    const t2 = setTimeout(() => setAnalyzing(false), 1500);
    return () => { clearInterval(t1); clearTimeout(t2); };
  }, []);

  const results = useMemo(() => recommendProjects(land, goals), [land, goals]);
  const confidence = dataConfidence(land);

  const budgetMax = BUDGET_MAX_THB[goals?.budget];
  const specsCache = useMemo(() => {
    const m = {};
    results.forEach(r => { try { m[r.id] = getSpecs(r.id, land, budgetMax); } catch { m[r.id] = null; } });
    return m;
  }, [results, land, budgetMax]);

  // Re-rank + adjust score: a plan unbuildable even at its smallest size gets a
  // score penalty — it may suit the land, but not the stated budget.
  const ranked = useMemo(() => {
    const over = id => !!specsCache[id]?.budgetFit?.stillOverBudget;
    const order = { great: 0, worth: 1, insufficient: 2, no: 3 };
    return results.map(r => {
      const ob = over(r.id);
      return { ...r, overBudget: ob,
        score: ob ? Math.max(10, r.score - 45) : r.score,
        status: ob && r.status === 'great' ? 'worth' : r.status };
    }).sort((a, b) => order[a.status] - order[b.status] || a.overBudget - b.overBudget || b.score - a.score || a.id.localeCompare(b.id));
  }, [results, specsCache]);
  const top = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  if (analyzing) {
    return (
      <div className="max-w-md mx-auto px-4 py-28 text-center">
        <div className="w-14 h-14 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin mx-auto" />
        <p className="mt-6 text-sm text-ink-soft font-medium">{msgs[analyzeMsg]}…</p>
        <p className="mt-1 text-xs text-ink-faint">Analyzing from your inputs — just a moment</p>
      </div>
    );
  }

  const landKindLabel = { flat: 'flat/open land', agri: 'farmland', pond: 'has a pond', slope: 'sloped land' }[land.landType] || 'unspecified';

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
                {land.provinceData?.nameEn || land.provinceData?.name || 'Pinned location'} · {(land.areaSqM / 1600).toFixed(2)} rai
              </div>
              <div className="text-xs text-ink-faint mt-0.5">
                {landKindLabel}
                {land.roadType === 'main' ? ' · main road' : land.roadType === 'dirt' ? ' · hard to reach' : ' · secondary road'}
                {goals.budget && goals.budget !== 'unsure' ? ` · budget: ${{ 'under-500k': 'under ฿500k', '0.5-2m': '฿0.5–2M', '2-5m': '฿2–5M', '5-10m': '฿5–10M', 'over-10m': 'over ฿10M' }[goals.budget]}` : ''}
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/start')} className="btn-ghost text-xs self-start sm:self-auto">
            <Pencil className="w-3.5 h-3.5" /> Edit info
          </button>
        </div>
        {confidence.missing.length > 0 && (
          <div className="mt-3 flex items-start gap-2 text-xs text-volt-800 bg-volt-50 border border-volt-200 rounded-xl px-3.5 py-2.5">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Data confidence: <strong>{confidence.level}</strong> — no data yet on {confidence.missing.join(' ')}, so results are rougher</span>
          </div>
        )}
      </div>

      <h1 className="text-xl sm:text-2xl font-bold">
        {top.length >= 3 ? 'We found 3 options worth exploring for your land' : `Found ${top.length} options that passed initial screening`}
      </h1>
      <p className="text-sm text-ink-soft mt-1.5 mb-6">
        Suitability scores come from system criteria on your inputs — not profit odds or a guarantee of success
      </p>

      <div className="space-y-4">
        {top.map((r, idx) => {
          const meta = PROJECT_FRIENDLY[r.id];
          const specs = specsCache[r.id];
          const capexM = specs?.financials?.totalCapexMillionTHB;
          const budgetWarn = budgetCaution(r.id, goals.budget, capexM ? capexM * 1e6 : null);
          const isCompared = compareIds.includes(r.id);
          return (
            <div key={r.id} className={`card p-5 sm:p-6 ${idx === 0 ? 'border-brand-300 ring-2 ring-brand-200/70 shadow-lg shadow-brand-600/10' : ''}`}>
              <div className="flex flex-col sm:flex-row gap-4">
                <ProjectIcon id={r.id} size="lg" active={idx === 0} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{meta.name}</h2>
                    <span className="text-xs text-ink-faint font-normal">{meta.sub}</span>
                    {idx === 0 && <span className="chip bg-brand-700 text-white">Best fit right now</span>}
                  </div>
                  <p className="text-sm text-ink-soft mt-0.5">{meta.oneLiner}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <StatusBadge status={r.status} />
                    <span className="flex items-center gap-1.5 text-xs text-ink-faint">
                      Suitability
                      <span className="w-16 h-1.5 rounded-full bg-brand-100 overflow-hidden">
                        <span className="score-bar" style={{ width: `${r.score}%` }} />
                      </span>
                      <span className="font-semibold text-ink">{r.score}/100</span>
                      <button className="underline decoration-dotted" onClick={() => setWhyOpen(whyOpen === r.id ? null : r.id)}>why this score?</button>
                    </span>
                  </div>

                  {whyOpen === r.id && (
                    <div className="mt-3 rounded-xl bg-paper border border-[#E8E8ED] p-4 text-xs text-ink-soft space-y-1.5">
                      <div className="font-medium text-ink">Scoring factors (prototype weights)</div>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Land area and terrain suitability</li>
                        <li>Electrical readiness (sun / grid distance / utility zone)</li>
                        <li>Road access and usage demand</li>
                        <li>Fit with your goals and budget</li>
                        {r.overBudget && <li className="text-volt-800 font-medium">Score reduced: even the smallest buildable size exceeds your stated budget</li>}
                      </ul>
                      <p>Scores adjust to what you enter and change when you edit</p>
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
                    <span className="text-ink-faint">Rough investment: </span>
                    {capexM ? (
                      <span className="font-semibold">{fmtTHB(capexM * 0.85)} – {fmtTHB(capexM * 1.2)}</span>
                    ) : (
                      <span className="text-ink-faint">not estimable yet</span>
                    )}
                    <span className="text-xs text-ink-faint ml-1">(estimate, not a real price)</span>
                    {specs?.budgetFit?.resized && (
                      <span className="block text-xs text-brand-700 mt-0.5">
                        Sized to fit your budget — uses ~{specs.budgetFit.usedAreaRai} rai of your {(land.areaSqM / 1600).toFixed(2)}-rai plot
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#EBEBEF] flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => { setChosenPlan(r.id); navigate(`/plan/${r.id}`); }}
                  className="btn-primary flex-1">
                  View this plan <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleCompare(r.id)}
                  className={`btn-secondary flex-1 ${isCompared ? 'border-brand-600 text-brand-800 bg-brand-50' : ''}`}>
                  <GitCompareArrows className="w-4 h-4" />
                  {isCompared ? 'In compare list' : 'Add to compare'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <Collapsible title="Other options not ideal right now" sub="Missing conditions or higher risk — reasons shown" defaultOpen={false}>
          <div className="space-y-3 pt-3">
            {rest.map(r => {
              const meta = PROJECT_FRIENDLY[r.id];
              return (
                <div key={r.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E8E8ED] bg-paper/60">
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
                    Details
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
            <Scale className="w-4 h-4" /> Compare {compareIds.length} selected plans
          </button>
        )}
        <div className="flex-1" />
        <button onClick={() => navigate('/start?step=2')} className="btn-ghost text-sm">
          <Pencil className="w-3.5 h-3.5" /> Adjust goals or budget
        </button>
      </div>

      <div className="mt-8">
        <DisclaimerStrip />
      </div>
    </div>
  );
}
