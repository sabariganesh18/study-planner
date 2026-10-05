import React, { useState, useEffect, useCallback } from 'react';
import {
  Target,
  Plus,
  Edit,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { goalService } from '../services/api';
import { useToast } from '../context/ToastContext';
import GoalModal from '../components/GoalModal';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const { showSuccess, showError } = useToast();

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await goalService.getGoals();
      if (res.data.success) {
        setGoals(res.data.goals);
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await goalService.deleteGoal(id);
      showSuccess('Goal removed.');
      fetchGoals();
    } catch (err) {
      showError('Failed to delete goal.');
    }
  };

  const handleSaveGoal = async (payload, id) => {
    if (id) {
      await goalService.updateGoal(id, payload);
      showSuccess('Goal updated successfully!');
    } else {
      await goalService.createGoal(payload);
      showSuccess('Study goal created!');
    }
    fetchGoals();
  };

  const handleQuickProgressUpdate = async (goal, delta) => {
    const newProgress = Math.min(100, Math.max(0, goal.progress + delta));
    try {
      await goalService.updateGoal(goal.id, {
        title: goal.title,
        description: goal.description,
        target_date: goal.target_date,
        progress: newProgress,
        status: newProgress >= 100 ? 'Completed' : goal.status
      });
      showSuccess(newProgress >= 100 ? 'Goal completed! 🎉 Congratulations!' : `Progress updated to ${newProgress}%`);
      fetchGoals();
    } catch (err) {
      showError('Failed to update progress.');
    }
  };

  const openNewGoalModal = () => {
    setEditingGoal(null);
    setModalOpen(true);
  };

  const openEditGoalModal = (goal) => {
    setEditingGoal(goal);
    setModalOpen(true);
  };

  const filteredGoals = goals.filter((g) => {
    if (statusFilter === 'All') return true;
    return g.status === statusFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Target className="w-7 h-7 text-brand-500" />
            <span>Study Goals & Milestones</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Set ambitious targets, track progress percentages, and achieve academic milestones
          </p>
        </div>

        <button
          onClick={openNewGoalModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Set New Goal</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Active', 'Completed', 'Overdue'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === tab
                ? 'bg-brand-500 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading goals...</div>
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          title="No goals created yet"
          description="Setting clear goals helps keep your study habits consistent and focused."
          actionLabel="Create a Study Goal"
          onAction={openNewGoalModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGoals.map((goal) => (
            <div
              key={goal.id}
              className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                goal.status === 'Completed'
                  ? 'border-emerald-200 bg-emerald-50/20 shadow-soft'
                  : goal.status === 'Overdue'
                  ? 'border-rose-200 bg-rose-50/20 shadow-soft'
                  : 'border-slate-200/80 shadow-soft hover:shadow-card'
              }`}
            >
              <div>
                {/* Header Badge & Actions */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      goal.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : goal.status === 'Overdue'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-brand-100 text-brand-800'
                    }`}
                  >
                    {goal.status === 'Completed'
                      ? '🎉 Completed'
                      : goal.status === 'Overdue'
                      ? '⚠️ Overdue'
                      : '🚀 Active'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditGoalModal(goal)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors"
                      title="Edit Goal"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Goal Title & Description */}
                <h3 className="text-lg font-bold text-slate-900 mb-1">{goal.title}</h3>
                {goal.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {goal.description}
                  </p>
                )}
              </div>

              {/* Progress Bar & Quick Increments */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <ProgressBar
                  progress={goal.progress}
                  label="Goal Completion"
                  color={
                    goal.progress >= 100
                      ? 'bg-emerald-500'
                      : goal.status === 'Overdue'
                      ? 'bg-rose-500'
                      : 'bg-brand-500'
                  }
                  height="h-3"
                />

                {/* Quick Increment buttons */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickProgressUpdate(goal, -10)}
                      disabled={goal.progress <= 0}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
                    >
                      -10%
                    </button>
                    <button
                      onClick={() => handleQuickProgressUpdate(goal, 10)}
                      disabled={goal.progress >= 100}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
                    >
                      +10%
                    </button>
                    <button
                      onClick={() => handleQuickProgressUpdate(goal, 25)}
                      disabled={goal.progress >= 100}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
                    >
                      +25%
                    </button>
                  </div>

                  {goal.target_date && (
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Target: {goal.target_date}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Goal Modal */}
      <GoalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveGoal}
        goal={editingGoal}
      />
    </div>
  );
}
