import { useState } from "react";
import { Lock, User, BookOpen, Eye, EyeOff, Shield } from "lucide-react";
import { hasCredentials, verifyPin, setAuthenticated, saveCredentials, getUsername, setSessionPin } from "@/lib/auth";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const isFirstTime = !hasCredentials();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      if (isFirstTime) {
        if (!username.trim()) {
          setError("Inserisci il tuo nome.");
          setLoading(false);
          return;
        }
        if (pin.length < 4) {
          setError("Il PIN deve essere di almeno 4 cifre.");
          setLoading(false);
          return;
        }
        if (!/^\d+$/.test(pin)) {
          setError("Il PIN deve contenere solo cifre.");
          setLoading(false);
          return;
        }
        if (pin !== confirmPin) {
          setError("I PIN non corrispondono.");
          setLoading(false);
          return;
        }
        saveCredentials(username.trim(), pin);
        // Salva il PIN in memoria per la crittografia AES dei dati
        setSessionPin(pin);
        setAuthenticated(pin);
        onLogin();
      } else {
        if (!verifyPin(pin)) {
          setError("PIN non corretto. Riprova.");
          setLoading(false);
          return;
        }
        // Salva il PIN in memoria per la crittografia AES dei dati
        setSessionPin(pin);
        setAuthenticated(pin);
        onLogin();
      }
    }, 300);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: "radial-gradient(ellipse at 30% 30%, rgba(16,185,129,0.2) 0%, transparent 60%), radial-gradient(ellipse at 70% 70%, rgba(5,150,105,0.15) 0%, transparent 60%), #051a12"
    }}>
      <div className="w-full max-w-sm">
        <div className="glass-strong rounded-2xl p-8 emerald-glow">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl emerald-gradient mb-4 shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Registro Docente</h1>
            <p className="text-sm text-emerald-300/70">
              {isFirstTime ? "Crea il tuo accesso" : `Bentornato, ${getUsername()}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isFirstTime && (
              <div>
                <label className="block text-xs font-medium text-emerald-300/80 mb-1.5 ml-1">
                  Nome Utente
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/50" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Es. Prof. Rossi"
                    data-testid="input-username"
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-emerald-300/80 mb-1.5 ml-1">
                PIN {isFirstTime ? "(min. 4 cifre)" : ""}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/50" />
                <input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  maxLength={8}
                  data-testid="input-pin"
                  className="glass-input w-full pl-10 pr-10 py-2.5 rounded-xl text-sm focus:outline-none tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400/50 hover:text-emerald-400 transition-colors"
                  data-testid="button-toggle-pin-visibility"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isFirstTime && (
              <div>
                <label className="block text-xs font-medium text-emerald-300/80 mb-1.5 ml-1">
                  Conferma PIN
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/50" />
                  <input
                    type={showPin ? "text" : "password"}
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••"
                    maxLength={8}
                    data-testid="input-confirm-pin"
                    className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none tracking-widest"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2" data-testid="text-login-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="button-login-submit"
              className="btn-emerald w-full py-2.5 rounded-xl font-semibold text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "..." : isFirstTime ? "Crea Accesso" : "Accedi"}
            </button>
          </form>

          {/* Security badge */}
          <div className="mt-5 flex items-center gap-2 justify-center">
            <Shield className="w-3 h-3 text-emerald-400/40" />
            <p className="text-center text-xs text-emerald-400/40">
              PIN hashato SHA-256 · Dati cifrati AES-256
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
