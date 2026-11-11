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
  { path: '', label: 'Home' },
  { path: 'start', label: 'Analyze land' },
  { path: 'projects', label: 'My projects' },
  { path: 'help', label: 'How to use' },
];

function NavBar() {
  const { path } = useRoute();
  const { projects } = useApp();
  const [open, setOpen] = React.useState(false);

  const linkCls = (p) => `px-3 py-2 rounded-lg text-sm font-medium transition ${
    path === p ? 'text-brand-800 bg-brand-50' : 'text-ink-soft hover:text-ink hover:bg-black/[0.04]'
  }`;

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl saturate-150 border-b border-black/[0.08]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-electric-500 flex items-center justify-center text-white shadow-md shadow-brand-600/30">
            <Sun className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="font-bold text-base tracking-tight leading-none">LandWatt</div>
            <div className="text-[10px] text-ink-faint leading-tight mt-0.5 hidden sm:block">Land-energy planning assistant</div>
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

        <button className="md:hidden p-2" onClick={() => setOpen(o => !o)} aria-label="Menu">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-black/[0.08] bg-white/95 backdrop-blur-xl px-4 py-3 space-y-1">
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
      <main key={path} className="flex-1 animate-in">{page}</main>
      <footer className="border-t border-[#E8E8ED] py-8 px-4 sm:px-6 text-center no-print">
        <p className="text-xs text-ink-faint">
          LandWatt — results are preliminary estimates, not legal or price guarantees ·
          Your data is stored only in this browser
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
