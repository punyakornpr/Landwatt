import React, { useMemo, useState } from 'react';
import { navigate } from '../router';
import { useApp } from '../state/AppState';
import { convertToSqMeters, convertSqMetersToThai } from '../utils/engineeringCalculations';
import { GOAL_OPTIONS, BUDGET_OPTIONS } from '../engine/recommend';
import GoogleMapPicker from '../components/GoogleMapPicker';
import geoGrid from '../assets/geo-grid.svg';
import { StepProgress, OptionCard, Collapsible, Note, ICONS } from '../components/ui';
import { useT } from '../i18n';
import {
  Ruler, Mountain, ArrowLeft, ArrowRight, Check,
  Store, Waves, Trees, HelpCircle, Building2,
} from 'lucide-react';

const JOURNEY_STEPS = ['Your land', 'Goals & budget', 'Suggested options', 'Review plan', 'Save/report'];

const LAND_KINDS = [
  { id: 'open', icon: Mountain, title: 'Open or flat land', titleTh: 'ที่ดินโล่ง / ราบ', sub: 'Empty land, nothing shading it', subTh: 'ที่ว่าง ไม่มีอะไรบัง',
    patch: { landKind: 'open', landType: 'flat', hasWaterBody: false, landTypeUnknown: false, hasAgriculturalWaste: false, zoningColor: 'green' } },
  { id: 'agri', icon: SproutIcon, title: 'Orchard / farmland', titleTh: 'สวน / ไร่ / นา', sub: 'Currently planted or farmed', subTh: 'ปลูกพืชหรือทำเกษตรอยู่',
    patch: { landKind: 'agri', landType: 'agri', hasWaterBody: false, landTypeUnknown: false, hasAgriculturalWaste: true, zoningColor: 'green' } },
  { id: 'roadside', icon: Store, title: 'Roadside / commercial', titleTh: 'ติดถนน / เชิงพาณิชย์', sub: 'Easy vehicle access, wide frontage', subTh: 'รถเข้าออกง่าย หน้าแปลงกว้าง',
    patch: { landKind: 'roadside', landType: 'flat', hasWaterBody: false, landTypeUnknown: false, hasAgriculturalWaste: false, roadType: 'main', roadWidthMeters: 12, zoningColor: 'orange' } },
  { id: 'urban', icon: Building2, title: 'In-town / village lot', titleTh: 'ในเมือง / ในหมู่บ้าน', sub: 'Surrounded by houses, on a soi', subTh: 'มีบ้านล้อมรอบ อยู่ในซอย',
    patch: { landKind: 'urban', landType: 'flat', hasWaterBody: false, landTypeUnknown: false, hasAgriculturalWaste: false, hasStructures: true, roadType: 'secondary', roadWidthMeters: 6, zoningColor: 'yellow', gridDistanceMeters: 50, gridUnknown: false } },
  { id: 'pond', icon: Waves, title: 'Has a pond / water body', titleTh: 'มีบ่อ / แหล่งน้ำ', sub: 'Part of the plot is water', subTh: 'แปลงบางส่วนเป็นน้ำ',
    patch: { landKind: 'pond', landType: 'pond', hasWaterBody: true, landTypeUnknown: false, hasAgriculturalWaste: false } },
  { id: 'slope', icon: Mountain, title: 'Sloped land', titleTh: 'ที่ดินลาดเอียง', sub: 'Hills or uneven terrain', subTh: 'เนินเขาหรือพื้นไม่เรียบ',
    patch: { landKind: 'slope', landType: 'slope', hasWaterBody: false, landTypeUnknown: false, hasAgriculturalWaste: false } },
  { id: 'unsure', icon: HelpCircle, title: 'Not sure yet', titleTh: 'ยังไม่แน่ใจ', sub: 'Enter rough values now, refine later', subTh: 'ใส่ค่าคร่าว ๆ ก่อน แก้ทีหลังได้',
    patch: { landKind: 'unsure', landType: 'flat', landTypeUnknown: true } },
];

function SproutIcon(props) { return <Trees {...props} />; }

export default function Wizard() {
  const { land, goals, updateLand, updateGoals, lang } = useApp();
  const t = useT();
  const [step, setStep] = useState(() => window.location.hash.includes('step=2') ? 1 : 0);
  const thai = convertSqMetersToThai(land.areaSqM);

  const canNext1 = land.areaSqM > 0;
  // landKind = last card the user picked (fallback: infer from old fields for old drafts)
  const kind = LAND_KINDS.find(k => k.id === land.landKind)
    || (land.landTypeUnknown ? LAND_KINDS[6]
    : (land.hasWaterBody || land.landType === 'pond') ? LAND_KINDS[4]
    : land.landType === 'agri' ? LAND_KINDS[1]
    : land.landType === 'slope' ? LAND_KINDS[5]
    : (land.roadType === 'main' && land.zoningColor === 'orange') ? LAND_KINDS[2]
    : LAND_KINDS[0]);

  const finish = () => navigate('/results');

  return (
    <div className="relative">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(#F3F7FC, #FFFFFF 60%)',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: `url(${geoGrid})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '60px 52px',
          opacity: 0.55,
          maskImage: 'linear-gradient(to bottom, black 55%, transparent 95%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 95%)',
        }} />
        <div className="absolute inset-x-0 top-0 h-[300px]" style={{
          background: 'linear-gradient(rgba(37,99,235,0.08), transparent)',
        }} />
      </div>
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <StepProgress steps={JOURNEY_STEPS.map(t)} current={step} />
      </div>

      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{t('Where is your land?')}</h1>
            <p className="text-sm text-ink-soft mt-1">{t('Drop a pin on the map or search a district/province name — exact coordinates not needed')}</p>
          </div>

          {/* Location */}
          <div className="card p-5 space-y-4">
            <GoogleMapPicker
              coordinates={land.coordinates}
              onCoordinatesChange={(c) => updateLand({ coordinates: c })}
              onProvinceAutoSelect={(prov, actualName) => updateLand({ provinceId: prov.id, provinceData: prov, detectedProvinceName: actualName })}
              gridDistanceMeters={land.gridDistanceMeters}
              onGridDistanceChange={(d) => updateLand({ gridDistanceMeters: d, gridUnknown: false })}
              currentAreaSqM={land.areaSqM}
              onApplyDrawnArea={(sqM) => updateLand({ areaSqM: sqM })}
            />
            {land.provinceData && (
              <Note type="ok">
                {t('We located roughly here:')} <strong>{land.detectedProvinceName || land.provinceData.nameEn || land.provinceData.name}</strong>
                {land.detectedProvinceName && land.detectedProvinceName !== (land.provinceData.nameEn || land.provinceData.name).split('/')[0].trim() && (
                  <span className="text-ink-faint"> ({t('solar/grid data referenced from')} {land.provinceData.nameEn || land.provinceData.name} — {t('no province-specific data yet')})</span>
                )} —{' '}
                {t('This area averages {ghi} kWh/m²/day of sun and is in the {grid} grid zone')
                  .replace('{ghi}', land.provinceData.ghi)
                  .replace('{grid}', land.provinceData.grid === 'MEA' ? t('MEA (metropolitan)') : t('PEA (provincial)'))}
              </Note>
            )}
          </div>

          {/* Size */}
          <div className="card p-5">
            <h2 className="text-base font-semibold flex items-center gap-2 mb-1">
              <Ruler className="w-4 h-4 text-brand-600" /> {t('Roughly how big is the land?')}
            </h2>
            <p className="text-xs text-ink-faint mb-4">{t('Not sure of the size? Enter a rough value or draw the boundary on the map above')}</p>
            <div className="grid grid-cols-3 gap-3">
              {[['rai', t('Rai')], ['ngan', t('Ngan')], ['sqWah', t('Sq. wah')]].map(([k, label]) => (
                <div key={k}>
                  <label className="block text-xs text-ink-faint mb-1">{label}</label>
                  <input
                    type="number" min="0" className="input-field text-center font-mono"
                    value={thai[k]}
                    onChange={(e) => {
                      const next = { ...thai, [k]: Math.max(0, parseFloat(e.target.value) || 0) };
                      updateLand({ areaSqM: convertToSqMeters(next.rai, next.ngan, next.sqWah) });
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-paper border border-[#E8E8ED] px-4 py-2.5 text-sm">
              <span className="text-ink-faint">{t('Total area')}</span>
              <span className="font-semibold">{(land.areaSqM / 1600).toFixed(2)} {t('rai')} ≈ {land.areaSqM.toLocaleString()} m²</span>
            </div>
            {land.areaSqM <= 0 && <Note type="warn">{t('Please enter at least a rough area so the system can estimate')}</Note>}
          </div>

          {/* Land kind */}
          <div className="card p-5">
            <h2 className="text-base font-semibold flex items-center gap-2 mb-1">
              <Mountain className="w-4 h-4 text-brand-600" /> {t('What kind of land is it?')}
            </h2>
            <p className="text-xs text-ink-faint mb-4">{t('Pick the closest match — if unsure, choose "Not sure yet"')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LAND_KINDS.map(k => (
                <OptionCard
                  key={k.id}
                  icon={k.icon}
                  title={lang === 'th' ? k.titleTh : k.title}
                  sub={lang === 'th' ? k.subTh : k.sub}
                  selected={kind?.id === k.id}
                  onClick={() => updateLand(k.patch)}
                />
              ))}
            </div>
          </div>

          {/* Optional extras */}
          <Collapsible
            title={t('Answer more if you know (improves accuracy)')}
            sub={t('All skippable — the system will note missing data')}
          >
            <div className="space-y-5 pt-3">
              <div>
                <div className="text-sm font-medium mb-2">{t('Do large trees or buildings shade the site?')}</div>
                <div className="flex flex-wrap gap-2">
                  {[[t('None or little'), false], [t('Noticeable shading'), true], [t('Unknown'), null]].map(([label, val]) => (
                    <button key={String(label)} type="button"
                      onClick={() => updateLand({ hasShading: val })}
                      className={`chip border transition ${land.hasShading === val ? 'bg-brand-700 text-white border-brand-700' : 'bg-white border-[#D2D2D7] text-ink-soft hover:border-brand-400'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">{t('Any buildings/ponds/obstructions? (deducted from usable area)')}</div>
                <div className="flex flex-wrap gap-2">
                  {[[t('None'), 'none'], [t('Yes — specify size'), 'yes'], [t('Unknown'), 'unknown']].map(([label, val]) => (
                    <button key={val} type="button"
                      onClick={() => updateLand({ hasStructures: val, excludedAreaSqM: val === 'yes' ? land.excludedAreaSqM : 0 })}
                      className={`chip border transition ${land.hasStructures === val ? 'bg-brand-700 text-white border-brand-700' : 'bg-white border-[#D2D2D7] text-ink-soft hover:border-brand-400'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                {land.hasStructures === 'yes' && (
                  <div className="mt-2 flex items-center gap-2">
                    <input type="number" min="0" className="input-field w-32" placeholder="m²"
                      value={land.excludedAreaSqM || ''}
                      onChange={(e) => updateLand({ excludedAreaSqM: Math.max(0, Number(e.target.value) || 0) })} />
                    <span className="text-xs text-ink-soft">
                      {t('m² → usable left ≈ {n} m²').replace('{n}', Math.max(0, land.areaSqM - (land.excludedAreaSqM || 0)).toLocaleString())}
                    </span>
                  </div>
                )}
                {land.hasStructures === 'unknown' && (
                  <p className="text-xs text-volt-700 mt-2">{t('Unknown — the system will not assume open land; a site visit is recommended')}</p>
                )}
              </div>
              <div>
                <div className="text-sm font-medium mb-2">{t('How easy is road access to the land?')}</div>
                <div className="flex flex-wrap gap-2">
                  {[[t('On a main road'), { roadType: 'main', roadWidthMeters: 12 }],
                    [t('Secondary/paved road'), { roadType: 'secondary', roadWidthMeters: 8 }],
                    [t('Dirt road/hard to reach'), { roadType: 'dirt', roadWidthMeters: 4 }]].map(([label, patch]) => (
                    <button key={String(label)} type="button"
                      onClick={() => updateLand(patch)}
                      className={`chip border transition ${land.roadType === patch.roadType ? 'bg-brand-700 text-white border-brand-700' : 'bg-white border-[#D2D2D7] text-ink-soft hover:border-brand-400'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">{t('Is a power line near the land?')}</div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button type="button"
                    onClick={() => updateLand({ gridUnknown: true })}
                    className={`chip border transition ${land.gridUnknown ? 'bg-brand-700 text-white border-brand-700' : 'bg-white border-[#D2D2D7] text-ink-soft hover:border-brand-400'}`}>
                    {t('Unknown (skip)')}
                  </button>
                  <button type="button"
                    onClick={() => updateLand({ gridUnknown: false })}
                    className={`chip border transition ${!land.gridUnknown ? 'bg-brand-700 text-white border-brand-700' : 'bg-white border-[#D2D2D7] text-ink-soft hover:border-brand-400'}`}>
                    {t('Know roughly')}
                  </button>
                </div>
                {!land.gridUnknown ? (
                  <div>
                    <input type="range" min="20" max="2000" step="20" value={land.gridDistanceMeters}
                      onChange={(e) => updateLand({ gridDistanceMeters: parseInt(e.target.value) })}
                      style={{ '--fill': `${((land.gridDistanceMeters - 20) / 1980) * 100}%` }}
                      className="w-full" />
                    <div className="flex justify-between text-xs text-ink-faint mt-1">
                      <span>{t('Adjacent')}</span>
                      <span className="font-medium text-ink">{t('about {d} m away').replace('{d}', land.gridDistanceMeters)}</span>
                      <span>{t('Very far')}</span>
                    </div>
                  </div>
                ) : (
                  <Note>{t('No problem — we will estimate and flag in results that the grid connection point should be confirmed with the local utility')}</Note>
                )}
              </div>
            </div>
          </Collapsible>

          <div className="flex items-center justify-between pt-2">
            <button onClick={() => navigate('/')} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> {t('Back to home')}</button>
            <button onClick={() => setStep(1)} disabled={!canNext1} className="btn-primary text-base px-6 py-3">
              {t('Next')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{t('What do you want this land to help with?')}</h1>
            <p className="text-sm text-ink-soft mt-1">{t('Pick more than one, or "No idea yet" and let the system suggest')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GOAL_OPTIONS.map(g => {
              const sel = goals.aims.includes(g.id);
              return (
                <OptionCard
                  key={g.id}
                  icon={ICONS[g.icon]}
                  title={lang === 'th' ? g.labelTh : g.label}
                  selected={sel}
                  onClick={() => {
                    const aims = sel ? goals.aims.filter(a => a !== g.id) : [...goals.aims, g.id];
                    updateGoals({ aims });
                  }}
                />
              );
            })}
          </div>

          {goals.aims.includes('save') && (
            <div className="card p-5">
              <div className="text-sm font-medium mb-2">{t('Average monthly electricity bill?')} <span className="text-ink-faint font-normal">{t('(optional)')}</span></div>
              <div className="flex flex-wrap gap-2">
                {[[t('Under') + ' 3,000', 2000], ['3,000–10,000', 6500], ['10,000–30,000', 20000], [t('Over') + ' 30,000', 45000]].map(([label, val]) => (
                  <button key={label} type="button"
                    onClick={() => updateGoals({ monthlyBill: val })}
                    className={`chip border transition ${goals.monthlyBill === val ? 'bg-brand-700 text-white border-brand-700' : 'bg-white border-[#D2D2D7] text-ink-soft hover:border-brand-400'}`}>
                    {label} {t('THB')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {goals.aims.includes('ev') && (
            <div className="card p-5">
              <div className="text-sm font-medium mb-2">{t('Is the land on a busy road?')} <span className="text-ink-faint font-normal">{t('(optional)')}</span></div>
              <div className="flex flex-wrap gap-2">
                {[[t('Heavy traffic'), 'high'], [t('Moderate'), 'medium'], [t('Quiet'), 'low'], [t('Unknown'), 'unknown']].map(([label, val]) => (
                  <button key={label} type="button"
                    onClick={() => updateGoals({ evTraffic: val })}
                    className={`chip border transition ${goals.evTraffic === val ? 'bg-brand-700 text-white border-brand-700' : 'bg-white border-[#D2D2D7] text-ink-soft hover:border-brand-400'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="card p-5">
            <h2 className="text-base font-semibold mb-1">{t('Do you have a budget in mind?')}</h2>
            <p className="text-xs text-ink-faint mb-4">{t('This range filters suitable options — not a real project price')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BUDGET_OPTIONS.map(b => (
                <button key={b.id} type="button"
                  onClick={() => updateGoals({ budget: b.id })}
                  className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition ${
                    goals.budget === b.id ? 'border-brand-600 bg-brand-50/60 text-brand-900' : 'border-[#E8E8ED] bg-white hover:border-brand-300'
                  }`}>
                  {lang === 'th' ? b.labelTh : b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setStep(0)} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> {t('Back')}</button>
            <button onClick={finish} className="btn-primary text-base px-7 py-3">
              <Check className="w-4 h-4" /> {t('See suggested options')}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
