import React, { useState, useEffect } from 'react';
import {
  Sun, Sprout, Zap, BatteryCharging, Waves, Flame,
  TrendingUp, PiggyBank, Lightbulb, ChevronDown,
  CheckCircle2, AlertTriangle, Info, HelpCircle,
} from 'lucide-react';
import { STATUS, PROJECT_FRIENDLY } from '../engine/recommend';

export const ICONS = {
  Sun, Sprout, Zap, BatteryCharging, Waves, Flame,
  TrendingUp, PiggyBank, Lightbulb,
};

export function Reveal({ children, delay = 0, className = '' }) {
  const [ref, setRef] = useState(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setShown(true);
        io.disconnect();
      }
    }, { threshold: 0.12 });
    io.observe(ref);
    return () => io.disconnect();
  }, [ref]);
  return (
    <div
      ref={setRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${className} transition-all duration-500 ease-out ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {children}
    </div>
  );
}

export function PageHead({ title, sub, children }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
      {sub && <p className="mt-1.5 text-sm text-ink-soft leading-relaxed max-w-2xl">{sub}</p>}
      {children}
    </div>
  );
}

export function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.insufficient;
  return (
    <span className={`chip border ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export function ProjectIcon({ id, size = 'md', active }) {
  const meta = PROJECT_FRIENDLY[id] || {};
  const Icon = ICONS[meta.icon] || Zap;
  const cls = size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const icls = size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  return (
    <div className={`${cls} rounded-xl flex items-center justify-center flex-shrink-0 ${
      active ? 'bg-gradient-to-br from-brand-600 to-electric-500 text-white shadow-md shadow-brand-600/25' : 'bg-brand-50 text-brand-700'
    }`}>
      <Icon className={icls} />
    </div>
  );
}

export function StepProgress({ steps, current }) {
  return (
    <div className="flex items-center gap-0 w-full" aria-label="Steps">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            {i > 0 && <div className={`flex-1 h-0.5 mx-1 sm:mx-2 rounded ${i <= current ? 'bg-brand-600' : 'bg-[#E8E8ED]'}`} />}
            <div className="flex flex-col items-center gap-1 min-w-0">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition ${
                done ? 'bg-brand-600 text-white' :
                active ? 'bg-brand-700 text-white ring-4 ring-brand-100' :
                'bg-[#E8E8ED] text-ink-faint'
              }`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[10px] sm:text-xs text-center leading-tight max-w-[72px] sm:max-w-none ${
                active ? 'text-ink font-medium' : 'text-ink-faint'
              }`}>{s}</span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function Collapsible({ title, sub, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-black/[0.02] transition"
        aria-expanded={open}
      >
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {sub && <div className="text-xs text-ink-faint mt-0.5">{sub}</div>}
        </div>
        <ChevronDown className={`w-5 h-5 text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-[#EBEBEF]">{children}</div>}
    </div>
  );
}

export function OptionCard({ selected, onClick, icon: IconCmp, title, sub }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 hover:-translate-y-0.5 hover:shadow-md ${
        selected
          ? 'border-brand-600 bg-brand-50/60 shadow-md shadow-brand-600/10'
          : 'border-[#E8E8ED] bg-white hover:border-brand-300'
      }`}
    >
      {IconCmp && (
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          selected ? 'bg-brand-700 text-white' : 'bg-[#F5F5F7] text-ink-soft'
        }`}>
          <IconCmp className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0">
        <div className={`text-sm font-semibold ${selected ? 'text-brand-900' : 'text-ink'}`}>{title}</div>
        {sub && <div className="text-xs text-ink-faint mt-0.5 leading-relaxed">{sub}</div>}
      </div>
      <div className={`ml-auto mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
        selected ? 'border-brand-600 bg-brand-600' : 'border-[#D2D2D7]'
      }`}>
        {selected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
      </div>
    </button>
  );
}

export function Note({ type = 'info', children }) {
  const styles = {
    info: 'bg-electric-50 border-electric-200 text-electric-900',
    warn: 'bg-volt-50 border-volt-200 text-volt-900',
    ok: 'bg-energy-50 border-energy-200 text-energy-900',
  };
  const Icon = type === 'warn' ? AlertTriangle : type === 'ok' ? CheckCircle2 : Info;
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm leading-relaxed ${styles[type]}`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-70" />
      <div>{children}</div>
    </div>
  );
}

export function GlossaryHint({ term, hint }) {
  return (
    <span className="inline-flex items-center gap-1">
      {term}
      <span className="group relative inline-block">
        <HelpCircle className="w-3.5 h-3.5 text-ink-faint cursor-help" />
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-52 p-2.5 rounded-lg bg-ink text-white text-[11px] leading-relaxed font-normal z-30 shadow-lg">
          {hint}
        </span>
      </span>
    </span>
  );
}

export function fmtTHB(millionTHB) {
  const v = parseFloat(millionTHB);
  if (!isFinite(v)) return '—';
  if (v >= 1000) return `฿${(v / 1000).toFixed(2)}B`;
  if (v >= 1) return `฿${v.toFixed(2)}M`;
  return `฿${Math.round(v * 1000000).toLocaleString()}`;
}

export function DisclaimerStrip() {
  return (
    <div className="rounded-xl bg-[#F5F5F7] border border-[#E8E8ED] px-4 py-3 text-xs text-ink-soft leading-relaxed flex items-start gap-2">
      <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-ink-faint" />
      <span>
        All results are <strong>preliminary estimates</strong> from the data provided and system assumptions —
        not a guarantee of land rights, permits, or actual prices/income. Survey the site and confirm with the authorities before investing
      </span>
    </div>
  );
}
