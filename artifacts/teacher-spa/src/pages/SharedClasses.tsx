import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Copy, Check, Trash2, GraduationCap, AlertTriangle,
  BookOpen, MapPin, Clipboard, ChevronLeft, ChevronRight,
  Calendar, List, X
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
function toDateStr(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }

interface FlatEvent extends SharedEvent { className: string; classId: string; }

// ─────────────────────────────────────────────
// Popup evento condiviso
// ─────────────────────────────────────────────
function SharedEventPopup({ event, onClose, onDelete }: {
  event: FlatEvent | null;
  onClose: () => void;
  onDelete: (classId: string, eventId: string) => void;
}) {
  if (!event) return null;
  const s = getKindStyle(event.type);
  const icon = event.type === "verifica" ? <BookOpen className="w-5 h-5" /> : event.type === "gita" ? <MapPin className="w-5 h-5" /> : <Clipboard className="w-5 h-5" />;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
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
              <p className="text-xs text-emerald-300/50 mt-0.5">{event.className}</p>
            </div>
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1 -mt-1 -mr-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-sm text-white/50 mb-5 pb-4 border-b border-emerald-500/10">
            <Calendar className="w-3.5 h-3.5 text-emerald-400/50" />
            {formatDate(event.date)}
          </div>

          {event.description && (
            <p className="text-sm text-white/70 mb-5">{event.description}</p>
          )}

          <button
            onClick={() => { onDelete(event.classId, event.id); onClose(); }}
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
// Calendario mensile classi condivise
// ─────────────────────────────────────────────
function SharedCalendar({ classes, onDeleteEvent }: {
  classes: SharedClass[];
  onDeleteEvent: (classId: string, eventId: string) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [popup, setPopup] = useState<FlatEvent | null>(null);

  // Tutti gli eventi da tutte le classi, appiattiti con il nome classe
  const allEvents: FlatEvent[] = classes.flatMap(cls =>
    cls.events.map(ev => ({ ...ev, className: cls.name, classId: cls.id }))
  );

  function getEventsForDay(dateStr: string): FlatEvent[] {
    return allEvents.filter(e => e.date === dateStr).sort((a,b) => a.type.localeCompare(b.type));
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

  // Prossimi eventi (da oggi in poi)
  const upcoming = allEvents
    .filter(e => e.date >= toDateStr(today))
    .sort((a,b) => a.date.localeCompare(b.date))
    .slice(0, 6);

  // Statistiche mese corrente
  const monthEvents = allEvents.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
  });

  return (
    <div className="space-y-5">
      {/* Navigazione mese */}
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="glass p-2 rounded-xl text-emerald-300/70 hover:text-emerald-300 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="glass px-4 py-2 rounded-xl text-sm font-semibold text-white min-w-[160px] text-center">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button onClick={nextMonth} className="glass p-2 rounded-xl text-emerald-300/70 hover:text-emerald-300 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); }}
            className="glass px-3 py-2 rounded-xl text-xs font-medium text-emerald-400/70 hover:text-emerald-400 transition-all ml-1">
            Oggi
          </button>
        </div>

        {/* Legenda */}
        <div className="hidden sm:flex items-center gap-2">
          {EVENT_KINDS.map(k => (
            <span key={k.id} className={`text-xs font-medium px-2 py-0.5 rounded-full ${k.pill}`}>{k.label}</span>
          ))}
        </div>
      </div>

      {/* Statistiche mese */}
      <div className="grid grid-cols-3 gap-3">
        {EVENT_KINDS.map(k => {
          const count = monthEvents.filter(e => e.type === k.id).length;
          return (
            <div key={k.id} className={`glass-card rounded-xl p-3 border ${k.border}`}>
              <p className={`text-xs font-semibold ${k.color} mb-1`}>{k.label}</p>
              <p className={`text-2xl font-bold ${k.color}`}>{count}</p>
            </div>
          );
        })}
      </div>

      {/* Griglia calendario */}
      <div className="glass-strong rounded-2xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-emerald-500/10">
          {DAYS_SHORT.map(d => (
            <div key={d} className="py-2.5 text-center text-xs font-semibold text-emerald-300/50 uppercase tracking-wider">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) return <div key={`e${idx}`} className="calendar-cell border-r border-b border-emerald-500/05" />;
            const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const evs = getEventsForDay(dateStr);
            const tod = isToday(day);
            return (
              <div key={day} className={`calendar-cell p-1 border-r border-b border-emerald-500/05 ${tod ? "today" : ""}`}>
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-0.5 ${tod ? "bg-emerald-500 text-white font-bold" : "text-white/60"}`}>
                  {day}
                </span>
                <div className="space-y-0.5">
                  {evs.slice(0, 2).map((ev, i) => {
                    const s = getKindStyle(ev.type);
                    return (
                      <div key={i} onClick={() => setPopup(ev)}
                        className={`event-pill cursor-pointer truncate ${s.pill}`}
                        title={`${ev.title} — ${ev.className}`}>
                        {ev.title}
                      </div>
                    );
                  })}
                  {evs.length > 2 && (
                    <div className="event-pill" style={{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.4)"}}>
                      +{evs.length - 2}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prossimi eventi */}
      {upcoming.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-emerald-300/60 mb-4 uppercase tracking-wider">Prossimi impegni condivisi</h3>
          <div className="space-y-2">
            {upcoming.map((ev, i) => {
              const s = getKindStyle(ev.type);
              return (
                <button key={i} onClick={() => setPopup(ev)}
                  className="w-full flex items-center gap-3 hover:bg-emerald-500/5 rounded-lg px-1 py-1.5 transition-all text-left">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.pill} flex-shrink-0`}>{s.label}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{ev.title}</p>
                    <p className="text-xs text-white/30 truncate">{ev.className}</p>
                  </div>
                  <span className="text-xs text-white/30 flex-shrink-0">{formatDate(ev.date)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Popup */}
      {popup && (
        <SharedEventPopup
          event={popup}
          onClose={() => setPopup(null)}
          onDelete={(classId, eventId) => { onDeleteEvent(classId, eventId); }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Pagina principale SharedClasses
// ─────────────────────────────────────────────
export default function SharedClasses() {
  const { classes, addClass, deleteClass, addEvent, deleteEvent, joinClass } = useSharedData();
  const [mainTab, setMainTab] = useState<"calendar" | "list">("calendar");
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
          {/* Tab: Calendario / Classi */}
          <div className="flex items-center gap-1 glass rounded-xl p-1">
            <button onClick={() => setMainTab("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mainTab === "calendar" ? "bg-emerald-500/30 text-emerald-300" : "text-white/40 hover:text-white/70"}`}>
              <Calendar className="w-3.5 h-3.5" /> Calendario
            </button>
            <button onClick={() => setMainTab("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mainTab === "list" ? "bg-emerald-500/30 text-emerald-300" : "text-white/40 hover:text-white/70"}`}>
              <List className="w-3.5 h-3.5" /> Classi
            </button>
          </div>
          <button onClick={() => setFormTab(f => f === "join" ? "none" : "join")} data-testid="button-join-class"
            className="glass flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300/80 hover:text-emerald-300 transition-all">
            <Clipboard className="w-3.5 h-3.5" /> Unisciti
          </button>
          <button onClick={() => setFormTab(f => f === "create" ? "none" : "create")} data-testid="button-create-class"
            className="btn-emerald flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold">
            <Plus className="w-4 h-4" /> Nuova Classe
          </button>
        </div>
      </div>

      {/* Form Crea */}
      <AnimatePresence>
        {formTab === "create" && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}
            className="glass-strong rounded-2xl p-5 border border-emerald-400/20">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" /> Crea Nuova Classe
            </h3>
            <form onSubmit={handleCreate} className="flex gap-3">
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Nome classe (es. 3A Matematica)" data-testid="input-shared-class-name"
                className="glass-input flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none" />
              <button type="submit" data-testid="button-create-class-submit" className="btn-emerald px-4 py-2 rounded-xl text-sm font-semibold">Crea</button>
              <button type="button" onClick={() => setFormTab("none")} className="glass px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white transition-colors">✕</button>
            </form>
            {createError && <p className="text-xs text-red-400 mt-2">{createError}</p>}
            <p className="text-xs text-white/25 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Verrà generato un codice univoco da condividere.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Unisciti */}
      <AnimatePresence>
        {formTab === "join" && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}
            className="glass-strong rounded-2xl p-5 border border-blue-400/20">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Clipboard className="w-4 h-4 text-blue-400" /> Unisciti a una Classe
            </h3>
            <form onSubmit={handleJoin} className="flex gap-3">
              <input type="text" value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,""))}
                placeholder="Codice (es. XJ72K9)" maxLength={6} data-testid="input-join-code"
                className="glass-input flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none font-mono tracking-widest uppercase" />
              <button type="submit" data-testid="button-join-submit"
                className="glass px-4 py-2 rounded-xl text-sm font-semibold text-blue-300 border border-blue-400/30 hover:bg-blue-900/20 transition-all">Unisciti</button>
              <button type="button" onClick={() => setFormTab("none")} className="glass px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white transition-colors">✕</button>
            </form>
            {joinError   && <p className="text-xs text-red-400 mt-2">{joinError}</p>}
            {joinSuccess && <p className="text-xs text-emerald-400 mt-2">{joinSuccess}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenuto principale con transizione */}
      <AnimatePresence mode="wait">
        {mainTab === "calendar" ? (
          <motion.div key="calendar" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.2}}>
            {classes.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <Calendar className="w-14 h-14 text-emerald-400/20 mx-auto mb-4" />
                <p className="text-white/40 text-sm">Nessuna classe condivisa ancora.</p>
                <p className="text-white/25 text-xs mt-1">Crea una classe o unisciti con un codice per vedere gli impegni nel calendario.</p>
              </div>
            ) : (
              <SharedCalendar classes={classes} onDeleteEvent={deleteEvent} />
            )}
          </motion.div>
        ) : (
          <motion.div key="list" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-6}} transition={{duration:0.2}}>
            {classes.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <GraduationCap className="w-14 h-14 text-emerald-400/20 mx-auto mb-4" />
                <p className="text-white/40 text-sm">Nessuna classe condivisa.</p>
                <p className="text-white/25 text-xs mt-1">Crea una classe o unisciti con un codice.</p>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────
// ClassCard
// ─────────────────────────────────────────────
interface ClassCardProps {
  cls: SharedClass;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onAddEvent: (ev: Omit<SharedEvent,"id"|"createdAt">) => void;
  onDeleteEvent: (eid: string) => void;
  copiedCode: string | null;
  onCopy: (code: string) => void;
}

function ClassCard({ cls, expanded, onToggle, onDelete, onAddEvent, onDeleteEvent, copiedCode, onCopy }: ClassCardProps) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ date: string; type: EventKind; title: string; description: string }>({
    date: "", type: "verifica", title: "", description: ""
  });
  const [formError, setFormError] = useState("");

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.date || !form.title) { setFormError("Data e titolo sono obbligatori."); return; }
    onAddEvent({ date: form.date, type: form.type, title: form.title, description: form.description });
    setForm({ date: "", type: "verifica", title: "", description: "" });
    setFormError(""); setShowForm(false);
  }

  const sortedEvents = [...cls.events].sort((a,b) => a.date.localeCompare(b.date));

  return (
    <div className="glass-card rounded-2xl overflow-hidden" data-testid={`shared-class-${cls.id}`}>
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={onToggle}>
        <div className="p-2 rounded-xl bg-emerald-500/15 flex-shrink-0">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white">{cls.name}</p>
          <p className="text-xs text-white/30 mt-0.5">{cls.events.length} event{cls.events.length !== 1 ? "i" : "o"}</p>
        </div>
        <div className="flex items-center gap-1.5 glass rounded-lg px-2.5 py-1.5" onClick={e => e.stopPropagation()}>
          <span className="font-mono text-sm font-bold text-emerald-300 tracking-widest">{cls.code}</span>
          <button onClick={() => onCopy(cls.code)} data-testid={`button-copy-code-${cls.id}`}
            className="text-emerald-400/50 hover:text-emerald-400 transition-colors">
            {copiedCode === cls.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        {!cls.joined && (
          <button onClick={e => { e.stopPropagation(); onDelete(); }} data-testid={`button-delete-class-${cls.id}`}
            className="text-white/20 hover:text-red-400 transition-colors p-1">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.25}}>
            <div className="border-t border-emerald-500/10 p-4 space-y-3">
              {!showForm && (
                <button onClick={() => setShowForm(true)} data-testid={`button-add-shared-event-${cls.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl glass text-xs font-semibold text-emerald-300/70 hover:text-emerald-300 border border-emerald-500/15 hover:border-emerald-500/30 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Aggiungi evento
                </button>
              )}
              <AnimatePresence>
                {showForm && (
                  <motion.form initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                    onSubmit={handleAdd} className="glass p-4 rounded-xl space-y-3 border border-emerald-400/15">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-emerald-300/60 mb-1">Data *</label>
                        <input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))}
                          data-testid="input-shared-event-date"
                          className="glass-input w-full px-2 py-1.5 rounded-lg text-xs focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs text-emerald-300/60 mb-1">Tipo</label>
                        <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value as EventKind}))}
                          data-testid="select-shared-event-type"
                          className="glass-input w-full px-2 py-1.5 rounded-lg text-xs focus:outline-none">
                          {EVENT_KINDS.map(k => <option key={k.id} value={k.id}>{k.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-emerald-300/60 mb-1">Titolo *</label>
                      <input type="text" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
                        placeholder="Es. Verifica algebra" data-testid="input-shared-event-title"
                        className="glass-input w-full px-2 py-1.5 rounded-lg text-xs focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs text-emerald-300/60 mb-1">Descrizione</label>
                      <input type="text" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
                        placeholder="Dettagli aggiuntivi" data-testid="input-shared-event-desc"
                        className="glass-input w-full px-2 py-1.5 rounded-lg text-xs focus:outline-none" />
                    </div>
                    {formError && <p className="text-xs text-red-400">{formError}</p>}
                    <div className="flex gap-2">
                      <button type="submit" className="btn-emerald px-3 py-1.5 rounded-lg text-xs font-semibold">Salva</button>
                      <button type="button" onClick={()=>setShowForm(false)} className="glass px-3 py-1.5 rounded-lg text-xs text-white/50 hover:text-white transition-colors">Annulla</button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {sortedEvents.length === 0 ? (
                <p className="text-center text-xs text-white/20 py-3">Nessun evento ancora</p>
              ) : (
                <div className="space-y-1.5">
                  {sortedEvents.map(ev => {
                    const s = getKindStyle(ev.type);
                    const icon = ev.type === "verifica" ? <BookOpen className="w-3.5 h-3.5" /> : ev.type === "gita" ? <MapPin className="w-3.5 h-3.5" /> : <Clipboard className="w-3.5 h-3.5" />;
                    return (
                      <div key={ev.id} className={`flex items-center gap-3 p-2.5 rounded-xl border ${s.bg} ${s.border}`} data-testid={`shared-event-${ev.id}`}>
                        <span className={s.color}>{icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${s.color}`}>{ev.title}</p>
                          <p className="text-xs text-white/30">{formatDate(ev.date)}{ev.description ? ` — ${ev.description}` : ""}</p>
                        </div>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${s.bg} ${s.color} border ${s.border} flex-shrink-0`}>{s.label}</span>
                        <button onClick={() => onDeleteEvent(ev.id)} data-testid={`button-delete-shared-event-${ev.id}`}
                          className="text-white/15 hover:text-red-400 transition-colors p-0.5 flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
