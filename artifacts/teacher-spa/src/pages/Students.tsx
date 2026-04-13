import { useState, useCallback } from "react";
import { Plus, Trash2, UserCheck, ChevronDown, ChevronRight, GraduationCap } from "lucide-react";
import { AppData, ClassGroup, Student, generateId } from "@/lib/store";

interface StudentsProps {
  data: AppData;
  updateData: (updater: (prev: AppData) => AppData) => void;
}

export default function Students({ data, updateData }: StudentsProps) {
  const [expandedClass, setExpandedClass] = useState<string | null>(data.classes[0]?.id ?? null);
  const [newClassName, setNewClassName] = useState("");
  const [newStudentName, setNewStudentName] = useState<Record<string, string>>({});
  const [showAddClass, setShowAddClass] = useState(false);

  function addStudent(classId: string) {
    const name = (newStudentName[classId] || "").trim();
    if (!name) return;
    const student: Student = { id: generateId(), name, notes: "" };
    updateData(prev => ({
      ...prev,
      classes: prev.classes.map(c => c.id === classId ? { ...c, students: [...c.students, student] } : c)
    }));
    setNewStudentName(prev => ({ ...prev, [classId]: "" }));
  }

  function deleteStudent(classId: string, studentId: string) {
    updateData(prev => ({
      ...prev,
      classes: prev.classes.map(c => c.id === classId
        ? { ...c, students: c.students.filter(s => s.id !== studentId) }
        : c
      )
    }));
  }

  function addClass() {
    const name = newClassName.trim();
    if (!name) return;
    const cls: ClassGroup = { id: generateId(), name, students: [] };
    updateData(prev => ({ ...prev, classes: [...prev.classes, cls] }));
    setNewClassName("");
    setShowAddClass(false);
    setExpandedClass(cls.id);
  }

  function deleteClass(classId: string) {
    if (!confirm("Eliminare questa classe e tutti i suoi studenti?")) return;
    updateData(prev => ({ ...prev, classes: prev.classes.filter(c => c.id !== classId) }));
    if (expandedClass === classId) setExpandedClass(null);
  }

  const updateNote = useCallback((classId: string, studentId: string, notes: string) => {
    updateData(prev => ({
      ...prev,
      classes: prev.classes.map(c => c.id === classId
        ? { ...c, students: c.students.map(s => s.id === studentId ? { ...s, notes } : s) }
        : c
      )
    }));
  }, [updateData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Annotazioni Studenti</h2>
          <p className="text-sm text-emerald-300/60 mt-0.5">{data.classes.length} class{data.classes.length !== 1 ? "i" : "e"}</p>
        </div>
        <button
          onClick={() => setShowAddClass(!showAddClass)}
          data-testid="button-add-class"
          className="btn-emerald flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Nuova Classe
        </button>
      </div>

      {showAddClass && (
        <div className="glass-strong rounded-2xl p-5 border border-emerald-400/20">
          <div className="flex gap-3">
            <input
              type="text"
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addClass()}
              placeholder="Nome classe (es. 3A, 4B...)"
              data-testid="input-class-name"
              className="glass-input flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none"
            />
            <button onClick={addClass} data-testid="button-save-class" className="btn-emerald px-4 py-2 rounded-xl text-sm font-semibold">
              Aggiungi
            </button>
            <button onClick={() => setShowAddClass(false)} className="glass px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white transition-colors">
              Annulla
            </button>
          </div>
        </div>
      )}

      {data.classes.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <GraduationCap className="w-12 h-12 text-emerald-400/30 mx-auto mb-3" />
          <p className="text-white/40 text-sm">Nessuna classe. Aggiungine una per iniziare.</p>
        </div>
      )}

      {data.classes.map(cls => (
        <ClassPanel
          key={cls.id}
          cls={cls}
          expanded={expandedClass === cls.id}
          onToggle={() => setExpandedClass(expandedClass === cls.id ? null : cls.id)}
          onDeleteClass={() => deleteClass(cls.id)}
          onAddStudent={() => addStudent(cls.id)}
          onDeleteStudent={(sid) => deleteStudent(cls.id, sid)}
          newStudentName={newStudentName[cls.id] || ""}
          setNewStudentName={(v) => setNewStudentName(prev => ({ ...prev, [cls.id]: v }))}
          onUpdateNote={(sid, notes) => updateNote(cls.id, sid, notes)}
        />
      ))}
    </div>
  );
}

interface ClassPanelProps {
  cls: ClassGroup;
  expanded: boolean;
  onToggle: () => void;
  onDeleteClass: () => void;
  onAddStudent: () => void;
  onDeleteStudent: (sid: string) => void;
  newStudentName: string;
  setNewStudentName: (v: string) => void;
  onUpdateNote: (sid: string, notes: string) => void;
}

function ClassPanel({
  cls, expanded, onToggle, onDeleteClass, onAddStudent, onDeleteStudent,
  newStudentName, setNewStudentName, onUpdateNote
}: ClassPanelProps) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer select-none"
        onClick={onToggle}
        data-testid={`class-panel-${cls.id}`}
      >
        {expanded ? <ChevronDown className="w-4 h-4 text-emerald-400" /> : <ChevronRight className="w-4 h-4 text-emerald-400/50" />}
        <div className="flex-shrink-0 p-1.5 rounded-lg bg-emerald-500/15">
          <GraduationCap className="w-4 h-4 text-emerald-400" />
        </div>
        <span className="font-bold text-white text-lg">{cls.name}</span>
        <span className="text-xs text-white/40 ml-1">{cls.students.length} student{cls.students.length !== 1 ? "i" : "e"}</span>
        <button
          onClick={e => { e.stopPropagation(); onDeleteClass(); }}
          data-testid={`button-delete-class-${cls.id}`}
          className="ml-auto text-white/20 hover:text-red-400 transition-colors p-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-emerald-500/10 p-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newStudentName}
              onChange={e => setNewStudentName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && onAddStudent()}
              placeholder="Aggiungi studente (Nome Cognome)"
              data-testid={`input-student-name-${cls.id}`}
              className="glass-input flex-1 px-3 py-1.5 rounded-lg text-sm focus:outline-none"
            />
            <button onClick={onAddStudent} data-testid={`button-add-student-${cls.id}`}
              className="btn-emerald px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
              <Plus className="w-3 h-3" />
              Aggiungi
            </button>
          </div>

          {cls.students.length === 0 && (
            <div className="text-center py-4">
              <UserCheck className="w-8 h-8 text-emerald-400/20 mx-auto mb-2" />
              <p className="text-xs text-white/30">Nessuno studente. Aggiungine uno.</p>
            </div>
          )}

          {cls.students.map(student => (
            <StudentRow key={student.id} student={student} classId={cls.id} onDelete={onDeleteStudent} onUpdateNote={onUpdateNote} />
          ))}
        </div>
      )}
    </div>
  );
}

function StudentRow({ student, classId, onDelete, onUpdateNote }: {
  student: Student;
  classId: string;
  onDelete: (sid: string) => void;
  onUpdateNote: (sid: string, notes: string) => void;
}) {
  const [localNote, setLocalNote] = useState(student.notes);
  const [saved, setSaved] = useState(false);

  function handleNoteChange(v: string) {
    setLocalNote(v);
    setSaved(false);
    onUpdateNote(student.id, v);
    setSaved(true);
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-900/10 border border-emerald-500/08" data-testid={`student-row-${student.id}`}>
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
        <span className="text-xs font-bold text-emerald-300">{student.name.charAt(0)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white mb-1.5">{student.name}</p>
        <div className="relative">
          <textarea
            value={localNote}
            onChange={e => handleNoteChange(e.target.value)}
            placeholder="Note rapide sullo studente..."
            rows={2}
            data-testid={`textarea-student-notes-${student.id}`}
            className="glass-input w-full px-3 py-2 rounded-lg text-xs focus:outline-none resize-none"
          />
          {saved && localNote && (
            <span className="absolute top-1 right-2 text-xs text-emerald-400/60">✓</span>
          )}
        </div>
      </div>
      <button onClick={() => onDelete(student.id)} data-testid={`button-delete-student-${student.id}`}
        className="text-white/20 hover:text-red-400 transition-colors p-1 flex-shrink-0 mt-0.5">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
