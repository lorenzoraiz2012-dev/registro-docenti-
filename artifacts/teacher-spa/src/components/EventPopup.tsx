import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, BookOpen, Users, MessageSquare, Clock, Calendar, FileText, User } from "lucide-react";
import { Lesson, Meeting, Hearing, formatDate } from "@/lib/store";

type EventItem =
  | { kind: "lesson"; data: Lesson }
  | { kind: "meeting"; data: Meeting }
  | { kind: "hearing"; data: Hearing };

interface EventPopupProps {
  event: EventItem | null;
  onClose: () => void;
  onDelete?: (kind: string, id: string) => void;
}

export default function EventPopup({ event, onClose, onDelete }: EventPopupProps) {
  if (!event) return null;

  const { kind, data } = event;
  const iconMap = {
    lesson: { Icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/20", label: "Lezione", pillClass: "lesson-pill" },
    meeting: { Icon: Users, color: "text-blue-400", bg: "bg-blue-500/20", label: "Riunione", pillClass: "meeting-pill" },
    hearing: { Icon: MessageSquare, color: "text-orange-400", bg: "bg-orange-500/20", label: "Udienza", pillClass: "hearing-pill" },
  };
  const { Icon, color, bg, label, pillClass } = iconMap[kind];

  function getTitle() {
    if (kind === "lesson") return (data as Lesson).subject;
    if (kind === "meeting") return (data as Meeting).type;
    return `${(data as Hearing).student}`;
  }

  function renderFields() {
    if (kind === "lesson") {
      const l = data as Lesson;
      return (
        <div className="space-y-3">
          <Field icon={<User className="w-3.5 h-3.5" />} label="Classe" value={l.class} />
          {l.topic && <Field icon={<FileText className="w-3.5 h-3.5" />} label="Argomento" value={l.topic} />}
          {l.notes && <Field icon={<FileText className="w-3.5 h-3.5" />} label="Note" value={l.notes} multiline />}
        </div>
      );
    }
    if (kind === "meeting") {
      const m = data as Meeting;
      return (
        <div className="space-y-3">
          {m.agenda && <Field icon={<FileText className="w-3.5 h-3.5" />} label="Ordine del Giorno" value={m.agenda} multiline />}
          {m.notes && <Field icon={<FileText className="w-3.5 h-3.5" />} label="Note" value={m.notes} multiline />}
        </div>
      );
    }
    const h = data as Hearing;
    return (
      <div className="space-y-3">
        {h.parent && <Field icon={<User className="w-3.5 h-3.5" />} label="Genitore/Tutore" value={h.parent} />}
        {h.notes && <Field icon={<FileText className="w-3.5 h-3.5" />} label="Note" value={h.notes} multiline />}
      </div>
    );
  }

  return (
    <AnimatePresence>
      {event && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="glass-strong rounded-2xl p-6 w-full max-w-sm pointer-events-auto border border-emerald-400/20"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-5">
                <div className={`p-2 rounded-xl ${bg} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`event-pill text-xs ${pillClass} mb-1.5 inline-block`}>{label}</span>
                  <h3 className="text-base font-bold text-white leading-tight">{getTitle()}</h3>
                </div>
                <button onClick={onClose} data-testid="button-close-popup"
                  className="text-white/30 hover:text-white transition-colors p-1 flex-shrink-0 -mt-1 -mr-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Date / Time */}
              <div className="flex items-center gap-4 mb-5 pb-4 border-b border-emerald-500/10">
                <div className="flex items-center gap-1.5 text-xs text-white/50">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400/50" />
                  {formatDate(data.date)}
                </div>
                {data.time && (
                  <div className="flex items-center gap-1.5 text-xs text-white/50">
                    <Clock className="w-3.5 h-3.5 text-emerald-400/50" />
                    ore {data.time}
                  </div>
                )}
              </div>

              {/* Fields */}
              {renderFields()}

              {/* Delete */}
              {onDelete && (
                <button
                  onClick={() => { onDelete(kind, data.id); onClose(); }}
                  data-testid={`button-popup-delete-${data.id}`}
                  className="mt-5 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium text-red-400/70 hover:text-red-400 hover:bg-red-900/15 border border-red-500/10 hover:border-red-500/30 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Elimina evento
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({ icon, label, value, multiline }: { icon: React.ReactNode; label: string; value: string; multiline?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-emerald-400/40 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-white/30 mb-0.5">{label}</p>
        <p className={`text-sm text-white/80 ${multiline ? "whitespace-pre-wrap" : "truncate"}`}>{value}</p>
      </div>
    </div>
  );
}
