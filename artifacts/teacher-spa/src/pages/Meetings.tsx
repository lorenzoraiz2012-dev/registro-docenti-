import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import { AppData, Meeting, generateId, formatDate, isPast, MEETING_TYPES } from "@/lib/store";

interface MeetingsProps {
  data: AppData;
  updateData: (updater: (prev: AppData) => AppData) => void;
}

export default function Meetings({ data, updateData }: MeetingsProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: "", time: "", type: "", agenda: "", notes: "" });
  const [error, setError] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.date || !form.type) {
      setError("Data e Tipo sono obbligatori.");
      return;
    }
    const meeting: Meeting = {
      id: generateId(),
      ...form,
      createdAt: new Date().toISOString()
    };
    updateData(prev => ({ ...prev, meetings: [meeting, ...prev.meetings] }));
    setForm({ date: "", time: "", type: "", agenda: "", notes: "" });
    setShowForm(false);
  }

  function handleDelete(id: string) {
    if (!confirm("Eliminare questa riunione?")) return;
    updateData(prev => ({ ...prev, meetings: prev.meetings.filter(m => m.id !== id) }));
  }

  const active = [...data.meetings]
    .filter(m => !isPast(m.date))
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.time || "").localeCompare(b.time || "");
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Riunioni</h2>
          <p className="text-sm text-emerald-300/60 mt-0.5">{data.meetings.length} riunion{data.meetings.length !== 1 ? "i" : "e"} totali</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          data-testid="button-add-meeting"
          className="btn-emerald flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Nuova Riunione
        </button>
      </div>

      {showForm && (
        <div className="glass-strong rounded-2xl p-6 border border-emerald-400/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Aggiungi Riunione
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-emerald-300/70 mb-1.5">Data *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  data-testid="input-meeting-date"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-300/70 mb-1.5">Ora</label>
                <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  data-testid="input-meeting-time"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-300/70 mb-1.5">Tipo *</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                data-testid="select-meeting-type"
                className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none">
                <option value="">Seleziona tipo...</option>
                {MEETING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-300/70 mb-1.5">Ordine del Giorno</label>
              <textarea value={form.agenda} onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))}
                placeholder="Punti all'ordine del giorno..."
                rows={3}
                data-testid="input-meeting-agenda"
                className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-300/70 mb-1.5">Note</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Note aggiuntive..."
                rows={2}
                data-testid="input-meeting-notes"
                className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none resize-none" />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" data-testid="button-save-meeting" className="btn-emerald px-5 py-2 rounded-xl text-sm font-semibold">Salva</button>
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
            <Users className="w-12 h-12 text-blue-400/30 mx-auto mb-3" />
            <p className="text-white/40 text-sm">Nessuna riunione pianificata.</p>
          </div>
        )}
        {active.map(m => <MeetingCard key={m.id} meeting={m} onDelete={handleDelete} />)}
      </div>

    </div>
  );
}

function MeetingCard({ meeting, onDelete, archived }: { meeting: Meeting; onDelete: (id: string) => void; archived?: boolean }) {
  return (
    <div className={`glass-card rounded-xl p-4 flex items-start gap-4 ${archived ? "archive-item" : ""}`} data-testid={`card-meeting-${meeting.id}`}>
      <div className="flex-shrink-0 p-2 rounded-lg bg-blue-500/15 mt-0.5">
        <Users className="w-4 h-4 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white text-sm">{meeting.type}</span>
        </div>
        <p className="text-xs text-white/50 mt-0.5">{formatDate(meeting.date)}{meeting.time ? ` ore ${meeting.time}` : ""}</p>
        {meeting.agenda && <p className="text-xs text-white/50 mt-1 line-clamp-2"><span className="text-white/30">OdG:</span> {meeting.agenda}</p>}
        {meeting.notes && <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{meeting.notes}</p>}
      </div>
      <button onClick={() => onDelete(meeting.id)} data-testid={`button-delete-meeting-${meeting.id}`}
        className="text-white/20 hover:text-red-400 transition-colors p-1 flex-shrink-0">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
