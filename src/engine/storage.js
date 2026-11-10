// เก็บข้อมูลแบบฟอร์มและโครงการใน localStorage (ต้นแบบ — ข้อมูลอยู่เฉพาะในเครื่องผู้ใช้)
const PROJECTS_KEY = 'terrawatt.projects.v1';
const DRAFT_KEY = 'terrawatt.draft.v1';

export const DEFAULT_LAND = {
  areaSqM: 8000, // 5 ไร่
  provinceId: null,
  provinceData: null,
  coordinates: { lat: 13.7563, lng: 100.5018 },
  roadType: 'secondary',
  roadWidthMeters: 8,
  gridDistanceMeters: 200,
  landType: 'flat',
  landTypeUnknown: false,
  gridUnknown: false,
  hasWaterBody: false,
  hasAgriculturalWaste: false,
  hasShading: null,   // true/false/null = ไม่ทราบ
  hasStructures: null, // มีอาคาร/สิ่งกีดขวางไหม (user-declared)
  excludedAreaSqM: 0,  // พื้นที่ยกเว้นที่ผู้ใช้ระบุ [F-02]
  hasGridPower: null, // มีไฟฟ้าอยู่แล้วไหม
  soilStability: 'good',
  zoningColor: 'green',
};

export const DEFAULT_GOALS = {
  aims: [],
  budget: 'unsure',
  monthlyBill: null,    // ค่าไฟ/เดือน (บาท) ถ้าเลือกเป้าหมายประหยัด
  evTraffic: null,      // 'high'|'medium'|'low'|'unknown'
};

export const DEFAULT_DRAFT = {
  land: DEFAULT_LAND,
  goals: DEFAULT_GOALS,
  compareIds: [],
  chosenPlanId: null,
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function loadDraft() {
  const d = readJSON(DRAFT_KEY, null);
  if (!d) return DEFAULT_DRAFT;
  return {
    land: { ...DEFAULT_LAND, ...(d.land || {}) },
    goals: { ...DEFAULT_GOALS, ...(d.goals || {}) },
    compareIds: d.compareIds || [],
    chosenPlanId: d.chosenPlanId || null,
  };
}

export function saveDraft(draft) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch {}
}

export function loadProjects() {
  return readJSON(PROJECTS_KEY, []);
}

export function saveProjects(list) {
  try { localStorage.setItem(PROJECTS_KEY, JSON.stringify(list)); } catch {}
}

export function exportProjectJSON(project) {
  return JSON.stringify(project, null, 2);
}

export function importProjectJSON(text) {
  const obj = JSON.parse(text);
  if (!obj.land || !obj.land.areaSqM) throw new Error('ไฟล์ไม่ถูกต้อง');
  return {
    ...obj,
    id: obj.id || `p-${Date.now()}`,
    land: { ...DEFAULT_LAND, ...obj.land },
    goals: { ...DEFAULT_GOALS, ...(obj.goals || {}) },
  };
}
