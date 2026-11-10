import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadDraft, saveDraft, loadProjects, saveProjects, DEFAULT_DRAFT } from '../engine/storage';

const AppCtx = createContext(null);

export function AppStateProvider({ children }) {
  const [draft, setDraft] = useState(loadDraft);
  const [projects, setProjects] = useState(loadProjects);

  useEffect(() => { saveDraft(draft); }, [draft]);
  useEffect(() => { saveProjects(projects); }, [projects]);

  const api = useMemo(() => ({
    draft,
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
        name: name || `แผนที่ดิน ${new Date().toLocaleDateString('th-TH')}`,
        createdAt: new Date().toISOString(),
        land: draft.land,
        goals: draft.goals,
        compareIds: draft.compareIds,
        chosenPlanId: draft.chosenPlanId,
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
      setProjects(list => [{ ...p, id: `p-${Date.now()}`, name: `${p.name} (สำเนา)` }, ...list]);
    },
    deleteProject: (id) => setProjects(list => list.filter(x => x.id !== id)),
    addProject: (p) => setProjects(list => [p, ...list]),
  }), [draft, projects]);

  return <AppCtx.Provider value={api}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppStateProvider');
  return ctx;
}
