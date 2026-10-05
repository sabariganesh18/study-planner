import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  ListTodo,
  ExternalLink,
  Sparkles,
  Layers
} from 'lucide-react';
import { subjectService, taskService } from '../services/api';
import { useToast } from '../context/ToastContext';
import SubjectModal from '../components/SubjectModal';
import TaskModal from '../components/TaskModal';
import ProgressBar from '../components/ProgressBar';
import EmptyState from '../components/EmptyState';

// Course color themes
const COURSE_GRADIENTS = [
  'from-sky-500 to-brand-600',
  'from-indigo-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600'
];

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedSubjectIdForTask, setSelectedSubjectIdForTask] = useState(null);

  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await subjectService.getSubjects();
      if (res.data.success) {
        setSubjects(res.data.subjects);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleDeleteSubject = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? Associated tasks will remain unassigned.`)) {
      return;
    }
    try {
      await subjectService.deleteSubject(id);
      showSuccess('Subject deleted.');
      fetchSubjects();
    } catch (err) {
      showError('Failed to delete subject.');
    }
  };

  const handleSaveSubject = async (payload, id) => {
    if (id) {
      await subjectService.updateSubject(id, payload);
      showSuccess('Subject updated!');
    } else {
      await subjectService.createSubject(payload);
      showSuccess('Subject added successfully!');
    }
    fetchSubjects();
  };

  const handleSaveTaskForSubject = async (payload) => {
    await taskService.createTask(payload);
    showSuccess('Task added to subject!');
    fetchSubjects();
  };

  const openNewSubjectModal = () => {
    setEditingSubject(null);
    setSubjectModalOpen(true);
  };

  const openEditSubjectModal = (subject) => {
    setEditingSubject(subject);
    setSubjectModalOpen(true);
  };

  const openAddTaskModal = (subjectId) => {
    setSelectedSubjectIdForTask(subjectId);
    setTaskModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-brand-500" />
            <span>Academic Subjects & Courses</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track syllabus coverage, assignment progress, and exam mastery per subject
          </p>
        </div>

        <button
          onClick={openNewSubjectModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Subjects Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading subjects...</div>
      ) : subjects.length === 0 ? (
        <EmptyState
          title="No subjects enrolled"
          description="Add your first college course or subject to start managing assignments."
          actionLabel="Add Subject"
          onAction={openNewSubjectModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub, idx) => {
            const gradient = COURSE_GRADIENTS[idx % COURSE_GRADIENTS.length];

            return (
              <div
                key={sub.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-soft hover:shadow-card transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Colored Top Accent Bar */}
                <div className={`h-3 w-full bg-gradient-to-r ${gradient}`} />

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header: Code Pill & Actions */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="px-3 py-1 bg-slate-100 text-slate-800 text-xs font-extrabold rounded-xl uppercase tracking-wider">
                        {sub.code || 'COURSE'}
                      </span>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditSubjectModal(sub)}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-xl transition-colors"
                          title="Edit Subject"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(sub.id, sub.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Subject Name & Description */}
                    <h3 className="text-base font-extrabold text-slate-900 mb-2 leading-snug">
                      {sub.name}
                    </h3>

                    {sub.description && (
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                        {sub.description}
                      </p>
                    )}
                  </div>

                  {/* Progress Meter & Stats */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <ProgressBar
                      progress={sub.progress}
                      label="Subject Mastery"
                      color={`bg-gradient-to-r ${gradient}`}
                    />

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold">
                        <ListTodo className="w-3.5 h-3.5 text-slate-400" />
                        {sub.totalTasks} Tasks
                      </span>
                      <span className="flex items-center gap-1 font-extrabold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {sub.completedTasks} Done
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => openAddTaskModal(sub.id)}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-brand-50 text-slate-700 hover:text-brand-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-brand-500" />
                        <span>Add Task</span>
                      </button>

                      <button
                        onClick={() => navigate('/tasks')}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 bg-brand-50/60 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl border border-brand-200 transition-colors"
                      >
                        <span>View Tasks</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <SubjectModal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        onSave={handleSaveSubject}
        subject={editingSubject}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleSaveTaskForSubject}
        initialSubjectId={selectedSubjectIdForTask}
      />
    </div>
  );
}
