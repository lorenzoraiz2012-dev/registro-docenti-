import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Copy, Check, Trash2, GraduationCap, AlertTriangle, BookOpen, MapPin, Clipboard } from "lucide-react";
import { useSharedData, SharedClass, SharedEvent } from "@/lib/sharedStore";
import { formatDate } from "@/lib/store";

type EventKind = "verifica" | "gita" | "progetto";

const EVENT_KINDS: { id: EventKind; label: string; color: string; bg: string; border: string }[] = [
  { id: "verifica",  label: "Verifica",  color: "text-red-300",    bg: "bg-red-500/20",    border: "border-red-500/30"    },
  { id: "gita",      label: "Gita",      color: "text-yellow-300", bg: "bg-yellow-500/20", border: "border-yellow-500/30" },
  { id: "progetto",  label: "Progetto",  color: "text-orange-300", bg: "bg-orange-500/20", border: "border-orange-500/30" },
];

function getKindStyle(kind: EventKind) { return EVENT_KINDS.find(k => k.id === kind) ?? EVENT_KINDS[0]; }

export default function SharedClasses() {
  const { classes, addClass, deleteClass, addEvent, deleteEvent, joinClass } = useSharedData();
  const [tab, setTab] = useState<"list" | "create" | "join">("list");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  // Create form
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState("");

  // Join form
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) { setCreateError("Inserisci un nome per la classe."); return; }
    addClass(name);
    setNewName("");
    setCreateError("");
    setTab("list");
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) { setJoinError("Il codice deve avere 6 caratteri."); return; }
    const ok = joinClass(code);
    if (!ok) { setJoinError("Codice non trovato. Verifica e riprova."); return; }
    setJoinError("");
    setJoinSuccess(`Classe aggiunta con successo!`);
    setJoinCode("");
    setTimeout(() => { setJoinSuccess(""); setTab("list"); }, 1800);
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Classi Condivise</h2>
          <p className="text-sm text-emerald-300/60 mt-0.5">Collabora con altri docenti tramite codice univoco</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab("join")} data-testid="button-join-class"
            className="glass flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300/80 hover:text-emerald-300 transition-all">
            <Clipboard className="w-3.5 h-3.5" />
            Unisciti
          </button>
          <button onClick={() => setTab("create")} data-testid="button-create-class"
            className="btn-emerald flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold">
            <Plus className="w-4 h-4" />
            Nuova Classe
          </button>
        </div>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {tab === "create" && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}
            className="glass-strong rounded-2xl p-6 border border-emerald-400/20">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-400" /> Crea Nuova Classe
            </h3>
            <form onSubmit={handleCreate} className="flex gap-3">
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Nome classe (es. 3A Matematica)" data-testid="input-shared-class-name"
                className="glass-input flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none" />
              <button type="submit" data-testid="button-create-class-submit"
                className="btn-emerald px-4 py-2 rounded-xl text-sm font-semibold">Crea</button>
              <button type="button" onClick={() => setTab("list")}
                className="glass px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white transition-colors">✕</button>
            </form>
            {createError && <p className="text-xs text-red-400 mt-2">{createError}</p>}
            <p className="text-xs text-white/30 mt-3 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Verrà generato un codice univoco da condividere con i tuoi colleghi.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Join form */}
      <AnimatePresence>
        {tab === "join" && (
          <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}
            className="glass-strong rounded-2xl p-6 border border-blue-400/20">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Clipboard className="w-4 h-4 text-blue-400" /> Unisciti a una Classe
            </h3>
            <form onSubmit={handleJoin} className="flex gap-3">
              <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,""))}
                placeholder="Inserisci codice (es. XJ72K9)" maxLength={6} data-testid="input-join-code"
                className="glass-input flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none font-mono tracking-widest uppercase" />
              <button type="submit" data-testid="button-join-submit"
                className="glass px-4 py-2 rounded-xl text-sm font-semibold text-blue-300 border border-blue-400/30 hover:bg-blue-900/20 transition-all">
                Unisciti
              </button>
              <button type="button" onClick={() => setTab("list")}
                className="glass px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white transition-colors">✕</button>
            </form>
            {joinError   && <p className="text-xs text-red-400 mt-2">{joinError}</p>}
            {joinSuccess && <p className="text-xs text-emerald-400 mt-2">{joinSuccess}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Classes list */}
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
              onAddEvent={(ev) => addEvent(cls.id, ev)}
              onDeleteEvent={(eid) => deleteEvent(cls.id, eid)}
              copiedCode={copiedCode}
              onCopy={copyCode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────── ClassCard ────────────────
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
    setFormError("");
    setShowForm(false);
  }

  const sortedEvents = [...cls.events].sort((a,b) => a.date.localeCompare(b.date));

  return (
    <div className="glass-card rounded-2xl overflow-hidden" data-testid={`shared-class-${cls.id}`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={onToggle}>
        <div className="p-2 rounded-xl bg-emerald-500/15 flex-shrink-0">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white">{cls.name}</p>
          <p className="text-xs text-white/30 mt-0.5">{cls.events.length} event{cls.events.length !== 1 ? "i" : "o"}</p>
        </div>

        {/* Code badge */}
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
              {/* Add event button */}
              {!showForm && (
                <button onClick={() => setShowForm(true)} data-testid={`button-add-shared-event-${cls.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-xl glass text-xs font-semibold text-emerald-300/70 hover:text-emerald-300 border border-emerald-500/15 hover:border-emerald-500/30 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Aggiungi evento
                </button>
              )}

              {/* Add event form */}
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

              {/* Events list */}
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
