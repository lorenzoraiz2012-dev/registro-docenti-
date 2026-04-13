import { useState, useEffect } from "react";
import { BookOpen, Home, Users, MessageSquare, GraduationCap, FileText, LogOut, Menu, X } from "lucide-react";
import { isAuthenticated, logout, getUsername } from "@/lib/auth";
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
  { id: "home", label: "Home", icon: Home, color: "text-emerald-400" },
  { id: "lessons", label: "Lezioni", icon: BookOpen, color: "text-emerald-300" },
  { id: "meetings", label: "Riunioni", icon: Users, color: "text-blue-400" },
  { id: "hearings", label: "Udienze", icon: MessageSquare, color: "text-orange-400" },
  { id: "students", label: "Annotazioni Studenti", icon: GraduationCap, color: "text-purple-400" },
  { id: "notes", label: "Note Rapide", icon: FileText, color: "text-yellow-400" },
];

function getHashSection(): Section {
  const hash = window.location.hash.replace("#", "");
  const valid = ["home", "lessons", "meetings", "hearings", "students", "notes"];
  return (valid.includes(hash) ? hash : "home") as Section;
}

export default function App() {
  const [authed, setAuthed] = useState(() => isAuthenticated());
  const [section, setSection] = useState<Section>(getHashSection);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data, updateData } = useAppData();

  useEffect(() => {
    window.location.hash = section;
  }, [section]);

  useEffect(() => {
    function onHashChange() {
      setSection(getHashSection());
    }
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

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-50 h-full w-64 glass-sidebar flex flex-col
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `} data-testid="sidebar">
        {/* Logo */}
        <div className="p-5 border-b border-emerald-500/15">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl emerald-gradient flex items-center justify-center flex-shrink-0 shadow-lg">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">Registro Docente</h1>
              <p className="text-xs text-emerald-300/50 truncate">{getUsername()}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-y-auto scrollbar-thin space-y-0.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                data-testid={`nav-${item.id}`}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all nav-item text-left ${active ? "nav-item-active text-white" : "text-white/60 hover:text-white/90"}`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? item.color : "text-white/40"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-emerald-500/10">
          <button
            onClick={handleLogout}
            data-testid="button-logout"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-900/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Esci</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 glass border-b border-emerald-500/10">
          <button onClick={() => setMobileOpen(!mobileOpen)} data-testid="button-mobile-menu"
            className="p-2 rounded-xl glass text-white/70">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-semibold text-white text-sm">
            {NAV_ITEMS.find(n => n.id === section)?.label ?? "Home"}
          </span>
          <div className="w-9" />
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 lg:p-8">
          {section === "home" && <HomeView data={data} />}
          {section === "lessons" && <Lessons data={data} updateData={updateData} />}
          {section === "meetings" && <Meetings data={data} updateData={updateData} />}
          {section === "hearings" && <Hearings data={data} updateData={updateData} />}
          {section === "students" && <Students data={data} updateData={updateData} />}
          {section === "notes" && <QuickNotes data={data} updateData={updateData} />}
        </div>
      </main>
    </div>
  );
}
