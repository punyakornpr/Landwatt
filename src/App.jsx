import React from 'react';
import { AppStateProvider, useApp } from './state/AppState';
import { useRoute, navigate } from './router';
import Landing from './pages/Landing';
import Wizard from './pages/Wizard';
import Results from './pages/Results';
import PlanDetail from './pages/PlanDetail';
import Compare from './pages/Compare';
import MyProjects from './pages/MyProjects';
import Help from './pages/Help';
import Report from './pages/Report';
import { Sun, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { path: '', label: 'หน้าแรก' },
  { path: 'start', label: 'เริ่มวิเคราะห์ที่ดิน' },
  { path: 'projects', label: 'โครงการของฉัน' },
  { path: 'help', label: 'วิธีใช้งาน' },
];

function NavBar() {
  const { path } = useRoute();
  const { projects } = useApp();
  const [open, setOpen] = React.useState(false);

  const linkCls = (p) => `px-3 py-2 rounded-lg text-sm font-medium transition ${
    path === p ? 'text-brand-800 bg-brand-50' : 'text-ink-soft hover:text-ink hover:bg-black/[0.04]'
  }`;

  return (
    <header className="sticky top-0 z-40 bg-paper/90 backdrop-blur-md border-b border-[#E7E5DD]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center text-white">
            <Sun className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="font-bold text-base tracking-tight leading-none">LandWatt</div>
            <div className="text-[10px] text-ink-faint leading-tight mt-0.5 hidden sm:block">ผู้ช่วยวางแผนที่ดินด้านพลังงาน</div>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(n => (
            <button key={n.path} onClick={() => navigate(`/${n.path}`)} className={linkCls(n.path)}>
              {n.label}{n.path === 'projects' && projects.length > 0 && (
                <span className="ml-1.5 text-[10px] bg-brand-700 text-white rounded-full px-1.5 py-0.5">{projects.length}</span>
              )}
            </button>
          ))}
        </nav>

        <button className="md:hidden p-2" onClick={() => setOpen(o => !o)} aria-label="เมนู">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-[#E7E5DD] bg-paper px-4 py-3 space-y-1">
          {NAV_ITEMS.map(n => (
            <button key={n.path}
              onClick={() => { setOpen(false); navigate(`/${n.path}`); }}
              className={`block w-full text-left ${linkCls(n.path)}`}>
              {n.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}

function RoutedApp() {
  const { path, param } = useRoute();

  let page;
  switch (path) {
    case '': page = <Landing />; break;
    case 'start': page = <Wizard />; break;
    case 'results': page = <Results />; break;
    case 'plan': page = <PlanDetail projectId={param} />; break;
    case 'compare': page = <Compare />; break;
    case 'projects': page = <MyProjects />; break;
    case 'help': page = <Help />; break;
    case 'report': page = <Report projectId={param} />; break;
    default: page = <Landing />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">{page}</main>
      <footer className="border-t border-[#E7E5DD] py-8 px-4 sm:px-6 text-center no-print">
        <p className="text-xs text-ink-faint">
          LandWatt — ผลลัพธ์เป็นการประเมินเบื้องต้น ไม่ใช่การรับรองทางกฎหมายหรือราคาจริง ·
          ข้อมูลเก็บในเบราว์เซอร์ของคุณเท่านั้น
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <RoutedApp />
    </AppStateProvider>
  );
}
