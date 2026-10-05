import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BookOpen,
  Target,
  BarChart3,
  Timer,
  User,
  LogOut,
  GraduationCap,
  Sparkles,
  Flame,
  Zap,
  BookMarked
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { useToast } from '../context/ToastContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, badge: null },
  { name: 'My Tasks', path: '/tasks', icon: CheckSquare, badge: 'Tasks' },
  { name: 'Study Schedule', path: '/schedule', icon: Calendar, badge: 'Week' },
  { name: 'Subjects', path: '/subjects', icon: BookOpen, badge: null },
  { name: 'Goals', path: '/goals', icon: Target, badge: null },
  { name: 'Progress', path: '/progress', icon: BarChart3, badge: null },
  { name: 'Focus Timer', path: '/timer', icon: Timer, badge: 'Live' },
  { name: 'Profile', path: '/profile', icon: User, badge: null },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();

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
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white/95 backdrop-blur-xl border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 shadow-soft ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-sky-400 text-white flex items-center justify-center shadow-md shadow-brand-500/25">
                <GraduationCap className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
                  Study<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-sky-400">Mate</span>
                </span>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded-md">
                  Study OS
                </span>
              </div>
            </div>
          </div>

          {/* Student Streak Badge */}
          <div className="mx-4 my-4 p-3 rounded-2xl bg-gradient-to-r from-brand-50 via-sky-50 to-indigo-50/40 border border-brand-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white shadow-xs text-amber-500 flex items-center justify-center">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">4-Day Streak</p>
                <p className="text-[10px] font-semibold text-slate-500">Scholar Tier 2</p>
              </div>
            </div>
            <span className="text-[11px] font-extrabold text-brand-600 bg-white px-2 py-0.5 rounded-lg shadow-xs">
              +120 XP
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-500 to-sky-500 text-white shadow-md shadow-brand-500/25'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-500'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Quick Demo Seed */}
          <button
            onClick={handleSeedDemo}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-brand-50 text-slate-600 hover:text-brand-700 text-xs font-bold rounded-xl border border-slate-200 hover:border-brand-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Reset Demo Data</span>
          </button>

          {/* User Bar */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center gap-2.5 overflow-hidden pl-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">{user?.name || 'Student'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
