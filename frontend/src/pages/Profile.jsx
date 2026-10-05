import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Lock,
  Calendar,
  Clock,
  CheckCircle2,
  Save,
  LogOut,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService, authService } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [profileStats, setProfileStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    profileService.getProfile().then((res) => {
      if (res.data.success) {
        setProfileStats(res.data.user);
        setName(res.data.user.name || '');
      }
    }).catch(console.error);
  }, []);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await profileService.updateProfile({ name: name.trim() });
      showSuccess('Profile name updated!');
      updateUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update name.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setError('Please provide current password and new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await profileService.updateProfile({
        currentPassword,
        newPassword
      });
      showSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      const res = await authService.seedDemoData();
      showSuccess(res.data.message || 'Sample study data loaded!');
      window.location.reload();
    } catch (err) {
      showError('Failed to load sample data.');
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-brand-500" />
          <span>Student Profile</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal account details and security settings
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-brand-500/25 shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user?.name || 'College Student'}</h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Quick Student Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-xs font-semibold text-slate-500">Tasks Completed</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {profileStats?.completedTasks || 0}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-xs font-semibold text-slate-500">Total Tasks</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {profileStats?.totalTasks || 0}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-xs font-semibold text-slate-500">Total Study Time</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {((profileStats?.totalStudyMinutes || 0) / 60).toFixed(1)} hrs
            </p>
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Edit Name Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-soft">
          <h3 className="text-base font-bold text-slate-900 mb-1">Personal Details</h3>
          <p className="text-xs text-slate-500 mb-5">Update your display name</p>

          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Details</span>
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-soft">
          <h3 className="text-base font-bold text-slate-900 mb-1">Security & Password</h3>
          <p className="text-xs text-slate-500 mb-5">Ensure your account uses a secure password</p>

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Repeat new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Update Password</span>
            </button>
          </form>
        </div>
      </div>

      {/* Demo Seed Shortcut */}
      <div className="p-6 rounded-3xl bg-brand-50/60 border border-brand-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-brand-900">Need College Demo Data?</h4>
          <p className="text-xs text-brand-700 mt-0.5">
            Reset or populate standard CS courses, upcoming assignments, and study schedule.
          </p>
        </div>
        <button
          onClick={handleSeedDemo}
          className="px-4 py-2 bg-white hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl border border-brand-200 shadow-xs transition-colors shrink-0"
        >
          Load Starter Data
        </button>
      </div>
    </div>
  );
}
