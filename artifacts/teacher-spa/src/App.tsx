import { useState, useEffect } from "react";
import {
  BookOpen, Home, Users, MessageSquare, GraduationCap, FileText,
  LogOut, Menu, X, ChevronLeft, ChevronRight
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

type Section = "home" | "lessons" | "meetings" | "hearings" | "students" | "notes";

const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType; color: string }[] = [
  { id: "home",     label: "Home",                icon: Home,          color: "text-emerald-400" },
  { id: "lessons",  label: "Lezioni",             icon: BookOpen,      color: "text-emerald-300" },
  { id: "meetings", label: "Riunioni",            icon: Users,         color: "text-blue-400"    },
  { id: "hearings", label: "Udienze",             icon: MessageSquare, color: "text-orange-400"  },
  { id: "students", label: "Studenti",            icon: GraduationCap, color: "text-purple-400"  },
  { id: "notes",    label: "Note Rapide",         icon: FileText,      color: "text-yellow-400"  },
];

function getHashSection(): Section {
  const hash = window.location.hash.replace("#", "");
  const valid = ["home", "lessons", "meetings", "hearings", "students", "notes"];
  return (valid.includes(hash) ? hash : "home") as Section;
}

/**
 * L'utente è considerato autenticato solo se la sessione è valida
 * E il PIN è in memoria (necessario per la crittografia AES).
 * Se la pagina viene ricaricata, sessionPin si azzera e l'utente
 * deve reinserire il PIN (comportamento corretto per la sicurezza).
 */
function checkAuthed(): boolean {
  return isAuthenticated() && getSessionPin() !== null;
}

export default function App() {
  const [authed, setAuthed] = useState(checkAuthed);
  const [section, setSection] = useState<Section>(getHashSection);

  // Sidebar: expanded=true (w-64), expanded=false (w-14 icone)
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  // Mobile: visibile/nascosta
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data, updateData } = useAppData();

  useEffect(() => {
    window.location.hash = section;
  }, [section]);

  useEffect(() => {
    const onHashChange = () => setSection(getHashSection());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  if (!authed) {
    return <Login onLogin={() => setAuthed(true)} />;
  }

  function handleLogout() {
    logout();
    setAuthed(false);
  }

  function navigate(s: Section) {
    setSection(s);
    setMobileOpen(false);
  }

  const currentLabel = NAV_ITEMS.find(n => n.id === section)?.label ?? "Home";

  return (
    <div className="flex h-screen overflow-hidden">

      {/* ── Mobile backdrop ─────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────── */}
      {/*
        Desktop (≥ md): sempre nel flusso del documento (non fixed).
          - Expanded:  w-64  → mostra icona + etichetta
          - Collapsed: w-14  → mostra solo icona centrata
          Transizione larghezza con CSS transition-all.

        Mobile (< md): posizione fixed, scivola dentro/fuori tramite
          translate-x. La larghezza è sempre w-64 (espansa).
      */}
      <aside
        data-testid="sidebar"
        className={[
          "glass-sidebar flex flex-col flex-shrink-0 overflow-hidden",
          "transition-all duration-300 ease-in-out",
          // ── Desktop: in-flow, larghezza basata su sidebarExpanded
          "hidden md:flex",
          sidebarExpanded ? "md:w-64" : "md:w-14",
        ].join(" ")}
      >
        {/* Header sidebar — logo + toggle */}
        <div className={`
          flex items-center border-b border-emerald-500/15 h-16 flex-shrink-0
          ${sidebarExpanded ? "px-4 justify-between" : "justify-center px-0"}
        `}>
          {sidebarExpanded && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl emerald-gradient flex items-center justify-center flex-shrink-0 shadow">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight truncate">Registro Docente</p>
                <p className="text-xs text-emerald-300/50 truncate">{getUsername()}</p>
              </div>
            </div>
          )}

          {/* Toggle button */}
          <button
            onClick={() => setSidebarExpanded(e => !e)}
            data-testid="button-sidebar-toggle"
            title={sidebarExpanded ? "Comprimi sidebar" : "Espandi sidebar"}
            className={`
              flex-shrink-0 rounded-xl p-1.5 text-emerald-400/60 hover:text-emerald-300
              hover:bg-emerald-500/10 transition-all
              ${!sidebarExpanded ? "mx-auto" : ""}
            `}
          >
            {sidebarExpanded
              ? <ChevronLeft className="w-4 h-4" />
              : <ChevronRight className="w-4 h-4" />
            }
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin space-y-0.5 px-1.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                data-testid={`nav-${item.id}`}
                title={!sidebarExpanded ? item.label : undefined}
                className={[
                  "w-full flex items-center rounded-xl text-sm font-medium transition-all nav-item",
                  sidebarExpanded ? "gap-3 px-3 py-2.5 justify-start" : "justify-center p-2.5",
                  active ? "nav-item-active text-white" : "text-white/60 hover:text-white/90",
                ].join(" ")}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? item.color : "text-white/40"}`} />
                {sidebarExpanded && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer — logout */}
        <div className="px-1.5 pb-3 border-t border-emerald-500/10 pt-3">
          <button
            onClick={handleLogout}
            data-testid="button-logout"
            title={!sidebarExpanded ? "Esci" : undefined}
            className={[
              "w-full flex items-center rounded-xl text-sm font-medium text-white/40",
              "hover:text-red-400 hover:bg-red-900/10 transition-all",
              sidebarExpanded ? "gap-3 px-3 py-2.5" : "justify-center p-2.5",
            ].join(" ")}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarExpanded && <span>Esci</span>}
          </button>
        </div>
      </aside>

      {/* ── Mobile sidebar (overlay) ─────────────────────── */}
      <aside
        data-testid="sidebar-mobile"
        className={[
          "md:hidden fixed z-50 left-0 top-0 h-full w-64 glass-sidebar flex flex-col",
          "transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center gap-2.5 px-4 h-16 border-b border-emerald-500/15">
          <div className="w-8 h-8 rounded-xl emerald-gradient flex items-center justify-center flex-shrink-0 shadow">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white leading-tight truncate">Registro Docente</p>
            <p className="text-xs text-emerald-300/50 truncate">{getUsername()}</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin space-y-0.5 px-1.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                data-testid={`nav-mobile-${item.id}`}
                className={[
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all nav-item",
                  active ? "nav-item-active text-white" : "text-white/60 hover:text-white/90",
                ].join(" ")}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? item.color : "text-white/40"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="px-1.5 pb-3 border-t border-emerald-500/10 pt-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-900/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Esci</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 glass border-b border-emerald-500/10 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            data-testid="button-mobile-menu"
            className="p-1.5 rounded-xl text-white/60 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-white text-sm">{currentLabel}</span>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 md:p-8">
          {section === "home"     && <HomeView  data={data} />}
          {section === "lessons"  && <Lessons   data={data} updateData={updateData} />}
          {section === "meetings" && <Meetings  data={data} updateData={updateData} />}
          {section === "hearings" && <Hearings  data={data} updateData={updateData} />}
          {section === "students" && <Students  data={data} updateData={updateData} />}
          {section === "notes"    && <QuickNotes data={data} updateData={updateData} />}
        </div>
      </main>
    </div>
  );
}
