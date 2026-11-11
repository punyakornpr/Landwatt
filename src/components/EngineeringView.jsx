import React, { useState } from 'react';
import SingleLineDiagram from './SingleLineDiagram';
import FinancialYieldChart from './FinancialYieldChart';
import { Note, fmtTHB } from './ui';

// Source chips: user = user input, demo = demo value, est = estimate, calc = computed
const SRC = {
  user: ['Your input', 'bg-electric-100 text-electric-800'],
  demo: ['Demo value', 'bg-volt-100 text-volt-800'],
  est: ['Estimate', 'bg-[#EDECE5] text-ink-soft'],
  calc: ['Computed', 'bg-energy-100 text-energy-800'],
};

function Src({ t }) {
  const [label, cls] = SRC[t] || SRC.est;
  return <span className={`text-[10px] rounded-full px-2 py-0.5 ${cls}`}>{label}</span>;
}

function KV({ k, v, src }) {
  return (
    <div className="rounded-lg border border-[#E7E5DD] bg-paper p-3">
      <div className="text-[10px] text-ink-faint font-sans flex items-center justify-between gap-2">
        <span>{k}</span>{src && <Src t={src} />}
      </div>
      <div className="mt-0.5 font-mono">{v}</div>
    </div>
  );
}

// Card status per spec v4 — always labelled, never color-only
// Status labels per taxonomy v6 §3.4 — always labelled, never color-only
const STATUS = {
  calc: ['Computed', 'bg-energy-100 text-energy-800'],
  pass: ['Passed checks available', 'bg-energy-100 text-energy-800'],
  assumed: ['Estimated/assumed', 'bg-electric-100 text-electric-800'],
  warn: ['Needs further checks', 'bg-volt-100 text-volt-800'],
  unverified: ['Needs further checks', 'bg-[#EDECE5] text-ink-soft'],
  fail: ['Failed checked criteria', 'bg-volt-100 text-volt-800'],
};

// 9-part formula card — compact by default: id+name+status+formula+substitution+result+caution; details behind aria-expanded button
let traceSeq = 0;
function Trace({ fid, name, status, purpose, formula, vars, provenance, sub, steps, result, check, deps, note }) {
  const [open, setOpen] = useState(false);
  const panelId = `trace-${fid}-${useState(() => ++traceSeq)[0]}`;
  const [statusLabel, statusCls] = STATUS[status] || STATUS.unverified;
  return (
    <div className="rounded-xl border border-[#E7E5DD] p-4 space-y-2">
      {/* 1. name/purpose + status */}
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-[10px] font-mono font-bold bg-brand-700 text-white rounded px-1.5 py-0.5">{fid}</span>
        <span className="text-sm font-semibold">{name}</span>
        <span className={`text-[10px] rounded-full px-2 py-0.5 ml-auto ${statusCls}`}>{statusLabel}</span>
      </div>
      {purpose && <div className="text-[11px] text-ink-faint">Purpose: {purpose}</div>}
      {/* 2. general formula + 5. substitution + 7. answer (visible) */}
      <div className="font-mono text-xs text-ink-soft bg-paper rounded-lg px-3 py-2">{formula}</div>
      <div className="font-mono text-xs whitespace-pre-line">{sub}</div>
      <div className="font-mono text-sm font-bold text-brand-800">{result}</div>
      {/* cautions/limits visible even when collapsed */}
      {note && <div className="text-[11px] text-volt-800">{note}</div>}
      {/* details — real aria-expanded control */}
      {(vars?.length || provenance || steps?.length || check || deps) && (
        <div>
          <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(o => !o)}
            className="text-[11px] font-medium text-brand-700 py-1 underline underline-offset-2">
            {open ? 'Hide reasoning & sources' : 'Show reasoning & sources'}
          </button>
          {open && (
          <div id={panelId} className="pt-2 space-y-2">
            {/* 3. variable meanings */}
            {vars?.length > 0 && (
              <table className="text-[11px] font-mono w-full">
                <tbody>
                  {vars.map(([sym, meaning, unit, val, src], i) => (
                    <tr key={i} className="border-b border-[#F1EFE8] last:border-0">
                      <td className="py-0.5 pr-2 font-semibold w-16">{sym}</td>
                      <td className="py-0.5 pr-2 text-ink-soft">{meaning}{unit ? ` (${unit})` : ''}</td>
                      <td className="py-0.5 pr-2 text-right w-24">{val}</td>
                      <td className="py-0.5 w-28">{src && <Src t={src} />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {/* 4. value provenance */}
            {provenance && <div className="text-[11px] text-ink-faint">Source: {provenance}</div>}
            {/* 6. step-by-step calculation */}
            {steps?.length > 0 && (
              <ol className="font-mono text-xs space-y-0.5 list-decimal list-inside">
                {steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            )}
            {/* 8. checked conditions/limits */}
            {check && <div className="text-[11px] rounded-lg bg-energy-50 border border-energy-100 px-3 py-2">Checked: {check}</div>}
            {/* 9. dependencies */}
            {deps && <div className="text-[11px] text-ink-faint">Used by: {deps}</div>}
          </div>
          )}
        </div>
      )}
    </div>
  );
}

const Section = ({ title, sub, children }) => (
  <section className="card p-5">
    <h3 className="text-base font-bold">{title}</h3>
    {sub && <p className="text-xs text-ink-faint mt-0.5 mb-3">{sub}</p>}
    <div className="mt-3 space-y-3">{children}</div>
  </section>
);

export default function EngineeringView({ id, specs, land, project, summary }) {
  const sd = specs.stringDesign;
  const isPV = !!specs.dcCapacityKWp || !!specs.dcCapacityMWp;
  const isEV = id === 'ev-charging-hub';
  const isBESS = id === 'grid-bess';
  const isBio = id === 'biomass-biogas';
  const areaRai = (land.areaSqM / 1600);
  // Always use raw values: real panel count × 620W — specs.dcCapacityKWp is already rounded
  const sd_ = specs.stringDesign;
  const dcKwp = sd_ ? (sd_.installedPanelCount * 620) / 1000 : (specs.dcCapacityKWp || parseFloat(specs.dcCapacityMWp || 0) * 1000);
  const acKw = (specs.inverterCount || 0) * 300;
  const fin = specs.financials || {};

  return (
    <div className="space-y-6">
      <Note type="warn">
        Engineering view — shows formulas, substitutions and limits of the same calculation set used in the general view.
        These are <strong>preliminary estimates</strong>, not construction drawings or a grid-interconnection approval
      </Note>

      {/* A. Inputs & data quality */}
      <Section title="A. Inputs & data quality" sub="Every value is labelled by source — demo values are not measurements">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <KV k="Total area" v={`${(land.areaSqM || 0).toLocaleString()} m² (${areaRai.toFixed(3)} rai)`} src="user" />
          <KV k="Excluded area (buildings/ponds)" v={`${(specs.excludedAreaSqM || 0).toLocaleString()} m²`} src="user" />
          <KV k="Average GHI" v={`${land.provinceData?.ghi || '5.1'} kWh/m²/day`} src="est" />
          <KV k="Distance to power line" v={land.gridUnknown ? 'Unknown' : `~${land.gridDistanceMeters} m (approx.)`} src={land.gridUnknown ? 'est' : 'user'} />
          <KV k="Panel/inverter ratings" v="Demo Catalog (not a real datasheet)" src="demo" />
          <KV k="FiT rate" v="2.1679 THB/kWh — assumed scenario" src="demo" />
        </div>
      </Section>

      {/* B. Land calc */}
      <Section title="B. Area calculation" sub="Unit conversion and net usable area">
        <Trace fid="F-01" status="calc" name="How many rai is the land in total?"
          formula="A = 1600R + 400N + 4W  (m²) ;  R_total = A/1600"
          sub={`${(land.areaSqM || 0).toLocaleString()} / 1600`}
          result={`= ${areaRai.toFixed(4)} rai`}
          note="Area from drawn plot/input — not a cadastral survey" />
        <Trace fid="F-02" status="assumed" name="How much area is actually usable for installation?"
          formula="A_usable = (A_total − A_excluded) × 0.78  (setback/road/equipment-yard deduction)"
          sub={`(${ (land.areaSqM||0).toLocaleString() } − ${(specs.excludedAreaSqM||0).toLocaleString()}) × 0.78`}
          result={`= ${(((land.areaSqM||0) - (specs.excludedAreaSqM||0)) * 0.78).toLocaleString(undefined,{maximumFractionDigits:0})} m²`}
          note="78% is a design assumption, not a regulation" />
      </Section>

      {/* C. Solar PV */}
      {isPV && sd && (
        <Section title="C. Solar PV calculation" sub="Panels, strings, inverters and yield — all from the same demo catalog">
          <Trace fid="F-03" status="assumed" name={`Why does this area get ${sd.installedPanelCount.toLocaleString()} panels?`}
            purpose="Pick installed panel count from the area"
            formula="N_candidate = ⌊A_usable / 4.0⌋ ;  N_installed = ⌊N_used × f_layout⌋ whole strings"
            vars={[
              ['A_usable', 'net usable area', 'm²', (((land.areaSqM||0) - (specs.excludedAreaSqM||0)) * 0.78).toLocaleString(undefined,{maximumFractionDigits:0}), 'calc'],
              ['A_panel', 'layout area per panel', 'm²/panel', '4.0', 'assumed'],
              ['N_cand', 'area-based panel count', 'panels', String(specs.areaCandidatePanelCount || '—'), 'calc'],
            ]}
            provenance="4.0 m²/panel is a density-heuristic assumption including gaps/structures — not a real site layout"
            sub={id === 'agrivoltaics'
              ? `candidate ${specs.areaCandidatePanelCount} panels → ${specs.baseStringCount} strings → × 0.70 (agri area) = ${sd.stringCount} strings → ${sd.stringCount} × ${sd.stringSize} = ${sd.installedPanelCount} panels`
              : `candidate ${specs.areaCandidatePanelCount} panels → ⌊${specs.areaCandidatePanelCount} / ${sd.stringSize}⌋ = ${sd.stringCount} strings → ${sd.stringCount} × ${sd.stringSize} = ${sd.installedPanelCount} panels`}
            result={`${sd.installedPanelCount.toLocaleString()} panels installed (${sd.stringCount.toLocaleString()} strings)`}
            check={id === 'agrivoltaics'
              ? `Noted limit: 0.70 agri-area factor (design assumption, crop/light not verified) — not a crop analysis`
              : `Noted limit: only whole strings installed (${sd.stringSize}/string) — ${sd.leftoverPanels} leftover panels unassigned`}
            deps="F-04 (P_DC), F-05 (string voltage), SLD, CAPEX"
            note="Not a real layout on the polygon — actual arrangement/shading must be surveyed" />
          <Trace fid="F-04" status="calc" name="Total installed DC capacity of all panels?"
            purpose="Total DC nameplate of actually installed whole-string panels"
            formula="P_DC = N_installed × P_module / 1000"
            vars={[
              ['N_installed', 'installed panel count', 'panels', sd.installedPanelCount.toLocaleString(), 'calc'],
              ['P_module', 'panel STC rating', 'Wp', '620', 'demo'],
            ]}
            provenance="N_installed from F-03/F-05 (whole strings only) · P_module from Demo Catalog, not a real datasheet"
            sub={`P_DC = ${sd.installedPanelCount.toLocaleString()} × 620 / 1000`}
            steps={[
              `${sd.installedPanelCount.toLocaleString()} × 620 = ${(sd.installedPanelCount * 620).toLocaleString()} W`,
              `${(sd.installedPanelCount * 620).toLocaleString()} / 1000 = ${(sd.installedPanelCount * 620 / 1000).toLocaleString()} kW`,
            ]}
            result={`= ${(sd.installedPanelCount * 620 / 1000).toLocaleString()} kWp (${(sd.installedPanelCount * 620 / 1e6).toFixed(4)} MWp)`}
            check={`area candidate ${specs.areaCandidatePanelCount || '—'} panels → ${sd.installedPanelCount.toLocaleString()} installed as whole strings (${sd.leftoverPanels} leftover panels excluded)`}
            deps="F-07 (DC/AC), F-09A (yield), CAPEX, SLD, summary card — same raw values" />
        </Section>
      )}
      {isPV && sd && (
        <Section title="D. String design & voltage checks (F-05)" sub="Only conditions checkable from the data — not every condition">
          <Trace fid="F-05" status="warn" name="Is the string voltage within the inverter's range?"
            purpose="Verify string voltage stays under inverter rating and inside the MPPT range"
            vars={[
              ['V_oc,STC', 'STC open-circuit voltage', 'V', '45.2', 'demo'],
              ['β_voc', 'Voc temperature coefficient', '/°C', '−0.0025', 'demo'],
              ['V_mp,STC', 'STC MPP voltage', 'V', '38.1', 'demo'],
              ['β_vmp', 'Vmp temperature coefficient', '/°C', '−0.0030', 'demo'],
              ['N_s', 'panels per string', 'panels', String(sd.stringSize), 'calc'],
            ]}
            provenance="T_min=10°C, T_max=60°C are design assumptions · datasheet is the Demo Catalog"
            sub={`Cold: 45.2 × [1 + (−0.0025) × (10 − 25)] = ${sd.vocCold} V/panel → ${sd.stringSize} × ${sd.vocCold} = ${(sd.stringSize * parseFloat(sd.vocCold)).toFixed(1)} V ≤ ${sd.vdcMax} V
Hot: 38.1 × [1 + (−0.0030) × (60 − 25)] = ${sd.vmpHot} V/panel → ${sd.stringSize} × ${sd.vmpHot} = ${(sd.stringSize * parseFloat(sd.vmpHot)).toFixed(1)} V ∈ [${sd.mpptMin}, ${sd.mpptMax}] V`}
            steps={[
              `[Cold air raises open-circuit voltage] V_oc(10°C) = 45.2 × [1 + (−0.0025) × (−15)]`,
              `= 45.2 × [1 + 0.0375] = 45.2 × 1.0375 = ${sd.vocCold} V/panel`,
              `Max string voltage = ${sd.stringSize} × ${sd.vocCold} = ${(sd.stringSize * parseFloat(sd.vocCold)).toFixed(1)} V`,
              `[Hot cells lower operating voltage] V_mp(60°C) = 38.1 × [1 + (−0.0030) × 35]`,
              `= 38.1 × [1 − 0.105] = 38.1 × 0.895 = ${sd.vmpHot} V/panel`,
              `Operating string voltage = ${sd.stringSize} × ${sd.vmpHot} = ${(sd.stringSize * parseFloat(sd.vmpHot)).toFixed(1)} V`,
            ]}
            result={`Passed preliminary voltage check (assumed) — ${sd.stringCount.toLocaleString()} strings × ${sd.stringSize} panels, ${sd.leftoverPanels} leftover`}
            check={`${(sd.stringSize * parseFloat(sd.vocCold)).toFixed(0)} V ≤ ${sd.vdcMax} V (V_DC,max) ✓ and ${(sd.stringSize * parseFloat(sd.vmpHot)).toFixed(0)} V ∈ [${sd.mpptMin}, ${sd.mpptMax}] V (MPPT) ✓`}
            deps="F-03 (string size), F-06 (inverters), SLD DC box"
            note="Equipment matching not certified: Isc/Imp, MPPT input current, low-temp Vmp and the real datasheet must be checked — only the shown voltage criteria pass" />
        </Section>
      )}
      {isPV && sd && (
        <Section title="E. Inverters & DC/AC ratio (F-06, F-07)" sub="Real nameplate values after rounding unit counts">
          <Trace fid="F-06" status="calc" name="Total inverter rated capacity?"
            formula="P_AC,rated = N_inv × P_inv,rated"
            sub={`${specs.inverterCount} × 300`}
            result={`= ${acKw.toLocaleString()} kWac (${(acKw / 1000).toFixed(3)} MWac)`}
            note="Combined inverter nameplate — not demand or export limit" />
          <Trace fid="F-07" status="warn" name="Panel-to-inverter DC/AC ratio?"
            formula="R = P_DC / P_AC,rated"
            sub={`${dcKwp.toLocaleString()} / ${acKw.toLocaleString()}`}
            result={`= ${specs.actualDcAcRatio}`}
            deps="Inverter selection check — not proof of suitability"
            note="Design target ~1.25 — actual value after unit rounding may differ; compare equipment options further" />
        </Section>
      )}
      {isPV && sd && (
        <Section title="F. Annual yield & transformer (F-09A, F-14)" sub="Preliminary estimates — not measured data">
          {specs.annualEnergyMWh && (
            <Trace fid="F-09A" status="assumed" name="Estimated annual energy production?"
              formula="E_year = P_DC × Y_specific ;  Y_specific ≈ GHI × 365 × PR (estimate)"
              sub={`${dcKwp.toLocaleString()} kWp × (${land.provinceData?.ghi || 5.1} × 365 × 0.80)`}
              result={`≈ ${specs.annualEnergyMWh} MWh/yr`}
              note="Estimate already includes losses (PR=0.80) — no double loss deduction; not an hourly simulation" />
          )}
          {specs.transformerRating && (
            <Trace fid="F-14" status="assumed" name="Approximate transformer rating needed?"
              formula="S_required = P_AC / PF ; pick standard rating"
              sub={`${acKw.toLocaleString()} / 0.95 = ${(acKw / 0.95).toFixed(0)} kVA`}
              result={`→ ${specs.transformerRating}`}
              note="Preliminary estimate — not a confirmed rating or distribution-grid approval" />
          )}
        </Section>
      )}

      {/* D. EV */}
      {isEV && (
        <Section title="EV. Charging station calculation" sub="DC output vs AC input kept clearly separate">
          <Trace fid="F-12" status="calc" name="Real AC draw of the charger cabinets?"
            formula="P_AC,in = Σ P_DC,out / η_charger"
            sub={`${specs.dcChargersCount} × 180 / 0.95`}
            result={`= ${(specs.dcChargersCount * 180 / 0.95).toFixed(1)} kW AC (connected)`}
            note="180 kW rating is DC output — divide by efficiency to get the AC-side load" />
          <Trace fid="F-13" status="assumed" name="Peak demand and current?"
            formula="P_demand = P_connected × DF ;  I = P/(√3·V_LL·PF)"
            sub={`${(specs.dcChargersCount * 180 / 0.95).toFixed(1)} × 0.70 → I = P/(√3×400×0.98)`}
            result={`≈ ${(specs.dcChargersCount * 180 / 0.95 * 0.7).toFixed(1)} kW, ${(specs.dcChargersCount * 180 / 0.95 * 0.7 * 1000 / (Math.sqrt(3) * 400 * 0.98)).toFixed(0)} A`}
            note="DF 0.70 is a power-management assumption — no real load profile yet" />
          <Trace fid="F-14" status="assumed" name="Preliminary transformer sizing"
            formula="S_required = (P_demand − BESS assist) / PF ; pick standard rating"
            sub={`(${(specs.dcChargersCount * 180 / 0.95 * 0.7).toFixed(1)} − ${(specs.bessKWh || 0) / 2}) / 0.98`}
            result={`→ ${specs.transformerRating}`}
            note="Preliminary — BESS peak reduction is assumed, not confirmed" />
        </Section>
      )}

      {/* E. BESS / other — scope limited to what exists */}
      {(isBESS || isBio) && (
        <Section title="Scope. What this project computes" sub="States plainly what is computed and what is not">
          {isBESS && (
            <div className="text-sm space-y-2">
              <div>Energy capacity: {specs.capacityMWh || '—'} MWh · {specs.containerCount || '—'} containers</div>
              <Note type="warn">Stepwise SOC simulation (F-16–F-19) not implemented — ancillary-service revenue needs a real contract, shown only as concept and screening</Note>
            </div>
          )}
          {isBio && (
            <div className="text-sm space-y-2">
              <div>Estimated generator capacity: {specs.generatorCapacityKW || '—'} kW</div>
              <Note type="warn">No approved formula set for biogas volume/yield yet — results are preliminary estimates from area and feedstock assumptions, not a plant design</Note>
            </div>
          )}
        </Section>
      )}

      {/* F. SLD */}
      <Section title="G. Equipment & system diagram (SLD)" sub="Drawn from the same values as the tables above — conceptual draft, not construction documents">
        <SingleLineDiagram project={project} specs={specs} landData={land} />
        <p className="text-xs text-ink-faint">This single-line diagram is a preliminary concept — protection/metering/utility interface not yet verified</p>
      </Section>

      {/* G. Financial engineering */}
      <Section title="H. Financial calculation" sub="Same cash-flow set as the chart and summary cards">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <KV k="CAPEX" v={fin.totalCapexMillionTHB ? `${fin.totalCapexMillionTHB}M THB` : '—'} src="calc" />
          <KV k="Annual revenue" v={fin.annualRevenueMillionTHB ? `${fin.annualRevenueMillionTHB}M THB` : '—'} src="calc" />
          <KV k="Net cash/yr" v={fin.netAnnualCashflowMillionTHB ? `${fin.netAnnualCashflowMillionTHB}M THB` : (fin.netAnnualProfitMillionTHB ? `${fin.netAnnualProfitMillionTHB}M THB` : '—')} src="calc" />
          <KV k="CAPEX per MWp" v={specs.capexPerMWpMillionTHB ? `~${specs.capexPerMWpMillionTHB}M THB/MWp` : 'flat rate by type'} src="demo" />
        </div>
        {specs.dualIncome && (
          <div className="text-xs rounded-lg bg-paper border border-[#E7E5DD] p-3">
            Split income — power {fmtTHB(specs.dualIncome.powerRevenueMillionTHB)}/yr (assumed FiT) + crops {fmtTHB(specs.dualIncome.agriRevenueMillionTHB)}/yr (estimate, crop unspecified, do not treat as confirmed)
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <KV k="Payback (first year CCF ≥ 0)" v={fin.paybackYears ? `${fin.paybackYears} yrs` : '—'} src="calc" />
          <KV k="NPV 25 yrs @ 6%" v={fin.npv25YrMillionTHB ? `${fin.npv25YrMillionTHB}M THB` : '—'} src="calc" />
          <KV k="IRR" v={fin.irrPercent ? `${fin.irrPercent}%` : '—'} src="calc" />
        </div>
        <FinancialYieldChart project={project} specs={specs} landData={land} />
        {(specs.cashFlows?.length > 1) && (
          <details className="rounded-lg border border-[#E7E5DD]">
            <summary className="cursor-pointer text-xs font-semibold px-4 py-3">
              Cash-flow table yrs 0–{(specs.cashFlows.length - 1)} (Payback/NPV/IRR reproducible)
            </summary>
            <div className="px-4 pb-4 overflow-x-auto">
              <table className="text-[11px] font-mono w-full">
                <thead>
                  <tr className="text-ink-faint border-b border-[#E7E5DD]">
                    <th className="text-left py-1 pr-3">Year</th>
                    <th className="text-right py-1 pr-3">CF (M THB)</th>
                    <th className="text-right py-1 pr-3">DF @6%</th>
                    <th className="text-right py-1 pr-3">PV (M THB)</th>
                    <th className="text-right py-1">CCF (M THB)</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let ccf = 0;
                    return specs.cashFlows.map((cf, y) => {
                      ccf += cf;
                      const df = 1 / Math.pow(1.06, y);
                      return (
                        <tr key={y} className={cf < 0 ? 'text-volt-800' : ''}>
                          <td className="py-0.5 pr-3">{y}</td>
                          <td className="text-right py-0.5 pr-3">{(cf / 1e6).toFixed(3)}</td>
                          <td className="text-right py-0.5 pr-3">{y === 0 ? '1.000' : df.toFixed(4)}</td>
                          <td className="text-right py-0.5 pr-3">{(cf * df / 1e6).toFixed(3)}</td>
                          <td className="text-right py-0.5">{ccf >= 0 ? '' : '−'}{(Math.abs(ccf) / 1e6).toFixed(3)}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </details>
        )}
        <p className="text-xs text-ink-faint">
          [F-24] CF₀ = −CAPEX · {specs.cashFlowModel || 'CF_y = revenue − annual costs, per project-type model'} · [F-26] payback = first year CCF ≥ 0{fin.paybackInterpolated && fin.paybackInterpolated !== '—' ? ` (interpolated ≈ ${fin.paybackInterpolated} yrs)` : ''} ·
          [F-27] NPV at 6%, 25 yrs · [F-28] IRR via numerical root-finding — unlevered pre-tax, excludes tax/debt ·
          Revenue rates are scenarios, not confirmed entitlements
        </p>
      </Section>

      {/* H. Spec grid */}
      <Section title="I. Combined spec table" sub="Same values everywhere — cross-check against other sections">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
          <KV k="P_DC (nameplate)" v={specs.dcCapacityKWp ? `${specs.dcCapacityKWp} kWp` : specs.dcCapacityMWp ? `${specs.dcCapacityMWp} MWp` : '—'} src="calc" />
          <KV k="P_AC (inverter nameplate)" v={specs.acCapacityMW ? `${specs.acCapacityMW} MWac` : specs.pcsInverter || '—'} src="calc" />
          <KV k="DC/AC ratio" v={specs.actualDcAcRatio || '—'} src="calc" />
          <KV k="Panels" v={specs.moduleCount ? `${specs.moduleCount} × 620W` : '—'} src="calc" />
          <KV k="Inverters" v={specs.inverterCount ? `${specs.inverterCount} × 300kW` : specs.pcsInverter || '—'} src="demo" />
          <KV k="Transformer" v={specs.transformerRating || '—'} src="est" />
          <KV k="Generation/yr" v={specs.annualEnergyMWh ? `${specs.annualEnergyMWh} MWh` : '—'} src="calc" />
          <KV k="MV Cable" v={specs.mvCable || '—'} src="est" />
          <KV k="MV current (approx.)" v={specs.mvCurrentAmp ? `${specs.mvCurrentAmp} A` : '—'} src="est" />
        </div>
      </Section>
    </div>
  );
}
