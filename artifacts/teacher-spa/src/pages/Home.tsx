import { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Users, MessageSquare } from "lucide-react";
import { AppData, formatDate } from "@/lib/store";

interface HomeProps {
  data: AppData;
}

const DAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const MONTHS = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  let d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

export default function Home({ data }: HomeProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function getEventsForDay(day: number) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const lessons = data.lessons.filter(l => l.date === dateStr);
    const meetings = data.meetings.filter(m => m.date === dateStr);
    const hearings = data.hearings.filter(h => h.date === dateStr);
    return { lessons, meetings, hearings };
  }

  function isToday(day: number) {
    return day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);

  const upcomingEvents = [
    ...data.lessons.map(l => ({ ...l, type: "lesson" as const, label: `Lezione: ${l.subject} - ${l.class}` })),
    ...data.meetings.map(m => ({ ...m, type: "meeting" as const, label: `Riunione: ${m.type}` })),
    ...data.hearings.map(h => ({ ...h, type: "hearing" as const, label: `Udienza: ${h.student}` })),
  ]
    .filter(e => {
      const d = new Date(e.date);
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      return d >= t;
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.time || "").localeCompare(b.time || "");
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Calendario</h2>
          <p className="text-sm text-emerald-300/60 mt-0.5">Panoramica mensile delle attività</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} data-testid="button-prev-month" className="glass p-2 rounded-xl hover:bg-emerald-900/30 transition-all text-emerald-300">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="glass px-4 py-2 rounded-xl text-sm font-semibold text-white min-w-[140px] text-center">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button onClick={nextMonth} data-testid="button-next-month" className="glass p-2 rounded-xl hover:bg-emerald-900/30 transition-all text-emerald-300">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="glass-strong rounded-2xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-emerald-500/10">
          {DAYS.map(d => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-emerald-300/60 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="calendar-cell" />;
            }
            const { lessons, meetings, hearings } = getEventsForDay(day);
            const hasEvents = lessons.length > 0 || meetings.length > 0 || hearings.length > 0;
            return (
              <div
                key={day}
                className={`calendar-cell p-1.5 border-r border-b border-emerald-500/08 ${isToday(day) ? "today" : ""}`}
                data-testid={`calendar-cell-${day}`}
              >
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1 ${
                  isToday(day)
                    ? "bg-emerald-500 text-white font-bold"
                    : "text-white/70"
                }`}>
                  {day}
                </span>
                <div className="space-y-0.5">
                  {lessons.slice(0, 1).map(l => (
                    <div key={l.id} className="event-pill lesson-pill" title={`${l.subject} - ${l.class}`}>
                      {l.subject}
                    </div>
                  ))}
                  {meetings.slice(0, 1).map(m => (
                    <div key={m.id} className="event-pill meeting-pill" title={m.type}>
                      {m.type}
                    </div>
                  ))}
                  {hearings.slice(0, 1).map(h => (
                    <div key={h.id} className="event-pill hearing-pill" title={h.student}>
                      {h.student}
                    </div>
                  ))}
                  {hasEvents && (lessons.length + meetings.length + hearings.length) > 3 && (
                    <div className="event-pill" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>
                      +{lessons.length + meetings.length + hearings.length - 3}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-sm font-semibold text-white">Lezioni questo mese</span>
          </div>
          <p className="text-3xl font-bold emerald-text" data-testid="count-lessons-month">
            {data.lessons.filter(l => {
              const d = new Date(l.date);
              return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
            }).length}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-blue-500/20">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-sm font-semibold text-white">Riunioni questo mese</span>
          </div>
          <p className="text-3xl font-bold text-blue-400" data-testid="count-meetings-month">
            {data.meetings.filter(m => {
              const d = new Date(m.date);
              return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
            }).length}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-orange-500/20">
              <MessageSquare className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-sm font-semibold text-white">Udienze questo mese</span>
          </div>
          <p className="text-3xl font-bold text-orange-400" data-testid="count-hearings-month">
            {data.hearings.filter(h => {
              const d = new Date(h.date);
              return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
            }).length}
          </p>
        </div>
      </div>

      {upcomingEvents.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-emerald-300/80 mb-4 uppercase tracking-wider">Prossimi eventi</h3>
          <div className="space-y-2.5">
            {upcomingEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`event-pill text-xs px-2 py-0.5 ${ev.type === "lesson" ? "lesson-pill" : ev.type === "meeting" ? "meeting-pill" : "hearing-pill"}`}>
                  {ev.type === "lesson" ? "Lezione" : ev.type === "meeting" ? "Riunione" : "Udienza"}
                </span>
                <span className="text-sm text-white/80">{ev.label}</span>
                <span className="ml-auto text-xs text-white/40">{formatDate(ev.date)}{ev.time ? ` ore ${ev.time}` : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
