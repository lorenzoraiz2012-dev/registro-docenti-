import { useState, useEffect } from "react";
import { FileText, Trash2, Save } from "lucide-react";
import { AppData } from "@/lib/store";

interface QuickNotesProps {
  data: AppData;
  updateData: (updater: (prev: AppData) => AppData) => void;
}

export default function QuickNotes({ data, updateData }: QuickNotesProps) {
  const [localText, setLocalText] = useState(data.quickNotes);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalText(data.quickNotes);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localText !== data.quickNotes) {
        setSaving(true);
        updateData(prev => ({ ...prev, quickNotes: localText }));
        setLastSaved(new Date());
        setTimeout(() => setSaving(false), 500);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [localText]);

  function clearNotes() {
    if (!localText || !confirm("Cancellare tutte le note rapide?")) return;
    setLocalText("");
    updateData(prev => ({ ...prev, quickNotes: "" }));
    setLastSaved(null);
  }

  const wordCount = localText.trim() ? localText.trim().split(/\s+/).length : 0;
  const charCount = localText.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Note Rapide</h2>
          <p className="text-sm text-emerald-300/60 mt-0.5">Appunti veloci — salvati automaticamente</p>
        </div>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-xs text-emerald-400/60 flex items-center gap-1">
              <Save className="w-3 h-3" />
              Salvando...
            </span>
          )}
          {!saving && lastSaved && (
            <span className="text-xs text-white/30">
              Salvato {lastSaved.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={clearNotes}
            data-testid="button-clear-notes"
            className="glass flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-400/70 hover:text-red-400 hover:bg-red-900/20 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Cancella tutto
          </button>
        </div>
      </div>

      <div className="glass-strong rounded-2xl p-1.5 border border-emerald-400/10">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-emerald-500/10 mb-1">
          <FileText className="w-4 h-4 text-emerald-400/50" />
          <span className="text-xs text-white/30">Scratchpad — {wordCount} parol{wordCount !== 1 ? "e" : "a"}, {charCount} caratteri</span>
        </div>
        <textarea
          value={localText}
          onChange={e => setLocalText(e.target.value)}
          placeholder="Inizia a scrivere i tuoi appunti qui...&#10;&#10;Questo spazio è pensato per note veloci e temporanee. Il testo viene salvato automaticamente."
          data-testid="textarea-quick-notes"
          className="w-full h-[calc(100vh-320px)] min-h-[300px] px-4 py-3 bg-transparent text-sm text-white/80 placeholder-white/20 focus:outline-none resize-none leading-relaxed"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {["Appuntamento importante!", "Vedi questo domani.", "Ricordare ai ragazzi:"].map((suggestion, i) => (
          <button
            key={i}
            onClick={() => setLocalText(t => t ? t + "\n\n" + suggestion : suggestion)}
            data-testid={`button-suggestion-${i}`}
            className="glass-card rounded-xl p-3 text-left text-xs text-white/40 hover:text-white/70 transition-all"
          >
            <span className="block text-emerald-400/30 text-xs mb-1">Suggerimento</span>
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
