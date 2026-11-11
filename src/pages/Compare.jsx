import React, { useMemo } from 'react';
import { navigate } from '../router';
import { useApp } from '../state/AppState';
import { recommendProjects, projectFriendly, BUDGET_MAX_THB } from '../engine/recommend';
import { getSpecs, friendlySummary } from '../engine/specs';
import { StatusBadge, ProjectIcon, Note, fmtTHB, DisclaimerStrip, PageHead } from '../components/ui';
import { useT } from '../i18n';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

export default function Compare() {
  const { land, goals, compareIds, toggleCompare, setChosenPlan, lang } = useApp();
  const t = useT();
  const results = useMemo(() => recommendProjects(land, goals, lang), [land, goals, lang]);
  const plans = compareIds.map(id => {
    const specs = getSpecs(id, land, BUDGET_MAX_THB[goals?.budget]);
    return { id, rec: results.find(r => r.id === id), specs, summary: friendlySummary(id, specs, land, lang) };
  }).filter(p => p.rec);

  if (plans.length < 2) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-xl font-bold">{t('Pick at least 2 plans to compare')}</h1>
        <p className="text-sm text-ink-soft mt-2">{t('On the results page, press "Add to compare" on options you like')}</p>
        <button onClick={() => navigate('/results')} className="btn-primary mt-6">
          {t('Go to results')} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const rows = [
    { label: t('Suitability status'), get: p => <StatusBadge status={p.rec.status} /> },
    { label: t('Fits your goals?'), get: p => p.rec.reasons[0] || '—' },
    { label: t('Rough investment'), get: p => p.summary.capex ? `${fmtTHB(p.summary.capex.low)} – ${fmtTHB(p.summary.capex.high)}` : t('not estimable') },
    { label: t('Area used'), get: p => p.summary.areaUsed },
    { label: t('Energy benefit'), get: p => p.summary.benefit },
    { label: t('Rough payback'), get: p => p.summary.payback },
    { label: t('Missing data'), get: p => (p.rec.confidence.missing.length ? p.rec.confidence.missing.join(', ') : t('complete at this level')) },
    { label: t('Check before investing'), get: p => p.rec.cautions[0] || '—' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate('/results')} className="btn-ghost text-sm mb-4 -ml-2 no-print">
        <ArrowLeft className="w-4 h-4" /> {t('Back to options')}
      </button>
      <PageHead
        title={t('Compare plans side by side')}
        sub={t('{n} plans on {loc} {rai} rai — each plan’s numbers come from assumptions that may differ')
          .replace('{n}', plans.length)
          .replace('{loc}', land.provinceData?.nameEn || land.provinceData?.name || t('the pinned land'))
          .replace('{rai}', (land.areaSqM / 1600).toFixed(2))}
      />

      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e8e8ed]">
                <th className="text-left p-4 text-ink-faint font-medium w-44">{t('Topic')}</th>
                {plans.map(p => (
                  <th key={p.id} className="text-left p-4 min-w-[200px]">
                    <div className="flex items-center gap-2.5">
                      <ProjectIcon id={p.id} />
                      <div>
                        <div className="font-bold">{projectFriendly(p.id, lang).name}</div>
                        <button onClick={() => toggleCompare(p.id)} className="text-[11px] text-ink-faint hover:text-danger-600 font-normal flex items-center gap-0.5 mt-0.5">
                          <X className="w-3 h-3" /> {t('Remove')}
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-[#f5f5f7] last:border-0 align-top">
                  <td className="p-4 text-ink-faint text-xs font-medium">{row.label}</td>
                  {plans.map(p => (
                    <td key={p.id} className="p-4 text-sm leading-relaxed">{row.get(p)}</td>
                  ))}
                </tr>
              ))}
              <tr>
                <td />
                {plans.map(p => (
                  <td key={p.id} className="p-4">
                    <button onClick={() => { setChosenPlan(p.id); navigate(`/plan/${p.id}`); }} className="btn-primary w-full text-xs px-3 py-2.5">
                      {t('View plan')}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden space-y-4">
        {plans.map(p => (
          <div key={p.id} className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <ProjectIcon id={p.id} />
              <div className="flex-1 font-bold">{projectFriendly(p.id, lang).name}</div>
              <button onClick={() => toggleCompare(p.id)} className="text-ink-faint hover:text-danger-600"><X className="w-4 h-4" /></button>
            </div>
            <dl className="space-y-3">
              {rows.map((row, i) => (
                <div key={i}>
                  <dt className="text-[11px] text-ink-faint">{row.label}</dt>
                  <dd className="text-sm mt-0.5 leading-relaxed">{row.get(p)}</dd>
                </div>
              ))}
            </dl>
            <button onClick={() => { setChosenPlan(p.id); navigate(`/plan/${p.id}`); }} className="btn-primary w-full mt-4 text-xs">
              {t('View plan')}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <Note>{t('We do not declare any plan "the best" — key limits still need a real site check. Use this table when talking to experts or contractors')}</Note>
        <DisclaimerStrip />
      </div>
    </div>
  );
}
