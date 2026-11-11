import React from 'react';
import { navigate } from '../router';
import { useApp } from '../state/AppState';
import { PROVINCES_DATA } from '../data/provinces';
import {
  ArrowRight, MapPin, ListChecks, FileText, Sun, Sprout, Zap,
  HelpCircle, CheckCircle2, PlayCircle,
} from 'lucide-react';
import { DisclaimerStrip } from '../components/ui';

const EXAMPLES = [
  {
    id: 'ex-rural',
    label: 'Rural land',
    desc: 'Nakhon Ratchasima, 10 rai of open flat land — good for solar',
    patch: {
      land: {
        areaSqM: 16000, provinceId: 'korat', provinceData: PROVINCES_DATA.find(p => p.id === 'korat'),
        coordinates: { lat: 14.9799, lng: 102.0977 }, roadType: 'secondary', roadWidthMeters: 8,
        gridDistanceMeters: 200, landType: 'flat', hasWaterBody: false, hasAgriculturalWaste: false,
      },
      goals: { aims: ['income'], budget: 'unsure' },
    },
  },
  {
    id: 'ex-roadside',
    label: 'Roadside plot',
    desc: 'Chonburi, 2 rai on a main road — good for an EV charger',
    patch: {
      land: {
        areaSqM: 3200, provinceId: 'chonburi', provinceData: PROVINCES_DATA.find(p => p.id === 'chonburi'),
        coordinates: { lat: 13.3611, lng: 100.9847 }, roadType: 'main', roadWidthMeters: 14,
        gridDistanceMeters: 100, landType: 'flat', hasWaterBody: false, hasAgriculturalWaste: false,
      },
      goals: { aims: ['ev'], budget: 'unsure' },
    },
  },
  {
    id: 'ex-farm',
    label: 'Farm or orchard',
    desc: 'Saraburi, 5 rai of farmland — good for agrivoltaics',
    patch: {
      land: {
        areaSqM: 8000, provinceId: 'saraburi', provinceData: PROVINCES_DATA.find(p => p.id === 'saraburi'),
        coordinates: { lat: 14.5289, lng: 100.9101 }, roadType: 'secondary', roadWidthMeters: 6,
        gridDistanceMeters: 200, landType: 'agri', hasWaterBody: false, hasAgriculturalWaste: true,
      },
      goals: { aims: ['farm', 'income'], budget: 'unsure' },
    },
  },
];

const FAQS = [
  { q: 'I don\u2019t know the exact coordinates — can I still use it?', a: 'Yes. Pick a province or drop a pin roughly — the closer the position, the better the solar and grid estimates.' },
  { q: 'No fixed budget yet — is that OK?', a: 'Yes. The system shows rough investment ranges for each option first; you can filter by budget later.' },
  { q: 'Does it cost anything?', a: 'This estimator is free to use. Your inputs stay on your device only.' },
  { q: 'Are the investment and revenue figures real prices?', a: 'They are estimates from system-wide assumptions, not quotations. Real prices depend on contractors, equipment and grid-connection terms at the time.' },
  { q: 'Where does my input data go?', a: 'Data stays in your browser (localStorage); nothing is sent to a server.' },
];

export default function Landing() {
  const { updateLand, updateGoals } = useApp();

  const useExample = (ex) => {
    updateLand(ex.patch.land);
    updateGoals(ex.patch.goals);
    navigate('/start?step=2');
  };

  return (
    <div className="pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/80 via-paper to-paper pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-14 text-center">
          <span className="chip bg-white border border-brand-200 text-brand-800 mb-5">
            <Sun className="w-3.5 h-3.5" /> Land-use energy planning assistant
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            Your vacant land can<br className="sm:hidden" /> do more than you think
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed">
            Tell us where your land is and what you want — LandWatt compares energy options
            and estimates area, investment and returns in plain terms
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button onClick={() => navigate('/start')} className="btn-primary text-base px-7 py-3.5 w-full sm:w-auto">
              Plan my land <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => useExample(EXAMPLES[0])} className="btn-secondary text-base px-7 py-3.5 w-full sm:w-auto">
              <PlayCircle className="w-4 h-4" /> Try an example
            </button>
          </div>
          <p className="mt-4 text-xs text-ink-faint">No sign-up · no electrical knowledge needed · under 2 minutes</p>
        </div>
      </section>

      {/* Why LandWatt */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: MapPin, title: 'Know what suits your land', desc: 'Answer simple questions about the land and see fitting options with reasons' },
            { icon: ListChecks, title: 'See it before you invest', desc: 'Simulated layout, usable area, investment and cautions' },
            { icon: FileText, title: 'Compare cost & value', desc: 'Put 2–3 plans side by side and download a summary to decide' },
          ].map((c, i) => (
            <div key={i} className="card p-6">
              <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-4">
                <c.icon className="w-5.5 h-5.5 w-6 h-6" />
              </div>
              <h3 className="font-semibold">{c.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-center">How it works</h2>
        <p className="text-sm text-ink-faint text-center mt-1">4 easy steps, done in a few minutes</p>
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: MapPin, t: 'Describe your land', d: 'Location, size and terrain' },
            { icon: Sun, t: 'Get recommendations', d: 'Ranked options with reasons' },
            { icon: ListChecks, t: 'Review a plan', d: 'Simulation, investment and cautions' },
            { icon: FileText, t: 'Download a summary', d: 'Save plans and print a short report' },
          ].map((s, i) => (
            <div key={i} className="relative card p-5 text-center">
              <span className="absolute top-3 left-4 text-xs font-bold text-brand-600">Step {i + 1}</span>
              <div className="w-11 h-11 rounded-full bg-brand-700 text-white flex items-center justify-center mx-auto mt-2 mb-3">
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-sm font-semibold">{s.t}</div>
              <div className="text-xs text-ink-faint mt-1 leading-relaxed">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Examples */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-center">Try an example</h2>
        <p className="text-sm text-ink-faint text-center mt-1">Click to fill the real form with sample data, then adjust to your land</p>
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {EXAMPLES.map((ex, i) => {
            const icons = [Sun, Zap, Sprout];
            const Icon = icons[i];
            return (
              <button key={ex.id} onClick={() => useExample(ex)}
                className="card p-6 text-left hover:border-brand-400 transition group">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F3F1EA] text-ink-soft flex items-center justify-center group-hover:bg-brand-700 group-hover:text-white transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="chip bg-volt-100 text-volt-800 border border-volt-200">Demo data</span>
                </div>
                <h3 className="mt-4 font-semibold">{ex.label}</h3>
                <p className="mt-1 text-sm text-ink-soft leading-relaxed">{ex.desc}</p>
                <span className="mt-3 inline-flex items-center text-sm font-medium text-brand-700">
                  Use this example <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <DisclaimerStrip />
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <details key={i} className="card group open:bg-white">
              <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none">
                <span className="flex items-center gap-2.5 text-sm font-medium">
                  <HelpCircle className="w-4 h-4 text-brand-600 flex-shrink-0" /> {f.q}
                </span>
                <span className="text-ink-faint group-open:rotate-45 transition text-lg leading-none">+</span>
              </summary>
              <p className="px-5 pb-4 pl-[42px] text-sm text-ink-soft leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="text-center mt-10">
          <button onClick={() => navigate('/start')} className="btn-primary px-8 py-3.5">
            Analyze my land <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
