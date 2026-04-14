import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Home, Users, MessageSquare, GraduationCap, FileText,
  LogOut, Menu, X, ChevronLeft, ChevronRight, Share2
} from "lucide-react";
import { isAuthenticated, logout, getUsername, getSessionPin } from "@/lib/auth";
import { useAppData } from "@/lib/store";
import Login from "@/pages/Login";
import HomeView from "@/pages/Home";
import Lessons from "@/pages/Lessons";
import Meetings from "@/pages/Meetings";
import Hearings from "@/pages/Hearings";
import Students from "@/pages/Students";
import QuickNotes from "@/pages/QuickNotes";
import SharedClasses from "@/pages/SharedClasses";

type Section = "home" | "lessons" | "meetings" | "hearings" | "students" | "notes" | "shared";

const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType; color: string }[] = [
  { id: "home",     label: "Home",             icon: Home,          color: "text-emerald-400" },
  { id: "lessons",  label: "Lezioni",          icon: BookOpen,      color: "text-emerald-300" },
  { id: "meetings", label: "Riunioni",         icon: Users,         color: "text-blue-400"    },
  { id: "hearings", label: "Udienze",          icon: MessageSquare, color: "text-orange-400"  },
  { id: "students", label: "Studenti",         icon: GraduationCap, color: "text-purple-400"  },
  { id: "notes",    label: "Note Rapide",      icon: FileText,      color: "text-yellow-400"  },
  { id: "shared",   label: "Classi Condivise", icon: Share2,        color: "text-teal-400"    },
];

const VALID_SECTIONS = NAV_ITEMS.map(n => n.id);

function getHashSection(): Section {
  const hash = window.location.hash.replace("#", "");
  return (VALID_SECTIONS.includes(hash as Section) ? hash : "home") as Section;
}

function checkAuthed(): boolean {
  return isAuthenticated() && getSessionPin() !== null;
}

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
};

// ─────────────────────────────────────────────────────────
// Sidebar width classes (tutti scritti esplicitamente per
// Tailwind — non usare template literal dinamici).
// ─────────────────────────────────────────────────────────
function sidebarWidthClass(mobileOpen: boolean, expanded: boolean): string {
  if ( mobileOpen &&  expanded) return "w-64 md:w-64";
  if ( mobileOpen && !expanded) return "w-64 md:w-14";
  if (!mobileOpen &&  expanded) return "w-0 md:w-64";
  return "w-0 md:w-14";
}

export default function App() {
  const [authed, setAuthed]         = useState(checkAuthed);
  const [section, setSection]       = useState<Section>(getHashSection);
  const [expanded, setExpanded]     = useState(true);   // desktop: w-64 / w-14
  const [mobileOpen, setMobileOpen] = useState(false);  // mobile: w-0 / w-64

  const { data, updateData, reloadData } = useAppData();

  // ── Tutti gli hook prima di qualsiasi return condizionale ──
  useEffect(() => {
    if (authed) window.location.hash = section;
  }, [authed, section]);

  useEffect(() => {
    const onHashChange = () => setSection(getHashSection());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handleDelete = useCallback((kind: string, id: string) => {
    if (kind === "lesson")  updateData(prev => ({ ...prev, lessons:  prev.lessons.filter(x => x.id !== id) }));
    if (kind === "meeting") updateData(prev => ({ ...prev, meetings: prev.meetings.filter(x => x.id !== id) }));
    if (kind === "hearing") updateData(prev => ({ ...prev, hearings: prev.hearings.filter(x => x.id !== id) }));
  }, [updateData]);

  // ── Return condizionale DOPO tutti gli hook ──
  if (!authed) {
    return (
      <Login onLogin={() => {
        setAuthed(true);
        // Ricarica i dati con il PIN ora in memoria → decripta correttamente
        reloadData();
      }} />
    );
  }

  function handleLogout() { logout(); setAuthed(false); }
  function navigate(s: Section) { setSection(s); setMobileOpen(false); }

  const widthClass = sidebarWidthClass(mobileOpen, expanded);
  const currentLabel = NAV_ITEMS.find(n => n.id === section)?.label ?? "Home";

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Sidebar (sempre in-flow, mai overlay) ─── */}
      <aside
        data-testid="sidebar"
        className={[
          "glass-sidebar flex flex-col flex-shrink-0 h-full",
          "transition-all duration-300 ease-in-out overflow-hidden",
          widthClass,
        ].join(" ")}
      >
        {/* Header sidebar */}
        <div className="flex items-center border-b border-emerald-500/15 h-14 flex-shrink-0 px-2">
          {/* Logo + nome — visibile solo quando la sidebar è larga */}
          <div className={`flex items-center gap-2.5 flex-1 min-w-0 overflow-hidden transition-all duration-300 ${expanded ? "opacity-100 max-w-full" : "opacity-0 max-w-0"}`}>
            <div className="w-7 h-7 rounded-xl emerald-gradient flex items-center justify-center flex-shrink-0 shadow">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white leading-tight truncate whitespace-nowrap">Registro Docente</p>
              <p className="text-xs text-emerald-300/50 truncate whitespace-nowrap">{getUsername()}</p>
            </div>
          </div>

          {/* Toggle desktop: ‹ / › */}
          <button
            onClick={() => setExpanded(e => !e)}
            data-testid="button-sidebar-toggle"
            title={expanded ? "Comprimi" : "Espandi"}
            className="hidden md:flex flex-shrink-0 rounded-xl p-1.5 text-emerald-400/50 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all"
          >
            {expanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Chiudi su mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden flex-shrink-0 rounded-xl p-1.5 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto space-y-0.5 px-1.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                data-testid={`nav-${item.id}`}
                title={!expanded ? item.label : undefined}
                className={[
                  "w-full flex items-center rounded-xl text-sm font-medium transition-all nav-item",
                  expanded ? "gap-3 px-3 py-2.5 justify-start" : "justify-center p-2.5",
                  active ? "nav-item-active text-white" : "text-white/60 hover:text-white/90",
                ].join(" ")}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? item.color : "text-white/40"}`} />
                {expanded && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer logout */}
        <div className="px-1.5 pb-3 border-t border-emerald-500/10 pt-3 flex-shrink-0">
          <button
            onClick={handleLogout}
            data-testid="button-logout"
            title={!expanded ? "Esci" : undefined}
            className={[
              "w-full flex items-center rounded-xl text-sm font-medium text-white/40",
              "hover:text-red-400 hover:bg-red-900/10 transition-all",
              expanded ? "gap-3 px-3 py-2.5" : "justify-center p-2.5",
            ].join(" ")}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {expanded && <span>Esci</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top bar — hamburger + titolo sezione */}
        <div className="flex items-center gap-3 px-4 h-14 glass border-b border-emerald-500/10 flex-shrink-0">
          {/* Hamburger su mobile / Toggle alternativo su desktop quando sidebar è chiusa */}
          <button
            onClick={() => {
              if (window.innerWidth < 768) {
                setMobileOpen(o => !o);
              } else {
                setExpanded(e => !e);
              }
            }}
            data-testid="button-mobile-menu"
            className={`p-1.5 rounded-xl text-white/60 hover:text-white transition-colors flex-shrink-0 ${expanded ? "md:hidden" : ""}`}
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="font-semibold text-white text-sm truncate">{currentLabel}</span>
        </div>

        {/* Page content con transizioni Framer Motion */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={section} variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.18 }}>
              {section === "home"     && <HomeView    data={data} onDelete={handleDelete} />}
              {section === "lessons"  && <Lessons     data={data} updateData={updateData} />}
              {section === "meetings" && <Meetings    data={data} updateData={updateData} />}
              {section === "hearings" && <Hearings    data={data} updateData={updateData} />}
              {section === "students" && <Students    data={data} updateData={updateData} />}
              {section === "notes"    && <QuickNotes  data={data} updateData={updateData} />}
              {section === "shared"   && <SharedClasses />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
