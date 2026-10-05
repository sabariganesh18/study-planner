import React from 'react';

export default function ProgressBar({ progress = 0, label, showPercent = true, color = 'bg-brand-500', height = 'h-2.5' }) {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-semibold">
          {label && <span className="text-slate-600">{label}</span>}
          {showPercent && <span className="text-slate-900 font-bold ml-auto">{clampedProgress}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
