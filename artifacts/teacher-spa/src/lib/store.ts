import { useState, useEffect, useCallback } from 'react';
import { encryptField, decryptField } from "@/lib/crypto";
import { getSessionPin } from "@/lib/auth";
import { db } from './firebase'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
      ],
    },
    {
      id: "cls2",
      name: "4B",
      students: [
        { id: "s4", name: "Esposito Anna", notes: "" },
        { id: "s5", name: "Ferrari Giorgio", notes: "" },
      ],
    },
  ],
  quickNotes: "",
};

const STORAGE_KEY = "registro_docente_data";

// ──────────────────────────────────────────────
// Encrypt / decrypt helpers per campi sensibili
// ──────────────────────────────────────────────

function encryptLesson(l: Lesson, pin: string): Lesson {
  return {
    ...l,
    subject: encryptField(l.subject, pin),
    class: encryptField(l.class, pin),
    topic: encryptField(l.topic, pin),
    notes: encryptField(l.notes, pin),
  };
}

function decryptLesson(l: Lesson, pin: string): Lesson {
  return {
    ...l,
    subject: decryptField(l.subject, pin),
    class: decryptField(l.class, pin),
    topic: decryptField(l.topic, pin),
    notes: decryptField(l.notes, pin),
  };
}

function encryptMeeting(m: Meeting, pin: string): Meeting {
  return {
    ...m,
    type: encryptField(m.type, pin),
    agenda: encryptField(m.agenda, pin),
    notes: encryptField(m.notes, pin),
  };
}

function decryptMeeting(m: Meeting, pin: string): Meeting {
  return {
    ...m,
    type: decryptField(m.type, pin),
    agenda: decryptField(m.agenda, pin),
    notes: decryptField(m.notes, pin),
  };
}

function encryptHearing(h: Hearing, pin: string): Hearing {
  return {
    ...h,
    parent: encryptField(h.parent, pin),
    student: encryptField(h.student, pin),
    notes: encryptField(h.notes, pin),
  };
}

function decryptHearing(h: Hearing, pin: string): Hearing {
  return {
    ...h,
    parent: decryptField(h.parent, pin),
    student: decryptField(h.student, pin),
    notes: decryptField(h.notes, pin),
  };
}

function encryptClass(c: ClassGroup, pin: string): ClassGroup {
  return {
    ...c,
    name: encryptField(c.name, pin),
    students: c.students.map(s => ({
      ...s,
      name: encryptField(s.name, pin),
      notes: encryptField(s.notes, pin),
    })),
  };
}

function decryptClass(c: ClassGroup, pin: string): ClassGroup {
  return {
    ...c,
    name: decryptField(c.name, pin),
    students: c.students.map(s => ({
      ...s,
      name: decryptField(s.name, pin),
      notes: decryptField(s.notes, pin),
    })),
  };
}

function encryptData(data: AppData, pin: string): AppData {
  if (!pin) return data;
  return {
    lessons: data.lessons.map(l => encryptLesson(l, pin)),
    meetings: data.meetings.map(m => encryptMeeting(m, pin)),
    hearings: data.hearings.map(h => encryptHearing(h, pin)),
    classes: data.classes.map(c => encryptClass(c, pin)),
    quickNotes: encryptField(data.quickNotes, pin),
  };
}

function decryptData(data: AppData, pin: string): AppData {
  if (!pin) return data;
  return {
    lessons: data.lessons.map(l => decryptLesson(l, pin)),
    meetings: data.meetings.map(m => decryptMeeting(m, pin)),
    hearings: data.hearings.map(h => decryptHearing(h, pin)),
    classes: data.classes.map(c => decryptClass(c, pin)),
    quickNotes: decryptField(data.quickNotes, pin),
  };
}

// ──────────────────────────────────────────────
// Load / Save
// ──────────────────────────────────────────────

export async function loadData(): Promise<AppData> {
  try {
    // Cerchiamo i dati nel database Firebase
    const userDoc = doc(db, "settings", "global_data"); 
    const snap = await getDoc(userDoc);

    if (snap.exists()) {
      return snap.data() as AppData;
    }
    return DEFAULT_DATA;
  } catch (e) {
    console.error("Errore nel caricamento da Firebase:", e);
    return DEFAULT_DATA;
  }
}

export async function saveData(data: AppData) {
  try {
    // Salviamo i dati su Firebase invece che nel browser
    const userDoc = doc(db, "settings", "global_data");
    await setDoc(userDoc, data);
    console.log("Dati salvati correttamente su Firebase!");
  } catch (e) {
    console.error("Errore nel salvataggio su Firebase:", e);
  }
}

// ──────────────────────────────────────────────
// Hooks and utilities
// ──────────────────────────────────────────────

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function isToday(dateStr: string): boolean {
  const today = new Date();
  const d = new Date(dateStr);
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function isPast(dateStr: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  return d < today;
}

export function useAppData() {
  // Inizializziamo lo stato a null o vuoto finché Firebase non risponde
  const [data, setDataState] = useState<AppData | null>(null);

  // Funzione per caricare i dati (ora asincrona)
  const reloadData = useCallback(async () => {
    try {
      const freshData = await loadData();
      setDataState(freshData);
    } catch (error) {
      console.error("Errore caricamento Firebase:", error);
    }
  }, []);

  // Avvia il caricamento non appena l'app viene aperta
  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const updateData = useCallback((updater: (prev: AppData) => AppData) => {
    setDataState(prev => {
      // Se i dati non sono ancora pronti, non facciamo nulla
      if (!prev) return prev; 
      const next = updater(prev);
      saveData(next);
      return next;
    });
  }, []);

  return { data, updateData, reloadData };
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string, timeStr: string): string {
  return `${formatDate(dateStr)} ${timeStr ? "ore " + timeStr : ""}`.trim();
}

const MEETING_TYPES = [
  "Collegio Docenti",
  "Consiglio di Classe",
  "Dipartimento",
  "Consigli di Istituto",
  "Altro",
] as const;
export { MEETING_TYPES };
