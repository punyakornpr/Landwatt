import React, { useMemo, useState } from 'react';
import { navigate } from '../router';
import { useApp } from '../state/AppState';
import { recommendProjects, projectFriendly, BUDGET_MAX_THB } from '../engine/recommend';
import { getSpecs, friendlySummary, realityChecklist } from '../engine/specs';
import { EE_PROJECTS } from '../data/eeProjects';
import { PROVIDERS } from '../data/providers';
import { useT } from '../i18n';
import SiteLayoutCanvas from '../components/SiteLayoutCanvas';
import FinancialYieldChart from '../components/FinancialYieldChart';
import EngineeringView from '../components/EngineeringView';
import ProjectArt from '../components/ProjectArt';
import {
  StepProgress, StatusBadge, Note, Collapsible, fmtTHB, DisclaimerStrip,
} from '../components/ui';
import {
  ArrowLeft, Banknote, Ruler, Zap, Clock, GitCompareArrows,
  Save, FileText, CheckCircle2, AlertTriangle, Info, Wrench, ChevronRight,
  ExternalLink, Phone,
} from 'lucide-react';

// Company logo: real favicon fetched from the company's own domain; falls back to an initial tile.
function ProviderLogo({ name, website }) {
  const [err, setErr] = useState(false);
  // data file is trusted, but a bad entry shouldn't crash the page
  const host = website ? (() => { try { return new URL(website).hostname; } catch { return null; } })() : null;
  if (!host || err) {
    return (
      <div className="w-9 h-9 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
        {name.charAt(0)}
      </div>
    );
  }
  return (
    <img src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`} alt={`${name} logo`}
      onError={() => setErr(true)} loading="lazy"
      className="w-9 h-9 rounded-lg object-contain bg-white border border-[#E8E8ED] p-1 flex-shrink-0" />
  );
}

const JOURNEY_STEPS = ['Your land', 'Goals & budget', 'Suggested options', 'Review plan', 'Save/report'];

export default function PlanDetail({ projectId }) {
  const { land, goals, toggleCompare, compareIds, saveCurrent, setChosenPlan, chosenPlanId, lang } = useApp();
  const t = useT();
  const th = lang === 'th';
  const id = projectId || chosenPlanId || 'solar-farm';
  const project = EE_PROJECTS.find(p => p.id === id) || EE_PROJECTS[0];
  const meta = projectFriendly(id, lang);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState('general'); // default = general user view

  const budgetMax = BUDGET_MAX_THB[goals?.budget];
  const specs = useMemo(() => getSpecs(id, land, budgetMax), [id, land, budgetMax]);
  const summary = useMemo(() => friendlySummary(id, specs, land, lang), [id, specs, land, lang]);
  const rec = useMemo(() => recommendProjects(land, goals, lang).find(r => r.id === id), [land, goals, id, lang]);
  const checklist = realityChecklist(id, lang);
  const isCompared = compareIds.includes(id);

  const handleSave = () => {
    const name = window.prompt(t('Name this plan'), `${meta.name} — ${land.provinceData?.nameEn || land.provinceData?.name || t('My land')}`);
    if (name === null) return;
    setChosenPlan(id);
    saveCurrent(name || undefined);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const summaryCards = [
    {
      icon: Banknote, label: t('Initial investment'),
      value: summary.capex ? `${fmtTHB(summary.capex.low)} – ${fmtTHB(summary.capex.high)}` : t('Not estimable yet'),
      sub: t('Estimated range from base assumptions'),
    },
    { icon: Ruler, label: t('Area used'), value: summary.areaUsed.split('(')[0], sub: summary.areaUsed.includes('(') ? `(${summary.areaUsed.split('(')[1]}` : '' },
    { icon: Zap, label: t('Energy benefit'), value: summary.benefit.split(' ').slice(0, 4).join(' ') + '…', sub: t('Details below') },
    { icon: Clock, label: t('Rough payback'), value: summary.payback, sub: t('From the assumptions shown below') },
  ];

  const equipmentBullets = th ? [
    specs.moduleCount && `~${specs.moduleCount} ${t('solar panels')}`,
    specs.inverterCount && `${specs.inverterCount} ${t('inverters')}`,
    specs.dcChargersCount && `${specs.dcChargersCount} ${t('fast chargers')} (${specs.totalGuns} ${t('guns')})`,
    specs.bessKWh && `${specs.bessKWh} ${t('kWh backup battery')}`,
    specs.solarCanopyKWp && `~${specs.solarCanopyKWp} ${t('kWp solar canopy over parking')}`,
    specs.containerCount && `${specs.containerCount} ${t('battery containers')}`,
    specs.transformerRating && `${t('Transformer')} ${specs.transformerRating.split(',')[0]}`,
    specs.digesterVolumeM3 && `~${specs.digesterVolumeM3} ${t('m³ biogas digester')}`,
    specs.swapCabinets && `${specs.swapCabinets} ${t('battery-swap cabinets')} (${specs.swapSlots} ${t('slots')})`,
    specs.coldRooms && `${specs.coldRooms} ${t('cold rooms')} (~${specs.coldStorageM3} ${t('m³ storage')})`,
    specs.dryerTunnels && `${specs.dryerTunnels} ${t('solar drying tunnels')} (~${specs.dryCapacityKgDay} ${t('kg/day')})`,
    specs.pontoonType && `${t('Floating pontoons')} ${specs.pontoonType.split('(')[0]}`,
    specs.mountingStructure && `${t('Raised structure for farming under panels')}`,
    specs.leasableRai && `~${specs.leasableRai} ${t('rai leased')} (~${(specs.annualLeaseTHB || 0).toLocaleString()} ${t('THB/yr rent')})`,
    specs.warehouseM2 && `${t('Warehouse')} ~${specs.warehouseM2} ${t('m²')} + ${t('rooftop PV')} ~${specs.roofSolarKWp} ${t('kWp')}`,
    specs.treeCount && `~${specs.treeCount.toLocaleString()} ${t('trees')} (~${specs.creditTonsYr} ${t('tCO2/yr')})`,
    specs.dailyCustomers && `${t('Café shop')} ~${specs.shopM2} ${t('m²')} (~${specs.dailyCustomers} ${t('customers/day')})`,
    specs.dailyGrossTHB && `${t('Store')} ~${specs.shopM2} ${t('m²')} (~${specs.dailyGrossTHB.toLocaleString()} ${t('THB/day est.')})`,
    specs.storageUnits && `${specs.storageUnits} ${t('storage units')} + ${t('rooftop PV')} ~${specs.roofSolarKWp} ${t('kWp')}`,
    specs.courtCount && `${specs.courtCount} ${t('courts')} (${t('hall')} ~${specs.hallM2} ${t('m²')})`,
    specs.roomCount && `${specs.roomCount} ${t('cabins/tents')} (~${specs.occupancyPct}% ${t('occupancy')})`,
    specs.machineCount && `${specs.machineCount} ${t('washers/dryers')}`,
    specs.bayCount && `${specs.bayCount} ${t('wash bays')} + ${t('PV canopy')}`,
  ].filter(Boolean) : [
    specs.moduleCount && `~${specs.moduleCount} solar panels`,
    specs.inverterCount && `${specs.inverterCount} inverters`,
    specs.dcChargersCount && `${specs.dcChargersCount} fast chargers (${specs.totalGuns} guns)`,
    specs.bessKWh && `${specs.bessKWh} kWh backup battery`,
    specs.solarCanopyKWp && `~${specs.solarCanopyKWp} kWp solar canopy over parking`,
    specs.containerCount && `${specs.containerCount} battery containers`,
    specs.transformerRating && `Transformer ${specs.transformerRating.split(',')[0]}`,
    specs.digesterVolumeM3 && `~${specs.digesterVolumeM3} m³ biogas digester`,
    specs.swapCabinets && `${specs.swapCabinets} battery-swap cabinets (${specs.swapSlots} slots)`,
    specs.coldRooms && `${specs.coldRooms} cold rooms (~${specs.coldStorageM3} m³ storage)`,
    specs.dryerTunnels && `${specs.dryerTunnels} solar drying tunnels (~${specs.dryCapacityKgDay} kg/day)`,
    specs.pontoonType && `Floating pontoons ${specs.pontoonType.split('(')[0]}`,
    specs.mountingStructure && `Raised structure for farming under panels`,
    specs.leasableRai && `~${specs.leasableRai} rai leased (~${(specs.annualLeaseTHB || 0).toLocaleString()} THB/yr rent)`,
    specs.warehouseM2 && `Warehouse ~${specs.warehouseM2} m² + rooftop PV ~${specs.roofSolarKWp} kWp`,
    specs.treeCount && `~${specs.treeCount.toLocaleString()} trees (~${specs.creditTonsYr} tCO2/yr)`,
    specs.dailyCustomers && `Café shop ~${specs.shopM2} m² (~${specs.dailyCustomers} customers/day)`,
    specs.dailyGrossTHB && `Store ~${specs.shopM2} m² (~${specs.dailyGrossTHB.toLocaleString()} THB/day est.)`,
    specs.storageUnits && `${specs.storageUnits} storage units + rooftop PV ~${specs.roofSolarKWp} kWp`,
    specs.courtCount && `${specs.courtCount} courts (hall ~${specs.hallM2} m²)`,
    specs.roomCount && `${specs.roomCount} cabins/tents (~${specs.occupancyPct}% occupancy)`,
    specs.machineCount && `${specs.machineCount} washers/dryers`,
    specs.bayCount && `${specs.bayCount} wash bays + PV canopy`,
  ].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <StepProgress steps={JOURNEY_STEPS.map(t)} current={3} />
      </div>

      <button onClick={() => navigate('/results')} className="btn-ghost text-sm mb-4 -ml-2">
        <ArrowLeft className="w-4 h-4" /> {t('Back to options')}
      </button>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <ProjectArt id={id} className="w-full sm:w-56 aspect-[120/84] self-start sm:order-2" />
          <div className="flex-1 sm:order-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">{meta.name}</h1>
              {rec && <StatusBadge status={rec.status} />}
            </div>
            <p className="text-sm text-ink-soft mt-1.5 leading-relaxed">
              {t('This is the plan LandWatt suggests for your land —')} {meta.oneLiner}
            </p>
            {rec && (
              <p className="text-sm text-ink-faint mt-1">
                {t('On {loc} {rai} rai · feasibility:')
                  .replace('{loc}', land.provinceData?.nameEn || land.provinceData?.name || t('the pinned land'))
                  .replace('{rai}', (land.areaSqM / 1600).toFixed(2))}{' '}
                {t(rec.status === 'great' ? 'great fit' : rec.status === 'worth' ? 'worth exploring' : rec.status === 'insufficient' ? 'needs more data' : 'not recommended')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Display-mode switch — top of page after the project name */}
      <div className="card p-1.5 mb-6 grid grid-cols-2 gap-1.5" role="tablist" aria-label="Display mode">
        {[
          ['general', t('General user view'), t('Simple')],
          ['engineering', t('Engineering details'), t('Technical')],
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
            <div className="text-sm text-ink-faint">{c.label}</div>
            <div className="text-sm font-bold mt-1 leading-snug">{c.value}</div>
            <div className="text-[11px] text-ink-faint mt-1">{c.sub}</div>
          </div>
        ))}
      </div>

      {specs.budgetFit?.resized && (
        <div className="mb-8">
          <Note type={specs.budgetFit.stillOverBudget ? 'warn' : 'info'}>
            {specs.budgetFit.stillOverBudget
              ? t('Even the smallest buildable size (~{capex}) is above your budget — a larger budget or different option may be needed')
                  .replace('{capex}', fmtTHB(specs.financials.totalCapexMillionTHB * 1e6))
              : t('Sized to fit your budget — uses ~{rai} rai of your {total}-rai plot (full-plot build would cost ~฿{orig}M)')
                  .replace('{rai}', specs.budgetFit.usedAreaRai)
                  .replace('{total}', (land.areaSqM / 1600).toFixed(2))
                  .replace('{orig}', specs.budgetFit.originalCapexMillionTHB)}
          </Note>
        </div>
      )}

      <div className="space-y-8">
        {/* Layout */}
        <section>
          <h2 className="text-lg font-bold mb-1">{t('What would the land look like if built?')}</h2>
          <p className="text-sm text-ink-soft mb-3">{t('Simulated layout scaled to your plot')}</p>
          <SiteLayoutCanvas project={project} specs={specs} landData={land} />
          <div className="mt-2"><Note>{t('This is a schematic simulation for a rough picture — not construction drawings and not measured positions on the plot')}</Note></div>
        </section>

        {/* Equipment */}
        <section>
          <h2 className="text-lg font-bold mb-1">{t('What are the main components?')}</h2>
          <div className="card p-5">
            <ul className="space-y-2.5">
              {equipmentBullets.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <Wrench className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" /> {s}
                </li>
              ))}
            </ul>
            <p className="text-sm text-ink-faint mt-4">{t('Counts and sizes are computed from the area you gave — they change if the land size changes')}</p>
          </div>
        </section>

        {/* Money */}
        <section>
          <h2 className="text-lg font-bold mb-1">{t('How much money is needed and is it worth it?')}</h2>
          <div className="card p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-paper border border-[#E8E8ED] p-4">
                <div className="text-sm text-ink-faint">{t('Initial investment')}</div>
                <div className="text-lg font-bold mt-0.5">{summary.capex ? fmtTHB(summary.capex.mid) : '—'}</div>
              </div>
              <div className="rounded-xl bg-paper border border-[#E8E8ED] p-4">
                <div className="text-sm text-ink-faint">{t('Revenue/savings per year (approx.)')}</div>
                <div className="text-lg font-bold mt-0.5">
                  {specs.financials?.annualRevenueMillionTHB ? fmtTHB(specs.financials.annualRevenueMillionTHB) : t('Not estimable yet')}
                </div>
                {specs.dualIncome && (
                  <div className="text-[11px] text-ink-soft mt-1 leading-snug">
                    {t('= power {p} (assumed FiT)').replace('{p}', fmtTHB(specs.dualIncome.powerRevenueMillionTHB))}
                    {' '}{t('+ crops {c} (estimate, crop unspecified)').replace('{c}', fmtTHB(specs.dualIncome.agriRevenueMillionTHB))}
                  </div>
                )}
                {specs.tariffStatus === 'scenario' && (
                  <div className="text-[11px] text-volt-800 mt-1">{t('Power revenue uses an assumed rate, not a confirmed power-purchase entitlement')}</div>
                )}
              </div>
              <div className="rounded-xl bg-paper border border-[#E8E8ED] p-4">
                <div className="text-sm text-ink-faint">{t('Rough payback')}</div>
                <div className="text-lg font-bold mt-0.5">{summary.payback}</div>
              </div>
            </div>
            <FinancialYieldChart project={project} specs={specs} landData={land} />
            <Note>{t('These numbers are preliminary estimates — actuals depend on installation prices, usage behavior and utility interconnection terms; not a guaranteed price')}</Note>
            <Collapsible title={t('Return details (advanced)')} sub={t('NPV, IRR and financial assumptions')}>
              <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {[
                  [t('IRR (return rate)'), specs.financials?.irrPercent ? `${specs.financials.irrPercent}%` : '—'],
                  [t('NPV 25 yrs'), specs.financials?.npv25YrMillionTHB ? `${fmtTHB(specs.financials.npv25YrMillionTHB)}` : '—'],
                  [t('Net cash flow/yr'), specs.financials?.netAnnualCashflowMillionTHB ? fmtTHB(specs.financials.netAnnualCashflowMillionTHB) : specs.financials?.netAnnualProfitMillionTHB ? fmtTHB(specs.financials.netAnnualProfitMillionTHB) : '—'],
                  [t('Actual DC/AC ratio'), specs.actualDcAcRatio || '—'],
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
          <h2 className="text-lg font-bold mb-3">{t('Strengths and things to watch out for?')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-energy-800 mb-3">{t('Plan strengths')}</h3>
              <ul className="space-y-2">
                {(rec?.reasons || []).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-energy-600 flex-shrink-0 mt-0.5" />{s}</li>
                ))}
                {project.keyBenefits?.slice(0, 2).map((s, i) => (
                  <li key={`b${i}`} className="flex items-start gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-energy-600 flex-shrink-0 mt-0.5" />{t(s)}</li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-volt-800 mb-3">{t('Cautions / unknowns')}</h3>
              <ul className="space-y-2">
                {(rec?.cautions || []).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm"><AlertTriangle className="w-4 h-4 text-volt-600 flex-shrink-0 mt-0.5" />{s}</li>
                ))}
                {(rec?.confidence?.missing || []).map((s, i) => (
                  <li key={`m${i}`} className="flex items-start gap-2 text-sm text-ink-soft"><Info className="w-4 h-4 text-electric-600 flex-shrink-0 mt-0.5" />{t('No data on {t} yet — add it later for better accuracy').replace('{t}', s)}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section>
          <h2 className="text-lg font-bold mb-3">{t('What to do before real investment?')}</h2>
          <div className="card p-5">
            <ul className="space-y-3">
              {checklist.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Providers */}
        {PROVIDERS[id]?.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-1">{t('Who could build this?')}</h2>
            <p className="text-sm text-ink-soft mb-3">{t('Example companies working in this field in Thailand — compare several before deciding')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROVIDERS[id].map(p => {
                const Card = p.website ? 'a' : 'div';
                return (
                  <Card key={p.name} className={`card p-4 ${p.website ? 'hover:border-brand-400 hover:shadow-sm transition cursor-pointer no-underline text-inherit' : ''}`}
                    {...(p.website ? { href: p.website, target: '_blank', rel: 'noopener noreferrer' } : {})}>
                    <div className="flex items-start gap-3">
                      <ProviderLogo name={p.name} website={p.website} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-bold flex items-center gap-1.5">
                            {p.name}
                            {p.website && <ExternalLink className="w-3.5 h-3.5 text-ink-faint" />}
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-paper border border-[#E8E8ED] text-ink-faint flex-shrink-0">{t(p.scale)}</span>
                        </div>
                        <div className="text-sm text-ink-soft mt-1 leading-snug">{p.focus}</div>
                        {p.contact && (
                          <div className="text-[11px] text-brand-700 mt-1.5 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {p.contact}
                          </div>
                        )}
                        <div className="text-[11px] text-ink-faint mt-1.5 leading-snug">{p.note}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            <div className="mt-3">
              <Note>{t('Reference list only — not an endorsement. Always compare 2–3 quotes and verify licenses, insurance and warranty terms before signing')}</Note>
            </div>
          </section>
        )}

      </div>
      </>
      )}

      {/* Actions — shared by both modes */}
      <div className="card p-5 mt-8">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button onClick={() => navigate('/start')} className="btn-secondary flex-1">{t('Adjust plan to budget')}</button>
          <button onClick={() => toggleCompare(id)} className={`btn-secondary flex-1 ${isCompared ? 'border-brand-600 text-brand-800 bg-brand-50' : ''}`}>
            <GitCompareArrows className="w-4 h-4" /> {isCompared ? t('Remove from compare') : t('Compare with other plans')}
          </button>
          <button onClick={handleSave} className="btn-primary flex-1">
            <Save className="w-4 h-4" /> {saved ? t('Saved ✓') : t('Save plan')}
          </button>
        </div>
        <button onClick={() => { setChosenPlan(id); navigate(`/report/${id}`); }}
          className="mt-2.5 w-full text-center text-sm font-medium text-brand-700 hover:underline py-2">
          <FileText className="w-4 h-4 inline -mt-0.5 mr-1" /> {t('View & print the summary report for this plan')}
        </button>
      </div>

      <DisclaimerStrip />
    </div>
  );
}
