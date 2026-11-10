import React, { useState } from 'react';
import { ShieldCheck, Info, Zap, Activity, ChevronRight } from 'lucide-react';

export default function SingleLineDiagram({ project, specs, landData }) {
  const [activeElement, setActiveElement] = useState(null);

  const isEV = project.id === 'ev-charging-hub';
  const isBESS = project.id === 'grid-bess';
  const isBiogas = project.id === 'biomass-biogas';
  const isSolar = !isEV && !isBESS && !isBiogas;

  const gridVoltage = landData.provinceData?.grid === 'MEA' ? '24 kV' : '22 kV';
  const gridName = landData.provinceData?.grid || 'PEA';

  const elementDescriptions = {
    pv: {
      title: 'PV Array & DC Combiner Box',
      standard: 'วสท. 022013-64 / IEC 62548',
      desc: `แผงโซลาร์ N-Type TOPCon 620W รวม ${specs.moduleCount || '0'} แผง จัดวงจรสตริงละ ${specs.stringDesign?.stringSize || 20} แผง แรงดันสตริงสูงสุด ~${specs.stringDesign ? (specs.stringDesign.stringSize * parseFloat(specs.stringDesign.vocCold)).toFixed(0) : '—'} Vdc (≤ ${specs.stringDesign?.vdcMax || 1100} V พิกัดอินเวอร์เตอร์) พร้อมอุปกรณ์ป้องกันเสิร์จ Type 1+2 SPD`
    },
    inverter: {
      title: 'String Inverter / Inverter Station',
      standard: 'IEC 62109-1/2, IEEE 1547-2018',
      desc: `อินเวอร์เตอร์แปลงไฟกระแสตรงเป็นกระแสสลับ 3 เฟส 800Vac กำลังรวม ${specs.acCapacityMW || '0'} MW พร้อมระบบ MPPT และฟังก์ชันป้องกัน Anti-Islanding (IEEE 1547)`
    },
    ev_chargers: {
      title: 'DC Fast Chargers & Dynamic Load Control',
      standard: 'วสท. 022026-63 / IEC 61851-23',
      desc: `ตู้ชาร์จ DC Superfast 180kW CCS2 จำนวน ${specs.dcChargersCount || 4} ตู้ พร้อม Dynamic Load Management (DLM) และ RCD Type B ตรวจจับไฟรั่ว`
    },
    bess_container: {
      title: 'BESS Container & Bi-directional PCS',
      standard: 'NFPA 855 / UL 9540',
      desc: `ระบบแบตเตอรี่ลิเธียมฟอสเฟต (LFP) พร้อม Inverter สองทาง (PCS) ทำหน้าที่ Peak Shaving, Arbitrage และรักษาเสถียรภาพความถี่โครงข่าย`
    },
    gen_biogas: {
      title: 'Biogas Lean-Burn Synchronous Generator',
      standard: 'วสท. มาตรฐานเครื่องกำเนิดไฟฟ้า / IEEE C37.102',
      desc: `เครื่องกำเนิดไฟฟ้าก๊าซชีวภาพ 400V 3-Phase Synchronous Generator 1500 RPM พร้อมระบบ Excitation และ Governor ควบคุมความถี่อัตโนมัติ`
    },
    transformer: {
      title: 'Step-Up Transformer',
      standard: 'มอก. 384-2543 / IEC 60076',
      desc: `หม้อแปลงไฟฟ้ากำลัง ${specs.transformerRating || '1000 kVA'} อัตราแปลง 0.4kV / ${gridVoltage} ต่อขดลวดแบบ Dyn11 พร้อมบุชชิ่งแรงสูงและระบบป้องกันอุณหภูมิเกิน`
    },
    rmu_switchgear: {
      title: 'Medium Voltage Switchgear & RMU (VCB)',
      standard: 'IEC 62271-200 / PEA Code',
      desc: `ตู้สวิตช์เกียร์แรงกลางพร้อมเซอร์กิตเบรกเกอร์สุญญากาศ (Vacuum Circuit Breaker - VCB) พิกัด 24kV 630A Breaking Capacity 25kA`
    },
    protection_relay: {
      title: 'Numerical Protection Relays (ANSI Codes)',
      standard: 'IEEE C37.90 / PEA Protection Code',
      desc: `ชุดรีเลย์ป้องกันระบบไฟ: 50/51 (Overcurrent), 51N (Earth Fault), 27/59 (Under/Over Voltage), 81O/U (Under/Over Frequency), 32R (Reverse Power Control)`
    },
    grid_pcc: {
      title: 'Point of Common Coupling (PCC) & Revenue Metering',
      standard: 'PEA/MEA Grid Code 2021',
      desc: `จุดเชื่อมต่อระบบจำหน่ายของ ${gridName} แรงดัน ${gridVoltage} พร้อมหม้อแปลงวัดกระแส/แรงดัน (CT/PT Class 0.2S) สำหรับมาตรวัดคิดเงินแบบสองทิศทาง`
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-zinc-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-zinc-900 flex items-center">
            Single Line Diagram (SLD) — ไดอะแกรมเส้นเดียว
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            ผังวงจรระบบไฟฟ้าตามมาตรฐาน วสท. และข้อกำหนดการเชื่อมต่อโครงข่าย {gridName}
          </p>
        </div>

        <div className="text-[11px] text-zinc-500 flex items-center">
          <Info className="w-3.5 h-3.5 text-zinc-400 mr-1" />
          <span>คลิกที่อุปกรณ์เพื่อดูค่าพิกัดทางวิศวกรรม</span>
        </div>
      </div>

      {/* Schematic Canvas with Technical Dot Grid */}
      <div 
        className="bg-zinc-50 rounded-lg p-6 border border-zinc-200 overflow-x-auto relative min-w-[700px]"
        style={{
          backgroundImage: 'radial-gradient(#d4d4d8 1px, transparent 1px)',
          backgroundSize: '16px 16px'
        }}
      >
        
        {/* Main Busbar Line */}
        <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-zinc-400 -translate-y-1/2 z-0" />

        <div className="relative z-10 flex items-center justify-between space-x-3">
          
          {/* STEP 1: Generation Source */}
          <div 
            onClick={() => setActiveElement(isSolar ? 'pv' : isEV ? 'ev_chargers' : isBESS ? 'bess_container' : 'gen_biogas')}
            className={`cursor-pointer transition p-3 rounded-lg border flex flex-col items-center w-36 text-center ${
              activeElement === (isSolar ? 'pv' : isEV ? 'ev_chargers' : isBESS ? 'bess_container' : 'gen_biogas')
                ? 'bg-zinc-900 border-zinc-900 text-white shadow-md'
                : 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-400 shadow-sm'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 text-xs font-mono font-bold ${
              activeElement === (isSolar ? 'pv' : isEV ? 'ev_chargers' : isBESS ? 'bess_container' : 'gen_biogas') ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
            }`}>
              {isSolar ? 'PV' : isEV ? 'EV' : isBESS ? 'ESS' : 'GEN'}
            </div>
            <span className="text-[11px] font-mono font-bold">
              {isSolar ? 'PV ARRAY' : isEV ? 'EV CHARGERS' : isBESS ? 'BESS SYSTEM' : 'GAS ENGINE'}
            </span>
            <span className="text-[10px] mt-0.5 opacity-80">
              {isSolar ? `${specs.dcCapacityMWp || '0'} MWp` : isEV ? `${specs.totalGuns || 8} หัวชาร์จ` : isBESS ? `${specs.capacityMWh || 3.7} MWh` : `${specs.generatorCapacityKW || 500} kW`}
            </span>
            <span className="text-[9px] mt-0.5 font-mono opacity-60">
              {isSolar ? `~${specs.stringDesign ? (specs.stringDesign.stringSize * parseFloat(specs.stringDesign.vocCold)).toFixed(0) : '—'} Vdc` : '400 Vac'}
            </span>
          </div>

          <div className="text-zinc-400 text-xs font-mono font-bold">
            ──▶
          </div>

          {/* STEP 2: Inverter / Power Conversion */}
          <div 
            onClick={() => setActiveElement(isEV ? 'ev_chargers' : 'inverter')}
            className={`cursor-pointer transition p-3 rounded-lg border flex flex-col items-center w-36 text-center ${
              activeElement === 'inverter'
                ? 'bg-zinc-900 border-zinc-900 text-white shadow-md'
                : 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-400 shadow-sm'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 text-xs font-mono font-bold ${
              activeElement === 'inverter' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
            }`}>
              DC/AC
            </div>
            <span className="text-[11px] font-mono font-bold">
              {isEV ? 'DLM UNIT' : 'INVERTER'}
            </span>
            <span className="text-[10px] mt-0.5 opacity-80">
              {isEV ? 'Load Balancing' : `${specs.inverterCount || 1}x 300kW`}
            </span>
            <span className="text-[9px] mt-0.5 font-mono opacity-60">
              Eff &gt; 98.8%
            </span>
          </div>

          <div className="text-zinc-400 text-xs font-mono font-bold">
            ──▶
          </div>

          {/* STEP 3: Transformer */}
          <div 
            onClick={() => setActiveElement('transformer')}
            className={`cursor-pointer transition p-3 rounded-lg border flex flex-col items-center w-36 text-center ${
              activeElement === 'transformer'
                ? 'bg-zinc-900 border-zinc-900 text-white shadow-md'
                : 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-400 shadow-sm'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 text-xs font-mono font-bold ${
              activeElement === 'transformer' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
            }`}>
              ⚡
            </div>
            <span className="text-[11px] font-mono font-bold">
              TRANSFORMER
            </span>
            <span className="text-[10px] mt-0.5 opacity-80">
              {specs.transformerKVA || 1000} kVA
            </span>
            <span className="text-[9px] mt-0.5 font-mono opacity-60">
              0.4 / {gridVoltage} Dyn11
            </span>
          </div>

          <div className="text-zinc-400 text-xs font-mono font-bold">
            ──▶
          </div>

          {/* STEP 4: Protection Relays & RMU */}
          <div 
            onClick={() => setActiveElement('protection_relay')}
            className={`cursor-pointer transition p-3 rounded-lg border flex flex-col items-center w-40 text-center ${
              activeElement === 'protection_relay'
                ? 'bg-zinc-900 border-zinc-900 text-white shadow-md'
                : 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-400 shadow-sm'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 text-xs font-mono font-bold ${
              activeElement === 'protection_relay' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
            }`}>
              50/51
            </div>
            <span className="text-[11px] font-mono font-bold">
              RMU & RELAYS
            </span>
            <span className="text-[10px] mt-0.5 opacity-80">
              VCB 24kV 25kA
            </span>
            <span className="text-[9px] mt-0.5 font-mono opacity-60">
              50/51 | 51N | 27/59 | 81
            </span>
          </div>

          <div className="text-zinc-400 text-xs font-mono font-bold">
            ──▶
          </div>

          {/* STEP 5: Grid PCC */}
          <div 
            onClick={() => setActiveElement('grid_pcc')}
            className={`cursor-pointer transition p-3 rounded-lg border flex flex-col items-center w-36 text-center ${
              activeElement === 'grid_pcc'
                ? 'bg-zinc-900 border-zinc-900 text-white shadow-md'
                : 'bg-white border-zinc-200 text-zinc-800 hover:border-zinc-400 shadow-sm'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 text-xs font-mono font-bold ${
              activeElement === 'grid_pcc' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-700'
            }`}>
              GRID
            </div>
            <span className="text-[11px] font-mono font-bold">
              {gridName} PCC
            </span>
            <span className="text-[10px] mt-0.5 opacity-80">
              มิเตอร์ 2 ทิศทาง
            </span>
            <span className="text-[9px] mt-0.5 font-mono opacity-60">
              {gridVoltage} 3-Phase
            </span>
          </div>

        </div>

      </div>

      {/* Selected Element Engineering Deep Dive Card */}
      {activeElement && elementDescriptions[activeElement] ? (
        <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-900 font-mono">
              {elementDescriptions[activeElement].title}
            </h4>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-zinc-700 border border-zinc-200">
              {elementDescriptions[activeElement].standard}
            </span>
          </div>
          <p className="text-xs text-zinc-600 leading-relaxed pt-1">
            {elementDescriptions[activeElement].desc}
          </p>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-center text-xs text-zinc-500">
          คลิกที่อุปกรณ์แต่ละตัวในไดอะแกรมเพื่อดูพิกัดวิศวกรรมไฟฟ้า (Voltage, Current, Protection Relays)
        </div>
      )}

      {/* Engineering Specs Table */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
          <span className="text-zinc-500 block text-[11px]">พิกัดกระแสแรงกลาง (MV)</span>
          <span className="text-zinc-900 font-mono font-semibold text-sm mt-0.5 block">
            {specs.mvCurrentAmp || '26.2'} A @ {gridVoltage}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
          <span className="text-zinc-500 block text-[11px]">ขนาดสายเคเบิล</span>
          <span className="text-zinc-900 font-mono text-xs mt-0.5 block truncate">
            {specs.mvCable || 'XLPE 24kV 1x185 sq.mm'}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
          <span className="text-zinc-500 block text-[11px]">มาตรฐานอ้างอิง</span>
          <span className="text-zinc-900 font-medium text-xs mt-0.5 block">
            วสท. 022013-64 / PEA Code
          </span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
          <span className="text-zinc-500 block text-[11px]">จุดเชื่อมต่อจำหน่าย</span>
          <span className="text-zinc-900 font-medium text-xs mt-0.5 block">
            {gridName} Overhead Feeder
          </span>
        </div>
      </div>

    </div>
  );
}
