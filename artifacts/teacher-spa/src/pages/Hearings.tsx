import { useState } from "react";
import { Plus, Trash2, Archive, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { AppData, Hearing, generateId, formatDate, isPast } from "@/lib/store";

interface HearingsProps {
  data: AppData;
  updateData: (updater: (prev: AppData) => AppData) => void;
}

export default function Hearings({ data, updateData }: HearingsProps) {
  const [showForm, setShowForm] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [form, setForm] = useState({ date: "", time: "", parent: "", student: "", notes: "" });
  const [error, setError] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.date || !form.student) {
      setError("Data e Alunno sono obbligatori.");
      return;
    }
    const hearing: Hearing = {
      id: generateId(),
      ...form,
      createdAt: new Date().toISOString()
    };
    updateData(prev => ({ ...prev, hearings: [hearing, ...prev.hearings] }));
    setForm({ date: "", time: "", parent: "", student: "", notes: "" });
    setShowForm(false);
  }

  function handleDelete(id: string) {
    if (!confirm("Eliminare questa udienza?")) return;
    updateData(prev => ({ ...prev, hearings: prev.hearings.filter(h => h.id !== id) }));
  }

  const sorted = [...data.hearings].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return (b.time || "").localeCompare(a.time || "");
  });
  const active = sorted.filter(h => !isPast(h.date));
  const archive = sorted.filter(h => isPast(h.date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Udienze</h2>
          <p className="text-sm text-emerald-300/60 mt-0.5">{data.hearings.length} udienza{data.hearings.length !== 1 ? "e" : ""} totali</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          data-testid="button-add-hearing"
          className="btn-emerald flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Nuova Udienza
        </button>
      </div>

      {showForm && (
        <div className="glass-strong rounded-2xl p-6 border border-emerald-400/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-orange-400" />
            Aggiungi Udienza
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-emerald-300/70 mb-1.5">Data *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  data-testid="input-hearing-date"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-300/70 mb-1.5">Ora</label>
                <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  data-testid="input-hearing-time"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-300/70 mb-1.5">Alunno *</label>
              <input type="text" value={form.student} onChange={e => setForm(f => ({ ...f, student: e.target.value }))}
                placeholder="Nome e Cognome dell'alunno"
                data-testid="input-hearing-student"
                className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-300/70 mb-1.5">Genitore/Tutore</label>
              <input type="text" value={form.parent} onChange={e => setForm(f => ({ ...f, parent: e.target.value }))}
                placeholder="Nome del genitore"
                data-testid="input-hearing-parent"
                className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-300/70 mb-1.5">Note</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Motivo, argomenti da trattare..."
                rows={3}
                data-testid="input-hearing-notes"
                className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none resize-none" />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" data-testid="button-save-hearing" className="btn-emerald px-5 py-2 rounded-xl text-sm font-semibold">Salva</button>
              <button type="button" onClick={() => { setShowForm(false); setError(""); }}
                className="glass px-5 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-colors">
                Annulla
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {active.length === 0 && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <MessageSquare className="w-12 h-12 text-orange-400/30 mx-auto mb-3" />
            <p className="text-white/40 text-sm">Nessuna udienza pianificata.</p>
          </div>
        )}
        {active.map(h => <HearingCard key={h.id} hearing={h} onDelete={handleDelete} />)}
      </div>

      {archive.length > 0 && (
        <div>
          <button onClick={() => setShowArchive(!showArchive)}
            data-testid="button-toggle-archive-hearings"
            className="flex items-center gap-2 text-sm text-emerald-300/60 hover:text-emerald-300 transition-colors mb-3">
            <Archive className="w-4 h-4" />
            Archivio ({archive.length})
            {showArchive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showArchive && (
            <div className="space-y-2">
              {archive.map(h => <HearingCard key={h.id} hearing={h} onDelete={handleDelete} archived />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HearingCard({ hearing, onDelete, archived }: { hearing: Hearing; onDelete: (id: string) => void; archived?: boolean }) {
  return (
    <div className={`glass-card rounded-xl p-4 flex items-start gap-4 ${archived ? "archive-item" : ""}`} data-testid={`card-hearing-${hearing.id}`}>
      <div className="flex-shrink-0 p-2 rounded-lg bg-orange-500/15 mt-0.5">
        <MessageSquare className="w-4 h-4 text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white text-sm">{hearing.student}</span>
          {hearing.parent && <span className="text-xs text-white/40">— {hearing.parent}</span>}
        </div>
        <p className="text-xs text-white/50 mt-0.5">{formatDate(hearing.date)}{hearing.time ? ` ore ${hearing.time}` : ""}</p>
        {hearing.notes && <p className="text-xs text-white/40 mt-1 line-clamp-2">{hearing.notes}</p>}
      </div>
      <button onClick={() => onDelete(hearing.id)} data-testid={`button-delete-hearing-${hearing.id}`}
        className="text-white/20 hover:text-red-400 transition-colors p-1 flex-shrink-0">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
