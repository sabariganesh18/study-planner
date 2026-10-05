import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Target,
  BookOpen,
  TrendingUp,
  Flame,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import { progressService } from '../services/api';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';

export default function Progress() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    try {
      setLoading(true);
      const res = await progressService.getProgress();
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load progress stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading progress analytics...</div>;
  }

  // Chart data 1: Weekly Study Hours
  const weeklyStudyData = stats?.weeklyStudyChart || [];

  // Chart data 2: Task Completion Breakdown
  const taskPieData = [
    { name: 'Completed', value: stats?.completedTasks || 0, color: '#10b981' },
    { name: 'In Progress', value: stats?.inProgressTasks || 0, color: '#0ea5e9' },
    { name: 'Pending', value: stats?.pendingTasks || 0, color: '#f59e0b' }
  ].filter(item => item.value > 0);

  // Fallback for empty pie chart
  const hasTaskData = taskPieData.length > 0;

  // Chart data 3: Subject Progress
  const subjectChartData = (stats?.subjectProgress || []).map((sub) => ({
    name: sub.code || sub.name.substring(0, 12),
    fullName: sub.name,
    progress: sub.percentage,
    tasks: sub.totalTasks,
    completed: sub.completedTasks
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-brand-500" />
          <span>Progress & Analytics</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your weekly study hours, task completion rate, and subject-by-subject mastery
        </p>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Study Hours"
          value={`${stats?.totalStudyHours || 0} hrs`}
          subtitle={`${stats?.totalStudyMinutes || 0} focus minutes logged`}
          icon={Clock}
          iconBg="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Completed Tasks"
          value={stats?.completedTasks || 0}
          subtitle={`${stats?.overallTaskProgress || 0}% overall completion`}
          icon={CheckCircle2}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Pending Tasks"
          value={stats?.pendingTasks || 0}
          subtitle={`${stats?.inProgressTasks || 0} tasks in progress`}
          icon={AlertCircle}
          iconBg="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Goals Completed"
          value={stats?.completedGoals || 0}
          subtitle={`${stats?.activeGoals || 0} active milestones`}
          icon={Target}
          iconBg="bg-brand-50 text-brand-600"
        />
      </div>

      {/* Charts Row 1: Weekly Study Hours & Task Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart 1: Weekly Study Hours (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Weekly Study Hours</h2>
              <p className="text-xs text-slate-500 mt-0.5">Focus time over the past 7 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-xl">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Past 7 Days</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStudyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} unit="h" />
                <Tooltip
                  formatter={(value) => [`${value} hrs`, 'Study Time']}
                  labelFormatter={(label, item) => item?.[0]?.payload?.date || label}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="hours" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Task Completion Breakdown (1 Col) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-soft flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Task Completion</h2>
            <p className="text-xs text-slate-500 mt-0.5">Distribution of all tasks</p>
          </div>

          <div className="h-52 w-full my-2 flex items-center justify-center">
            {hasTaskData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {taskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No tasks created yet.</p>
            )}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Done</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">{stats?.completedTasks || 0}</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-brand-600">
                <span className="w-2 h-2 rounded-full bg-brand-500" />
                <span>Active</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">{stats?.inProgressTasks || 0}</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Pending</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">{stats?.pendingTasks || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Subject-wise Mastery Bar Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Subject Mastery & Progress</h2>
            <p className="text-xs text-slate-500 mt-0.5">Task completion percentage across all courses</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>{stats?.subjectProgress?.length || 0} Enrolled Subjects</span>
          </div>
        </div>

        {subjectChartData.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Add subjects and tasks to see course mastery analysis.</p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjectChartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} unit="%" stroke="#94a3b8" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={80} />
                <Tooltip
                  formatter={(value, name, item) => [`${value}% (${item.payload.completed}/${item.payload.tasks} tasks completed)`, item.payload.fullName]}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="progress" fill="#0284c7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
