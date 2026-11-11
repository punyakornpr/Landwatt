import React from 'react';
import { navigate } from '../router';
import { PageHead, GlossaryHint, Note } from '../components/ui';
import { useT } from '../i18n';
import {
  MapPin, Ruler, Target, Sparkles, Save, HelpCircle, ArrowRight, Info,
} from 'lucide-react';

const STEPS = [
  {
    icon: MapPin, t: 'Step 1 — Describe your land',
    items: [
      'Drop a pin on the map or pick a province — exact coordinates not needed',
      'Enter size in rai-ngan-square wah, or draw the boundary on the map (a drawn boundary is not a legal survey)',
      'pick the closest land type — choose "Not sure yet" if unsure',
    ],
  },
  {
    icon: Target, t: 'Step 2 — Goals & budget',
    items: [
      'Pick what you want the land to help with — multiple allowed, or let the system suggest',
      'budget is only a filter, not a real price — "Not sure" is fine',
      'Extra questions only relate to your goals — all skippable',
    ],
  },
  {
    icon: Sparkles, t: 'Step 3 — Review suggested options',
    items: [
      'The system ranks options with reasons and cautions',
      'statuses "Great fit / Worth exploring / Needs more data / Not recommended" come from system criteria, not success odds',
      'press "why this score?" to see the factors used',
    ],
  },
  {
    icon: Ruler, t: 'Step 4 — Review a plan',
    items: [
      'See a simulated layout, investment, benefits and rough payback',
      'the "Engineering details" view has specs, formulas and engineering diagrams for experts',
    ],
  },
  {
    icon: Save, t: 'Step 5 — Save plans & download a report',
    items: [
      'save plans in "My projects" and compare 2–3 side by side',
      'Print/download a summary report with a pre-investment checklist',
    ],
  },
];

const GLOSSARY = [
  ['kWp (kilowatt-peak)', 'Combined generation capacity of the solar panels — the bigger the more power'],
  ['kWh (energy unit)', 'Actual electricity used or produced — household bills use this unit'],
  ['FiT', 'The rate utilities pay small producers under state programs — has conditions and quotas'],
  ['Battery (BESS)', 'Stores electricity for later, e.g. daytime solar power for night use'],
  ['Transformer', 'Steps voltage up or down to match the utility grid'],
  ['Grid interconnection point', 'Where your system connects to the utility line — the farther the costlier'],
  ['Payback period', 'Time until accumulated income/savings equals the investment — an estimate, not a guarantee'],
  ['Suitability score', 'A system score from land, sun, road and grid criteria — for comparing options only'],
];

export default function Help() {
  const t = useT();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <PageHead
        title={t('How to use')}
        sub={t('LandWatt is made for people with no electrical background — just knowing where the land is and roughly how big it is is enough to start')}
      />

      <div className="space-y-4">
        {STEPS.map((s, i) => (
          <div key={i} className="card p-5 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0">
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">{t(s.t)}</h2>
              <ul className="mt-2 space-y-1.5">
                {s.items.map((it, j) => (
                  <li key={j} className="text-sm text-ink-soft leading-relaxed flex items-start gap-2">
                    <span className="text-brand-600 mt-1">•</span> {t(it)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5 mt-6">
        <h2 className="font-semibold flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-brand-600" /> {t('Terms you may see')}
        </h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {GLOSSARY.map(([term, def], i) => (
            <div key={i}>
              <div className="text-sm font-medium">{t(term)}</div>
              <div className="text-xs text-ink-faint leading-relaxed mt-0.5">{t(def)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <Note>
          {t('Limitations to know:') + ' ' + t('LandWatt results are preliminary estimates from your inputs and system assumptions. The system has no live data feeds (real grid positions, current installation prices, purchase quotas) — so it does not certify feasibility or real prices/income. Survey the site and consult experts before deciding')}
        </Note>
        <div className="text-center">
          <button onClick={() => navigate('/start')} className="btn-primary px-8">
            {t('Ready — analyze my land')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
