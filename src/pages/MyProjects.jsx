import React, { useRef, useState } from 'react';
import { navigate } from '../router';
import { useApp } from '../state/AppState';
import { projectFriendly } from '../engine/recommend';
import { exportProjectJSON, importProjectJSON } from '../engine/storage';
import { ProjectIcon, PageHead, Note } from '../components/ui';
import { useT } from '../i18n';
import {
  FolderOpen, Copy, Trash2, Download, Upload, Plus, MapPin, ArrowRight,
} from 'lucide-react';

export default function MyProjects() {
  const { projects, openProject, duplicateProject, deleteProject, addProject, lang } = useApp();
  const t = useT();
  const fileRef = useRef(null);
  const [confirmId, setConfirmId] = useState(null);
  const [importError, setImportError] = useState('');

  const handleExport = (p) => {
    const blob = new Blob([exportProjectJSON(p)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `terrawatt-${p.id}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const p = importProjectJSON(await file.text());
      addProject({ ...p, id: `p-${Date.now()}`, name: p.name || t('Imported plan') });
      setImportError('');
    } catch (err) {
      setImportError(t('Import failed — not a valid LandWatt plan file'));
    }
    e.target.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <PageHead
        title={t('My projects')}
        sub={t('Your saved land plans — data stays in this browser, never sent to a server')}
      >
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => navigate('/start')} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> {t('New plan')}
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-secondary text-sm">
            <Upload className="w-4 h-4" /> {t('Import plan file (.json)')}
          </button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        </div>
        {importError && <p className="mt-2 text-xs text-danger-600">{importError}</p>}
      </PageHead>

      {projects.length === 0 ? (
        <div className="card p-10 text-center">
          <FolderOpen className="w-10 h-10 text-ink-faint mx-auto mb-3" />
          <h2 className="font-semibold">{t('No saved plans yet')}</h2>
          <p className="text-sm text-ink-soft mt-1.5">{t('Analyze your land, then press "Save plan" on the plan page to keep it here')}</p>
          <button onClick={() => navigate('/start')} className="btn-primary mt-5">
            {t('Analyze land')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => (
            <div key={p.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-xs text-ink-faint mt-0.5">
                      {p.land.provinceData?.nameEn || p.land.provinceData?.name || t('No province')} · {(p.land.areaSqM / 1600).toFixed(2)} {t('rai')}
                      {p.chosenPlanId && projectFriendly(p.chosenPlanId, lang) ? ` · ${projectFriendly(p.chosenPlanId, lang).name}` : ''}
                    </div>
                    <div className="text-[11px] text-ink-faint mt-0.5">
                      {t('Saved')} {new Date(p.createdAt).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' })}
                      {!p.engineVersion && <div className="text-[10px] text-volt-800 mt-0.5">{t('Made with an older version — recalculated from saved data on open')}</div>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => { openProject(p.id); navigate(p.chosenPlanId ? `/plan/${p.chosenPlanId}` : '/results'); }}
                    className="btn-primary text-xs px-4 py-2.5">{t('Open')}</button>
                  <button onClick={() => duplicateProject(p.id)} className="btn-ghost text-xs px-3 py-2.5" title={t('Duplicate')}>
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleExport(p)} className="btn-ghost text-xs px-3 py-2.5" title={t('Export JSON')}>
                    <Download className="w-4 h-4" />
                  </button>
                  {confirmId === p.id ? (
                    <span className="flex items-center gap-1.5">
                      <button onClick={() => { deleteProject(p.id); setConfirmId(null); }}
                        className="text-xs font-medium text-white bg-danger-600 rounded-lg px-3 py-2">{t('Confirm delete')}</button>
                      <button onClick={() => setConfirmId(null)} className="btn-ghost text-xs px-2 py-2">{t('Cancel')}</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirmId(p.id)} className="btn-ghost text-xs px-3 py-2.5 text-danger-600" title={t('Delete')}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Note>
          {t("Data is stored in this browser's localStorage — it survives refreshes but is lost if you clear browser data or switch devices. Export a JSON file as backup")}
        </Note>
      </div>
    </div>
  );
}
