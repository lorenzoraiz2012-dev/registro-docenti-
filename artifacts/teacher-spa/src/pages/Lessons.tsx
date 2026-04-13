import { useState } from "react";
import { Plus, Trash2, Archive, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { AppData, Lesson, generateId, formatDate, isPast } from "@/lib/store";

interface LessonsProps {
  data: AppData;
  updateData: (updater: (prev: AppData) => AppData) => void;
}

export default function Lessons({ data, updateData }: LessonsProps) {
  const [showForm, setShowForm] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [form, setForm] = useState({
    date: "", time: "", subject: "", class: "", topic: "", notes: ""
  });
  const [error, setError] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.date || !form.subject || !form.class) {
      setError("Data, Materia e Classe sono obbligatori.");
      return;
    }
    const lesson: Lesson = {
      id: generateId(),
      ...form,
      createdAt: new Date().toISOString()
    };
    updateData(prev => ({ ...prev, lessons: [lesson, ...prev.lessons] }));
    setForm({ date: "", time: "", subject: "", class: "", topic: "", notes: "" });
    setShowForm(false);
  }

  function handleDelete(id: string) {
    if (!confirm("Eliminare questa lezione?")) return;
    updateData(prev => ({ ...prev, lessons: prev.lessons.filter(l => l.id !== id) }));
  }

  const sorted = [...data.lessons].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return (b.time || "").localeCompare(a.time || "");
  });
  const active = sorted.filter(l => !isPast(l.date));
  const archive = sorted.filter(l => isPast(l.date));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Lezioni</h2>
          <p className="text-sm text-emerald-300/60 mt-0.5">{data.lessons.length} lezione{data.lessons.length !== 1 ? "i" : ""} totali</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          data-testid="button-add-lesson"
          className="btn-emerald flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Nuova Lezione
        </button>
      </div>

      {showForm && (
        <div className="glass-strong rounded-2xl p-6 border border-emerald-400/20">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            Aggiungi Lezione
          </h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-emerald-300/70 mb-1.5">Data *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  data-testid="input-lesson-date"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-300/70 mb-1.5">Ora</label>
                <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                  data-testid="input-lesson-time"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-emerald-300/70 mb-1.5">Materia *</label>
                <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  placeholder="Es. Matematica"
                  data-testid="input-lesson-subject"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-emerald-300/70 mb-1.5">Classe *</label>
                <input type="text" value={form.class} onChange={e => setForm(f => ({ ...f, class: e.target.value }))}
                  placeholder="Es. 3A"
                  data-testid="input-lesson-class"
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-300/70 mb-1.5">Argomento</label>
              <input type="text" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                placeholder="Argomento della lezione"
                data-testid="input-lesson-topic"
                className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-emerald-300/70 mb-1.5">Note</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Note aggiuntive..."
                rows={2}
                data-testid="input-lesson-notes"
                className="glass-input w-full px-3 py-2 rounded-xl text-sm focus:outline-none resize-none" />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" data-testid="button-save-lesson" className="btn-emerald px-5 py-2 rounded-xl text-sm font-semibold">Salva</button>
              <button type="button" onClick={() => { setShowForm(false); setError(""); }}
                className="glass px-5 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-colors">
                Annulla
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {active.length === 0 && !showArchive && (
          <div className="glass-card rounded-2xl p-8 text-center">
            <BookOpen className="w-12 h-12 text-emerald-400/30 mx-auto mb-3" />
            <p className="text-white/40 text-sm">Nessuna lezione pianificata. Aggiungine una!</p>
          </div>
        )}
        {active.map(l => (
          <LessonCard key={l.id} lesson={l} onDelete={handleDelete} />
        ))}
      </div>

      {archive.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchive(!showArchive)}
            data-testid="button-toggle-archive-lessons"
            className="flex items-center gap-2 text-sm text-emerald-300/60 hover:text-emerald-300 transition-colors mb-3"
          >
            <Archive className="w-4 h-4" />
            Archivio ({archive.length})
            {showArchive ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showArchive && (
            <div className="space-y-2">
              {archive.map(l => (
                <LessonCard key={l.id} lesson={l} onDelete={handleDelete} archived />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LessonCard({ lesson, onDelete, archived }: { lesson: Lesson; onDelete: (id: string) => void; archived?: boolean }) {
  return (
    <div className={`glass-card rounded-xl p-4 flex items-start gap-4 ${archived ? "archive-item" : ""}`} data-testid={`card-lesson-${lesson.id}`}>
      <div className="flex-shrink-0 p-2 rounded-lg bg-emerald-500/15 mt-0.5">
        <BookOpen className="w-4 h-4 text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white text-sm">{lesson.subject}</span>
          <span className="badge-lesson event-pill">{lesson.class}</span>
          {lesson.topic && <span className="text-xs text-white/50">— {lesson.topic}</span>}
        </div>
        <p className="text-xs text-white/50 mt-0.5">{formatDate(lesson.date)}{lesson.time ? ` ore ${lesson.time}` : ""}</p>
        {lesson.notes && <p className="text-xs text-white/40 mt-1 line-clamp-2">{lesson.notes}</p>}
      </div>
      <button onClick={() => onDelete(lesson.id)} data-testid={`button-delete-lesson-${lesson.id}`}
        className="text-white/20 hover:text-red-400 transition-colors p-1 flex-shrink-0">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
