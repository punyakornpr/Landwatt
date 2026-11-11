import React, { useState } from 'react';
import { ShieldCheck, Info, Zap, Activity, ChevronRight } from 'lucide-react';

export default function SingleLineDiagram({ project, specs, landData }) {
  const [activeElement, setActiveElement] = useState(null);

  const isEV = project.id === 'ev-charging-hub';
  const isBESS = project.id === 'grid-bess';
  const isBiogas = project.id === 'biomass-biogas';
  const isSmallSolar = project.id === 'small-solar' || project.id === 'solar-coldroom' || project.id === 'ev-moto-swap';
  const isKit = project.id === 'solar-utility-kit' || project.id === 'solar-dryer';
  const isSolar = !isEV && !isBESS && !isBiogas;

  const gridVoltage = landData.provinceData?.grid === 'MEA' ? '24 kV' : '22 kV';
  const gridName = landData.provinceData?.grid || 'PEA';

  const elementDescriptions = {
    pv: {
      title: 'PV Array & DC Combiner Box',
      standard: 'EIT 022013-64 / IEC 62548',
      desc: `N-Type TOPCon 620W modules × ${specs.moduleCount || '0'}, ${specs.stringDesign?.stringSize || 20} per string; max string voltage ~${specs.stringDesign ? (specs.stringDesign.stringSize * parseFloat(specs.stringDesign.vocCold)).toFixed(0) : '—'} Vdc (≤ ${specs.stringDesign?.vdcMax || 1100} V inverter rating) with Type 1+2 SPD surge protection`
    },
    inverter: {
      title: 'String Inverter / Inverter Station',
      standard: 'IEC 62109-1/2, IEEE 1547-2018',
      desc: `DC-to-3-phase-AC inverters, 800Vac, ${specs.acCapacityMW || '0'} MW total, with MPPT and IEEE 1547 anti-islanding protection`
    },
    ev_chargers: {
      title: 'DC Fast Chargers & Dynamic Load Control',
      standard: 'EIT 022026-63 / IEC 61851-23',
      desc: `${specs.dcChargersCount || 4} × DC Superfast 180kW CCS2 cabinets with Dynamic Load Management (DLM) and Type-B RCD leakage detection`
    },
    bess_container: {
      title: 'BESS Container & Bi-directional PCS',
      standard: 'NFPA 855 / UL 9540',
      desc: `Lithium iron phosphate (LFP) batteries with bi-directional PCS for peak shaving, arbitrage and grid frequency stabilization`
    },
    gen_biogas: {
      title: 'Biogas Lean-Burn Synchronous Generator',
      standard: 'EIT generator standard / IEEE C37.102',
      desc: `Biogas generator 400V 3-phase synchronous, 1500 RPM, with excitation and governor for automatic frequency control`
    },
    transformer: {
      title: 'Step-Up Transformer',
      standard: 'TIS 384-2543 / IEC 60076',
      desc: `${specs.transformerRating || '1000 kVA'} transformer, 0.4kV / ${gridVoltage} Dyn11 winding, with HV bushings and over-temperature protection`
    },
    rmu_switchgear: {
      title: 'Medium Voltage Switchgear & RMU (VCB)',
      standard: 'IEC 62271-200 / PEA Code',
      desc: `MV switchgear with vacuum circuit breaker (VCB) rated 24kV 630A, breaking capacity 25kA`
    },
    protection_relay: {
      title: 'Numerical Protection Relays (ANSI Codes)',
      standard: 'IEEE C37.90 / PEA Protection Code',
      desc: `Protection relay set: 50/51 (overcurrent), 51N (earth fault), 27/59 (under/over voltage), 81O/U (frequency), 32R (reverse power)`
    },
    grid_pcc: {
      title: 'Point of Common Coupling (PCC) & Revenue Metering',
      standard: 'PEA/MEA Grid Code 2021',
      desc: `${gridName} distribution interconnection at ${gridVoltage} with CT/PT (Class 0.2S) for bi-directional revenue metering`
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-zinc-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-zinc-900 flex items-center">
            Single Line Diagram (SLD)
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Electrical schematic per EIT standards and {gridName} grid-interconnection rules
          </p>
        </div>

        <div className="text-[11px] text-zinc-500 flex items-center">
          <Info className="w-3.5 h-3.5 text-zinc-400 mr-1" />
          <span>Click a component to view engineering ratings</span>
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
              {isSolar ? `${specs.dcCapacityMWp || '0'} MWp` : isEV ? `${specs.totalGuns || 8} guns` : isBESS ? `${specs.capacityMWh || 3.7} MWh` : `${specs.generatorCapacityKW || 500} kW`}
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
              {isEV ? 'Load Balancing' : `${specs.inverterCount || 1}x ${specs.inverterUnitKW || 300}kW`}
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
              {isKit ? 'BATTERY' : isSmallSolar ? 'MAIN DB' : 'TRANSFORMER'}
            </span>
            <span className="text-[10px] mt-0.5 opacity-80">
              {isKit ? `${specs.bessKWh || 1.2} kWh LiFePO4` : isSmallSolar ? 'Existing LV board' : `${specs.transformerKVA || 1000} kVA`}
            </span>
            <span className="text-[9px] mt-0.5 font-mono opacity-60">
              {isKit ? 'Storage for night' : isSmallSolar ? '230/400V' : `0.4 / ${gridVoltage} Dyn11`}
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
              {isKit ? 'FUSE / SPD' : isSmallSolar ? 'MCB / RCD' : 'RMU & RELAYS'}
            </span>
            <span className="text-[10px] mt-0.5 opacity-80">
              {isKit ? 'DC fuse + batt breaker' : isSmallSolar ? 'Type-B RCD + SPD II' : 'VCB 24kV 25kA'}
            </span>
            <span className="text-[9px] mt-0.5 font-mono opacity-60">
              {isKit || isSmallSolar ? 'LV protection' : '50/51 | 51N | 27/59 | 81'}
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
              {isKit ? 'LOADS' : `${gridName} PCC`}
            </span>
            <span className="text-[10px] mt-0.5 opacity-80">
              {isKit ? 'Lights / fans / pump' : 'Bi-directional meter'}
            </span>
            <span className="text-[9px] mt-0.5 font-mono opacity-60">
              {isKit || isSmallSolar ? '230/400V' : `${gridVoltage} 3-Phase`}
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
          Click any component in the diagram for electrical ratings (voltage, current, protection relays)
        </div>
      )}

      {/* Engineering Specs Table */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
          <span className="text-zinc-500 block text-[11px]">MV rated current</span>
          <span className="text-zinc-900 font-mono font-semibold text-sm mt-0.5 block">
            {specs.mvCurrentAmp || '26.2'} A @ {gridVoltage}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
          <span className="text-zinc-500 block text-[11px]">Cable size</span>
          <span className="text-zinc-900 font-mono text-xs mt-0.5 block truncate">
            {specs.mvCable || 'XLPE 24kV 1x185 sq.mm'}
          </span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
          <span className="text-zinc-500 block text-[11px]">Reference standards</span>
          <span className="text-zinc-900 font-medium text-xs mt-0.5 block">
            EIT 022013-64 / PEA Code
          </span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200">
          <span className="text-zinc-500 block text-[11px]">Grid interconnection</span>
          <span className="text-zinc-900 font-medium text-xs mt-0.5 block">
            {gridName} Overhead Feeder
          </span>
        </div>
      </div>

    </div>
  );
}
