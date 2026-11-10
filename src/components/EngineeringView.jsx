import React from 'react';
import SingleLineDiagram from './SingleLineDiagram';
import FinancialYieldChart from './FinancialYieldChart';
import { Note, fmtTHB } from './ui';

// ชิปที่มาของข้อมูล: user = ผู้ใช้ระบุ, demo = ค่าสาธิต, est = ประมาณการ, calc = คำนวณได้
const SRC = {
  user: ['ข้อมูลที่คุณระบุ', 'bg-electric-100 text-electric-800'],
  demo: ['ค่าสาธิต (Demo)', 'bg-volt-100 text-volt-800'],
  est: ['ประมาณการ', 'bg-[#EDECE5] text-ink-soft'],
  calc: ['คำนวณ', 'bg-energy-100 text-energy-800'],
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

function Trace({ fid, name, formula, sub, result, note }) {
  return (
    <div className="rounded-xl border border-[#E7E5DD] p-4 space-y-1.5">
      <div className="flex items-baseline gap-2">
        <span className="text-[10px] font-mono font-bold bg-brand-700 text-white rounded px-1.5 py-0.5">{fid}</span>
        <span className="text-sm font-semibold">{name}</span>
      </div>
      <div className="font-mono text-xs text-ink-soft">{formula}</div>
      <div className="font-mono text-xs">{sub}</div>
      <div className="font-mono text-sm font-bold text-brand-800">{result}</div>
      {note && <div className="text-[11px] text-ink-faint">{note}</div>}
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
  // ใช้ค่าดิบก่อนปัดเสมอ: จำนวนแผงจริง × 620W — specs.dcCapacityKWp เป็น Math.round แล้ว
  const sd_ = specs.stringDesign;
  const dcKwp = sd_ ? (sd_.installedPanelCount * 620) / 1000 : (specs.dcCapacityKWp || parseFloat(specs.dcCapacityMWp || 0) * 1000);
  const acKw = (specs.inverterCount || 0) * 300;
  const fin = specs.financials || {};

  return (
    <div className="space-y-6">
      <Note type="warn">
        มุมมองวิศวกรรม — แสดงสูตร การแทนค่า และข้อจำกัดของการคำนวณชุดเดียวกับที่ใช้ในมุมมองผู้ใช้ทั่วไป
        เป็น<strong>การประเมินเบื้องต้น</strong> ไม่ใช่แบบก่อสร้างหรือการรับรองการเชื่อมต่อระบบไฟฟ้า
      </Note>

      {/* A. Inputs & data quality */}
      <Section title="A. ข้อมูลนำเข้าและคุณภาพข้อมูล" sub="แหล่งที่มาของแต่ละค่าถูกระบุไว้ — ค่าสาธิตไม่ใช่ข้อมูลวัดจริง">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <KV k="พื้นที่รวม" v={`${(land.areaSqM || 0).toLocaleString()} ตร.ม. (${areaRai.toFixed(3)} ไร่)`} src="user" />
          <KV k="พื้นที่ยกเว้น (อาคาร/บ่อ)" v={`${(specs.excludedAreaSqM || 0).toLocaleString()} ตร.ม.`} src="user" />
          <KV k="รังสีแดดเฉลี่ย GHI" v={`${land.provinceData?.ghi || '5.1'} kWh/ตร.ม./วัน`} src="est" />
          <KV k="ระยะถึงสายไฟ" v={land.gridUnknown ? 'ไม่ทราบ' : `~${land.gridDistanceMeters} ม. (ประมาณ)`} src={land.gridUnknown ? 'est' : 'user'} />
          <KV k="พิกัดแผง/อินเวอร์เตอร์" v="Demo Catalog (ไม่ใช่ datasheet จริง)" src="demo" />
          <KV k="อัตรา FiT" v="2.1679 ฿/kWh — สถานการณ์สมมติ" src="demo" />
        </div>
      </Section>

      {/* B. Land calc */}
      <Section title="B. การคำนวณพื้นที่" sub="การแปลงหน่วยและพื้นที่ใช้งานสุทธิ">
        <Trace fid="F-01" name="พื้นที่รวม (ไร่)"
          formula="A = 1600R + 400N + 4W  (ตร.ม.) ;  R_total = A/1600"
          sub={`${(land.areaSqM || 0).toLocaleString()} / 1600`}
          result={`= ${areaRai.toFixed(4)} ไร่`}
          note="พื้นที่จากการวาดแปลง/กรอก — ไม่ใช่รังวัดกรรมสิทธิ์" />
        <Trace fid="F-02" name="พื้นที่ใช้งานสุทธิ"
          formula="A_usable = (A_total − A_excluded) × 0.78  (สัดส่วนหักระยะร่น/ถนน/ลานอุปกรณ์)"
          sub={`(${ (land.areaSqM||0).toLocaleString() } − ${(specs.excludedAreaSqM||0).toLocaleString()}) × 0.78`}
          result={`= ${(((land.areaSqM||0) - (specs.excludedAreaSqM||0)) * 0.78).toLocaleString(undefined,{maximumFractionDigits:0})} ตร.ม.`}
          note="78% เป็นสมมติฐานการออกแบบ ไม่ใช่ข้อกฎหมาย" />
      </Section>

      {/* C. Solar PV */}
      {isPV && sd && (
        <Section title="C. การคำนวณโซลาร์เซลล์ (PV)" sub="จำนวนแผง สตริง อินเวอร์เตอร์ และผลผลิต — จาก Demo Catalog เดียวกันทั้งหมด">
          <Trace fid="F-04" name="กำลังติดตั้ง DC"
            formula="P_DC = N_installed × P_module / 1000"
            sub={`${sd.installedPanelCount.toLocaleString()} × 620 / 1000`}
            result={`= ${(sd.installedPanelCount * 620 / 1000).toLocaleString()} kWp (${(sd.installedPanelCount * 620 / 1e6).toFixed(3)} MWp)`}
            note={`candidate จากพื้นที่ ${specs.areaCandidatePanelCount || '—'} แผง → เต็มสตริง ${sd.installedPanelCount.toLocaleString()} แผง`} />
          <Trace fid="F-05" name="ตรวจแรงดันสตริงเมื่ออุณหภูมิเปลี่ยน"
            formula="V_oc(T) = Voc_STC × [1 + β(T−25)] ; ตรวจ V_string ≤ V_DC,max และอยู่ในช่วง MPPT"
            sub={`V_oc(10°C) = 45.2 × [1 − 0.0025×15] = ${sd.vocCold} V → ${sd.stringSize}×${sd.vocCold} = ${(sd.stringSize * parseFloat(sd.vocCold)).toFixed(0)} V ≤ ${sd.vdcMax} V
V_mp(60°C) = 38.1 × [1 − 0.0030×35] = ${sd.vmpHot} V → ${sd.stringSize}×${sd.vmpHot} = ${(sd.stringSize * parseFloat(sd.vmpHot)).toFixed(0)} V ∈ [${sd.mpptMin}, ${sd.mpptMax}] V`}
            result={`ผ่านเงื่อนไข — ${sd.stringCount.toLocaleString()} สตริง × ${sd.stringSize} แผง, ไม่เหลือแผงค้าง ${sd.leftoverPanels} แผง`}
            note="linear approximation ตาม datasheet — ยังไม่ได้ตรวจกระแส Isc/MPPT input current (ข้อมูล demo ไม่พอ)" />
          <Trace fid="F-06" name="พิกัด AC อินเวอร์เตอร์ (nameplate)"
            formula="P_AC,rated = N_inv × P_inv,rated"
            sub={`${specs.inverterCount} × 300`}
            result={`= ${acKw.toLocaleString()} kWac (${(acKw / 1000).toFixed(3)} MWac)`}
            note="เป็น nameplate รวมของอินเวอร์เตอร์ ไม่ใช่กำลังที่ต้องการหรือ export limit" />
          <Trace fid="F-07" name="อัตราส่วน DC/AC"
            formula="R = P_DC / P_AC,rated"
            sub={`${dcKwp.toLocaleString()} / ${acKw.toLocaleString()}`}
            result={`= ${specs.actualDcAcRatio}`}
            note="ค่าออกแบบเป้าหมาย ~1.25 — ค่าจริงหลังปัดจำนวนอินเวอร์เตอร์อาจต่างออกไป" />
          {specs.annualEnergyMWh && (
            <Trace fid="F-09A" name="ผลิตไฟฟ้ารายปี (เส้นทาง specific yield)"
              formula="E_year = P_DC × Y_specific ;  Y_specific ≈ GHI × 365 × PR (ประมาณการ)"
              sub={`${dcKwp.toLocaleString()} kWp × (${land.provinceData?.ghi || 5.1} × 365 × 0.80)`}
              result={`≈ ${specs.annualEnergyMWh} MWh/ปี`}
              note="ค่าประมาณรวม loss แล้ว (PR=0.80) — ไม่หัก loss ซ้ำ และไม่ใช่การจำลองรายชั่วโมง" />
          )}
          {specs.transformerRating && (
            <Trace fid="F-14" name="หม้อแปลงเบื้องต้น"
              formula="S_required = P_AC / PF ; เลือกพิกัดมาตรฐาน"
              sub={`${acKw.toLocaleString()} / 0.95 = ${(acKw / 0.95).toFixed(0)} kVA`}
              result={`→ ${specs.transformerRating}`}
              note="การประเมินเบื้องต้น — ไม่ใช่การรับรองขนาดจริงหรือการเชื่อมต่อระบบจำหน่าย" />
          )}
        </Section>
      )}

      {/* D. EV */}
      {isEV && (
        <Section title="D. การคำนวณสถานีชาร์จ (EV)" sub="แยกพิกัด DC output จาก AC input ชัดเจน">
          <Trace fid="F-12" name="โหลด AC ของเครื่องชาร์จ DC"
            formula="P_AC,in = Σ P_DC,out / η_charger"
            sub={`${specs.dcChargersCount} × 180 / 0.95`}
            result={`= ${(specs.dcChargersCount * 180 / 0.95).toFixed(1)} kW AC (connected)`}
            note="พิกัด 180 kW เป็น DC output — หาร efficiency เพื่อได้โหลดฝั่งไฟฟ้า" />
          <Trace fid="F-13" name="ดีมานด์สูงสุดและกระแส 3 เฟส"
            formula="P_demand = P_connected × DF ;  I = P/(√3·V_LL·PF)"
            sub={`${(specs.dcChargersCount * 180 / 0.95).toFixed(1)} × 0.70 → I = P/(√3×400×0.98)`}
            result={`≈ ${(specs.dcChargersCount * 180 / 0.95 * 0.7).toFixed(1)} kW, ${(specs.dcChargersCount * 180 / 0.95 * 0.7 * 1000 / (Math.sqrt(3) * 400 * 0.98)).toFixed(0)} A`}
            note="DF 0.70 เป็นสมมติฐาน power management — ยังไม่มี load profile จริง" />
          <Trace fid="F-14" name="หม้อแปลงเบื้องต้น"
            formula="S_required = (P_demand − BESS assist) / PF ; เลือกพิกัดมาตรฐาน"
            sub={`(${(specs.dcChargersCount * 180 / 0.95 * 0.7).toFixed(1)} − ${(specs.bessKWh || 0) / 2}) / 0.98`}
            result={`→ ${specs.transformerRating}`}
            note="การประเมินเบื้องต้น — BESS ช่วยลด peak ตามสมมติฐาน ยังไม่ใช่ค่ายืนยัน" />
        </Section>
      )}

      {/* E. BESS / other — ขอบเขตตามจริง */}
      {(isBESS || isBio) && (
        <Section title="E. ขอบเขตการคำนวณของโครงการนี้" sub="ระบุตรง ๆ ว่าอะไรคำนวณได้และอะไรยังไม่ได้">
          {isBESS && (
            <div className="text-sm space-y-2">
              <div>ขนาดพลังงาน: {specs.capacityMWh || '—'} MWh · {specs.containerCount || '—'} ตู้คอนเทนเนอร์</div>
              <Note type="warn">ยังไม่ได้จำลอง SOC รายขั้นตอน (F-16–F-19) — รายได้จากบริการระบบไฟฟ้าต้องอาศัยสัญญาจริง จึงแสดงเป็นแนวคิดและการคัดกรองเท่านั้น</Note>
            </div>
          )}
          {isBio && (
            <div className="text-sm space-y-2">
              <div>กำลังเครื่องกำเนิดประมาณการ: {specs.generatorCapacityKW || '—'} kW</div>
              <Note type="warn">ยังไม่มีชุดสูตรอนุมัติสำหรับปริมาณก๊าซ/ผลผลิต biogas — ผลลัพธ์เป็นการประเมินเบื้องต้นจากพื้นที่และสมมติฐานวัตถุดิบ ไม่ใช่การออกแบบโรงงาน</Note>
            </div>
          )}
        </Section>
      )}

      {/* F. SLD */}
      <Section title="F. อุปกรณ์และแผนผังระบบ (SLD)" sub="วาดจากค่าชุดเดียวกับตารางข้างบน — แบบร่างเชิงแนวคิด ไม่ใช่แบบก่อสร้าง">
        <SingleLineDiagram project={project} specs={specs} landData={land} />
        <p className="text-xs text-ink-faint">แผนผังเส้นเดียวนี้เป็น preliminary concept — protection/metering/utility interface ยังไม่ผ่านการตรวจสอบจริง</p>
      </Section>

      {/* G. Financial engineering */}
      <Section title="G. การคำนวณทางการเงิน" sub="กระแสเงินสดชุดเดียวกับกราฟและการ์ดสรุป">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <KV k="CAPEX" v={fin.totalCapexMillionTHB ? `${fin.totalCapexMillionTHB} ล้าน฿` : '—'} src="calc" />
          <KV k="รายได้รวม/ปี" v={fin.annualRevenueMillionTHB ? `${fin.annualRevenueMillionTHB} ล้าน฿` : '—'} src="calc" />
          <KV k="เงินสดสุทธิ/ปี" v={fin.netAnnualCashflowMillionTHB ? `${fin.netAnnualCashflowMillionTHB} ล้าน฿` : (fin.netAnnualProfitMillionTHB ? `${fin.netAnnualProfitMillionTHB} ล้าน฿` : '—')} src="calc" />
          <KV k="CAPEX ต่อหน่วย" v={specs.capexPerMWpMillionTHB ? `~${specs.capexPerMWpMillionTHB} ล้าน฿/MWp` : 'อัตรารวมตามประเภท'} src="demo" />
        </div>
        {specs.dualIncome && (
          <div className="text-xs rounded-lg bg-paper border border-[#E7E5DD] p-3">
            รายได้แยกส่วน — ไฟฟ้า {fmtTHB(specs.dualIncome.powerRevenueMillionTHB)}/ปี (FiT สมมติฐาน) + พืชผล {fmtTHB(specs.dualIncome.agriRevenueMillionTHB)}/ปี (ประมาณการ ไม่ได้ระบุพืชจริง ห้ามถือเป็นค่ายืนยัน)
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <KV k="คืนทุน (ปีแรกที่ CCF ≥ 0)" v={fin.paybackYears ? `${fin.paybackYears} ปี` : '—'} src="calc" />
          <KV k="NPV 25 ปี @ 6%" v={fin.npv25YrMillionTHB ? `${fin.npv25YrMillionTHB} ล้าน฿` : '—'} src="calc" />
          <KV k="IRR" v={fin.irrPercent ? `${fin.irrPercent}%` : '—'} src="calc" />
        </div>
        <FinancialYieldChart project={project} specs={specs} landData={land} />
        {(specs.cashFlows?.length > 1) && (
          <details className="rounded-lg border border-[#E7E5DD]">
            <summary className="cursor-pointer text-xs font-semibold px-4 py-3">
              ตารางกระแสเงินสดปี 0–{(specs.cashFlows.length - 1)} (ตรวจ Payback/NPV/IRR ย้อนได้)
            </summary>
            <div className="px-4 pb-4 overflow-x-auto">
              <table className="text-[11px] font-mono w-full">
                <thead>
                  <tr className="text-ink-faint border-b border-[#E7E5DD]">
                    <th className="text-left py-1 pr-3">ปี</th>
                    <th className="text-right py-1 pr-3">CF (ล้าน฿)</th>
                    <th className="text-right py-1 pr-3">DF @6%</th>
                    <th className="text-right py-1 pr-3">PV (ล้าน฿)</th>
                    <th className="text-right py-1">CCF (ล้าน฿)</th>
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
          [F-24] CF₀ = −CAPEX, CF_y = R_PV,1×(1−d)^(y−1) + R_crop + Savings − OPEX (เสื่อมเฉพาะไฟฟ้า, รายได้พืชคงที่) · [F-26] คืนทุน = ปีแรกที่ CCF ≥ 0{fin.paybackInterpolated && fin.paybackInterpolated !== '—' ? ` (interpolated ≈ ${fin.paybackInterpolated} ปี)` : ''} ·
          [F-27] NPV ที่ 6% 25 ปี · [F-28] IRR หารากเชิงตัวเลข — unlevered pre-tax ไม่รวมภาษี/เงินกู้ ·
          อัตรา FiT เป็นสถานการณ์ ไม่ใช่สิทธิรับซื้อไฟ
        </p>
      </Section>

      {/* H. Spec grid */}
      <Section title="H. ตารางสเปกรวม" sub="ค่าเดียวกันทุกจุด — ใช้ตรวจเทียบกับส่วนอื่นได้">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
          <KV k="P_DC (nameplate)" v={specs.dcCapacityKWp ? `${specs.dcCapacityKWp} kWp` : specs.dcCapacityMWp ? `${specs.dcCapacityMWp} MWp` : '—'} src="calc" />
          <KV k="P_AC (inverter nameplate)" v={specs.acCapacityMW ? `${specs.acCapacityMW} MWac` : specs.pcsInverter || '—'} src="calc" />
          <KV k="DC/AC ratio" v={specs.actualDcAcRatio || '—'} src="calc" />
          <KV k="แผง" v={specs.moduleCount ? `${specs.moduleCount} × 620W` : '—'} src="calc" />
          <KV k="อินเวอร์เตอร์" v={specs.inverterCount ? `${specs.inverterCount} × 300kW` : specs.pcsInverter || '—'} src="demo" />
          <KV k="หม้อแปลง" v={specs.transformerRating || '—'} src="est" />
          <KV k="ผลิตไฟ/ปี" v={specs.annualEnergyMWh ? `${specs.annualEnergyMWh} MWh` : '—'} src="calc" />
          <KV k="MV Cable" v={specs.mvCable || '—'} src="est" />
          <KV k="กระแส MV (ประมาณ)" v={specs.mvCurrentAmp ? `${specs.mvCurrentAmp} A` : '—'} src="est" />
        </div>
      </Section>
    </div>
  );
}
