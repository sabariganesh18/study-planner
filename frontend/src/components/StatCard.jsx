import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, iconBg = 'bg-brand-50 text-brand-600', trend }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft hover:shadow-card transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
        {subtitle && <span className="text-xs text-slate-400 font-medium">{subtitle}</span>}
      </div>
      {trend && (
        <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1">
          {trend}
        </div>
      )}
    </div>
  );
}
