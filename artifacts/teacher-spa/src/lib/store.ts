import { useState, useEffect, useCallback } from "react";

export type EventType = "lesson" | "meeting" | "hearing";

export interface Lesson {
  id: string;
  date: string;
  time: string;
  subject: string;
  class: string;
  topic: string;
  notes: string;
  createdAt: string;
}

export interface Meeting {
  id: string;
  date: string;
  time: string;
  type: string;
  agenda: string;
  notes: string;
  createdAt: string;
}

export interface Hearing {
  id: string;
  date: string;
  time: string;
  parent: string;
  student: string;
  notes: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  notes: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  students: Student[];
}

export interface AppData {
  lessons: Lesson[];
  meetings: Meeting[];
  hearings: Hearing[];
  classes: ClassGroup[];
  quickNotes: string;
}

const DEFAULT_DATA: AppData = {
  lessons: [],
  meetings: [],
  hearings: [],
  classes: [
    {
      id: "cls1",
      name: "3A",
      students: [
        { id: "s1", name: "Bianchi Marco", notes: "" },
        { id: "s2", name: "Rossi Sofia", notes: "" },
        { id: "s3", name: "Verdi Luca", notes: "" },
      ]
    },
    {
      id: "cls2",
      name: "4B",
      students: [
        { id: "s4", name: "Esposito Anna", notes: "" },
        { id: "s5", name: "Ferrari Giorgio", notes: "" },
      ]
    }
  ],
  quickNotes: ""
};

const STORAGE_KEY = "registro_docente_data";

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DATA, ...parsed };
  } catch {
    return DEFAULT_DATA;
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.error("Failed to save data");
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function isToday(dateStr: string): boolean {
  const today = new Date();
  const d = new Date(dateStr);
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
}

export function isPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  return d < today;
}

export function useAppData() {
  const [data, setDataState] = useState<AppData>(() => loadData());

  const updateData = useCallback((updater: (prev: AppData) => AppData) => {
    setDataState(prev => {
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  return { data, updateData };
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(dateStr: string, timeStr: string): string {
  return `${formatDate(dateStr)} ${timeStr ? "ore " + timeStr : ""}`.trim();
}

const MEETING_TYPES = ["Collegio Docenti", "Consiglio di Classe", "Dipartimento", "Consigli di Istituto", "Altro"] as const;
export { MEETING_TYPES };
