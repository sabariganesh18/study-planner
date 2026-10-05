import React, { useState, useEffect, useRef } from 'react';
import {
  Timer as TimerIcon,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Sparkles,
  CheckCircle2,
  Clock,
  History,
  Flame,
  Award,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react';
import { timerService } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function DailyTimer() {
  const [selectedDuration, setSelectedDuration] = useState(25); // in minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [history, setHistory] = useState([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [completedMessage, setCompletedMessage] = useState('');

  const timerRef = useRef(null);
  const { showSuccess, showError } = useToast();

  const fetchHistory = async () => {
    try {
      const res = await timerService.getHistory();
      if (res.data.success) {
        setHistory(res.data.sessions);
        setTotalMinutes(res.data.totalMinutes);
        setTotalSessions(res.data.totalSessions);
      }
    } catch (err) {
      console.error('Failed to load timer history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Web Audio Synthesized Chime (Zero external API / pure JS)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.log('Audio chime error:', e);
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, isBreak, selectedDuration]);

  const handleSessionComplete = async () => {
    playChime();
    if (!isBreak) {
      try {
        await timerService.recordSession({ duration_minutes: selectedDuration });
        showSuccess(`🎉 Fantastic! ${selectedDuration} minutes study block completed and logged!`);
        setCompletedMessage(`Awesome job! Completed ${selectedDuration} minutes of focused study.`);
        fetchHistory();
      } catch (err) {
        showError('Failed to save completed study session.');
      }
    } else {
      showSuccess('☕ Break completed! Ready to get back into focus mode?');
      setCompletedMessage('Break finished. Ready for your next focus round!');
    }
  };

  const handleSelectPreset = (minutes, breakMode = false) => {
    setIsRunning(false);
    setIsBreak(breakMode);
    setSelectedDuration(minutes);
    setTimeLeft(minutes * 60);
    setCompletedMessage('');
  };

  const handleStart = () => {
    setCompletedMessage('');
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
    setCompletedMessage('');
  };

  // Format MM:SS
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // SVG Circular Ring Calculation
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const totalSeconds = selectedDuration * 60;
  const progressPercent = (totalSeconds - timeLeft) / totalSeconds;
  const strokeDashoffset = circumference - progressPercent * circumference;

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <TimerIcon className="w-7 h-7 text-brand-500" />
            <span>Deep Focus Pomodoro</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Build study endurance with scientifically calibrated focus intervals
          </p>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
            soundEnabled
              ? 'bg-brand-50 border-brand-200 text-brand-700'
              : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span>{soundEnabled ? 'Chime Enabled' : 'Muted'}</span>
        </button>
      </div>

      {/* Main Circular Timer Display Card */}
      <div className="relative overflow-hidden bg-white rounded-4xl p-8 sm:p-12 border border-slate-200/80 shadow-soft text-center">
        {/* Presets Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            onClick={() => handleSelectPreset(25, false)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
              !isBreak && selectedDuration === 25
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            25m Standard
          </button>
          <button
            onClick={() => handleSelectPreset(45, false)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
              !isBreak && selectedDuration === 45
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            45m Deep Study
          </button>
          <button
            onClick={() => handleSelectPreset(60, false)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all ${
              !isBreak && selectedDuration === 60
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            60m Intense
          </button>
          <button
            onClick={() => handleSelectPreset(5, true)}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              isBreak && selectedDuration === 5
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>5m Rest</span>
          </button>
        </div>

        {/* Circular Dial Visual */}
        <div className="relative w-72 h-72 mx-auto my-2 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Ring */}
            <circle
              cx="144"
              cy="144"
              r={radius}
              stroke="#f1f5f9"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="144"
              cy="144"
              r={radius}
              stroke={isBreak ? '#10b981' : '#0284c7'}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Time digits placed centrally */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              className={`text-5xl sm:text-6xl font-extrabold font-mono tracking-tight transition-colors ${
                isBreak
                  ? 'text-emerald-500'
                  : isRunning
                  ? 'text-brand-600'
                  : 'text-slate-900'
              }`}
            >
              {timeFormatted}
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">
              {isBreak ? '☕ Rest Mode' : isRunning ? '⚡ In Session' : 'Ready to Start'}
            </span>
          </div>
        </div>

        {/* Completion Notice */}
        {completedMessage && (
          <div className="mt-4 inline-flex items-center gap-2 p-3 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{completedMessage}</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Focus Session</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-2.5 px-8 py-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>Pause Timer</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Total Study Summary & History Log */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/70 shadow-soft flex flex-col justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 mx-auto flex items-center justify-center mb-3">
            <Award className="w-6 h-6 stroke-[2.2]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Focus Time</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">
            {(totalMinutes / 60).toFixed(1)} <span className="text-sm font-semibold text-slate-500">hours</span>
          </p>
          <p className="text-xs text-slate-400 mt-1 font-medium">{totalSessions} completed blocks</p>
        </div>

        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/70 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-brand-500" />
              <span>Recent Focus History</span>
            </h2>
            <span className="text-[11px] font-semibold text-slate-400">Auto-saved to database</span>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">
              Complete your first focus timer to start logging hours!
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-brand-500" />
                    <span className="font-bold text-slate-800">{item.duration_minutes} Mins Focused Study</span>
                  </div>
                  <span className="text-slate-400 font-medium">
                    {new Date(item.completed_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
