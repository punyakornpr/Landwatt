import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadDraft, saveDraft, loadProjects, saveProjects, DEFAULT_DRAFT } from '../engine/storage';

const AppCtx = createContext(null);

export function AppStateProvider({ children }) {
  const [draft, setDraft] = useState(loadDraft);
  const [projects, setProjects] = useState(loadProjects);
  // Default language follows the browser — Thai speakers get Thai, others get English
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('landwatt-lang');
    if (saved) return saved;
    return (navigator.language || '').toLowerCase().startsWith('th') ? 'th' : 'en';
  });

  useEffect(() => { saveDraft(draft); }, [draft]);
  useEffect(() => { saveProjects(projects); }, [projects]);
  useEffect(() => { localStorage.setItem('landwatt-lang', lang); }, [lang]);

  const api = useMemo(() => ({
    draft,
    lang,
    setLang,
    toggleLang: () => setLang(l => (l === 'th' ? 'en' : 'th')),
    land: draft.land,
    goals: draft.goals,
    compareIds: draft.compareIds,
    chosenPlanId: draft.chosenPlanId,

    updateLand: (patch) => setDraft(d => ({ ...d, land: { ...d.land, ...patch } })),
    updateGoals: (patch) => setDraft(d => ({ ...d, goals: { ...d.goals, ...patch } })),
    setChosenPlan: (id) => setDraft(d => ({ ...d, chosenPlanId: id })),
    toggleCompare: (id) => setDraft(d => {
      const has = d.compareIds.includes(id);
      const next = has ? d.compareIds.filter(x => x !== id) : [...d.compareIds, id].slice(-3);
      return { ...d, compareIds: next };
    }),
    resetDraft: () => setDraft(DEFAULT_DRAFT),

    projects,
    saveCurrent: (name) => {
      const p = {
        id: `p-${Date.now()}`,
        name: name || `Land plan ${new Date().toLocaleDateString('en-GB')}`,
        createdAt: new Date().toISOString(),
        land: draft.land,
        goals: draft.goals,
        compareIds: draft.compareIds,
        chosenPlanId: draft.chosenPlanId,
        engineVersion: 'v6.1',
      };
      setProjects(list => [p, ...list]);
      return p;
    },
    openProject: (id) => {
      const p = projects.find(x => x.id === id);
      if (!p) return;
      setDraft({ land: p.land, goals: p.goals, compareIds: p.compareIds || [], chosenPlanId: p.chosenPlanId || null });
    },
    duplicateProject: (id) => {
      const p = projects.find(x => x.id === id);
      if (!p) return;
      setProjects(list => [{ ...p, id: `p-${Date.now()}`, name: `${p.name} (copy)` }, ...list]);
    },
    deleteProject: (id) => setProjects(list => list.filter(x => x.id !== id)),
    addProject: (p) => setProjects(list => [p, ...list]),
  }), [draft, projects, lang]);

  return <AppCtx.Provider value={api}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppStateProvider');
  return ctx;
}
