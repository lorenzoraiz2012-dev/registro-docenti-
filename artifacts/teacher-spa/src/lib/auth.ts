import { sha256Hash, isLegacyHash, verifyLegacyPin } from "@/lib/crypto";

const AUTH_KEY = "registro_docente_auth";
const CREDENTIALS_KEY = "registro_docente_credentials";

interface Credentials {
  username: string;
  pinHash: string;
}

// PIN in memoria per la sessione corrente (mai persistito)
let sessionPin: string | null = null;

export function getSessionPin(): string | null {
  return sessionPin;
}

export function setSessionPin(pin: string): void {
  sessionPin = pin;
}

export function clearSessionPin(): void {
  sessionPin = null;
}

export function getCredentials(): Credentials | null {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCredentials(username: string, pin: string): void {
  const creds: Credentials = {
    username,
    pinHash: sha256Hash(pin),
  };
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
}

/**
 * Verifica il PIN e aggiorna l'hash se ancora legacy (migrazione automatica).
 * Ritorna true se il PIN è corretto.
 */
export function verifyPin(pin: string): boolean {
  const creds = getCredentials();
  if (!creds) return false;

  // Migrazione automatica da legacy hash → SHA-256
  if (isLegacyHash(creds.pinHash)) {
    if (verifyLegacyPin(pin, creds.pinHash)) {
      // Aggiorna all'hash SHA-256
      const upgraded: Credentials = { username: creds.username, pinHash: sha256Hash(pin) };
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(upgraded));
      return true;
    }
    return false;
  }

  return creds.pinHash === sha256Hash(pin);
}

export function isAuthenticated(): boolean {
  try {
    const session = localStorage.getItem(AUTH_KEY);
    if (!session) return false;
    const { expiry } = JSON.parse(session);
    if (Date.now() > expiry) {
      localStorage.removeItem(AUTH_KEY);
      clearSessionPin();
      return false;
    }
    // sessionPin può essere null se la pagina è stata ricaricata
    // In quel caso isAuthenticated ritorna true ma sessionPin è null →
    // l'app renderizzerà Login per richiedere il PIN (che verrà rimesso in memoria)
    return true;
  } catch {
    return false;
  }
}

export function setAuthenticated(pin: string): void {
  const expiry = Date.now() + 8 * 60 * 60 * 1000;
  localStorage.setItem(AUTH_KEY, JSON.stringify({ expiry }));
  setSessionPin(pin);
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
  clearSessionPin();
}

export function getUsername(): string {
  const creds = getCredentials();
  return creds?.username ?? "Docente";
}

export function hasCredentials(): boolean {
  return getCredentials() !== null;
}
