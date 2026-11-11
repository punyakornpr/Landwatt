import React from 'react';
import { navigate } from '../router';
import { useApp } from '../state/AppState';
import { PROVINCES_DATA } from '../data/provinces';
import {
  ArrowRight, MapPin, ListChecks, FileText, Sun, Sprout, Zap,
  HelpCircle, CheckCircle2, PlayCircle, ChevronRight,
} from 'lucide-react';
import { DisclaimerStrip, Reveal } from '../components/ui';
import { useT } from '../i18n';
import heroBg from '../assets/hero-landscape.svg';

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
  const { updateLand, updateGoals, lang } = useApp();
  const t = useT();

  const useExample = (ex) => {
    updateLand(ex.patch.land);
    updateGoals(ex.patch.goals);
    navigate('/start?step=2');
  };

  return (
    <div className="pb-16">
      {/* Hero */}
      <section
        className="relative overflow-hidden bg-cover bg-[center_62%] hero-scene"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/10 to-white pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-36 sm:pb-48 text-center">
          <h1 className={`text-4xl sm:text-6xl font-bold animate-in ${lang === 'th' ? 'leading-[1.25]' : 'tracking-tight leading-[1.08]'}`} style={{ animationDelay: '90ms' }}>
            {t('Your vacant land')}<br className="sm:hidden" />{' '}
            <span className="bg-gradient-to-r from-brand-700 via-brand-600 to-electric-500 bg-clip-text text-transparent">
              {t('can do more than you think')}
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-xl text-ink-soft max-w-2xl mx-auto leading-relaxed animate-in" style={{ animationDelay: '180ms' }}>
            {t('Tell us where your land is and what you want — LandWatt compares energy options and estimates area, investment and returns in plain terms')}
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 animate-in" style={{ animationDelay: '270ms' }}>
            <button onClick={() => navigate('/start')} className="btn-primary text-base px-7 py-3.5 w-full sm:w-auto">
              {t('Plan my land')} <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => useExample(EXAMPLES[0])} className="btn-secondary text-base px-7 py-3.5 w-full sm:w-auto">
              <PlayCircle className="w-4 h-4" /> {t('Try an example')}
            </button>
          </div>
          <p className="mt-4 animate-in" style={{ animationDelay: '360ms' }}>
            <span className="inline-flex items-center gap-1.5 rounded-2xl bg-white/75 backdrop-blur px-4 py-1.5 text-xs text-ink-soft shadow-sm">
              {t('No sign-up · no electrical knowledge needed · under 2 minutes')}
            </span>
          </p>
        </div>
      </section>

      {/* Why LandWatt */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-center">{t('Why LandWatt')}</h2>
        <p className="text-sm text-ink-faint text-center mt-1">{t('Simple for anyone — rigorous engineering underneath')}</p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: MapPin, title: 'Know what suits your land', desc: 'Answer simple questions about the land and see fitting options with reasons' },
            { icon: ListChecks, title: 'See it before you invest', desc: 'Simulated layout, usable area, investment and cautions' },
            { icon: FileText, title: 'Compare cost & value', desc: 'Put 2–3 plans side by side and download a summary to decide' },
          ].map((c, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="card p-6 h-full">
                <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-4">
                  <c.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">{t(c.title)}</h3>
                <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">{t(c.desc)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[#F5F5F7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <h2 className="text-xl sm:text-2xl font-bold text-center">{t('How it works')}</h2>
        <p className="text-sm text-ink-faint text-center mt-1">{t('4 easy steps, done in a few minutes')}</p>
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: MapPin, t: 'Describe your land', d: 'Location, size and terrain' },
            { icon: Sun, t: 'Get recommendations', d: 'Ranked options with reasons' },
            { icon: ListChecks, t: 'Review a plan', d: 'Simulation, investment and cautions' },
            { icon: FileText, t: 'Download a summary', d: 'Save plans and print a short report' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 60}>
            <div className="relative card p-5 text-center h-full">
              <div className="relative w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-700 text-white text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <div className="text-base font-semibold">{t(s.t)}</div>
              <div className="text-xs text-ink-faint mt-1 leading-relaxed">{t(s.d)}</div>
              {i < 3 && (
                <ChevronRight className="hidden lg:block absolute left-full top-1/2 -translate-y-1/2 w-4 h-4 text-mute-300" />
              )}
            </div>
            </Reveal>
          ))}
        </div>
      </div>
      </section>

      {/* Examples */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-center">{t('Try an example')}</h2>
        <p className="text-sm text-ink-faint text-center mt-1">{t('Click to fill the real form with sample data, then adjust to your land')}</p>
        <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {EXAMPLES.map((ex, i) => {
            const icons = [Sun, Zap, Sprout];
            const Icon = icons[i];
            return (
              <Reveal key={ex.id} delay={i * 80}>
              <button onClick={() => useExample(ex)}
                className="card p-6 text-left hover:border-brand-400 transition group w-full h-full">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] text-ink-soft flex items-center justify-center group-hover:bg-brand-700 group-hover:text-white transition">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="chip bg-volt-100 text-volt-800 border border-volt-200">{t('Demo data')}</span>
                </div>
                <h3 className="mt-4 font-semibold text-lg">{t(ex.label)}</h3>
                <p className="mt-1 text-sm text-ink-soft leading-relaxed">{t(ex.desc)}</p>
                <span className="mt-3 inline-flex items-center text-sm font-medium text-brand-700">
                  {t('Use this example')} <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition" />
                </span>
              </button>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Reveal><DisclaimerStrip /></Reveal>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">{t('Frequently asked questions')}</h2>
        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={i} delay={i * 50}>
            <details className="card group open:bg-white">
              <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none">
                <span className="flex items-center gap-2.5 text-sm font-medium">
                  <HelpCircle className="w-4 h-4 text-brand-600 flex-shrink-0" /> {t(f.q)}
                </span>
                <span className="text-ink-faint group-open:rotate-45 transition text-lg leading-none">+</span>
              </summary>
              <p className="px-5 pb-4 pl-[42px] text-sm text-ink-soft leading-relaxed">{t(f.a)}</p>
            </details>
            </Reveal>
          ))}
        </div>
        <div className="text-center mt-10">
          <button onClick={() => navigate('/start')} className="btn-primary px-8 py-3.5">
            {t('Analyze my land')} <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
