import React from 'react';

// Flat SVG scene per project — decorative thumbnail for option cards.
// Shared backdrop: sky, sun, ground. Motif shapes per business type.

const S = {
  sky: '#EAF2FD', ground: '#DCE7DA', sun: '#FBBF24',
  panel: '#2563EB', panelDark: '#1E40AF', panelLine: '#93C5FD',
  wall: '#F8FAFC', wallDark: '#E2E8F0', roof: '#94A3B8',
  tree: '#16A34A', treeDark: '#15803D', trunk: '#92400E',
  water: '#7DD3FC', waterDark: '#38BDF8', ink: '#334155',
  amber: '#F59E0B', red: '#EF4444', violet: '#8B5CF6',
};

function Scene({ children }) {
  return (
    <svg viewBox="0 0 120 84" className="w-full h-full block" aria-hidden="true">
      <rect width="120" height="84" fill={S.sky} />
      <circle cx="99" cy="14" r="9" fill={S.sun} />
      <rect y="64" width="120" height="20" fill={S.ground} />
      {children}
    </svg>
  );
}

const Panels = ({ x = 8, y = 52, n = 3 }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => (
      <g key={i} transform={`translate(${x + i * 26} ${y - (i % 2) * 0})`}>
        <rect x="0" y="0" width="22" height="12" rx="1.5" fill={S.panel} transform="skewX(-18)" />
        <path d="M-2 0 L20 0 M-4 6 L18 6 M-6 12 L16 12" stroke={S.panelLine} strokeWidth="0.8" transform="skewX(-18)" />
        <rect x="7" y="12" width="3" height="8" fill={S.panelDark} />
      </g>
    ))}
  </g>
);

function SolarArray() {
  return <Scene><Panels x={10} y={50} n={3} /><Panels x={28} y={66} n={2} /></Scene>;
}

function SolarRoof() {
  return (
    <Scene>
      <rect x="34" y="40" width="52" height="26" rx="2" fill={S.wall} />
      <path d="M30 42 L60 24 L90 42 Z" fill={S.roof} />
      <rect x="52" y="50" width="14" height="16" rx="1" fill={S.panelLine} />
      <rect x="42" y="30" width="16" height="10" rx="1.5" fill={S.panel} transform="rotate(-33 50 35)" />
      <rect x="62" y="30" width="16" height="10" rx="1.5" fill={S.panel} transform="rotate(33 70 35)" />
    </Scene>
  );
}

function SolarAgri() {
  return (
    <Scene>
      <Panels x={16} y={44} n={3} />
      {Array.from({ length: 6 }).map((_, i) => (
        <g key={i} transform={`translate(${14 + i * 17} 74)`}>
          <path d="M0 0 Q1 -6 4 -7 M0 0 Q-1 -6 -4 -7" stroke={S.tree} strokeWidth="1.6" fill="none" />
        </g>
      ))}
    </Scene>
  );
}

function EvCharger() {
  return (
    <Scene>
      <rect x="14" y="30" width="16" height="34" rx="3" fill={S.ink} />
      <rect x="17" y="34" width="10" height="8" rx="1" fill={S.water} />
      <rect x="19" y="46" width="6" height="3" rx="1" fill={S.amber} />
      <path d="M30 40 Q40 40 40 50 L40 54" stroke={S.ink} strokeWidth="2" fill="none" />
      <g transform="translate(46 46)">
        <rect x="0" y="0" width="52" height="16" rx="7" fill={S.wallDark} />
        <rect x="8" y="-5" width="20" height="8" rx="4" fill={S.waterDark} />
        <circle cx="12" cy="17" r="5" fill={S.ink} />
        <circle cx="40" cy="17" r="5" fill={S.ink} />
        <path d="M4 8 L10 8" stroke={S.amber} strokeWidth="2" />
      </g>
    </Scene>
  );
}

function MotoSwap() {
  return (
    <Scene>
      <rect x="10" y="26" width="30" height="38" rx="3" fill={S.violet} />
      {[0, 1, 2].map(r => [0, 1].map(c => (
        <rect key={`${r}${c}`} x={14 + c * 12} y={30 + r * 11} width="10" height="9" rx="1" fill="#EDE9FE" />
      )))}
      <g transform="translate(56 48)">
        <path d="M0 14 L6 0 L26 0 L34 8 L34 14" stroke={S.ink} strokeWidth="2.5" fill="none" />
        <circle cx="10" cy="16" r="5" fill={S.ink} />
        <circle cx="28" cy="16" r="5" fill={S.ink} />
        <rect x="14" y="4" width="8" height="6" rx="1" fill={S.violet} />
      </g>
    </Scene>
  );
}

function Coldroom() {
  return (
    <Scene>
      <rect x="22" y="34" width="52" height="30" rx="2" fill={S.wall} />
      <rect x="22" y="34" width="52" height="6" fill={S.waterDark} />
      <rect x="56" y="44" width="14" height="20" rx="1" fill={S.panelLine} />
      <path d="M30 46 l8 0 M34 42 l0 8 M31 43.5 l6 5 M37 43.5 l-6 5" stroke={S.waterDark} strokeWidth="1.4" />
      <rect x="26" y="26" width="22" height="8" rx="1.5" fill={S.panel} transform="skewX(-20)" />
      <rect x="80" y="44" width="24" height="20" rx="2" fill={S.wallDark} />
      <circle cx="86" cy="52" r="2" fill={S.ink} /><circle cx="98" cy="52" r="2" fill={S.ink} />
    </Scene>
  );
}

function SolarDryer() {
  return (
    <Scene>
      <rect x="18" y="36" width="60" height="28" rx="3" fill={S.wall} />
      <rect x="18" y="36" width="60" height="28" rx="3" fill="none" stroke={S.wallDark} />
      {[44, 52, 60].map(y => <rect key={y} x="24" y={y} width="48" height="3" rx="1.5" fill={S.amber} />)}
      <rect x="40" y="28" width="24" height="8" rx="1.5" fill={S.panel} transform="skewX(-20)" />
      <path d="M92 30 q6 6 0 12 M100 30 q6 6 0 12" stroke={S.amber} strokeWidth="2" fill="none" />
    </Scene>
  );
}

function Battery() {
  return (
    <Scene>
      {[0, 1].map(i => (
        <g key={i} transform={`translate(${16 + i * 44} 34)`}>
          <rect width="38" height="30" rx="2" fill={S.ink} />
          <rect x="4" y="5" width="30" height="20" rx="1" fill="#4C51BF" />
          <path d="M20 8 L15 16 L20 16 L17 23 L25 13 L20 13 Z" fill={S.sun} />
        </g>
      ))}
    </Scene>
  );
}

function Floating() {
  return (
    <Scene>
      <rect y="56" width="120" height="28" fill={S.water} />
      {[62, 70, 78].map(y => <path key={y} d={`M0 ${y} q10 -3 20 0 t20 0 t20 0 t20 0 t20 0`} stroke={S.waterDark} strokeWidth="1.5" fill="none" />)}
      <Panels x={20} y={44} n={2} /><Panels x={62} y={44} n={2} />
    </Scene>
  );
}

function Biogas() {
  return (
    <Scene>
      <path d="M18 64 a22 22 0 0 1 44 0 Z" fill={S.wallDark} />
      <path d="M24 64 a16 16 0 0 1 32 0 Z" fill={S.wall} />
      <rect x="38" y="36" width="4" height="8" fill={S.ink} />
      <path d="M62 58 L78 58 L78 64" stroke={S.ink} strokeWidth="2.5" fill="none" />
      <rect x="78" y="50" width="18" height="14" rx="2" fill={S.tree} />
      <path d="M87 53 l0 6 M84 56 l6 0" stroke="#DCFCE7" strokeWidth="1.6" />
    </Scene>
  );
}

function Datacenter() {
  return (
    <Scene>
      <rect x="30" y="22" width="60" height="42" rx="2" fill={S.ink} />
      {[0, 1, 2, 3].map(r => [0, 1, 2].map(c => (
        <rect key={`${r}${c}`} x={36 + c * 16} y={27 + r * 9} width="12" height="6" rx="1" fill={r === 1 && c === 1 ? S.waterDark : '#475569'} />
      )))}
      <rect x="14" y="44" width="12" height="20" fill={S.wallDark} />
      <path d="M16 44 l4 -8 l4 8" stroke={S.ink} strokeWidth="2" fill="none" />
      <path d="M20 34 L20 26 M16 30 L24 30" stroke={S.ink} strokeWidth="1.5" />
    </Scene>
  );
}

function Warehouse() {
  return (
    <Scene>
      <rect x="16" y="34" width="88" height="30" rx="2" fill={S.wall} />
      <path d="M16 34 L104 34 L96 26 L24 26 Z" fill={S.roof} />
      {[0, 1, 2].map(i => <rect key={i} x={30 + i * 14} y="28" width="11" height="6" rx="1" fill={S.panel} />)}
      {[0, 1, 2].map(i => (
        <g key={i} transform={`translate(${26 + i * 26} 44)`}>
          <rect width="18" height="20" rx="1" fill={S.wallDark} />
          {[0, 1, 2].map(l => <rect key={l} x="2" y={3 + l * 5} width="14" height="2" fill={S.roof} />)}
        </g>
      ))}
    </Scene>
  );
}

function Forest() {
  return (
    <Scene>
      {[[24, 30, 14], [52, 22, 18], [82, 28, 15], [100, 38, 11]].map(([x, y, r], i) => (
        <g key={i}>
          <rect x={x - 2} y={y + r - 2} width="4" height={64 - y - r + 4} fill={S.trunk} />
          <circle cx={x} cy={y} r={r} fill={i % 2 ? S.tree : S.treeDark} />
        </g>
      ))}
    </Scene>
  );
}

function Shop({ sign, signColor }) {
  return (
    <Scene>
      <rect x="26" y="34" width="68" height="30" rx="2" fill={S.wall} />
      <path d="M22 34 h76 v-6 a4 4 0 0 0 -4 -4 h-68 a4 4 0 0 0 -4 4 Z" fill={signColor} />
      {[0, 1, 2, 3].map(i => <path key={i} d={`M${30 + i * 16} 34 a8 6 0 0 0 16 0`} fill={i % 2 ? '#FFF' : signColor} />)}
      <rect x="34" y="44" width="20" height="20" rx="1" fill={S.waterDark} />
      <rect x="62" y="44" width="24" height="14" rx="1" fill={S.wallDark} />
      <text x="60" y="30" textAnchor="middle" fontSize="7" fill="#FFF" fontWeight="bold">{sign}</text>
    </Scene>
  );
}

function Storage() {
  return (
    <Scene>
      <rect x="14" y="28" width="92" height="36" rx="2" fill={S.wall} />
      <path d="M14 28 L106 28 L98 20 L22 20 Z" fill={S.violet} />
      {[0, 1, 2].map(i => (
        <g key={i} transform={`translate(${20 + i * 30} 34)`}>
          <rect width="24" height="30" rx="1" fill={S.wallDark} />
          {[0, 1, 2, 3, 4].map(l => <rect key={l} x="2" y={3 + l * 5.4} width="20" height="2.6" fill={S.roof} />)}
        </g>
      ))}
    </Scene>
  );
}

function Court() {
  return (
    <Scene>
      <rect x="20" y="24" width="80" height="44" rx="3" fill={S.tree} />
      <rect x="24" y="28" width="72" height="36" fill="none" stroke="#FFF" strokeWidth="1.5" />
      <path d="M60 28 L60 64 M24 46 L96 46" stroke="#FFF" strokeWidth="1.5" />
      <path d="M42 28 L42 64 M78 28 L78 64" stroke="#FFF" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M104 12 q4 6 0 10 M108 10 q5 7 0 12" stroke={S.ink} strokeWidth="1.5" fill="none" />
    </Scene>
  );
}

function Stay() {
  return (
    <Scene>
      <g transform="translate(20 34)">
        <rect width="34" height="24" rx="2" fill={S.wall} />
        <path d="M-4 0 L17 -14 L38 0 Z" fill={S.trunk} />
        <rect x="12" y="10" width="10" height="14" rx="1" fill={S.trunk} />
      </g>
      <path d="M74 58 L88 30 L102 58 Z" fill={S.violet} />
      <path d="M82 58 L88 44 L94 58 Z" fill="#EDE9FE" />
      <rect x="104" y="40" width="3" height="24" fill={S.trunk} />
      <circle cx="105" cy="34" r="10" fill={S.tree} />
    </Scene>
  );
}

function Laundry() {
  return (
    <Scene>
      {[0, 1, 2].map(i => (
        <g key={i} transform={`translate(${20 + i * 30} 30)`}>
          <rect width="24" height="34" rx="2" fill={S.wall} />
          <circle cx="12" cy="21" r="8" fill={S.waterDark} />
          <circle cx="12" cy="21" r="5" fill={S.water} />
          <rect x="4" y="4" width="10" height="4" rx="2" fill={S.wallDark} />
          <circle cx="19" cy="6" r="1.6" fill={S.red} />
        </g>
      ))}
    </Scene>
  );
}

function CarWash() {
  return (
    <Scene>
      <path d="M14 34 L60 34 L54 24 L20 24 Z" fill={S.panel} />
      <rect x="16" y="34" width="3" height="30" fill={S.panelDark} />
      <rect x="55" y="34" width="3" height="30" fill={S.panelDark} />
      <g transform="translate(28 46)">
        <rect width="40" height="14" rx="6" fill={S.wallDark} />
        <rect x="6" y="-4" width="16" height="7" rx="3" fill={S.waterDark} />
        <circle cx="10" cy="15" r="4.5" fill={S.ink} />
        <circle cx="30" cy="15" r="4.5" fill={S.ink} />
      </g>
      {[[78, 34], [88, 40], [84, 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.4" fill={S.waterDark} />)}
      <rect x="76" y="46" width="24" height="18" rx="2" fill={S.wall} />
      <rect x="80" y="50" width="16" height="4" rx="2" fill={S.water} />
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
  'minimart': () => <Shop sign="MART" signColor={S.panel} />,
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
