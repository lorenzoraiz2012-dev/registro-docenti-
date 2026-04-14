import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BookOpen, Users, MessageSquare, Calendar } from "lucide-react";
import { AppData, Lesson, Meeting, Hearing, formatDate, isPast } from "@/lib/store";
import EventPopup from "@/components/EventPopup";

interface HomeProps {
  data: AppData;
  onDelete?: (kind: string, id: string) => void;
}

type CalView = "month" | "week" | "day" | "year";

const DAYS_SHORT  = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const DAYS_FULL   = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
const MONTHS      = ["Gennaio","Febbraio","Marzo","Aprile","Maggio","Giugno","Luglio","Agosto","Settembre","Ottobre","Novembre","Dicembre"];
const MONTHS_SHORT = ["Gen","Feb","Mar","Apr","Mag","Giu","Lug","Ago","Set","Ott","Nov","Dic"];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }
function getMonday(d: Date): Date { const day = d.getDay(); const diff = day === 0 ? -6 : 1 - day; const m = new Date(d); m.setDate(d.getDate() + diff); return m; }
function toDateStr(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }

type AnyEvent = { kind: "lesson"; data: Lesson } | { kind: "meeting"; data: Meeting } | { kind: "hearing"; data: Hearing };

const VIEWS: { id: CalView; label: string }[] = [
  { id: "day",   label: "Giorno" },
  { id: "week",  label: "Settimana" },
  { id: "month", label: "Mese" },
  { id: "year",  label: "Anno" },
];

const VIEW_TRANSITION = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
  transition: { duration: 0.2 },
};

export default function Home({ data, onDelete }: HomeProps) {
  const today = new Date();
  const [view, setView] = useState<CalView>("month");
  const [prevView, setPrevView] = useState<CalView>("month");
  const [anchor, setAnchor] = useState<Date>(new Date(today));
  const [popup, setPopup] = useState<AnyEvent | null>(null);

  function allEvents(dateStr: string): AnyEvent[] {
    const ls: AnyEvent[] = data.lessons.filter(l => l.date === dateStr).map(l => ({ kind: "lesson", data: l }));
    const ms: AnyEvent[] = data.meetings.filter(m => m.date === dateStr).map(m => ({ kind: "meeting", data: m }));
    const hs: AnyEvent[] = data.hearings.filter(h => h.date === dateStr).map(h => ({ kind: "hearing", data: h }));
    return [...ls, ...ms, ...hs].sort((a, b) => (a.data.time || "").localeCompare(b.data.time || ""));
  }

  function changeView(v: CalView) { setPrevView(view); setView(v); }

  function navigate(delta: number) {
    const d = new Date(anchor);
    if (view === "day")   d.setDate(d.getDate() + delta);
    if (view === "week")  d.setDate(d.getDate() + delta * 7);
    if (view === "month") d.setMonth(d.getMonth() + delta);
    if (view === "year")  d.setFullYear(d.getFullYear() + delta);
    setAnchor(d);
  }

  function headerLabel() {
    if (view === "day")   return formatDate(toDateStr(anchor));
    if (view === "week")  { const mon = getMonday(anchor); const sun = new Date(mon); sun.setDate(mon.getDate()+6); return `${mon.getDate()} – ${sun.getDate()} ${MONTHS[sun.getMonth()]} ${sun.getFullYear()}`; }
    if (view === "month") return `${MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`;
    return `${anchor.getFullYear()}`;
  }

  function isToday(d: Date) {
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  }

  const handleDelete = (kind: string, id: string) => { onDelete && onDelete(kind, id); };

  const upcomingEvents: AnyEvent[] = [
    ...data.lessons.map<AnyEvent>(l => ({ kind: "lesson", data: l })),
    ...data.meetings.map<AnyEvent>(m => ({ kind: "meeting", data: m })),
    ...data.hearings.map<AnyEvent>(h => ({ kind: "hearing", data: h })),
  ]
    .filter(e => !isPast(e.data.date) || e.data.date === toDateStr(today))
    .sort((a, b) => { if (a.data.date !== b.data.date) return a.data.date.localeCompare(b.data.date); return (a.data.time||"").localeCompare(b.data.time||""); })
    .slice(0, 6);

  // Stats for current month
  const statsMonth = view === "month" || view === "year" ? anchor.getMonth() : today.getMonth();
  const statsYear  = view === "month" || view === "year" ? anchor.getFullYear() : today.getFullYear();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white">Calendario</h2>
          <p className="text-sm text-emerald-300/60 mt-0.5">Le tue attività in un colpo d'occhio</p>
        </div>

        {/* View selector */}
        <div className="flex items-center gap-1 glass rounded-xl p-1">
          {VIEWS.map(v => (
            <button
              key={v.id}
              onClick={() => changeView(v.id)}
              data-testid={`button-calview-${v.id}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === v.id ? "bg-emerald-500/30 text-emerald-300 shadow-sm" : "text-white/40 hover:text-white/70"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(-1)} data-testid="button-cal-prev" className="glass p-2 rounded-xl text-emerald-300/70 hover:text-emerald-300 transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="glass px-3 py-2 rounded-xl text-xs font-semibold text-white min-w-[130px] text-center">{headerLabel()}</span>
          <button onClick={() => navigate(1)} data-testid="button-cal-next" className="glass p-2 rounded-xl text-emerald-300/70 hover:text-emerald-300 transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => setAnchor(new Date())} data-testid="button-cal-today" className="glass px-3 py-2 rounded-xl text-xs font-medium text-emerald-400/70 hover:text-emerald-400 transition-all ml-1">Oggi</button>
        </div>
      </div>

      {/* Calendar view with transitions */}
      <AnimatePresence mode="wait">
        <motion.div key={view} {...VIEW_TRANSITION}>
          {view === "month" && <MonthView anchor={anchor} allEvents={allEvents} isToday={isToday} onEventClick={setPopup} />}
          {view === "week"  && <WeekView  anchor={anchor} allEvents={allEvents} isToday={isToday} onEventClick={setPopup} />}
          {view === "day"   && <DayView   anchor={anchor} allEvents={allEvents} isToday={isToday} onEventClick={setPopup} />}
          {view === "year"  && <YearView  anchor={anchor} allEvents={allEvents} isToday={isToday} onMonthClick={(y,m) => { const d = new Date(y,m,1); setAnchor(d); changeView("month"); }} />}
        </motion.div>
      </AnimatePresence>

      {/* Stats + upcoming */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<BookOpen className="w-4 h-4 text-emerald-400" />} bg="bg-emerald-500/20" label="Lezioni questo mese" count={data.lessons.filter(l=>{ const d=new Date(l.date); return d.getFullYear()===statsYear && d.getMonth()===statsMonth; }).length} color="emerald-text" testId="count-lessons-month" />
        <StatCard icon={<Users className="w-4 h-4 text-blue-400" />}    bg="bg-blue-500/20"    label="Riunioni questo mese" count={data.meetings.filter(m=>{ const d=new Date(m.date); return d.getFullYear()===statsYear && d.getMonth()===statsMonth; }).length} color="text-blue-400" testId="count-meetings-month" />
        <StatCard icon={<MessageSquare className="w-4 h-4 text-orange-400" />} bg="bg-orange-500/20" label="Udienze questo mese" count={data.hearings.filter(h=>{ const d=new Date(h.date); return d.getFullYear()===statsYear && d.getMonth()===statsMonth; }).length} color="text-orange-400" testId="count-hearings-month" />
      </div>

      {upcomingEvents.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-xs font-semibold text-emerald-300/60 mb-4 uppercase tracking-wider">Prossimi eventi</h3>
          <div className="space-y-2">
            {upcomingEvents.map((ev, i) => (
              <button key={i} onClick={() => setPopup(ev)} className="w-full flex items-center gap-3 hover:bg-emerald-500/5 rounded-lg px-1 py-1 transition-all text-left">
                <span className={`event-pill text-xs ${ev.kind === "lesson" ? "lesson-pill" : ev.kind === "meeting" ? "meeting-pill" : "hearing-pill"}`}>
                  {ev.kind === "lesson" ? "Lezione" : ev.kind === "meeting" ? "Riunione" : "Udienza"}
                </span>
                <span className="text-sm text-white/80 flex-1 truncate">
                  {ev.kind === "lesson" ? `${(ev.data as Lesson).subject} - ${(ev.data as Lesson).class}` : ev.kind === "meeting" ? (ev.data as Meeting).type : (ev.data as Hearing).student}
                </span>
                <span className="text-xs text-white/30 flex-shrink-0">{formatDate(ev.data.date)}{ev.data.time ? ` ${ev.data.time}` : ""}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Event popup */}
      <AnimatePresence>
        {popup && (
          <EventPopup event={popup} onClose={() => setPopup(null)} onDelete={handleDelete} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ──────────────── MONTH VIEW ────────────────
function MonthView({ anchor, allEvents, isToday, onEventClick }: {
  anchor: Date; allEvents: (d:string)=>AnyEvent[]; isToday:(d:Date)=>boolean; onEventClick:(e:AnyEvent)=>void;
}) {
  const y = anchor.getFullYear(), m = anchor.getMonth();
  const days = getDaysInMonth(y, m);
  const first = getFirstDayOfMonth(y, m);
  const cells: (number|null)[] = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let i = 1; i <= days; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="glass-strong rounded-2xl overflow-hidden">
      <div className="grid grid-cols-7 border-b border-emerald-500/10">
        {DAYS_SHORT.map(d => (
          <div key={d} className="py-2.5 text-center text-xs font-semibold text-emerald-300/50 uppercase tracking-wider">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e${idx}`} className="calendar-cell border-r border-b border-emerald-500/05" />;
          const d = new Date(y, m, day);
          const dateStr = toDateStr(d);
          const evs = allEvents(dateStr);
          const isTod = isToday(d);
          return (
            <div key={day} className={`calendar-cell p-1 border-r border-b border-emerald-500/05 ${isTod ? "today" : ""}`} data-testid={`cell-${dateStr}`}>
              <span className={`inline-flex items-center justify-center w-5.5 h-5.5 w-6 h-6 rounded-full text-xs font-medium mb-0.5 ${isTod ? "bg-emerald-500 text-white font-bold" : "text-white/60"}`}>{day}</span>
              <div className="space-y-0.5">
                {evs.slice(0,2).map((ev, i) => (
                  <div key={i} onClick={() => onEventClick(ev)}
                    className={`event-pill cursor-pointer ${ev.kind === "lesson" ? "lesson-pill" : ev.kind === "meeting" ? "meeting-pill" : "hearing-pill"}`}>
                    {ev.kind === "lesson" ? (ev.data as Lesson).subject : ev.kind === "meeting" ? (ev.data as Meeting).type : (ev.data as Hearing).student}
                  </div>
                ))}
                {evs.length > 2 && (
                  <div className="event-pill" style={{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.4)"}}>+{evs.length-2}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────── WEEK VIEW ────────────────
function WeekView({ anchor, allEvents, isToday, onEventClick }: {
  anchor: Date; allEvents: (d:string)=>AnyEvent[]; isToday:(d:Date)=>boolean; onEventClick:(e:AnyEvent)=>void;
}) {
  const mon = getMonday(anchor);
  const days = Array.from({length:7}, (_,i) => { const d = new Date(mon); d.setDate(mon.getDate()+i); return d; });

  return (
    <div className="glass-strong rounded-2xl overflow-hidden">
      <div className="grid grid-cols-7 border-b border-emerald-500/10">
        {days.map((d, i) => (
          <div key={i} className={`py-3 text-center ${isToday(d) ? "bg-emerald-500/10" : ""}`}>
            <p className="text-xs text-emerald-300/50 uppercase">{DAYS_SHORT[i]}</p>
            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold mx-auto mt-1 ${isToday(d) ? "bg-emerald-500 text-white" : "text-white/80"}`}>{d.getDate()}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 min-h-[200px]">
        {days.map((d, i) => {
          const evs = allEvents(toDateStr(d));
          return (
            <div key={i} className={`p-1.5 border-r border-emerald-500/05 space-y-1 ${isToday(d) ? "bg-emerald-500/05" : ""}`}>
              {evs.length === 0 && <div className="text-center text-xs text-white/10 mt-4">—</div>}
              {evs.map((ev, j) => (
                <button key={j} onClick={() => onEventClick(ev)}
                  className={`event-pill w-full text-left cursor-pointer ${ev.kind === "lesson" ? "lesson-pill" : ev.kind === "meeting" ? "meeting-pill" : "hearing-pill"}`}>
                  {ev.data.time && <span className="opacity-70 mr-1">{ev.data.time}</span>}
                  {ev.kind === "lesson" ? (ev.data as Lesson).subject : ev.kind === "meeting" ? (ev.data as Meeting).type : (ev.data as Hearing).student}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────── DAY VIEW ────────────────
function DayView({ anchor, allEvents, isToday, onEventClick }: {
  anchor: Date; allEvents: (d:string)=>AnyEvent[]; isToday:(d:Date)=>boolean; onEventClick:(e:AnyEvent)=>void;
}) {
  const dateStr = toDateStr(anchor);
  const evs = allEvents(dateStr);
  const isTod = isToday(anchor);
  const dayIdx = anchor.getDay() === 0 ? 6 : anchor.getDay() - 1;

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${isTod ? "emerald-gradient text-white" : "glass text-white"}`}>
          {anchor.getDate()}
        </div>
        <div>
          <p className="text-lg font-bold text-white">{DAYS_FULL[dayIdx]}</p>
          <p className="text-sm text-white/40">{MONTHS[anchor.getMonth()]} {anchor.getFullYear()}</p>
        </div>
        {isTod && <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300">Oggi</span>}
      </div>

      {evs.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-emerald-400/20 mx-auto mb-3" />
          <p className="text-sm text-white/30">Nessun evento per questo giorno</p>
        </div>
      ) : (
        <div className="space-y-2">
          {evs.map((ev, i) => {
            const pillCls = ev.kind === "lesson" ? "lesson-pill" : ev.kind === "meeting" ? "meeting-pill" : "hearing-pill";
            const title = ev.kind === "lesson" ? `${(ev.data as Lesson).subject} — ${(ev.data as Lesson).class}` : ev.kind === "meeting" ? (ev.data as Meeting).type : `${(ev.data as Hearing).student}`;
            return (
              <button key={i} onClick={() => onEventClick(ev)}
                className="w-full flex items-center gap-4 p-3 rounded-xl glass-card text-left hover:border-emerald-400/20 group transition-all">
                <div className="text-xs text-white/40 w-10 flex-shrink-0">{ev.data.time || "—"}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{title}</p>
                  {ev.kind === "lesson" && (ev.data as Lesson).topic && <p className="text-xs text-white/40 mt-0.5">{(ev.data as Lesson).topic}</p>}
                </div>
                <span className={`event-pill ${pillCls} flex-shrink-0`}>{ev.kind === "lesson" ? "Lezione" : ev.kind === "meeting" ? "Riunione" : "Udienza"}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ──────────────── YEAR VIEW ────────────────
function YearView({ anchor, allEvents, isToday, onMonthClick }: {
  anchor: Date; allEvents: (d:string)=>AnyEvent[]; isToday:(d:Date)=>boolean; onMonthClick:(y:number,m:number)=>void;
}) {
  const y = anchor.getFullYear();

  return (
    <div className="glass-strong rounded-2xl p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({length:12}, (_,m) => {
          const days = getDaysInMonth(y, m);
          const first = getFirstDayOfMonth(y, m);
          const cells: (number|null)[] = [];
          for (let i = 0; i < first; i++) cells.push(null);
          for (let i = 1; i <= days; i++) cells.push(i);
          while (cells.length % 7 !== 0) cells.push(null);

          const hasEventsThisMonth = Array.from({length:days}, (_,i) => {
            const d = new Date(y,m,i+1);
            return allEvents(toDateStr(d)).length > 0;
          }).some(Boolean);

          return (
            <button key={m} onClick={() => onMonthClick(y,m)} data-testid={`year-month-${m}`}
              className="glass-card rounded-xl p-3 text-left hover:border-emerald-400/25 transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className={`text-xs font-bold ${anchor.getMonth() === m ? "text-emerald-400" : "text-white/70"}`}>{MONTHS_SHORT[m]}</p>
                {hasEventsThisMonth && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />}
              </div>
              <div className="grid grid-cols-7 gap-px">
                {cells.map((day, idx) => {
                  if (!day) return <div key={`e${idx}`} className="aspect-square" />;
                  const d = new Date(y,m,day);
                  const evs = allEvents(toDateStr(d));
                  const tod = isToday(d);
                  return (
                    <div key={day} className={`aspect-square rounded-sm flex items-center justify-center text-[7px] ${tod ? "bg-emerald-500 text-white font-bold rounded-full" : evs.length > 0 ? "bg-emerald-500/20 text-emerald-300" : "text-white/20"}`}>
                      {day}
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────── STAT CARD ────────────────
function StatCard({ icon, bg, label, count, color, testId }: {
  icon: React.ReactNode; bg: string; label: string; count: number; color: string; testId: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${bg}`}>{icon}</div>
        <span className="text-xs font-semibold text-white/60">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${color}`} data-testid={testId}>{count}</p>
    </div>
  );
}
