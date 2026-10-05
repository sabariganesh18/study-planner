import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  BookOpen,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { sessionService } from '../services/api';
import { useToast } from '../context/ToastContext';
import SessionModal from '../components/SessionModal';
import EmptyState from '../components/EmptyState';

export default function StudySchedule() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [selectedDateForNew, setSelectedDateForNew] = useState(null);

  const { showSuccess, showError } = useToast();

  const getWeekDates = (offset = 0) => {
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday + offset * 7);

    const week = [];
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      week.push({
        dayName: dayNames[i],
        dateStr,
        formattedDay: d.getDate(),
        formattedMonth: d.toLocaleString('en-US', { month: 'short' }),
        isToday
      });
    }

    return week;
  };

  const weekDays = getWeekDates(currentWeekOffset);
  const weekStartDate = weekDays[0].dateStr;
  const weekEndDate = weekDays[6].dateStr;

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await sessionService.getSessions({
        start_date: weekStartDate,
        end_date: weekEndDate
      });
      if (res.data.success) {
        setSessions(res.data.sessions);
      }
    } catch (err) {
      console.error('Failed to load study sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [weekStartDate, weekEndDate]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleDeleteSession = async (id) => {
    if (!window.confirm('Delete this scheduled study session?')) return;
    try {
      await sessionService.deleteSession(id);
      showSuccess('Session deleted from schedule.');
      fetchSessions();
    } catch (err) {
      showError('Failed to delete session.');
    }
  };

  const handleSaveSession = async (payload, id) => {
    if (id) {
      await sessionService.updateSession(id, payload);
      showSuccess('Session updated successfully!');
    } else {
      await sessionService.createSession(payload);
      showSuccess('Study session scheduled!');
    }
    fetchSessions();
  };

  const openNewForDate = (dateStr) => {
    setEditingSession(null);
    setSelectedDateForNew(dateStr);
    setModalOpen(true);
  };

  const openEdit = (session) => {
    setEditingSession(session);
    setSelectedDateForNew(null);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-brand-500" />
            <span>Weekly Study Timetable</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize revision slots, exam prep blocks, and weekly academic flow
          </p>
        </div>

        {/* Week controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200/80 rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
              className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-xl transition-colors"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentWeekOffset(0)}
              className="px-3 py-1 text-xs font-extrabold text-slate-800 hover:text-brand-600 transition-colors"
            >
              Current Week
            </button>
            <button
              onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
              className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-xl transition-colors"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => { setEditingSession(null); setSelectedDateForNew(null); setModalOpen(true); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-brand-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Block</span>
          </button>
        </div>
      </div>

      {/* Week banner */}
      <div className="bg-gradient-to-r from-brand-50 via-sky-50 to-indigo-50 border border-brand-200/60 rounded-3xl p-4 text-xs font-bold text-brand-900 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span>Timeline: {weekDays[0].formattedMonth} {weekDays[0].formattedDay} – {weekDays[6].formattedMonth} {weekDays[6].formattedDay}</span>
        </span>
        <span className="bg-white/80 backdrop-blur-md px-3 py-1 rounded-xl text-brand-700 shadow-xs">
          {sessions.length} sessions planned
        </span>
      </div>

      {/* 7-Day Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const daySessions = sessions.filter((s) => s.session_date === day.dateStr);

          return (
            <div
              key={day.dateStr}
              className={`bg-white rounded-3xl border flex flex-col min-h-[320px] transition-all ${
                day.isToday
                  ? 'border-brand-400 ring-4 ring-brand-500/10 shadow-md'
                  : 'border-slate-200/70 shadow-soft hover:shadow-card'
              }`}
            >
              {/* Day Header */}
              <div
                className={`p-3.5 border-b rounded-t-3xl flex items-center justify-between ${
                  day.isToday ? 'bg-brand-50/80 border-brand-100' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-extrabold uppercase tracking-wider ${
                        day.isToday ? 'text-brand-700' : 'text-slate-700'
                      }`}
                    >
                      {day.dayName.substring(0, 3)}
                    </span>
                    {day.isToday && (
                      <span className="text-[9px] font-black uppercase bg-brand-500 text-white px-1.5 py-0.2 rounded-md">
                        Today
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    {day.formattedMonth} {day.formattedDay}
                  </p>
                </div>

                <button
                  onClick={() => openNewForDate(day.dateStr)}
                  className="w-7 h-7 rounded-xl bg-white text-slate-500 hover:text-brand-600 shadow-xs flex items-center justify-center transition-colors"
                  title={`Add study session for ${day.dayName}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sessions */}
              <div className="p-3 flex-1 space-y-2.5 overflow-y-auto max-h-[440px]">
                {daySessions.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-300">
                    <p className="text-[11px] font-semibold">No Sessions</p>
                  </div>
                ) : (
                  daySessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-white hover:from-brand-50/50 hover:to-white border border-slate-200/80 hover:border-brand-300 transition-all group shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="text-xs font-extrabold text-slate-900 line-clamp-2 leading-snug">
                          {session.topic}
                        </h3>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={() => openEdit(session)}
                            className="p-1 text-slate-400 hover:text-brand-600"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {session.subject_name && (
                        <p className="text-[10px] font-extrabold text-brand-600 mt-1 truncate">
                          {session.subject_name}
                        </p>
                      )}

                      <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-slate-500">
                        <Clock className="w-3 h-3 text-brand-400 shrink-0" />
                        <span>
                          {session.start_time} - {session.end_time}
                        </span>
                      </div>

                      {session.notes && (
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 italic">
                          "{session.notes}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Session Modal */}
      <SessionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveSession}
        session={editingSession}
        defaultDate={selectedDateForNew}
      />
    </div>
  );
}
