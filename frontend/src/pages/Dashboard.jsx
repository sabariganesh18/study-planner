import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Calendar,
  BookOpen,
  Target,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Play,
  Flame,
  Zap,
  ChevronRight,
  Timer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { taskService, progressService, subjectService, sessionService, goalService } from '../services/api';
import { useToast } from '../context/ToastContext';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';
import TaskModal from '../components/TaskModal';
import SubjectModal from '../components/SubjectModal';
import SessionModal from '../components/SessionModal';
import GoalModal from '../components/GoalModal';

export default function Dashboard() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [progressRes, todayRes, upcomingRes] = await Promise.all([
        progressService.getProgress(),
        taskService.getTasks({ date: 'today' }),
        taskService.getTasks({ date: 'upcoming' })
      ]);

      if (progressRes.data.success) {
        setStats(progressRes.data.stats);
      }
      if (todayRes.data.success) {
        setTodayTasks(todayRes.data.tasks);
      }
      if (upcomingRes.data.success) {
        setUpcomingTasks(upcomingRes.data.tasks.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleToggleTaskStatus = async (task) => {
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await taskService.updateStatus(task.id, newStatus);
      showSuccess(newStatus === 'Completed' ? 'Task marked as completed! 🎯' : 'Task set to pending.');
      fetchDashboardData();
    } catch (err) {
      showError('Failed to update task status.');
    }
  };

  const handleSaveTask = async (data, id) => {
    if (id) {
      await taskService.updateTask(id, data);
      showSuccess('Task updated!');
    } else {
      await taskService.createTask(data);
      showSuccess('Task added successfully!');
    }
    fetchDashboardData();
  };

  const handleSaveSubject = async (data) => {
    await subjectService.createSubject(data);
    showSuccess('Subject created!');
    fetchDashboardData();
  };

  const handleSaveSession = async (data) => {
    await sessionService.createSession(data);
    showSuccess('Study session scheduled!');
    fetchDashboardData();
  };

  const handleSaveGoal = async (data) => {
    await goalService.createGoal(data);
    showSuccess('Goal created!');
    fetchDashboardData();
  };

  const todayDateString = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }).format(new Date());

  return (
    <div className="space-y-6 pb-12">
      {/* Bento Top: Hero Header & Quick Focus Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-navy-900 to-brand-900 p-7 sm:p-9 text-white shadow-card">
        {/* Glow ambient blobs */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-sky-200 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                <span>{todayDateString}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold border border-amber-500/30">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>4-Day Streak</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'Scholar'}! 🚀
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
              You have <span className="font-bold text-sky-300">{stats?.todayTasks || 0} tasks scheduled for today</span>. Complete them to maintain your study momentum.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/timer')}
              className="group flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-sky-400 to-brand-500 hover:from-sky-300 hover:to-brand-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5 shrink-0"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Launch Focus Timer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bento Grid Row 1: KPI Stats with Glassmorphic Elevation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-soft hover:shadow-card transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Today's Tasks</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckSquare className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats?.todayTasks || 0}</span>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              {stats?.todayCompletedTasks || 0} finished today
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-soft hover:shadow-card transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Tasks</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats?.completedTasks || 0}</span>
            <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
              {stats?.overallTaskProgress || 0}% overall rate
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-soft hover:shadow-card transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Tasks</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats?.pendingTasks || 0}</span>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              {stats?.inProgressTasks || 0} in progress
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-soft hover:shadow-card transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Study Time</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats?.totalStudyHours || 0}h</span>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
              {stats?.totalSessions || 0} focus sessions
            </p>
          </div>
        </div>
      </div>

      {/* Bento Grid Row 2: Main Workspace & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2 Cols on Large: Today's Tasks Interactive Board */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/70 shadow-soft">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-brand-500" />
                  <span>Today's Study Checklist</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Priority coursework for today</p>
              </div>

              <button
                onClick={() => { setSelectedTask(null); setTaskModalOpen(true); }}
                className="flex items-center gap-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3.5 py-2 rounded-xl transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <EmptyState
                title="All caught up for today! 🎉"
                description="No pending tasks due today. You can add a new task or take a study break."
                actionLabel="Create a Task"
                onAction={() => { setSelectedTask(null); setTaskModalOpen(true); }}
              />
            ) : (
              <div className="space-y-2.5">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-start justify-between gap-3 p-4 rounded-2xl border transition-all ${
                      task.status === 'Completed'
                        ? 'bg-slate-50/70 border-slate-100 opacity-60'
                        : 'bg-white border-slate-200/80 hover:border-brand-300 shadow-xs hover:shadow-soft'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTaskStatus(task)}
                        className={`mt-0.5 w-5 h-5 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
                          task.status === 'Completed'
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                            : 'border-slate-300 hover:border-brand-500 bg-white'
                        }`}
                      >
                        {task.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        <p
                          className={`text-xs sm:text-sm font-bold truncate ${
                            task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                          {task.subject_name && (
                            <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md text-[10px]">
                              {task.subject_name}
                            </span>
                          )}
                          {task.due_time && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                              <Clock className="w-3 h-3" />
                              {task.due_time}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              task.priority === 'High'
                                ? 'bg-rose-50 text-rose-600'
                                : task.priority === 'Medium'
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleTaskStatus(task)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl shrink-0 transition-colors ${
                        task.status === 'Completed'
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {task.status === 'Completed' ? 'Undo' : 'Done'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Bento Row */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-soft">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Study Command Center
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => { setSelectedTask(null); setTaskModalOpen(true); }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-brand-50 border border-slate-200/70 hover:border-brand-200 transition-all text-slate-700 hover:text-brand-700 font-bold text-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-1.5">
                  <CheckSquare className="w-4 h-4" />
                </div>
                <span>New Task</span>
              </button>

              <button
                onClick={() => setSessionModalOpen(true)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/70 hover:border-indigo-200 transition-all text-slate-700 hover:text-indigo-700 font-bold text-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Schedule Study</span>
              </button>

              <button
                onClick={() => setSubjectModalOpen(true)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/70 hover:border-emerald-200 transition-all text-slate-700 hover:text-emerald-700 font-bold text-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span>Add Subject</span>
              </button>

              <button
                onClick={() => setGoalModalOpen(true)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200/70 hover:border-rose-200 transition-all text-slate-700 hover:text-rose-700 font-bold text-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1.5">
                  <Target className="w-4 h-4" />
                </div>
                <span>Set Goal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Mini Focus Timer + Subject Mastery Widget */}
        <div className="space-y-6">
          {/* Live Mini Focus Timer Bento Widget */}
          <div className="bg-gradient-to-br from-brand-600 to-sky-600 rounded-3xl p-6 text-white shadow-card relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-100 flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-sky-200" />
                <span>Focus Session</span>
              </span>
              <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full text-white">
                25:00 Standard
              </span>
            </div>

            <div className="text-center my-4">
              <div className="text-5xl font-extrabold tracking-tight font-mono">
                25:00
              </div>
              <p className="text-xs text-sky-100 mt-1 font-medium">Ready for your next study block</p>
            </div>

            <button
              onClick={() => navigate('/timer')}
              className="w-full mt-2 py-2.5 bg-white hover:bg-sky-50 text-brand-800 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-brand-800" />
              <span>Open Study Timer</span>
            </button>
          </div>

          {/* Subject Mastery Progress Widget */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-500" />
                <span>Course Mastery</span>
              </h3>
              <button
                onClick={() => navigate('/subjects')}
                className="text-xs font-bold text-brand-600 hover:underline"
              >
                View All
              </button>
            </div>

            {stats?.subjectProgress?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No enrolled subjects.</p>
            ) : (
              <div className="space-y-4">
                {stats?.subjectProgress?.slice(0, 4).map((sub) => (
                  <div key={sub.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800 truncate max-w-[170px]">{sub.name}</span>
                      <span className="font-extrabold text-brand-600">{sub.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-brand-500 to-sky-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${sub.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTask}
        task={selectedTask}
      />
      <SubjectModal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        onSave={handleSaveSubject}
      />
      <SessionModal
        isOpen={sessionModalOpen}
        onClose={() => setSessionModalOpen(false)}
        onSave={handleSaveSession}
      />
      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSave={handleSaveGoal}
      />
    </div>
  );
}
