import React, { useEffect, useMemo, useState } from 'react';
import { navigate } from '../router';
import { useApp } from '../state/AppState';
import { recommendProjects, dataConfidence, projectFriendly, budgetCaution, BUDGET_MAX_THB, BUDGET_OPTIONS } from '../engine/recommend';
import { getSpecs } from '../engine/specs';
import { StepProgress, StatusBadge, ProjectIcon, Note, Collapsible, fmtTHB, DisclaimerStrip } from '../components/ui';
import ProjectArt from '../components/ProjectArt';
import { useT } from '../i18n';
import {
  MapPin, Pencil, ArrowRight, Scale, CheckCircle2, AlertTriangle,
  Info, GitCompareArrows,
} from 'lucide-react';

const JOURNEY_STEPS = ['Your land', 'Goals & budget', 'Suggested options', 'Review plan', 'Save/report'];

export default function Results() {
  const { land, goals, compareIds, toggleCompare, setChosenPlan, lang } = useApp();
  const t = useT();
  const [analyzing, setAnalyzing] = useState(true);
  const [analyzeMsg, setAnalyzeMsg] = useState(0);
  const [whyOpen, setWhyOpen] = useState(null);

  const msgs = [t('Checking land size and terrain'), t('Comparing possible options'), t('Estimating initial investment')];
  useEffect(() => {
    const t1 = setInterval(() => setAnalyzeMsg(m => Math.min(m + 1, msgs.length - 1)), 550);
    const t2 = setTimeout(() => setAnalyzing(false), 1500);
    return () => { clearInterval(t1); clearTimeout(t2); };
  }, []);

  const results = useMemo(() => recommendProjects(land, goals, lang), [land, goals, lang]);
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
        <p className="mt-1 text-sm text-ink-faint">{t('Analyzing from your inputs — just a moment')}</p>
      </div>
    );
  }

  const landKindLabel = lang === 'th'
    ? ({ open: 'ที่ดินราบ/โล่ง', agri: 'ที่ทำเกษตร', roadside: 'ที่ติดถนน/เชิงพาณิชย์', urban: 'ที่ดินในเมือง/หมู่บ้าน', pond: 'มีบ่อน้ำ', slope: 'ที่ลาดเอียง', flat: 'ที่ดินราบ/โล่ง' }[land.landKind || land.landType] || 'ไม่ระบุ')
    : ({ open: 'flat/open land', agri: 'farmland', roadside: 'roadside/commercial lot', urban: 'in-town/community lot', pond: 'has a pond', slope: 'sloped land', flat: 'flat/open land' }[land.landKind || land.landType] || 'unspecified');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <StepProgress steps={JOURNEY_STEPS.map(t)} current={2} />
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
                {land.provinceData?.nameEn || land.provinceData?.name || t('Pinned location')} · {(land.areaSqM / 1600).toFixed(2)} {t('rai')}
              </div>
              <div className="text-sm text-ink-faint mt-0.5">
                {landKindLabel}
                {land.roadType === 'main' ? ` · ${t('main road')}` : land.roadType === 'dirt' ? ` · ${t('hard to reach')}` : ` · ${t('secondary road')}`}
                {goals.budget && goals.budget !== 'unsure' ? ` · ${t('budget:')} ${(b => lang === 'th' ? b?.labelTh : b?.label)(BUDGET_OPTIONS.find(b => b.id === goals.budget)) || goals.budget}` : ''}
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/start')} className="btn-ghost text-sm self-start sm:self-auto">
            <Pencil className="w-3.5 h-3.5" /> {t('Edit info')}
          </button>
        </div>
        {confidence.missing.length > 0 && (
          <div className="mt-3 flex items-start gap-2 text-sm text-volt-800 bg-volt-50 border border-volt-200 rounded-xl px-3.5 py-2.5">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{t('Data confidence:')} <strong>{t(confidence.level)}</strong> — {t('no data yet on {missing}, so results are rougher').replace('{missing}', confidence.missing.join(', '))}</span>
          </div>
        )}
      </div>

      <h1 className="text-xl sm:text-2xl font-bold">
        {top.length >= 3 ? t('We found 3 options worth exploring for your land') : t(`Found {n} options that passed initial screening`).replace('{n}', top.length)}
      </h1>
      <p className="text-sm text-ink-soft mt-1.5 mb-6">
        {t('Suitability scores come from system criteria on your inputs — not profit odds or a guarantee of success')}
      </p>

      <div className="space-y-4">
        {top.map((r, idx) => {
          const meta = projectFriendly(r.id, lang);
          const specs = specsCache[r.id];
          const capexM = specs?.financials?.totalCapexMillionTHB;
          const budgetWarn = budgetCaution(r.id, goals.budget, capexM ? capexM * 1e6 : null, lang);
          const isCompared = compareIds.includes(r.id);
          return (
            <div key={r.id} className={`card p-5 sm:p-6 ${idx === 0 ? 'border-brand-300 ring-2 ring-brand-200/70 shadow-lg shadow-brand-600/10' : ''}`}>
              <div className="flex flex-col sm:flex-row gap-4">
                <ProjectArt id={r.id} className="w-full sm:w-72 aspect-[120/84] self-start sm:order-2" />
                <div className="flex-1 min-w-0 sm:order-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{meta.name}</h2>
                    <span className="text-sm text-ink-faint font-normal">{meta.sub}</span>
                    {idx === 0 && (r.score > top[1]?.score || r.status !== top[1]?.status || !top[1]) && <span className="chip bg-brand-700 text-white">{t('Best fit right now')}</span>}
                  </div>
                  <p className="text-sm text-ink-soft mt-0.5">{meta.oneLiner}</p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <StatusBadge status={r.status} />
                    <span className="flex items-center gap-1.5 text-sm text-ink-faint">
                      {t('Suitability')}
                      <span className="w-16 h-1.5 rounded-full bg-brand-100 overflow-hidden">
                        <span className="score-bar" style={{ width: `${r.score}%` }} />
                      </span>
                      <span className="font-semibold text-ink">{r.score}/100</span>
                      <button className="underline decoration-dotted" onClick={() => setWhyOpen(whyOpen === r.id ? null : r.id)}>{t('why this score?')}</button>
                    </span>
                  </div>

                  {whyOpen === r.id && (
                    <div className="mt-3 rounded-xl bg-paper border border-[#E8E8ED] p-4 text-sm text-ink-soft space-y-1.5">
                      <div className="font-medium text-ink">{t('Scoring factors (prototype weights)')}</div>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>{t('Land area and terrain suitability')}</li>
                        <li>{t('Electrical readiness (sun / grid distance / utility zone)')}</li>
                        <li>{t('Road access and usage demand')}</li>
                        <li>{t('Fit with your goals and budget')}</li>
                        {r.overBudget && <li className="text-volt-800 font-medium">{t('Score reduced: even the smallest buildable size exceeds your stated budget')}</li>}
                      </ul>
                      <p>{t('Scores adjust to what you enter and change when you edit')}</p>
                    </div>
                  )}

                  <ul className="mt-3 space-y-1.5">
                    {r.reasons.slice(0, 3).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink">
                        <CheckCircle2 className="w-4 h-4 text-energy-600 flex-shrink-0 mt-0.5" /> {s}
                      </li>
                    ))}
                    {r.cautions.slice(0, 2).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                        <AlertTriangle className="w-4 h-4 text-volt-600 flex-shrink-0 mt-0.5" /> {s}
                      </li>
                    ))}
                  </ul>

                  {budgetWarn && <div className="mt-3"><Note type="warn">{budgetWarn}</Note></div>}

                  <div className="mt-3 text-sm">
                    <span className="text-ink-faint">{t('Rough investment:')} </span>
                    {capexM ? (
                      <span className="font-semibold">{fmtTHB(capexM * 0.85)} – {fmtTHB(capexM * 1.2)}</span>
                    ) : (
                      <span className="text-ink-faint">{t('not estimable yet')}</span>
                    )}
                    <span className="text-sm text-ink-faint ml-1">{t('(estimate, not a real price)')}</span>
                    {specs?.budgetFit?.resized && (
                      <span className="block text-sm text-brand-700 mt-0.5">
                        {t('Sized to fit your budget — uses ~{rai} rai of your {total}-rai plot')
                          .replace('{rai}', specs.budgetFit.usedAreaRai)
                          .replace('{total}', (land.areaSqM / 1600).toFixed(2))}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#e8e8ed] flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => { setChosenPlan(r.id); navigate(`/plan/${r.id}`); }}
                  className="btn-primary flex-1">
                  {t('View this plan')} <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleCompare(r.id)}
                  className={`btn-secondary flex-1 ${isCompared ? 'border-brand-600 text-brand-800 bg-brand-50' : ''}`}>
                  <GitCompareArrows className="w-4 h-4" />
                  {isCompared ? t('In compare list') : t('Add to compare')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <Collapsible title={t('Other options not ideal right now')} sub={t('Missing conditions or higher risk — reasons shown')} defaultOpen={false}>
          <div className="space-y-3 pt-3">
            {rest.map(r => {
              const meta = projectFriendly(r.id, lang);
              return (
                <div key={r.id} className="flex items-start gap-3 p-3.5 rounded-xl border border-[#E8E8ED] bg-paper/60">
                  <ProjectIcon id={r.id} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{meta.name}</span>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm text-ink-soft mt-1 leading-relaxed">{r.reasons[0] || meta.oneLiner}</p>
                  </div>
                  <button onClick={() => { setChosenPlan(r.id); navigate(`/plan/${r.id}`); }}
                    className="text-sm font-medium text-brand-700 hover:underline flex-shrink-0 mt-1">
                    {t('Details')}
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
            <Scale className="w-4 h-4" /> {t('Compare {n} selected plans').replace('{n}', compareIds.length)}
          </button>
        )}
        <div className="flex-1" />
        <button onClick={() => navigate('/start?step=2')} className="btn-ghost text-sm">
          <Pencil className="w-3.5 h-3.5" /> {t('Adjust goals or budget')}
        </button>
      </div>

      <div className="mt-8">
        <DisclaimerStrip />
      </div>
    </div>
  );
}
