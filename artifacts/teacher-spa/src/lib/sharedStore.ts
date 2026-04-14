import { useState, useCallback } from "react";

export interface SharedEvent {
  id: string;
  date: string;
  type: "verifica" | "gita" | "progetto";
  title: string;
  description: string;
  createdAt: string;
}

export interface SharedClass {
  id: string;
  name: string;
  code: string;
  joined?: boolean; // true if joined via code (not owner)
  events: SharedEvent[];
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const STORAGE_KEY = "rd_shared_classes";
const SHARED_CODE_PREFIX = "rd_shared_code_";

function loadClasses(): SharedClass[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SharedClass[];
  } catch {
    return [];
  }
}

function saveClasses(classes: SharedClass[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
  // Also persist each class by code so other instances can join
  classes.forEach(cls => {
    localStorage.setItem(SHARED_CODE_PREFIX + cls.code, JSON.stringify(cls));
  });
}

function lookupByCode(code: string): SharedClass | null {
  try {
    const raw = localStorage.getItem(SHARED_CODE_PREFIX + code);
    if (!raw) return null;
    return JSON.parse(raw) as SharedClass;
  } catch {
    return null;
  }
}

export function useSharedData() {
  const [classes, setClasses] = useState<SharedClass[]>(loadClasses);

  const persist = useCallback((updated: SharedClass[]) => {
    setClasses(updated);
    saveClasses(updated);
  }, []);

  const addClass = useCallback((name: string) => {
    const cls: SharedClass = {
      id: generateId(),
      name,
      code: generateCode(),
      events: [],
    };
    persist([...loadClasses(), cls]);
  }, [persist]);

  const deleteClass = useCallback((id: string) => {
    persist(loadClasses().filter(c => c.id !== id));
  }, [persist]);

  const joinClass = useCallback((code: string): boolean => {
    const existing = loadClasses();
    if (existing.some(c => c.code === code)) return true; // already joined
    const found = lookupByCode(code);
    if (!found) return false;
    persist([...existing, { ...found, joined: true }]);
    return true;
  }, [persist]);

  const addEvent = useCallback((classId: string, ev: Omit<SharedEvent, "id" | "createdAt">) => {
    const updated = loadClasses().map(c => {
      if (c.id !== classId) return c;
      const newEv: SharedEvent = { ...ev, id: generateId(), createdAt: new Date().toISOString() };
      const updatedClass = { ...c, events: [...c.events, newEv] };
      localStorage.setItem(SHARED_CODE_PREFIX + c.code, JSON.stringify(updatedClass));
      return updatedClass;
    });
    persist(updated);
  }, [persist]);

  const deleteEvent = useCallback((classId: string, eventId: string) => {
    const updated = loadClasses().map(c => {
      if (c.id !== classId) return c;
      const updatedClass = { ...c, events: c.events.filter(e => e.id !== eventId) };
      localStorage.setItem(SHARED_CODE_PREFIX + c.code, JSON.stringify(updatedClass));
      return updatedClass;
    });
    persist(updated);
  }, [persist]);

  return { classes, addClass, deleteClass, joinClass, addEvent, deleteEvent };
}
