import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  MoreVertical,
  Calendar,
  AlertCircle,
  Tag
} from 'lucide-react';
import { taskService, subjectService } from '../services/api';
import { useToast } from '../context/ToastContext';
import TaskModal from '../components/TaskModal';
import EmptyState from '../components/EmptyState';

export default function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const { showSuccess, showError } = useToast();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskService.getTasks({
        status: statusFilter,
        priority: priorityFilter,
        subject_id: subjectFilter,
        search: searchTerm
      });
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, subjectFilter, searchTerm]);

  useEffect(() => {
    subjectService.getSubjects().then((res) => {
      if (res.data.success) {
        setSubjects(res.data.subjects);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTasks();
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [fetchTasks]);

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await taskService.updateStatus(task.id, nextStatus);
      showSuccess(nextStatus === 'Completed' ? 'Task marked as completed! 🎯' : 'Task marked as pending.');
      fetchTasks();
    } catch (err) {
      showError('Failed to update status.');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await taskService.deleteTask(id);
      showSuccess('Task deleted successfully.');
      fetchTasks();
    } catch (err) {
      showError('Failed to delete task.');
    }
  };

  const handleSaveTask = async (payload, id) => {
    if (id) {
      await taskService.updateTask(id, payload);
      showSuccess('Task updated successfully!');
    } else {
      await taskService.createTask(payload);
      showSuccess('Task added successfully!');
    }
    fetchTasks();
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const statusTabs = ['All', 'Pending', 'In Progress', 'Completed'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-brand-500" />
            <span>My Tasks</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your assignments, project tasks, and study topics
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-soft space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-brand-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search and Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-slate-800"
            />
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-700 font-medium"
            >
              <option value="All">All Subjects</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-700 font-medium"
            >
              <option value="All">All Priorities</option>
              <option value="High">🔴 High Priority</option>
              <option value="Medium">🟡 Medium Priority</option>
              <option value="Low">🟢 Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title="No tasks match your criteria"
          description="Try modifying your search or filter options, or add a new study task."
          actionLabel="Add Task"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                task.status === 'Completed'
                  ? 'border-slate-100 bg-slate-50/60 opacity-80'
                  : 'border-slate-200/80 hover:border-brand-300 shadow-soft hover:shadow-card'
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                        task.status === 'Completed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 hover:border-brand-500 bg-white'
                      }`}
                      title={task.status === 'Completed' ? 'Mark Incomplete' : 'Mark Completed'}
                    >
                      {task.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <div>
                      <h3
                        className={`text-base font-bold ${
                          task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.subject_name && (
                        <span className="inline-block mt-1 text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                          {task.subject_name} {task.subject_code ? `(${task.subject_code})` : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Priority badge */}
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 ${
                      task.priority === 'High'
                        ? 'bg-rose-50 text-rose-600'
                        : task.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>

                {/* Description */}
                {task.description && (
                  <p className="text-xs text-slate-600 my-3 line-clamp-2 leading-relaxed pl-8">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Card Footer: Due Date & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  {task.due_date ? (
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {task.due_date} {task.due_time ? `@ ${task.due_time}` : ''}
                    </span>
                  ) : (
                    <span className="text-slate-400">No deadline</span>
                  )}
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-md text-[10px] ${
                      task.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : task.status === 'In Progress'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    title="Edit Task"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
      />
    </div>
  );
}
