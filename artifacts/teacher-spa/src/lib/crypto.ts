import CryptoJS from "crypto-js";

// ──────────────────────────────────────────────
// SHA-256 hashing (per il PIN)
// ──────────────────────────────────────────────
const SALT = "registro_docente_v2_2024";

export function sha256Hash(input: string): string {
  return CryptoJS.SHA256(SALT + input + SALT).toString(CryptoJS.enc.Hex);
}

// Riconosce il vecchio hash (simpleHash → 8 char hex) per la migrazione
export function isLegacyHash(hash: string): boolean {
  return hash.length === 8;
}

// Vecchio algoritmo (solo per migrazione)
function legacyHash(str: string): string {
  const legacySalt = "registro_docente_2024";
  const combined = legacySalt + str + legacySalt;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

export function verifyLegacyPin(pin: string, storedHash: string): boolean {
  return legacyHash(pin) === storedHash;
}

// ──────────────────────────────────────────────
// AES-256 encryption (per i dati sensibili)
// ──────────────────────────────────────────────

const ENC_PREFIX = "enc::";

export function encryptField(value: string, pin: string): string {
  if (!value || !pin) return value;
  try {
    const encrypted = CryptoJS.AES.encrypt(value, pin).toString();
    return ENC_PREFIX + encrypted;
  } catch {
    return value;
  }
}

export function decryptField(value: string, pin: string): string {
  if (!value || !pin) return value;
  if (!value.startsWith(ENC_PREFIX)) return value;
  try {
    const cipherText = value.slice(ENC_PREFIX.length);
    const bytes = CryptoJS.AES.decrypt(cipherText, pin);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    return result || value;
  } catch {
    return value;
  }
}

// Verifica che la decriptazione sia riuscita
// (ritorna true se il PIN è corretto e i dati leggibili)
export function canDecrypt(encryptedValue: string, pin: string): boolean {
  if (!encryptedValue.startsWith(ENC_PREFIX)) return true;
  try {
    const cipherText = encryptedValue.slice(ENC_PREFIX.length);
    const bytes = CryptoJS.AES.decrypt(cipherText, pin);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    return result.length > 0;
  } catch {
    return false;
  }
}
