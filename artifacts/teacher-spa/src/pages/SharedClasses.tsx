import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Copy, Check, Trash2, GraduationCap, AlertTriangle,
  BookOpen, MapPin, Clipboard, ChevronLeft, ChevronRight, X, Calendar, Clock, SortAsc
} from "lucide-react";
import { useSharedData, SharedClass, SharedEvent } from "@/lib/sharedStore";
import { formatDate } from "@/lib/store";

type EventKind = "verifica" | "gita" | "progetto";

const EVENT_KINDS: { id: EventKind; label: string; color: string; bg: string; border: string; pill: string }[] = [
  { id: "verifica",  label: "Verifica",  color: "text-red-300",    bg: "bg-red-500/20",    border: "border-red-500/30",    pill: "bg-red-500/25 text-red-200"       },
  { id: "gita",      label: "Gita",      color: "text-yellow-300", bg: "bg-yellow-500/20", border: "border-yellow-500/30", pill: "bg-yellow-500/25 text-yellow-200" },
  { id: "progetto",  label: "Progetto",  color: "text-orange-300", bg: "bg-orange-500/20", border: "border-orange-500/30", pill: "bg-orange-500/25 text-orange-200" },
];

function getKindStyle(kind: EventKind) { return EVENT_KINDS.find(k => k.id === kind) ?? EVENT_KINDS[0]; }

const DAYS_SHORT = ["Lun","Mar","Mer","Gio","Ven","Sab","Dom"];
const MONTHS = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

// ─────────────────────────────────────────────
// Popup evento
// ─────────────────────────────────────────────
function EventPopup({ event, onClose, onDelete }: {
  event: SharedEvent | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  if (!event) return null;
  const s = getKindStyle(event.type);
  const icon = event.type === "verifica" ? <BookOpen className="w-5 h-5" /> : event.type === "gita" ? <MapPin className="w-5 h-5" /> : <Clipboard className="w-5 h-5" />;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="glass-strong rounded-2xl p-6 w-full max-w-sm border border-emerald-400/20"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-start gap-3 mb-5">
            <div className={`p-2 rounded-xl ${s.bg} flex-shrink-0`}>
              <span className={s.color}>{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.color} border ${s.border} mb-1.5`}>{s.label}</span>
              <h3 className="text-base font-bold text-white leading-tight">{event.title}</h3>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1 -mt-1 -mr-1">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-white/50 mb-5 pb-4 border-b border-emerald-500/10">
            <Calendar className="w-3.5 h-3.5 text-emerald-400/50" />
            {formatDate(event.date)}
          </div>
          {event.description && <p className="text-sm text-white/70 mb-5">{event.description}</p>}
          <button
            onClick={() => { onDelete(event.id); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-red-400/70 hover:text-red-400 hover:bg-red-900/15 border border-red-500/10 hover:border-red-500/30 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Elimina evento
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// Popup overflow giorno classi condivise
// ─────────────────────────────────────────────
type SortMode = "time" | "inserted";

function SharedDayOverflowPopup({ dateStr, evs, onClose, onEventClick }: {
  dateStr: string;
  evs: SharedEvent[];
  onClose: () => void;
  onEventClick: (ev: SharedEvent) => void;
}) {
  const [sort, setSort] = useState<SortMode>("time");

  const sorted = [...evs].sort((a, b) => {
    if (sort === "time") return a.date.localeCompare(b.date);
    return (a.createdAt || "").localeCompare(b.createdAt || "");
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 12 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="glass-strong rounded-2xl p-5 w-full max-w-sm border border-emerald-400/20"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-emerald-300/50 uppercase tracking-wider">Tutti gli impegni</p>
              <p className="text-sm font-bold text-white mt-0.5">{formatDate(dateStr)}</p>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-1 glass rounded-xl p-1 mb-4">
            <button onClick={() => setSort("time")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${sort === "time" ? "bg-emerald-500/30 text-emerald-300" : "text-white/40 hover:text-white/70"}`}>
              <Clock className="w-3 h-3" /> Data
            </button>
            <button onClick={() => setSort("inserted")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${sort === "inserted" ? "bg-emerald-500/30 text-emerald-300" : "text-white/40 hover:text-white/70"}`}>
              <SortAsc className="w-3 h-3" /> Inserimento
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {sorted.map((ev, i) => {
              const s = getKindStyle(ev.type);
              return (
                <button key={i} onClick={() => { onClose(); onEventClick(ev); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl glass-card text-left hover:border-emerald-400/20 transition-all">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.pill} flex-shrink-0`}>{s.label}</span>
                  <p className="text-sm text-white/80 truncate flex-1">{ev.title}</p>
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
// Calendario per singola classe
// ─────────────────────────────────────────────
function ClassCalendar({ events, onDeleteEvent }: {
  events: SharedEvent[];
  onDeleteEvent: (id: string) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [popup, setPopup] = useState<SharedEvent | null>(null);
  const [dayOverflow, setDayOverflow] = useState<{ dateStr: string; evs: SharedEvent[] } | null>(null);

  function getEventsForDay(dateStr: string) {
    return events.filter(e => e.date === dateStr).sort((a,b) => a.type.localeCompare(b.type));
  }

  function isToday(day: number) {
    return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
  const monthEvents = events.filter(e => e.date.startsWith(monthStr));

  return (
    <div className="space-y-3">
      {/* Header mese */}
      <div className="flex items-center gap-2">
        <button onClick={prevMonth} className="glass p-1.5 rounded-lg text-emerald-300/70 hover:text-emerald-300 transition-all">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="flex-1 text-center text-sm font-semibold text-white/80">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} className="glass p-1.5 rounded-lg text-emerald-300/70 hover:text-emerald-300 transition-all">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); }}
          className="glass px-2 py-1 rounded-lg text-xs text-emerald-400/60 hover:text-emerald-400 transition-all">
          Oggi
        </button>
      </div>

      {/* Statistiche mese */}
      {monthEvents.length > 0 && (
        <div className="flex gap-2">
          {EVENT_KINDS.map(k => {
            const count = monthEvents.filter(e => e.type === k.id).length;
            if (count === 0) return null;
            return (
              <span key={k.id} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${k.pill}`}>
                {count} {k.label}{count > 1 ? "e" : ""}
              </span>
            );
          })}
        </div>
      )}

      {/* Griglia calendario */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-emerald-500/10">
          {DAYS_SHORT.map(d => (
            <div key={d} className="py-2 text-center text-[10px] font-semibold text-emerald-300/40 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) return <div key={`e${idx}`} className="calendar-cell border-r border-b border-emerald-500/05" />;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = getEventsForDay(dateStr);
            const tod = isToday(day);
            return (
              <div key={day} className={`calendar-cell p-1 border-r border-b border-emerald-500/05 ${tod ? "today" : ""}`}>
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-medium mb-0.5 ${tod ? "bg-emerald-500 text-white font-bold" : "text-white/50"}`}>
                  {day}
                </span>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 2).map((ev, i) => {
                    const s = getKindStyle(ev.type);
                    return (
                      <div key={i} onClick={() => setPopup(ev)}
                        className={`event-pill cursor-pointer truncate ${s.pill}`}
                        title={ev.title}>
                        {ev.title}
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <button
                      onClick={() => setDayOverflow({ dateStr, evs: dayEvents })}
                      className="event-pill w-full text-left cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ background: "rgba(16,185,129,0.15)", color: "rgba(110,231,183,0.8)" }}>
                      +{dayEvents.length - 2} altri
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popup */}
      {popup && (
        <EventPopup event={popup} onClose={() => setPopup(null)} onDelete={id => { onDeleteEvent(id); }} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Form aggiungi evento
// ─────────────────────────────────────────────
function AddEventForm({ classId, onAdd }: {
  classId: string;
  onAdd: (ev: Omit<SharedEvent, "id" | "createdAt">) => void;
}) {
  const [form, setForm] = useState<{ date: string; type: EventKind; title: string; description: string }>({
    date: "", type: "verifica", title: "", description: ""
  });
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.date || !form.title.trim()) { setError("Data e titolo sono obbligatori."); return; }
    onAdd({ date: form.date, type: form.type, title: form.title.trim(), description: form.description.trim() });
    setForm({ date: "", type: "verifica", title: "", description: "" });
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-emerald-500/10">
      <p className="text-xs font-semibold text-emerald-300/50 uppercase tracking-wider flex items-center gap-1.5">
        <Plus className="w-3 h-3" /> Aggiungi impegno
      </p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-white/30 mb-1">Data *</label>
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            data-testid={`input-shared-event-date-${classId}`}
            className="glass-input w-full px-2 py-1.5 rounded-lg text-xs focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs text-white/30 mb-1">Tipo</label>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as EventKind }))}
            data-testid={`select-shared-event-type-${classId}`}
            className="glass-input w-full px-2 py-1.5 rounded-lg text-xs focus:outline-none">
            {EVENT_KINDS.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs text-white/30 mb-1">Titolo *</label>
        <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Es. Verifica di algebra" data-testid={`input-shared-event-title-${classId}`}
          className="glass-input w-full px-2 py-1.5 rounded-lg text-xs focus:outline-none" />
      </div>
      <div>
        <label className="block text-xs text-white/30 mb-1">Note</label>
        <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Dettagli aggiuntivi (opzionale)" data-testid={`input-shared-event-desc-${classId}`}
          className="glass-input w-full px-2 py-1.5 rounded-lg text-xs focus:outline-none" />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <button type="submit" data-testid={`button-add-shared-event-${classId}`}
        className="btn-emerald w-full py-2 rounded-xl text-xs font-semibold">
        Aggiungi al calendario
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────
// Card classe
// ─────────────────────────────────────────────
function ClassCard({ cls, expanded, onToggle, onDelete, onAddEvent, onDeleteEvent, copiedCode, onCopy }: {
  cls: SharedClass;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onAddEvent: (ev: Omit<SharedEvent, "id" | "createdAt">) => void;
  onDeleteEvent: (eid: string) => void;
  copiedCode: string | null;
  onCopy: (code: string) => void;
}) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden" data-testid={`shared-class-${cls.id}`}>
      {/* Header classe */}
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={onToggle}>
        <div className="p-2 rounded-xl bg-emerald-500/15 flex-shrink-0">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white">{cls.name}</p>
          <p className="text-xs text-white/30 mt-0.5">
            {cls.events.length} event{cls.events.length !== 1 ? "i" : "o"} · codice <span className="font-mono text-emerald-400/60">{cls.code}</span>
          </p>
        </div>

        {/* Codice + copia */}
        <div className="flex items-center gap-1.5 glass rounded-lg px-2.5 py-1.5" onClick={e => e.stopPropagation()}>
          <span className="font-mono text-sm font-bold text-emerald-300 tracking-widest">{cls.code}</span>
          <button onClick={() => onCopy(cls.code)} data-testid={`button-copy-code-${cls.id}`}
            className="text-emerald-400/50 hover:text-emerald-400 transition-colors">
            {copiedCode === cls.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!cls.joined && (
          <button onClick={e => { e.stopPropagation(); onDelete(); }} data-testid={`button-delete-class-${cls.id}`}
            className="text-white/20 hover:text-red-400 transition-colors p-1 flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Contenuto espanso: calendario + form */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-emerald-500/10 p-4 space-y-4">
              <ClassCalendar events={cls.events} onDeleteEvent={onDeleteEvent} />
              <AddEventForm classId={cls.id} onAdd={onAddEvent} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// Pagina principale
// ─────────────────────────────────────────────
export default function SharedClasses() {
  const { classes, addClass, deleteClass, addEvent, deleteEvent, joinClass } = useSharedData();
  const [formTab, setFormTab] = useState<"none" | "create" | "join">("none");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) { setCreateError("Inserisci un nome per la classe."); return; }
    addClass(name);
    setNewName(""); setCreateError(""); setFormTab("none");
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) { setJoinError("Il codice deve avere 6 caratteri."); return; }
    const ok = joinClass(code);
    if (!ok) { setJoinError("Codice non trovato. Verifica e riprova."); return; }
    setJoinError("");
    setJoinSuccess("Classe aggiunta con successo!");
    setJoinCode("");
    setTimeout(() => { setJoinSuccess(""); setFormTab("none"); }, 1800);
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">Classi Condivise</h2>
          <p className="text-sm text-emerald-300/60 mt-0.5">Collabora con altri docenti tramite codice univoco</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setFormTab(f => f === "join" ? "none" : "join")}
            className="glass flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300/80 hover:text-emerald-300 transition-all">
            <Clipboard className="w-3.5 h-3.5" /> Unisciti
          </button>
          <button onClick={() => setFormTab(f => f === "create" ? "none" : "create")}
            className="btn-emerald flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold">
            <Plus className="w-4 h-4" /> Nuova Classe
          </button>
        </div>
      </div>

      {/* Form Crea */}
      <AnimatePresence>
        {formTab === "create" && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            className="glass-strong rounded-2xl p-5 border border-emerald-400/20">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" /> Crea Nuova Classe
            </h3>
            <form onSubmit={handleCreate} className="flex gap-3">
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Nome classe (es. 3A Matematica)" data-testid="input-shared-class-name"
                className="glass-input flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none" />
              <button type="submit" className="btn-emerald px-4 py-2 rounded-xl text-sm font-semibold">Crea</button>
              <button type="button" onClick={() => setFormTab("none")}
                className="glass px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white transition-colors">✕</button>
            </form>
            {createError && <p className="text-xs text-red-400 mt-2">{createError}</p>}
            <p className="text-xs text-white/25 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Verrà generato un codice univoco da condividere con i colleghi.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Unisciti */}
      <AnimatePresence>
        {formTab === "join" && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            className="glass-strong rounded-2xl p-5 border border-blue-400/20">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Clipboard className="w-4 h-4 text-blue-400" /> Unisciti a una Classe
            </h3>
            <form onSubmit={handleJoin} className="flex gap-3">
              <input type="text" value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                placeholder="Codice (es. XJ72K9)" maxLength={6} data-testid="input-join-code"
                className="glass-input flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none font-mono tracking-widest uppercase" />
              <button type="submit"
                className="glass px-4 py-2 rounded-xl text-sm font-semibold text-blue-300 border border-blue-400/30 hover:bg-blue-900/20 transition-all">
                Unisciti
              </button>
              <button type="button" onClick={() => setFormTab("none")}
                className="glass px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white transition-colors">✕</button>
            </form>
            {joinError   && <p className="text-xs text-red-400 mt-2">{joinError}</p>}
            {joinSuccess && <p className="text-xs text-emerald-400 mt-2">{joinSuccess}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista classi */}
      {classes.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <GraduationCap className="w-14 h-14 text-emerald-400/20 mx-auto mb-4" />
          <p className="text-white/40 text-sm">Nessuna classe condivisa ancora.</p>
          <p className="text-white/25 text-xs mt-1">Crea una nuova classe oppure unisciti con un codice fornito da un collega.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.map(cls => (
            <ClassCard
              key={cls.id}
              cls={cls}
              expanded={expandedClass === cls.id}
              onToggle={() => setExpandedClass(expandedClass === cls.id ? null : cls.id)}
              onDelete={() => deleteClass(cls.id)}
              onAddEvent={ev => addEvent(cls.id, ev)}
              onDeleteEvent={eid => deleteEvent(cls.id, eid)}
              copiedCode={copiedCode}
              onCopy={copyCode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
