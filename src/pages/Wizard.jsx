import React, { useMemo, useState } from 'react';
import { navigate } from '../router';
import { useApp } from '../state/AppState';
import { convertToSqMeters, convertSqMetersToThai } from '../utils/engineeringCalculations';
import { GOAL_OPTIONS, BUDGET_OPTIONS } from '../engine/recommend';
import GoogleMapPicker from '../components/GoogleMapPicker';
import { StepProgress, OptionCard, Collapsible, Note, ICONS } from '../components/ui';
import {
  Ruler, Mountain, ArrowLeft, ArrowRight, Check,
  Store, Waves, Trees, HelpCircle,
} from 'lucide-react';

const JOURNEY_STEPS = ['ที่ดินของคุณ', 'เป้าหมายและงบ', 'ทางเลือกแนะนำ', 'ดูแผน', 'เก็บแผน/รายงาน'];

const LAND_KINDS = [
  { id: 'open', icon: Mountain, title: 'ที่โล่งหรือที่ราบ', sub: 'พื้นว่าง ไม่มีอะไรบังแดด',
    patch: { landKind: 'open', landType: 'flat', hasWaterBody: false, landTypeUnknown: false, hasAgriculturalWaste: false, zoningColor: 'green' } },
  { id: 'agri', icon: SproutIcon, title: 'สวน / พื้นที่เกษตร', sub: 'ปลูกพืชหรือทำเกษตรอยู่',
    patch: { landKind: 'agri', landType: 'agri', hasWaterBody: false, landTypeUnknown: false, hasAgriculturalWaste: true, zoningColor: 'green' } },
  { id: 'roadside', icon: Store, title: 'ติดถนนหรือย่านการค้า', sub: 'รถผ่านสะดวก หน้ากว้าง',
    patch: { landKind: 'roadside', landType: 'flat', hasWaterBody: false, landTypeUnknown: false, hasAgriculturalWaste: false, roadType: 'main', roadWidthMeters: 12, zoningColor: 'orange' } },
  { id: 'pond', icon: Waves, title: 'มีบ่อน้ำ / สระน้ำ', sub: 'มีพื้นที่น้ำอยู่ในแปลง',
    patch: { landKind: 'pond', landType: 'pond', hasWaterBody: true, landTypeUnknown: false, hasAgriculturalWaste: false } },
  { id: 'slope', icon: Mountain, title: 'ที่ลาดเอียง', sub: 'เนินหรือพื้นที่ไม่เรียบ',
    patch: { landKind: 'slope', landType: 'slope', hasWaterBody: false, landTypeUnknown: false, hasAgriculturalWaste: false } },
  { id: 'unsure', icon: HelpCircle, title: 'ยังไม่แน่ใจ', sub: 'ใส่ค่าประมาณไปก่อนได้ ทีหลังค่อยแก้',
    patch: { landKind: 'unsure', landType: 'flat', landTypeUnknown: true } },
];

function SproutIcon(props) { return <Trees {...props} />; }

export default function Wizard() {
  const { land, goals, updateLand, updateGoals } = useApp();
  const [step, setStep] = useState(() => window.location.hash.includes('step=2') ? 1 : 0);
  const thai = convertSqMetersToThai(land.areaSqM);

  const canNext1 = land.areaSqM > 0;
  // landKind = การ์ดที่ผู้ใช้เลือกล่าสุด (fallback: เดาจากฟิลด์เดิมสำหรับ draft เก่า)
  const kind = LAND_KINDS.find(k => k.id === land.landKind)
    || (land.landTypeUnknown ? LAND_KINDS[5]
    : (land.hasWaterBody || land.landType === 'pond') ? LAND_KINDS[3]
    : land.landType === 'agri' ? LAND_KINDS[1]
    : land.landType === 'slope' ? LAND_KINDS[4]
    : (land.roadType === 'main' && land.zoningColor === 'orange') ? LAND_KINDS[2]
    : LAND_KINDS[0]);

  const finish = () => navigate('/results');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <StepProgress steps={JOURNEY_STEPS} current={step} />
      </div>

      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">ที่ดินของคุณอยู่ที่ไหน?</h1>
            <p className="text-sm text-ink-soft mt-1">ปักหมุดบนแผนที่ หรือค้นหาชื่ออำเภอ/จังหวัดก็ได้ — ไม่ต้องรู้พิกัดเป๊ะ ๆ</p>
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
                เราได้ตำแหน่งประมาณนี้แล้ว: <strong>{land.detectedProvinceName || land.provinceData.name}</strong>
                {land.detectedProvinceName && land.detectedProvinceName !== land.provinceData.name.split(' ')[0].split('/')[0] && (
                  <span className="text-ink-faint"> (ข้อมูลแดด/กริดอ้างอิงจาก{land.provinceData.name}เพราะยังไม่มีข้อมูลเฉพาะจังหวัดนี้)</span>
                )} —
                พื้นที่นี้มีแดดเฉลี่ย {land.provinceData.ghi} kWh/ตร.ม./วัน และอยู่ในเขต{land.provinceData.grid === 'MEA' ? 'การไฟฟ้านครหลวง' : 'การไฟฟ้าส่วนภูมิภาค'}
              </Note>
            )}
          </div>

          {/* Size */}
          <div className="card p-5">
            <h2 className="text-base font-semibold flex items-center gap-2 mb-1">
              <Ruler className="w-4 h-4 text-brand-600" /> ที่ดินมีขนาดประมาณเท่าไร?
            </h2>
            <p className="text-xs text-ink-faint mb-4">ไม่แน่ใจขนาดที่ดิน? ใส่ค่าประมาณไปก่อนได้ หรือวาดขอบเขตบนแผนที่ด้านบน</p>
            <div className="grid grid-cols-3 gap-3">
              {[['rai', 'ไร่'], ['ngan', 'งาน'], ['sqWah', 'ตารางวา']].map(([k, label]) => (
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
            <div className="mt-3 flex items-center justify-between rounded-xl bg-paper border border-[#E7E5DD] px-4 py-2.5 text-sm">
              <span className="text-ink-faint">พื้นที่รวม</span>
              <span className="font-semibold">{(land.areaSqM / 1600).toFixed(2)} ไร่ ≈ {land.areaSqM.toLocaleString()} ตร.ม.</span>
            </div>
            {land.areaSqM <= 0 && <Note type="warn">กรุณาใส่ขนาดพื้นที่อย่างน้อยคร่าว ๆ เพื่อให้ระบบประเมินได้</Note>}
          </div>

          {/* Land kind */}
          <div className="card p-5">
            <h2 className="text-base font-semibold flex items-center gap-2 mb-1">
              <Mountain className="w-4 h-4 text-brand-600" /> ที่ดินเป็นแบบไหน?
            </h2>
            <p className="text-xs text-ink-faint mb-4">เลือกแบบที่ใกล้ที่สุด — ถ้าไม่แน่ใจเลือก "ยังไม่แน่ใจ" ได้</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {LAND_KINDS.map(k => (
                <OptionCard
                  key={k.id}
                  icon={k.icon}
                  title={k.title}
                  sub={k.sub}
                  selected={kind?.id === k.id}
                  onClick={() => updateLand(k.patch)}
                />
              ))}
            </div>
          </div>

          {/* Optional extras */}
          <Collapsible
            title="ตอบเพิ่มถ้าทราบ (ช่วยให้ผลแม่นขึ้น)"
            sub="ข้ามได้ทั้งหมด — ระบบจะระบุไว้ว่าข้อมูลส่วนนี้ยังไม่มี"
          >
            <div className="space-y-5 pt-3">
              <div>
                <div className="text-sm font-medium mb-2">มีต้นไม้ใหญ่หรืออาคารบังแสงแดดไหม?</div>
                <div className="flex flex-wrap gap-2">
                  {[['ไม่มีหรือมีน้อย', false], ['มีบดบังพอสมควร', true], ['ไม่ทราบ', null]].map(([label, val]) => (
                    <button key={label} type="button"
                      onClick={() => updateLand({ hasShading: val })}
                      className={`chip border transition ${land.hasShading === val ? 'bg-brand-700 text-white border-brand-700' : 'bg-white border-[#DDDAD0] text-ink-soft hover:border-brand-400'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">มีอาคาร/บ่อ/สิ่งกีดขวางในพื้นที่ไหม? (จะหักออกจากพื้นที่ใช้งาน)</div>
                <div className="flex flex-wrap gap-2">
                  {[['ไม่มี', 'none'], ['มี — ระบุขนาด', 'yes'], ['ไม่ทราบ', 'unknown']].map(([label, val]) => (
                    <button key={val} type="button"
                      onClick={() => updateLand({ hasStructures: val, excludedAreaSqM: val === 'yes' ? land.excludedAreaSqM : 0 })}
                      className={`chip border transition ${land.hasStructures === val ? 'bg-brand-700 text-white border-brand-700' : 'bg-white border-[#DDDAD0] text-ink-soft hover:border-brand-400'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                {land.hasStructures === 'yes' && (
                  <div className="mt-2 flex items-center gap-2">
                    <input type="number" min="0" className="input-field w-32" placeholder="ตร.ม."
                      value={land.excludedAreaSqM || ''}
                      onChange={(e) => updateLand({ excludedAreaSqM: Math.max(0, Number(e.target.value) || 0) })} />
                    <span className="text-xs text-ink-soft">
                      ตร.ม. → พื้นที่ใช้งานเหลือ ≈ {Math.max(0, land.areaSqM - (land.excludedAreaSqM || 0)).toLocaleString()} ตร.ม.
                    </span>
                  </div>
                )}
                {land.hasStructures === 'unknown' && (
                  <p className="text-xs text-volt-700 mt-2">ไม่ทราบ — ระบบจะไม่สรุปว่าพื้นที่โล่ง แนะนำตรวจสอบภาคสนามก่อนตัดสินใจ</p>
                )}
              </div>
              <div>
                <div className="text-sm font-medium mb-2">เดินทางเข้าที่ดินสะดวกแค่ไหน?</div>
                <div className="flex flex-wrap gap-2">
                  {[['ติดถนนใหญ่', { roadType: 'main', roadWidthMeters: 12 }],
                    ['ถนนรอง/ลาดยาง', { roadType: 'secondary', roadWidthMeters: 8 }],
                    ['ทางลูกรัง/เข้ายาก', { roadType: 'dirt', roadWidthMeters: 4 }]].map(([label, patch]) => (
                    <button key={label} type="button"
                      onClick={() => updateLand(patch)}
                      className={`chip border transition ${land.roadType === patch.roadType ? 'bg-brand-700 text-white border-brand-700' : 'bg-white border-[#DDDAD0] text-ink-soft hover:border-brand-400'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">มีสายไฟแรงสูงผ่านใกล้ที่ดินไหม?</div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button type="button"
                    onClick={() => updateLand({ gridUnknown: true })}
                    className={`chip border transition ${land.gridUnknown ? 'bg-brand-700 text-white border-brand-700' : 'bg-white border-[#DDDAD0] text-ink-soft hover:border-brand-400'}`}>
                    ไม่ทราบ (ข้ามได้)
                  </button>
                  <button type="button"
                    onClick={() => updateLand({ gridUnknown: false })}
                    className={`chip border transition ${!land.gridUnknown ? 'bg-brand-700 text-white border-brand-700' : 'bg-white border-[#DDDAD0] text-ink-soft hover:border-brand-400'}`}>
                    ทราบคร่าว ๆ
                  </button>
                </div>
                {!land.gridUnknown ? (
                  <div>
                    <input type="range" min="20" max="2000" step="20" value={land.gridDistanceMeters}
                      onChange={(e) => updateLand({ gridDistanceMeters: parseInt(e.target.value) })}
                      className="w-full accent-brand-700" />
                    <div className="flex justify-between text-xs text-ink-faint mt-1">
                      <span>ติดขอบแปลง</span>
                      <span className="font-medium text-ink">ห่างประมาณ {land.gridDistanceMeters} เมตร</span>
                      <span>ไกลมาก</span>
                    </div>
                  </div>
                ) : (
                  <Note>ไม่เป็นไร — เราจะประเมินด้วยค่าประมาณและบอกไว้ในผลว่าควรตรวจสอบจุดเชื่อมต่อไฟฟ้ากับการไฟฟ้าพื้นที่ภายหลัง</Note>
                )}
              </div>
            </div>
          </Collapsible>

          <div className="flex items-center justify-between pt-2">
            <button onClick={() => navigate('/')} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> กลับหน้าแรก</button>
            <button onClick={() => setStep(1)} disabled={!canNext1} className="btn-primary">
              ถัดไป <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">คุณอยากให้ที่ดินแปลงนี้ช่วยเรื่องอะไร?</h1>
            <p className="text-sm text-ink-soft mt-1">เลือกได้มากกว่า 1 ข้อ หรือเลือก "ยังไม่มีไอเดีย" ให้ระบบช่วยแนะนำ</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GOAL_OPTIONS.map(g => {
              const sel = goals.aims.includes(g.id);
              return (
                <OptionCard
                  key={g.id}
                  icon={ICONS[g.icon]}
                  title={g.label}
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
              <div className="text-sm font-medium mb-2">ค่าไฟเฉลี่ยเดือนละประมาณเท่าไร? <span className="text-ink-faint font-normal">(ข้ามได้)</span></div>
              <div className="flex flex-wrap gap-2">
                {[['ต่ำกว่า 3,000', 2000], ['3,000–10,000', 6500], ['10,000–30,000', 20000], ['มากกว่า 30,000', 45000]].map(([label, val]) => (
                  <button key={label} type="button"
                    onClick={() => updateGoals({ monthlyBill: val })}
                    className={`chip border transition ${goals.monthlyBill === val ? 'bg-brand-700 text-white border-brand-700' : 'bg-white border-[#DDDAD0] text-ink-soft hover:border-brand-400'}`}>
                    {label} บาท
                  </button>
                ))}
              </div>
            </div>
          )}

          {goals.aims.includes('ev') && (
            <div className="card p-5">
              <div className="text-sm font-medium mb-2">ที่ดินติดถนนที่มีรถผ่านมากไหม? <span className="text-ink-faint font-normal">(ข้ามได้)</span></div>
              <div className="flex flex-wrap gap-2">
                {[['รถผ่านมาก', 'high'], ['ปานกลาง', 'medium'], ['ไม่ค่อยมี', 'low'], ['ไม่ทราบ', 'unknown']].map(([label, val]) => (
                  <button key={label} type="button"
                    onClick={() => updateGoals({ evTraffic: val })}
                    className={`chip border transition ${goals.evTraffic === val ? 'bg-brand-700 text-white border-brand-700' : 'bg-white border-[#DDDAD0] text-ink-soft hover:border-brand-400'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="card p-5">
            <h2 className="text-base font-semibold mb-1">มีงบลงทุนในใจหรือยัง?</h2>
            <p className="text-xs text-ink-faint mb-4">ช่วงงบนี้ใช้กรองทางเลือกให้เหมาะกับคุณ ไม่ใช่ราคาจริงของโครงการ</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BUDGET_OPTIONS.map(b => (
                <button key={b.id} type="button"
                  onClick={() => updateGoals({ budget: b.id })}
                  className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition ${
                    goals.budget === b.id ? 'border-brand-600 bg-brand-50/60 text-brand-900' : 'border-[#E7E5DD] bg-white hover:border-brand-300'
                  }`}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button onClick={() => setStep(0)} className="btn-ghost"><ArrowLeft className="w-4 h-4" /> กลับ</button>
            <button onClick={finish} className="btn-primary text-base px-7">
              <Check className="w-4 h-4" /> ดูทางเลือกที่แนะนำ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
