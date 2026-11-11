import React from 'react';

// SVG scene per project — illustrative thumbnail for option cards.
// Shared backdrop: gradient sky, sun, clouds, layered ground, soft shadows.

const S = {
  panel: '#2563EB', panelDark: '#1E40AF', panelLine: '#93C5FD',
  wall: '#F8FAFC', wallDark: '#E2E8F0', roof: '#94A3B8',
  tree: '#16A34A', treeDark: '#15803D', trunk: '#92400E',
  water: '#7DD3FC', waterDark: '#38BDF8', ink: '#334155',
  amber: '#F59E0B', red: '#EF4444', violet: '#8B5CF6',
  glass: '#BAE6FD', tire: '#1F2937',
};

let uid = 0;
function Scene({ children }) {
  const g = `pa${++uid}`;
  return (
    <svg viewBox="0 0 120 84" className="w-full h-full block" aria-hidden="true">
      <defs>
        <linearGradient id={`${g}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#BFDDFB" /><stop offset="1" stopColor="#EDF5FE" />
        </linearGradient>
        <linearGradient id={`${g}gr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CFE3C8" /><stop offset="1" stopColor="#B7D4AE" />
        </linearGradient>
        <linearGradient id={`${g}pv`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3B82F6" /><stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <radialGradient id={`${g}sun`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FDE68A" /><stop offset="0.7" stopColor="#FBBF24" /><stop offset="1" stopColor="#F59E0B" />
        </radialGradient>
      </defs>
      <rect width="120" height="84" fill={`url(#${g}sky)`} />
      <circle cx="98" cy="15" r="11" fill="#FDE68A" opacity="0.45" />
      <circle cx="98" cy="15" r="8" fill={`url(#${g}sun)`} />
      <g fill="#FFFFFF" opacity="0.85">
        <ellipse cx="24" cy="14" rx="11" ry="4" /><ellipse cx="34" cy="11" rx="8" ry="3.4" />
        <ellipse cx="72" cy="9" rx="9" ry="3" />
      </g>
      <rect y="62" width="120" height="22" fill={`url(#${g}gr)`} />
      <rect y="62" width="120" height="1.5" fill="#A8C89E" />
      {children}
    </svg>
  );
}

const Shadow = ({ cx, cy = 63, rx, ry = 2.5 }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#1F2937" opacity="0.12" />
);

const PanelUnit = ({ x, y, w = 24, h = 13 }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="8" y={h} width="3" height="7" fill={S.panelDark} />
    <g transform="skewX(-16)">
      <rect width={w} height={h} rx="1.5" fill={S.panelDark} />
      <rect x="1" y="1" width={w - 2} height={h - 2} rx="1" fill={S.panel} />
      <path d={`M2 ${h / 3} H${w - 2} M2 ${(2 * h) / 3} H${w - 2} M${w / 3} 1 V${h - 1} M${(2 * w) / 3} 1 V${h - 1}`} stroke={S.panelLine} strokeWidth="0.7" />
      <path d={`M3 3 L${w - 8} 3`} stroke="#BFDBFE" strokeWidth="1.2" opacity="0.8" />
    </g>
  </g>
);

const Panels = ({ x = 10, y = 50, n = 3, gap = 27 }) => (
  <g>{Array.from({ length: n }).map((_, i) => <PanelUnit key={i} x={x + i * gap} y={y} />)}</g>
);

function SolarArray() {
  return (
    <Scene>
      <Shadow cx="38" rx="34" /><Shadow cx="76" rx="30" cy="72" />
      <Panels x={12} y={46} n={3} /><Panels x={40} y={62} n={2} />
      <path d="M8 64 Q14 58 20 64 M100 68 Q106 62 112 68" stroke={S.tree} strokeWidth="1.8" fill="none" />
    </Scene>
  );
}

function SolarRoof() {
  return (
    <Scene>
      <Shadow cx="58" rx="40" cy="66" />
      <rect x="34" y="40" width="52" height="25" rx="2" fill={S.wall} />
      <rect x="34" y="40" width="52" height="25" rx="2" fill="none" stroke="#CBD5E1" strokeWidth="0.8" />
      <path d="M29 42 L60 22 L91 42 Z" fill={S.roof} />
      <path d="M29 42 L60 22 L91 42" fill="none" stroke="#64748B" strokeWidth="1" />
      <rect x="53" y="50" width="14" height="15" rx="1" fill="#7C2D12" />
      <rect x="40" y="48" width="9" height="9" rx="1" fill={S.glass} />
      <rect x="71" y="48" width="9" height="9" rx="1" fill={S.glass} />
      <g transform="rotate(-28 48 33)"><rect x="40" y="28" width="17" height="10" rx="1.5" fill={S.panel} /><path d="M42 33 h13 M48.5 29 v8" stroke={S.panelLine} strokeWidth="0.7" /></g>
      <g transform="rotate(28 72 33)"><rect x="63" y="28" width="17" height="10" rx="1.5" fill={S.panel} /><path d="M65 33 h13 M71.5 29 v8" stroke={S.panelLine} strokeWidth="0.7" /></g>
      <path d="M10 66 Q15 60 20 66" stroke={S.tree} strokeWidth="1.8" fill="none" />
    </Scene>
  );
}

function SolarAgri() {
  return (
    <Scene>
      <Shadow cx="48" rx="40" cy="58" />
      <Panels x={16} y={40} n={3} />
      <g stroke={S.tree} strokeWidth="1.8" fill="none">
        {Array.from({ length: 7 }).map((_, i) => (
          <g key={i} transform={`translate(${12 + i * 16} 72)`}>
            <path d="M0 0 Q1 -7 4 -9 M0 0 Q-1 -7 -4 -9" />
            <path d="M0 -3 Q2 -8 5 -8 M0 -3 Q-2 -8 -5 -8" strokeWidth="1.4" />
          </g>
        ))}
      </g>
      <g fill={S.amber}><circle cx="20" cy="68" r="1.4" /><circle cx="52" cy="69" r="1.4" /><circle cx="84" cy="68" r="1.4" /></g>
    </Scene>
  );
}

function EvCharger() {
  return (
    <Scene>
      <Shadow cx="22" rx="14" /><Shadow cx="72" rx="30" />
      <rect x="14" y="28" width="17" height="35" rx="3" fill={S.ink} />
      <rect x="16.5" y="31" width="12" height="9" rx="1" fill={S.glass} />
      <rect x="18" y="43" width="9" height="3" rx="1.5" fill={S.amber} />
      <rect x="18" y="49" width="9" height="2" rx="1" fill="#64748B" />
      <path d="M31 38 Q42 38 42 48 L42 52" stroke={S.ink} strokeWidth="2" fill="none" />
      <circle cx="42" cy="53" r="2" fill={S.ink} />
      <g transform="translate(48 47)">
        <path d="M0 14 Q0 6 8 6 L14 6 L22 0 L44 0 Q52 0 52 8 L52 14 Z" fill={S.wallDark} />
        <path d="M14 6 L21 1.5 L40 1.5 L40 6 Z" fill={S.glass} />
        <circle cx="13" cy="15" r="5" fill={S.tire} /><circle cx="13" cy="15" r="2" fill="#9CA3AF" />
        <circle cx="41" cy="15" r="5" fill={S.tire} /><circle cx="41" cy="15" r="2" fill="#9CA3AF" />
        <path d="M48 9 L52 9" stroke={S.amber} strokeWidth="2" />
      </g>
    </Scene>
  );
}

function MotoSwap() {
  return (
    <Scene>
      <Shadow cx="25" rx="16" /><Shadow cx="74" rx="22" />
      <rect x="10" y="24" width="32" height="39" rx="3" fill={S.violet} />
      <rect x="10" y="24" width="32" height="6" rx="3" fill="#7C3AED" />
      {[0, 1, 2].map(r => [0, 1].map(c => (
        <g key={`${r}${c}`}><rect x={14 + c * 13} y={33 + r * 10} width="11" height="8" rx="1" fill="#EDE9FE" />
          <rect x={16 + c * 13} y={35 + r * 10} width="7" height="1.6" fill={S.violet} /></g>
      )))}
      <g transform="translate(56 48)">
        <path d="M2 14 L8 0 L26 0 L36 9 L36 14" stroke={S.ink} strokeWidth="2.5" fill="none" />
        <rect x="16" y="3" width="9" height="7" rx="1" fill={S.violet} />
        <path d="M28 0 L33 5" stroke={S.ink} strokeWidth="2" />
        <circle cx="10" cy="16" r="5" fill={S.tire} /><circle cx="30" cy="16" r="5" fill={S.tire} />
      </g>
    </Scene>
  );
}

function Coldroom() {
  return (
    <Scene>
      <Shadow cx="50" rx="34" cy="65" />
      <rect x="22" y="33" width="54" height="31" rx="2" fill={S.wall} />
      <rect x="22" y="33" width="54" height="31" rx="2" fill="none" stroke="#CBD5E1" strokeWidth="0.8" />
      <rect x="22" y="33" width="54" height="7" fill={S.waterDark} />
      {[0, 1, 2, 3].map(i => <rect key={i} x={26 + i * 12.5} y="33" width="1" height="31" fill={S.wallDark} />)}
      <rect x="58" y="44" width="14" height="20" rx="1" fill="#0EA5E9" />
      <path d="M32 47 l7 0 M35.5 43.5 l0 7 M33 44.8 l5 4.4 M38 44.8 l-5 4.4" stroke={S.waterDark} strokeWidth="1.3" />
      <g transform="skewX(-20)"><rect x="52" y="24" width="22" height="8" rx="1.5" fill={S.panel} /><path d="M54 28 h18 M63 25 v6" stroke={S.panelLine} strokeWidth="0.6" /></g>
      <rect x="82" y="46" width="22" height="18" rx="2" fill={S.wallDark} />
      <rect x="84" y="48" width="8" height="8" rx="1" fill={S.glass} />
      <circle cx="96" cy="60" r="2" fill={S.tire} /><circle cx="88" cy="60" r="2" fill={S.tire} />
    </Scene>
  );
}

function SolarDryer() {
  return (
    <Scene>
      <Shadow cx="48" rx="36" cy="65" />
      <rect x="16" y="36" width="62" height="28" rx="3" fill={S.wall} />
      <rect x="16" y="36" width="62" height="28" rx="3" fill="none" stroke="#CBD5E1" strokeWidth="0.8" />
      {[44, 52, 60].map(y => <rect key={y} x="21" y={y} width="52" height="3" rx="1.5" fill={S.amber} opacity="0.85" />)}
      <rect x="16" y="36" width="62" height="6" rx="3" fill="#D97706" />
      <g transform="skewX(-20)"><rect x="66" y="27" width="24" height="8" rx="1.5" fill={S.panel} /><path d="M68 31 h20 M78 28 v6" stroke={S.panelLine} strokeWidth="0.6" /></g>
      <path d="M88 36 q5 5 0 11 M95 34 q6 6 0 14 M102 36 q5 5 0 11" stroke={S.amber} strokeWidth="1.8" fill="none" />
    </Scene>
  );
}

function Battery() {
  return (
    <Scene>
      <Shadow cx="36" rx="22" cy="65" /><Shadow cx="82" rx="22" cy="65" />
      {[0, 1].map(i => (
        <g key={i} transform={`translate(${16 + i * 46} 33)`}>
          <rect width="40" height="31" rx="2" fill={S.ink} />
          <rect x="3" y="4" width="34" height="23" rx="1" fill="#4338CA" />
          <path d="M22 7 L16 16 L21 16 L18 24 L27 13 L22 13 Z" fill="#FDE047" />
          <rect x="5" y="4" width="34" height="0" fill="none" />
          <path d="M3 4 h34" stroke="#6366F1" strokeWidth="0.8" />
        </g>
      ))}
      <path d="M56 40 L60 40 M60 40 L62 46" stroke={S.ink} strokeWidth="1.5" />
    </Scene>
  );
}

function Floating() {
  return (
    <Scene>
      <rect y="54" width="120" height="30" fill={S.water} />
      {[58, 66, 74, 80].map(y => <path key={y} d={`M0 ${y} q10 -3 20 0 t20 0 t20 0 t20 0 t20 0`} stroke={S.waterDark} strokeWidth="1.4" fill="none" opacity="0.7" />)}
      <Panels x={16} y={42} n={2} /><Panels x={64} y={42} n={2} />
      <path d="M14 55 q3 3 0 6 M102 57 q3 3 0 6" stroke="#075985" strokeWidth="1.4" fill="none" />
    </Scene>
  );
}

function Biogas() {
  return (
    <Scene>
      <Shadow cx="40" rx="26" cy="65" />
      <path d="M18 64 a22 22 0 0 1 44 0 Z" fill={S.wallDark} />
      <path d="M24 64 a16 16 0 0 1 32 0 Z" fill={S.wall} />
      <path d="M30 52 a12 12 0 0 1 20 0" fill="none" stroke="#CBD5E1" strokeWidth="1" />
      <rect x="38" y="36" width="4" height="8" fill={S.ink} />
      <circle cx="40" cy="34" r="2.5" fill={S.red} />
      <path d="M62 58 L78 58 L78 64 M62 62 L72 62" stroke={S.ink} strokeWidth="2.2" fill="none" />
      <rect x="78" y="50" width="20" height="14" rx="2" fill={S.tree} />
      <path d="M88 53.5 l0 7 M84.5 57 l7 0" stroke="#DCFCE7" strokeWidth="1.6" />
      <path d="M12 70 Q18 64 24 70" stroke={S.tree} strokeWidth="1.8" fill="none" />
    </Scene>
  );
}

function Datacenter() {
  return (
    <Scene>
      <Shadow cx="60" rx="36" cy="65" />
      <rect x="30" y="20" width="60" height="44" rx="2" fill={S.ink} />
      <rect x="30" y="20" width="60" height="44" rx="2" fill="none" stroke="#1E293B" />
      {[0, 1, 2, 3].map(r => [0, 1, 2].map(c => (
        <rect key={`${r}${c}`} x={36 + c * 16} y={25 + r * 9} width="12" height="6" rx="1" fill={r === 1 && c === 1 ? S.waterDark : '#475569'} />
      )))}
      <rect x="30" y="20" width="60" height="4" fill="#475569" />
      <rect x="14" y="46" width="12" height="18" fill={S.wallDark} />
      <path d="M16 46 l4 -9 l4 9" stroke={S.ink} strokeWidth="2" fill="none" />
      <path d="M20 36 L20 24 M16 30 L24 30 M17 26 L23 26" stroke={S.ink} strokeWidth="1.4" />
      <circle cx="20" cy="24" r="1.8" fill={S.red} />
    </Scene>
  );
}

function Warehouse() {
  return (
    <Scene>
      <Shadow cx="60" rx="46" cy="65" />
      <rect x="14" y="34" width="92" height="30" rx="2" fill={S.wall} />
      <path d="M14 34 L106 34 L96 24 L24 24 Z" fill={S.roof} />
      <path d="M14 34 L106 34 L96 24 L24 24" fill="none" stroke="#64748B" strokeWidth="0.8" />
      {[0, 1, 2, 3].map(i => <g key={i} transform="skewX(-8)"><rect x={26 + i * 15} y="26" width="12" height="7" rx="1" fill={S.panel} /></g>)}
      {[0, 1, 2].map(i => (
        <g key={i} transform={`translate(${24 + i * 28} 44)`}>
          <rect width="20" height="20" rx="1" fill={S.wallDark} />
          {[0, 1, 2].map(l => <rect key={l} x="2" y={3 + l * 6} width="16" height="3" fill={S.roof} />)}
        </g>
      ))}
      <rect x="88" y="52" width="14" height="12" fill={S.wallDark} />
      <circle cx="91" cy="64" r="1.8" fill={S.tire} /><circle cx="99" cy="64" r="1.8" fill={S.tire} />
    </Scene>
  );
}

function Forest() {
  return (
    <Scene>
      {[[22, 32, 13], [50, 24, 17], [80, 30, 14], [102, 38, 10], [38, 44, 10]].map(([x, y, r], i) => (
        <g key={i}>
          <Shadow cx={x} cy={64 - Math.max(0, (y + r - 64))} rx={r * 0.9} />
          <rect x={x - 2} y={y + r - 3} width="4" height={66 - y - r} fill={S.trunk} />
          <circle cx={x} cy={y} r={r} fill={i % 2 ? S.tree : S.treeDark} />
          <circle cx={x - r * 0.35} cy={y - r * 0.3} r={r * 0.5} fill={i % 2 ? '#4ADE80' : S.tree} opacity="0.75" />
        </g>
      ))}
      <path d="M8 68 Q14 62 20 68" stroke={S.tree} strokeWidth="1.8" fill="none" />
    </Scene>
  );
}

function Shop({ sign, signColor }) {
  return (
    <Scene>
      <Shadow cx="58" rx="40" cy="66" />
      <rect x="24" y="34" width="70" height="30" rx="2" fill={S.wall} />
      <rect x="24" y="34" width="70" height="30" rx="2" fill="none" stroke="#CBD5E1" strokeWidth="0.8" />
      <path d="M20 34 h78 v-7 a4 4 0 0 0 -4 -4 h-70 a4 4 0 0 0 -4 4 Z" fill={signColor} />
      {[0, 1, 2, 3].map(i => <path key={i} d={`M${28 + i * 16} 34 a8 6 0 0 0 16 0`} fill={i % 2 ? '#FFF' : signColor} />)}
      <rect x="32" y="44" width="18" height="20" rx="1" fill={S.glass} />
      <path d="M32 50 h18" stroke={S.waterDark} strokeWidth="1" />
      <rect x="58" y="44" width="26" height="14" rx="1" fill={S.wallDark} />
      <rect x="60" y="46" width="22" height="4" rx="1" fill={S.glass} />
      <rect x="60" y="52" width="22" height="4" rx="1" fill={S.glass} opacity="0.7" />
      <text x="59" y="30" textAnchor="middle" fontSize="7" fill="#FFF" fontWeight="bold">{sign}</text>
      <path d="M10 66 Q15 60 20 66 M100 66 Q105 60 110 66" stroke={S.tree} strokeWidth="1.8" fill="none" />
    </Scene>
  );
}

function Storage() {
  return (
    <Scene>
      <Shadow cx="60" rx="46" cy="65" />
      <rect x="12" y="28" width="96" height="36" rx="2" fill={S.wall} />
      <path d="M12 28 L108 28 L98 19 L22 19 Z" fill={S.violet} />
      {[0, 1, 2].map(i => (
        <g key={i} transform={`translate(${18 + i * 30} 34)`}>
          <rect width="24" height="30" rx="1" fill={S.wallDark} />
          <rect width="24" height="30" rx="1" fill="none" stroke="#94A3B8" strokeWidth="0.7" />
          {[0, 1, 2, 3, 4].map(l => <rect key={l} x="2" y={3 + l * 5.4} width="20" height="2.6" fill={S.roof} />)}
          <circle cx="20" cy="17" r="1.2" fill={S.ink} />
        </g>
      ))}
      <path d="M108 30 l6 -8" stroke={S.ink} strokeWidth="1.5" />
      <circle cx="115" cy="20" r="1.8" fill={S.amber} />
    </Scene>
  );
}

function Court() {
  return (
    <Scene>
      <Shadow cx="60" rx="42" cy="68" />
      <rect x="18" y="24" width="84" height="42" rx="3" fill={S.tree} />
      <rect x="18" y="24" width="84" height="42" rx="3" fill="none" stroke={S.treeDark} strokeWidth="1.5" />
      <rect x="24" y="29" width="72" height="32" fill="none" stroke="#FFF" strokeWidth="1.5" opacity="0.9" />
      <path d="M60 29 L60 61 M24 45 L96 45" stroke="#FFF" strokeWidth="1.5" opacity="0.9" />
      <path d="M42 29 L42 61 M78 29 L78 61" stroke="#FFF" strokeWidth="1" strokeDasharray="3 3" opacity="0.8" />
      <g transform="translate(104 14)"><circle cx="0" cy="0" r="3" fill="#FFF" /><path d="M0 -3 l-3 -5 M0 -3 l0 -6 M0 -3 l3 -5" stroke="#FFF" strokeWidth="1.4" /></g>
    </Scene>
  );
}

function Stay() {
  return (
    <Scene>
      <Shadow cx="38" rx="24" cy="64" /><Shadow cx="88" rx="18" cy="64" />
      <g transform="translate(18 34)">
        <rect width="36" height="26" rx="2" fill={S.wall} />
        <path d="M-4 0 L18 -15 L40 0 Z" fill={S.trunk} />
        <path d="M-4 0 L18 -15 L40 0" fill="none" stroke="#78350F" strokeWidth="1" />
        <rect x="13" y="12" width="10" height="14" rx="1" fill={S.trunk} />
        <rect x="4" y="6" width="7" height="7" rx="1" fill={S.glass} />
        <rect x="25" y="6" width="7" height="7" rx="1" fill={S.glass} />
      </g>
      <path d="M72 60 L88 30 L104 60 Z" fill={S.violet} />
      <path d="M80 60 L88 42 L96 60 Z" fill="#EDE9FE" />
      <path d="M88 30 L88 26" stroke={S.ink} strokeWidth="1.2" />
      <rect x="106" y="42" width="3" height="22" fill={S.trunk} />
      <circle cx="107" cy="36" r="9" fill={S.tree} />
      <circle cx="104" cy="33" r="4.5" fill="#4ADE80" opacity="0.7" />
    </Scene>
  );
}

function Laundry() {
  return (
    <Scene>
      <Shadow cx="60" rx="42" cy="65" />
      {[0, 1, 2].map(i => (
        <g key={i} transform={`translate(${18 + i * 30} 29)`}>
          <rect width="26" height="35" rx="2" fill={S.wall} />
          <rect width="26" height="35" rx="2" fill="none" stroke="#CBD5E1" strokeWidth="0.8" />
          <rect x="3" y="3" width="12" height="5" rx="1.5" fill={S.wallDark} />
          <circle cx="21" cy="5.5" r="1.8" fill={S.red} />
          <circle cx="13" cy="21" r="9" fill={S.ink} />
          <circle cx="13" cy="21" r="7" fill={S.waterDark} />
          <path d="M8 21 a5 5 0 0 1 10 0" stroke={S.water} strokeWidth="1.4" fill="none" />
        </g>
      ))}
      <rect x="100" y="50" width="14" height="14" rx="2" fill={S.wallDark} />
      <path d="M102 50 v-6 a2 2 0 0 1 4 0" stroke={S.ink} strokeWidth="1.4" fill="none" />
    </Scene>
  );
}

function CarWash() {
  return (
    <Scene>
      <Shadow cx="46" rx="32" cy="63" />
      <path d="M12 34 L62 34 L54 23 L20 23 Z" fill={S.panel} />
      <path d="M12 34 L62 34 L54 23 L20 23" fill="none" stroke={S.panelDark} strokeWidth="1" />
      <rect x="14" y="34" width="3" height="28" fill={S.panelDark} />
      <rect x="57" y="34" width="3" height="28" fill={S.panelDark} />
      <g transform="translate(24 45)">
        <path d="M0 13 Q0 6 7 6 L13 6 L20 0 L40 0 Q46 0 46 8 L46 13 Z" fill={S.wallDark} />
        <path d="M13 6 L19 1.5 L37 1.5 L37 6 Z" fill={S.glass} />
        <circle cx="11" cy="14" r="4.5" fill={S.tire} /><circle cx="11" cy="14" r="1.8" fill="#9CA3AF" />
        <circle cx="36" cy="14" r="4.5" fill={S.tire} /><circle cx="36" cy="14" r="1.8" fill="#9CA3AF" />
      </g>
      {[[78, 32], [86, 38], [82, 28], [92, 34]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.2" fill={S.waterDark} opacity="0.85" />)}
      <rect x="76" y="48" width="26" height="15" rx="2" fill={S.wall} />
      <rect x="76" y="48" width="26" height="15" rx="2" fill="none" stroke="#CBD5E1" strokeWidth="0.8" />
      <rect x="80" y="52" width="18" height="3.5" rx="1.7" fill={S.water} />
      <rect x="80" y="57" width="12" height="3" rx="1.5" fill={S.wallDark} />
    </Scene>
  );
}

const SCENES = {
  'solar-farm': SolarArray,
  'solar-lease': SolarArray,
  'small-solar': SolarRoof,
  'solar-utility-kit': SolarRoof,
  'agrivoltaics': SolarAgri,
  'ev-charging-hub': EvCharger,
  'ev-moto-swap': MotoSwap,
  'solar-coldroom': Coldroom,
  'solar-dryer': SolarDryer,
  'grid-bess': Battery,
  'floating-solar': Floating,
  'biomass-biogas': Biogas,
  'data-center-lease': Datacenter,
  'solar-warehouse': Warehouse,
  'carbon-forest': Forest,
  'roadside-cafe': () => <Shop sign="CAFE" signColor={S.amber} />,
  'minimart': () => <Shop sign="MART" signColor="#2563EB" />,
  'self-storage': Storage,
  'sports-court': Court,
  'homestay-camp': Stay,
  'laundry-shop': Laundry,
  'car-wash': CarWash,
};

export default function ProjectArt({ id, className = '' }) {
  const Art = SCENES[id] || SolarArray;
  return (
    <div className={`rounded-xl overflow-hidden border border-[#E8E8ED] bg-[#EAF2FD] flex-shrink-0 ${className}`}>
      <Art />
    </div>
  );
}
