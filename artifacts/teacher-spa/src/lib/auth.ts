const AUTH_KEY = "registro_docente_auth";
const CREDENTIALS_KEY = "registro_docente_credentials";

interface Credentials {
  username: string;
  pinHash: string;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function hashPin(pin: string): string {
  const salt = "registro_docente_2024";
  return simpleHash(salt + pin + salt);
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
    pinHash: hashPin(pin)
  };
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
}

export function verifyPin(pin: string): boolean {
  const creds = getCredentials();
  if (!creds) return false;
  return creds.pinHash === hashPin(pin);
}

export function isAuthenticated(): boolean {
  try {
    const session = localStorage.getItem(AUTH_KEY);
    if (!session) return false;
    const { expiry } = JSON.parse(session);
    if (Date.now() > expiry) {
      localStorage.removeItem(AUTH_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function setAuthenticated(): void {
  const expiry = Date.now() + 8 * 60 * 60 * 1000;
  localStorage.setItem(AUTH_KEY, JSON.stringify({ expiry }));
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getUsername(): string {
  const creds = getCredentials();
  return creds?.username ?? "Docente";
}

export function hasCredentials(): boolean {
  return getCredentials() !== null;
}
