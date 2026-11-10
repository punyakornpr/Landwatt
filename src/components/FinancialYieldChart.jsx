import React, { useState } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { TrendingUp, DollarSign, Calendar, BarChart3 } from 'lucide-react';

export default function FinancialYieldChart({ project, specs, landData }) {
  const [chartTab, setChartTab] = useState('cashflow');

  const capex = parseFloat(specs.financials?.totalCapexMillionTHB || 10);
  const annualRev = parseFloat(specs.financials?.annualRevenueMillionTHB || 2);
  const netCashflow = parseFloat(specs.financials?.netAnnualCashflowMillionTHB || specs.financials?.netAnnualProfitMillionTHB || 1.8);

  // ใช้ cashFlows[] ชุดเดียวกับ engine/NPV/IRR/ตาราง — ห้าม degrade net ซ้ำเอง
  const cashflowData = [];
  if (specs.cashFlows?.length > 1) {
    let cumulative = 0;
    specs.cashFlows.forEach((cf, yr) => {
      cumulative += cf;
      cashflowData.push({
        year: `ปี ${yr}`,
        net: parseFloat((cf / 1e6).toFixed(2)),
        cumulative: parseFloat((cumulative / 1e6).toFixed(2))
      });
    });
  } else {
    // fallback สำหรับประเภทที่ยังไม่มี cashFlows (EV/BESS/biogas)
    let cumulative = -capex;
    for (let yr = 0; yr <= 25; yr++) {
      if (yr === 0) {
        cashflowData.push({ year: `ปี 0`, net: -capex, cumulative: parseFloat(cumulative.toFixed(2)) });
      } else {
        const degradedCashflow = netCashflow * Math.pow(1 - 0.004, yr - 1);
        cumulative += degradedCashflow;
        cashflowData.push({
          year: `ปี ${yr}`,
          net: parseFloat(degradedCashflow.toFixed(2)),
          cumulative: parseFloat(cumulative.toFixed(2))
        });
      }
    }
  }

  const annualMWh = parseFloat((specs.annualEnergyMWh || '1500').replace(/,/g, ''));
  const monthlyWeights = [0.082, 0.091, 0.098, 0.102, 0.090, 0.081, 0.078, 0.074, 0.070, 0.075, 0.079, 0.080];
  const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  const monthlyData = months.map((m, idx) => ({
    month: m,
    yieldMWh: Math.round(annualMWh * monthlyWeights[idx]),
    revenueTHB: Math.round(annualMWh * monthlyWeights[idx] * 2167.9)
  }));

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-zinc-100 gap-3">
        <div>
          <h3 className="text-base font-bold text-zinc-900">
            การประเมินผลตอบแทนทางการเงิน (Techno-Economics)
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            ประมาณการกระแสเงินสดสะสม 25 ปี และปริมาณผลิตไฟฟ้ารายเดือน (กระจายตามน้ำหนักคงที่สมมติฐาน — ไม่ใช่ข้อมูลวัดหรือจำลองรายเดือน)
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs">
          <button
            onClick={() => setChartTab('cashflow')}
            className={`px-3 py-1 rounded-md font-medium transition flex items-center space-x-1.5 ${
              chartTab === 'cashflow'
                ? 'bg-white text-zinc-900 font-semibold shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-zinc-600" />
            <span>กระแสเงินสดสะสม (25 ปี)</span>
          </button>
          <button
            onClick={() => setChartTab('generation')}
            className={`px-3 py-1 rounded-md font-medium transition flex items-center space-x-1.5 ${
              chartTab === 'generation'
                ? 'bg-white text-zinc-900 font-semibold shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-zinc-600" />
            <span>การผลิตไฟฟ้ารายเดือน</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Key Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200">
          <span className="text-zinc-500 text-[11px] block">
            เงินลงทุนรวม (CAPEX)
          </span>
          <span className="text-lg font-bold text-zinc-900 font-mono mt-1 block">
            {specs.financials?.totalCapexMillionTHB} <span className="text-xs text-zinc-500 font-normal">ล้านบาท</span>
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200">
          <span className="text-zinc-500 text-[11px] block">
            อัตราผลตอบแทน (IRR)
          </span>
          <span className="text-lg font-bold text-zinc-900 font-mono mt-1 block">
            {specs.financials?.irrPercent}% <span className="text-xs text-zinc-500 font-normal">/ ปี</span>
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200">
          <span className="text-zinc-500 text-[11px] block">
            ระยะเวลาคืนทุน (Payback)
          </span>
          <span className="text-lg font-bold text-zinc-900 font-mono mt-1 block">
            {specs.financials?.paybackYears} <span className="text-xs text-zinc-500 font-normal">ปี</span>
          </span>
        </div>

        <div className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200">
          <span className="text-zinc-500 text-[11px] block">
            มูลค่าปัจจุบันสุทธิ (NPV @ 6%)
          </span>
          <span className="text-lg font-bold text-zinc-900 font-mono mt-1 block">
            +{specs.financials?.npv25YrMillionTHB || '12.4'} <span className="text-xs text-zinc-500 font-normal">ลบ.</span>
          </span>
        </div>
      </div>

      {/* Chart View */}
      <div className="w-full h-72 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
        <ResponsiveContainer width="100%" height="100%">
          {chartTab === 'cashflow' ? (
            <LineChart data={cashflowData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="year" stroke="#71717a" fontSize={11} interval={3} />
              <YAxis stroke="#71717a" fontSize={11} unit=" ลบ." />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '8px', fontSize: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                formatter={(val) => [`${val} ล้านบาท`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                name="กระแสเงินสดสะสม (Cumulative Cash Flow)" 
                stroke="#18181b" 
                strokeWidth={2} 
                dot={{ r: 2 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          ) : (
            <BarChart data={monthlyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="month" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} unit=" MWh" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '8px', fontSize: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                formatter={(val) => [`${val} MWh`, 'ผลผลิตพลังงาน']}
              />
              <Bar 
                dataKey="yieldMWh" 
                name="พลังงานไฟฟ้าที่ผลิตได้ (MWh/เดือน)" 
                fill="#3b82f6" 
                radius={[3, 3, 0, 0]} 
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-center justify-between">
        <span>อิงตามอัตราค่าไฟ FiT ตามระเบียบ กกพ. 2.1679 บาท/kWh และอัตราเสื่อมแผง (Degradation) 0.4%/ปี</span>
        <span className="text-zinc-900 font-semibold font-mono">คืนทุนปีที่ {specs.financials?.paybackYears}</span>
      </div>

    </div>
  );
}
