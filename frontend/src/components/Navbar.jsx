import React from 'react';
import { Menu, Timer, Sparkles, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenuToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 sm:px-8">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 lg:hidden transition-colors"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Date display */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          <CalendarDays className="w-3.5 h-3.5 text-brand-500" />
          <span>{formattedDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Focus Timer Button */}
        <button
          onClick={() => navigate('/timer')}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold rounded-xl border border-brand-200 transition-colors"
        >
          <Timer className="w-4 h-4 text-brand-600 animate-pulse" />
          <span>Focus Timer</span>
        </button>

        {/* User Info / Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'Student'}</p>
            <p className="text-[10px] text-slate-400 font-medium">StudyMate</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-brand-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
        </button>
      </div>
    </header>
  );
}
