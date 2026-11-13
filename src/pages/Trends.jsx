import React from 'react';
import { navigate } from '../router';
import { useApp } from '../state/AppState';
import { TRENDS, TREND_GROUPS, TREND_HIGHLIGHTS } from '../data/trendsData';
import { projectFriendly } from '../engine/recommend';
import { PageHead, Reveal, DisclaimerStrip, PageBackdrop, ICONS } from '../components/ui';
import { useT } from '../i18n';
import { CheckCircle2, MapPin, ArrowRight, ArrowUpRight } from 'lucide-react';

const SIGNALS = {
  hot:    ['Hot right now', 'มาแรงมาก',   'bg-volt-100 text-volt-800 border-volt-200'],
  rising: ['Rising fast',  'กำลังโตเร็ว', 'bg-electric-100 text-electric-800 border-electric-200'],
  steady: ['Steady demand', 'ดีมานด์นิ่ง', 'bg-energy-100 text-energy-800 border-energy-200'],
};

export default function Trends() {
  const { lang } = useApp();
  const t = useT();
  const L = pair => (lang === 'th' ? pair[1] : pair[0]);
  const year = new Date().getFullYear();
  const yearLabel = lang === 'th' ? `พ.ศ. ${year + 543}` : String(year);

  return (
    <div className="relative">
      <PageBackdrop />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <PageHead
          title={`${t('Business trends')} ${yearLabel}`}
          sub={t('Six sectors gaining momentum on Thai land this year — digital, health, food, lifestyle, clean energy and logistics. General market context, not advice for a specific plot.')}
        />

        <Reveal>
          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            {TREND_HIGHLIGHTS.map((h, i) => (
              <div key={i} className="card p-4 flex gap-2.5">
                <ArrowUpRight className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-ink-soft leading-relaxed">{L(h)}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {TREND_GROUPS.map(g => {
          const GIcon = ICONS[g.icon];
          const items = TRENDS.filter(x => x.group === g.id);
          return (
            <section key={g.id} className="mb-10">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0">
                  {GIcon && <GIcon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-xl font-bold">{L(g.title)}</h2>
                    <span className="text-xs text-ink-faint">{items.length}</span>
                  </div>
                  <p className="text-xs text-ink-faint mt-0.5">{L(g.blurb)}</p>
                </div>
              </div>
              <div className="grid lg:grid-cols-2 gap-4">
                {items.map((tr, i) => {
                  const Icon = ICONS[tr.icon];
                  const sig = SIGNALS[tr.signal] || SIGNALS.steady;
                  return (
                    <Reveal key={tr.id} delay={i * 40}>
                      <article className="card p-5 h-full flex flex-col">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0">
                            {Icon && <Icon className="w-6 h-6" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold">{L(tr.title)}</h3>
                              <span className={`chip border ${sig[2]}`}>{lang === 'th' ? sig[1] : sig[0]}</span>
                            </div>
                            <p className="mt-1 text-sm text-ink-soft leading-relaxed">{L(tr.tag)}</p>
                          </div>
                        </div>

                        <div className="mt-3.5">
                          <div className="text-[11px] font-semibold text-ink-faint uppercase tracking-wide">{t('Why now')}</div>
                          <ul className="mt-1.5 space-y-1.5">
                            {tr.why.map((w, wi) => (
                              <li key={wi} className="flex gap-2 text-sm text-ink-soft leading-relaxed">
                                <CheckCircle2 className="w-4 h-4 text-energy-600 flex-shrink-0 mt-0.5" />
                                <span>{L(w)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-3 flex items-start gap-1.5 text-xs text-ink-faint">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                          <span><span className="font-medium">{t('Fits land that is')}:</span> {L(tr.land)}</span>
                        </div>

                        {tr.plans?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#F0F0F2] flex flex-wrap gap-1.5">
                            {tr.plans.map(pid => (
                              <button key={pid} onClick={() => navigate(`/plan/${pid}`)}
                                className="chip border border-[#E8E8ED] bg-paper text-ink-soft hover:border-brand-300 hover:text-ink transition">
                                {projectFriendly(pid, lang).name} <ArrowRight className="w-3 h-3 inline -mt-0.5" />
                              </button>
                            ))}
                          </div>
                        )}
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            </section>
          );
        })}

        <Reveal>
          <div className="card p-6 sm:p-8 text-center bg-gradient-to-br from-brand-700 to-electric-600 !border-0 text-white">
            <h3 className="text-lg sm:text-xl font-bold">{t('See which of these fits your land')}</h3>
            <p className="text-sm text-white/80 mt-1.5">{t('The analyzer scores each option against your actual plot, budget and goals')}</p>
            <button onClick={() => navigate('/start')}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white text-brand-800 font-semibold px-6 py-3 hover:bg-brand-50 transition">
              {t('Analyze my land')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </Reveal>
        <div className="mt-6"><DisclaimerStrip /></div>
      </div>
    </div>
  );
}
