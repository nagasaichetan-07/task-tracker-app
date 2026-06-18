/* ============================================================
   Task Tracker App — Single-File React Application
   
   Modules:
     1. MY TASKS — One-off task manager with due dates
     2. MONTHLY TRACKER — Habit/goal progress tracker
   
   Tech: React, Tailwind CSS, Recharts, localStorage
   ============================================================ */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, Legend
} from 'recharts';
import { auth, provider, db } from './firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

// ============================================================
// SECTION 0 — ICONS (inline SVG components)
// ============================================================

const Icons = {
  Tasks: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  Calendar: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Plus: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Trash: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 5,6 21,6" /><path d="M19,6v14a2,2,0,01-2,2H7a2,2,0,01-2-2V6m3,0V4a2,2,0,012-2h4a2,2,0,012,2v2" />
    </svg>
  ),
  Edit: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Check: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  ),
  X: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ChevronLeft: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15,18 9,12 15,6" />
    </svg>
  ),
  ChevronRight: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9,18 15,12 9,6" />
    </svg>
  ),
  ChevronDown: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6,9 12,15 18,9" />
    </svg>
  ),
  ChevronUp: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18,15 12,9 6,15" />
    </svg>
  ),
  Search: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Note: ({ size = 14, filled = false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Clipboard: ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  Menu: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  TrendUp: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" /><polyline points="17,6 23,6 23,12" />
    </svg>
  ),
  TrendDown: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23,18 13.5,8.5 8.5,13.5 1,6" /><polyline points="17,18 23,18 23,12" />
    </svg>
  ),
  Copy: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
  GripVertical: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" opacity="0.4">
      <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" /><circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
    </svg>
  ),
  Settings: ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  ),
  Repeat: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17,1 21,5 17,9" /><path d="M3 11V9a4 4 0 014-4h14" /><polyline points="7,23 3,19 7,15" /><path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  ),
  CalendarDays: ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="8" cy="14" r="1" fill="currentColor" /><circle cx="12" cy="14" r="1" fill="currentColor" /><circle cx="16" cy="14" r="1" fill="currentColor" /><circle cx="8" cy="18" r="1" fill="currentColor" /><circle cx="12" cy="18" r="1" fill="currentColor" />
    </svg>
  ),
};


// ============================================================
// SECTION 1 — UTILITY FUNCTIONS
// ============================================================

/** Generate a unique ID */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/** Format date to YYYY-MM-DD */
const fmtDate = (d) => {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/** Format date to readable string */
const fmtReadable = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

/** Format month key YYYY-MM */
const monthKey = (year, month) => `${year}-${String(month + 1).padStart(2, '0')}`;

/** Get today as YYYY-MM-DD */
const today = () => fmtDate(new Date());

/** Check if a date is today */
const isToday = (dateStr) => dateStr === today();

/** Check if a date is past */
const isPast = (dateStr) => dateStr < today();

/** Get days in a month */
const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

/** Get the day of week for the 1st of the month (0=Sun) */
const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

/** Get month name */
const monthName = (month) => [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
][month];

/** Get short month name */
const shortMonth = (month) => [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
][month];

/** Get previous month {year, month} */
const prevMonth = (year, month) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };

/** Get next month {year, month} */
const nextMonth = (year, month) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };

/** Get ISO week number for a given date */
const getWeekOfMonth = (day) => Math.ceil(day / 7);


// ============================================================
// SECTION 2 — LOCAL STORAGE HELPERS
// ============================================================

const LS_KEYS = {
  MY_TASKS: 'my_tasks',
  TEMPLATES: 'progress_templates',
  OVERRIDES: 'progress_overrides',
  COMPLETIONS: 'progress_completions',
  NOTES: 'progress_notes',
};

/** Read from localStorage */
const lsGet = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch { return fallback; }
};

/** Write to localStorage */
const lsSet = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); }
  catch (e) { console.warn('localStorage write failed:', e); }
};


// ============================================================
// SECTION 3 — SHARED UI COMPONENTS
// ============================================================

/** Priority color mapping */
const priorityColors = {
  Low: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  Medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  High: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
};

/** Status color mapping */
const statusColors = {
  Pending: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
  'In Progress': { bg: 'bg-indigo-500/20', text: 'text-indigo-400' },
  Done: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  Overdue: { bg: 'bg-rose-500/20', text: 'text-rose-400' },
};

/** Pill Badge component */
function PillBadge({ label, colorClass = '', className = '' }) {
  return (
    <span className={`pill ${colorClass} ${className}`}>
      {label}
    </span>
  );
}

/** Modal / Drawer backdrop with click-outside + Escape handling */
function ModalBackdrop({ children, onClose, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === ref.current) onClose();
  };

  return (
    <div
      ref={ref}
      className={`fixed inset-0 z-50 modal-backdrop flex ${className}`}
      onClick={handleBackdropClick}
    >
      {children}
    </div>
  );
}

/** Empty state component */
function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-fade-in">
      <div className="text-slate-600 mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-400 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">{subtitle}</p>
      {action}
    </div>
  );
}

/** Animated progress bar */
function ProgressBar({ value, max, colorClass = 'bg-indigo-500', height = 'h-2', className = '' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className={`w-full bg-slate-700/50 rounded-full overflow-hidden ${height} ${className}`}>
      <div
        className={`${colorClass} ${height} rounded-full progress-bar-fill`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/** Get progress color based on percentage */
function getProgressColor(pct) {
  if (pct === 100) return { bar: 'bg-yellow-400', text: 'text-yellow-300', hex: '#facc15' };
  if (pct >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-400', hex: '#10b981' };
  if (pct >= 40) return { bar: 'bg-amber-500', text: 'text-amber-400', hex: '#f59e0b' };
  return { bar: 'bg-rose-500', text: 'text-rose-400', hex: '#f43f5e' };
}

/** Get personalized progress message based on completion percentage */
function getProgressMessage(pct) {
  if (pct === 100) return "Perfect day! You crushed it! 🏆";
  if (pct >= 80)  return "Almost perfect — incredible consistency! ⭐";
  if (pct >= 60)  return "Strong effort! The finish line is close 🎯";
  if (pct >= 40)  return "Halfway there, you're doing great! 💪";
  if (pct >= 21)  return "Building momentum — don't stop now! 🔥";
  if (pct >= 1)   return "A small start is still a start. Keep going! 🐣";
  return "Nothing logged yet — let's get started! 🌱";
}

/** Get personalized monthly progress message prefixed with month name */
function getMonthlyProgressMessage(pct, monthIdx) {
  const name = monthName(monthIdx);
  if (pct === 100) return `${name} was flawless! You crushed it! 🏆`;
  if (pct >= 80)  return `${name} is shining! Almost perfect — incredible consistency! ⭐`;
  if (pct >= 60)  return `${name} is going great! Strong effort — the finish line is close 🎯`;
  if (pct >= 40)  return `${name} is halfway there — you're doing great! 💪`;
  if (pct >= 21)  return `${name} is building momentum — don't stop now! 🔥`;
  if (pct >= 1)   return `${name} just started — a small start is still a start! 🐣`;
  return `${name} awaits — let's get started! 🌱`;
}

/** Progress message display component with fade-in animation */
function ProgressMessage({ pct, monthly = false, monthIdx = 0 }) {
  const message = monthly ? getMonthlyProgressMessage(pct, monthIdx) : getProgressMessage(pct);
  const color = getProgressColor(pct);
  return (
    <p
      key={pct} /* key change triggers re-mount = fade-in animation */
      className={`text-xs italic mt-1.5 animate-fade-in ${color.text}`}
    >
      {message}
    </p>
  );
}


// ============================================================
// SECTION 4 — SIDEBAR NAVIGATION
// ============================================================

function Sidebar({ activeModule, setActiveModule, collapsed, setCollapsed, user, onSignOut }) {
  const navItems = [
    { id: 'tasks', label: 'My Tasks', icon: <Icons.Tasks size={22} />, accent: 'indigo' },
    { id: 'tracker', label: 'Monthly Tracker', icon: <Icons.Calendar size={22} />, accent: 'violet' },
    { id: 'notes', label: 'Notes', icon: <Icons.Note size={22} />, accent: 'amber' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out flex flex-col
          ${collapsed ? 'w-16' : 'w-64'}
          bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50
          ${collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}`}
      >
        {/* Logo / Header */}
        <div className={`flex items-center h-16 border-b border-slate-700/50 px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <Icons.Tasks size={16} />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent whitespace-nowrap">
              TaskTracker
            </span>
          )}
        </div>

        {/* User Profile */}
        {user && !collapsed && (
          <div className="px-4 py-4 border-b border-slate-700/50 flex flex-col items-center gap-2 text-center animate-fade-in flex-shrink-0">
            <img
              src={user.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
              alt={user.displayName || 'User'}
              className="w-12 h-12 rounded-full border-2 border-violet-500/50 shadow-md object-cover"
            />
            <div className="min-w-0 w-full">
              <p className="text-xs font-semibold text-white truncate">{user.displayName}</p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
            </div>
            <button
              onClick={onSignOut}
              className="mt-1.5 flex items-center gap-1.5 text-[9px] uppercase font-bold text-slate-400 hover:text-rose-400 transition-colors py-1 px-3 rounded-lg border border-slate-800 hover:border-rose-500/20 bg-slate-900/50"
            >
              Sign Out
            </button>
          </div>
        )}
        {user && collapsed && (
          <div className="py-4 border-b border-slate-700/50 flex flex-col items-center gap-3 animate-fade-in flex-shrink-0">
            <img
              src={user.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}
              alt={user.displayName || 'User'}
              className="w-8 h-8 rounded-full border border-violet-500/50 object-cover"
              title={user.displayName}
            />
            <button
              onClick={onSignOut}
              className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
              title="Sign Out"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map(item => {
            const isActive = activeModule === item.id;
            const accentMap = {
              indigo: isActive ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-transparent',
              violet: isActive ? 'bg-violet-500/20 text-violet-400 border-violet-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-transparent',
              amber: isActive ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-transparent',
            };
            return (
              <button
                key={item.id}
                onClick={() => { setActiveModule(item.id); if (window.innerWidth < 1024) setCollapsed(true); }}
                className={`w-full flex items-center gap-3 rounded-lg border transition-all duration-200 
                  ${collapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'}
                  ${accentMap[item.accent]}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center h-12 border-t border-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors"
        >
          {collapsed ? <Icons.ChevronRight size={18} /> : <Icons.ChevronLeft size={18} />}
        </button>
      </aside>
    </>
  );
}


// ============================================================
// SECTION 5 — MODULE 1: MY TASKS
// ============================================================

/** Task Form Modal */
function TaskFormModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    name: task?.name || '',
    description: task?.description || '',
    priority: task?.priority || 'Medium',
    dueDate: task?.dueDate || today(),
    status: task?.status || 'Pending',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...task,
      id: task?.id || uid(),
      name: form.name.trim(),
      description: form.description.trim(),
      priority: form.priority,
      dueDate: form.dueDate,
      status: form.status,
      createdAt: task?.createdAt || new Date().toISOString(),
    });
    onClose();
  };

  return (
    <ModalBackdrop onClose={onClose} className="items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="glass rounded-2xl p-6 w-full max-w-lg animate-scale-in space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white">
          {task ? 'Edit Task' : 'New Task'}
        </h2>

        {/* Task Name */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Task Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500/50 transition-colors"
            placeholder="Enter task name..."
            autoFocus
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:border-indigo-500/50 transition-colors resize-none"
            placeholder="Add a description..."
            rows={3}
          />
        </div>

        {/* Priority + Status Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500/50 transition-colors"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500/50 transition-colors"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Due Date</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-4 py-2.5 text-white focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-600/50 text-slate-400 hover:bg-slate-700/50 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium hover:from-indigo-500 hover:to-indigo-400 transition-all duration-200 shadow-lg shadow-indigo-500/25"
          >
            {task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

/** Single task card */
function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const isDone = task.status === 'Done';
  const isOverdue = !isDone && isPast(task.dueDate);
  const displayStatus = isOverdue ? 'Overdue' : task.status;
  const sc = statusColors[displayStatus];
  const pc = priorityColors[task.priority];

  return (
    <div
      className={`glass rounded-xl p-4 card-lift transition-all duration-200 group
        ${isOverdue ? 'border-rose-500/30 bg-rose-500/5' : ''}
        ${isDone ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
            ${isDone
              ? 'bg-emerald-500 border-emerald-500 checkbox-pop'
              : 'border-slate-500 hover:border-indigo-400'}`}
        >
          {isDone && <Icons.Check size={12} />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium text-sm strikethrough ${isDone ? 'active text-slate-500' : 'text-white'}`}>
              {task.name}
            </span>
            <PillBadge label={displayStatus} colorClass={`${sc.bg} ${sc.text}`} />
            <PillBadge label={task.priority} colorClass={`${pc.bg} ${pc.text}`} />
          </div>

          {/* Due date */}
          <div className={`text-xs mt-1 ${isOverdue ? 'text-rose-400' : 'text-slate-500'}`}>
            Due: {fmtReadable(task.dueDate)}
            {isToday(task.dueDate) && <span className="ml-1 text-amber-400 font-medium">· Today</span>}
          </div>

          {/* Description (expandable) */}
          {task.description && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 flex items-center gap-1 transition-colors"
            >
              {expanded ? <Icons.ChevronUp size={12} /> : <Icons.ChevronDown size={12} />}
              {expanded ? 'Hide' : 'Show'} description
            </button>
          )}
          {expanded && task.description && (
            <p className="text-sm text-slate-400 mt-2 animate-slide-in leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-indigo-400 transition-all duration-200"
            title="Edit"
          >
            <Icons.Edit />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-rose-400 transition-all duration-200"
            title="Delete"
          >
            <Icons.Trash />
          </button>
        </div>
      </div>
    </div>
  );
}

/** My Tasks Module */
function MyTasks({ tasks, saveTask, deleteTask, toggleTask }) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState({ status: 'All', priority: 'All', search: '' });
  const [sortBy, setSortBy] = useState('dueDate');
  const [showCompleted, setShowCompleted] = useState(true);

  const handleSaveTask = (task) => {
    saveTask(task);
    setEditingTask(null);
  };

  // Computed stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const dueToday = tasks.filter(t => isToday(t.dueDate) && t.status !== 'Done').length;
    const overdue = tasks.filter(t => t.status !== 'Done' && isPast(t.dueDate)).length;
    return { total, dueToday, overdue };
  }, [tasks]);

  // Filtered & sorted tasks
  const { activeTasks, completedTasks } = useMemo(() => {
    let filtered = tasks.filter(t => {
      if (filter.status !== 'All') {
        if (filter.status === 'Overdue') {
          if (!(t.status !== 'Done' && isPast(t.dueDate))) return false;
        } else if (t.status !== filter.status) return false;
      }
      if (filter.priority !== 'All' && t.priority !== filter.priority) return false;
      if (filter.search && !t.name.toLowerCase().includes(filter.search.toLowerCase())) return false;
      return true;
    });

    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    filtered.sort((a, b) => {
      if (sortBy === 'dueDate') return a.dueDate.localeCompare(b.dueDate);
      if (sortBy === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
      if (sortBy === 'createdAt') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

    return {
      activeTasks: filtered.filter(t => t.status !== 'Done'),
      completedTasks: filtered.filter(t => t.status === 'Done'),
    };
  }, [tasks, filter, sortBy]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">My Tasks</h1>
          <p className="text-sm text-slate-400 mt-1">
            {stats.total} task{stats.total !== 1 ? 's' : ''}
            {stats.dueToday > 0 && <span className="text-amber-400"> · {stats.dueToday} due today</span>}
            {stats.overdue > 0 && <span className="text-rose-400"> · {stats.overdue} overdue</span>}
          </p>
        </div>
        <button
          onClick={() => { setEditingTask(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium hover:from-indigo-500 hover:to-indigo-400 transition-all duration-200 shadow-lg shadow-indigo-500/25"
        >
          <Icons.Plus size={18} /> Add Task
        </button>
      </div>

      {/* Filters & Sort */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Icons.Search size={16} />
            <input
              type="text"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              placeholder="Search tasks..."
              className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500/50 transition-colors"
              style={{ paddingLeft: '2.25rem' }}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Icons.Search size={14} />
            </div>
          </div>

          {/* Status filter */}
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500/50 transition-colors"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
            <option value="Overdue">Overdue</option>
          </select>

          {/* Priority filter */}
          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            className="bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500/50 transition-colors"
          >
            <option value="All">All Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500/50 transition-colors"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="createdAt">Sort by Created</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={<Icons.Clipboard size={64} />}
          title="No tasks yet"
          subtitle="Add your first task to get started! Stay organized and track your progress."
          action={
            <button
              onClick={() => { setEditingTask(null); setShowForm(true); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-all duration-200"
            >
              <Icons.Plus size={18} /> Add Your First Task
            </button>
          }
        />
      ) : (
        <>
          {/* Active Tasks */}
          {activeTasks.length === 0 && completedTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No tasks match your filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onEdit={(t) => { setEditingTask(t); setShowForm(true); }}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          )}

          {/* Completed Tasks (Collapsible) */}
          {completedTasks.length > 0 && (
            <div>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-3"
              >
                {showCompleted ? <Icons.ChevronDown size={14} /> : <Icons.ChevronRight size={14} />}
                Completed ({completedTasks.length})
              </button>
              {showCompleted && (
                <div className="space-y-3 animate-slide-in">
                  {completedTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={toggleTask}
                      onEdit={(t) => { setEditingTask(t); setShowForm(true); }}
                      onDelete={deleteTask}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <TaskFormModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}


// ============================================================
// SECTION 6 — MODULE 2: MONTHLY TRACKER
// ============================================================

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const WEEKDAY_LABELS = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 0: 'Sun' };
const WEEKDAYS = [
  { label: 'Mon', index: 1 },
  { label: 'Tue', index: 2 },
  { label: 'Wed', index: 3 },
  { label: 'Thu', index: 4 },
  { label: 'Fri', index: 5 },
  { label: 'Sat', index: 6 },
  { label: 'Sun', index: 0 },
];

function formatWeekdays(weekdays) {
  if (!weekdays || weekdays.length === 0) return '';
  const sorted = [...weekdays].sort((a, b) => {
    return WEEKDAY_ORDER.indexOf(a) - WEEKDAY_ORDER.indexOf(b);
  });
  return sorted.map(idx => WEEKDAY_LABELS[idx]).join(', ');
}

/** Frequency Badge with popover for custom days, or weekday labels */
function FrequencyBadge({ task, viewYear, viewMonth }) {
  const [showPopover, setShowPopover] = useState(false);
  const badgeRef = useRef(null);

  // Close popover on outside click
  useEffect(() => {
    if (!showPopover) return;
    const handler = (e) => {
      if (badgeRef.current && !badgeRef.current.contains(e.target)) setShowPopover(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPopover]);

  if (task.frequency === 'weekdays') {
    const label = formatWeekdays(task.weekdays);
    return (
      <span className="text-[10px] text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
        <Icons.CalendarDays size={9} /> {label || 'None'}
      </span>
    );
  }

  const isCustom = task.frequency === 'custom' && task.customDays?.length > 0;
  const dayCount = isCustom ? task.customDays.length : 0;

  if (!isCustom) {
    return (
      <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
        <Icons.Repeat size={9} /> Daily
      </span>
    );
  }

  return (
    <span className="relative" ref={badgeRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setShowPopover(!showPopover); }}
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
        className="text-[10px] text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1 cursor-pointer hover:bg-amber-500/25 transition-colors"
      >
        <Icons.CalendarDays size={9} /> {dayCount} day{dayCount !== 1 ? 's' : ''}
      </button>
      {showPopover && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 glass rounded-lg px-3 py-2 shadow-xl animate-fade-in min-w-[160px]">
          <p className="text-[10px] font-semibold text-slate-400 mb-1">Selected days:</p>
          <div className="flex flex-wrap gap-1">
            {task.customDays.map(ds => {
              const d = new Date(ds + 'T00:00:00');
              const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
              return (
                <span key={ds} className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                  {dayLabel}
                </span>
              );
            })}
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-slate-700/80" />
        </div>
      )}
    </span>
  );
}

/** Weekday Picker Grid for selecting specific days of the week */
function WeekdayPicker({ selectedWeekdays, onToggleWeekday }) {
  return (
    <div className="animate-slide-in">
      <div className="flex flex-wrap gap-1.5 py-1">
        {WEEKDAYS.map(({ label, index }) => {
          const isSelected = selectedWeekdays.includes(index);
          return (
            <button
              key={index}
              type="button"
              onClick={() => onToggleWeekday(index)}
              className={`text-[10px] px-3 py-1.5 rounded-lg border transition-all duration-150 font-medium
                ${isSelected
                  ? 'bg-violet-500/30 border-violet-500/50 text-violet-300 shadow-sm shadow-violet-500/20'
                  : 'bg-slate-800/40 border-slate-600/30 text-slate-500 hover:border-slate-500/50 hover:text-slate-400'}`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-500 mt-1.5">
        {selectedWeekdays.length} day{selectedWeekdays.length !== 1 ? 's' : ''} selected
      </p>
    </div>
  );
}

/** Monthly Template Editor Panel */
function TemplatePanel({ template, setTemplate, collapsed, setCollapsed, viewYear, viewMonth }) {
  const [newName, setNewName] = useState('');
  const [newPoints, setNewPoints] = useState(1);
  const [newFrequency, setNewFrequency] = useState('daily');   // 'daily' | 'weekdays'
  const [newWeekdays, setNewWeekdays] = useState([]);          // number[]
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPoints, setEditPoints] = useState(1);

  // Reset frequency state when month changes
  useEffect(() => {
    setNewFrequency('daily');
    setNewWeekdays([]);
  }, [viewYear, viewMonth]);

  const toggleWeekday = (index) => {
    setNewWeekdays(prev =>
      prev.includes(index) ? prev.filter(d => d !== index) : [...prev, index]
    );
  };

  const canAdd = newName.trim() && (newFrequency === 'daily' || newWeekdays.length > 0);

  const addTask = () => {
    if (!canAdd) return;
    setTemplate(prev => [...prev, {
      id: uid(),
      name: newName.trim(),
      points: Math.min(10, Math.max(1, newPoints)),
      frequency: newFrequency,
      weekdays: newFrequency === 'weekdays' ? [...newWeekdays] : [],
    }]);
    setNewName('');
    setNewPoints(1);
    setNewFrequency('daily');
    setNewWeekdays([]);
  };

  const removeTask = (id) => setTemplate(prev => prev.filter(t => t.id !== id));

  const startEdit = (task) => {
    setEditId(task.id);
    setEditName(task.name);
    setEditPoints(task.points);
  };

  const saveEdit = () => {
    if (!editName.trim()) return;
    setTemplate(prev => prev.map(t => t.id === editId ? { ...t, name: editName.trim(), points: Math.min(10, Math.max(1, editPoints)) } : t));
    setEditId(null);
  };

  const moveTask = (id, dir) => {
    setTemplate(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if ((dir === -1 && idx === 0) || (dir === 1 && idx === prev.length - 1)) return prev;
      const next = [...prev];
      [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
      return next;
    });
  };

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icons.Settings size={16} />
          <span className="font-semibold text-sm text-white">Monthly Template</span>
          <span className="text-xs text-slate-500">({template.length} tasks)</span>
        </div>
        {collapsed ? <Icons.ChevronDown /> : <Icons.ChevronUp />}
      </button>

      {!collapsed && (
        <div className="px-5 pb-5 space-y-3 animate-slide-in border-t border-slate-700/30 pt-4">
          {/* Existing tasks */}
          {template.map((task) => (
            <div key={task.id} className="flex items-center gap-2 group">
              <Icons.GripVertical />
              {editId === task.id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-slate-800/60 border border-violet-500/30 rounded-lg px-3 py-1.5 text-sm text-white"
                    autoFocus
                  />
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editPoints}
                    onChange={(e) => setEditPoints(parseInt(e.target.value) || 1)}
                    className="w-16 bg-slate-800/60 border border-violet-500/30 rounded-lg px-2 py-1.5 text-sm text-white text-center"
                  />
                  <button onClick={saveEdit} className="p-1 text-emerald-400 hover:text-emerald-300"><Icons.Check size={14} /></button>
                  <button onClick={() => setEditId(null)} className="p-1 text-slate-500 hover:text-slate-300"><Icons.X size={14} /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-slate-300">{task.name}</span>
                  <FrequencyBadge task={task} viewYear={viewYear} viewMonth={viewMonth} />
                  <span className="text-xs text-violet-400 bg-violet-500/20 px-2 py-0.5 rounded-full font-medium">{task.points} pt{task.points > 1 ? 's' : ''}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveTask(task.id, -1)} className="p-1 text-slate-500 hover:text-slate-300"><Icons.ChevronUp size={12} /></button>
                    <button onClick={() => moveTask(task.id, 1)} className="p-1 text-slate-500 hover:text-slate-300"><Icons.ChevronDown size={12} /></button>
                    <button onClick={() => startEdit(task)} className="p-1 text-slate-500 hover:text-indigo-400"><Icons.Edit size={12} /></button>
                    <button onClick={() => removeTask(task.id)} className="p-1 text-slate-500 hover:text-rose-400"><Icons.Trash size={12} /></button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add new task section */}
          <div className="pt-2 border-t border-slate-700/30 space-y-2">
            {/* Name + Points row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && newFrequency === 'daily' && addTask()}
                placeholder="New task name..."
                className="flex-1 bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500"
              />
              <input
                type="number"
                min={1}
                max={10}
                value={newPoints}
                onChange={(e) => setNewPoints(parseInt(e.target.value) || 1)}
                className="w-16 bg-slate-800/60 border border-slate-600/50 rounded-lg px-2 py-1.5 text-sm text-white text-center"
                placeholder="Pts"
              />
            </div>

            {/* Frequency selector */}
            {newName.trim() && (
              <div className="animate-slide-in space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Frequency:</span>
                  <button
                    type="button"
                    onClick={() => { setNewFrequency('daily'); setNewWeekdays([]); }}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all duration-150 flex items-center gap-1
                      ${newFrequency === 'daily'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-800/40 border-slate-600/30 text-slate-500 hover:text-slate-400'}`}
                  >
                    <Icons.Repeat size={11} /> Daily
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewFrequency('weekdays')}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all duration-150 flex items-center gap-1
                      ${newFrequency === 'weekdays'
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-slate-800/40 border-slate-600/30 text-slate-500 hover:text-slate-400'}`}
                  >
                    <Icons.CalendarDays size={11} /> Select Days
                  </button>
                </div>

                {/* Weekday picker grid (only shown when "Select Days" is chosen) */}
                {newFrequency === 'weekdays' && (
                  <WeekdayPicker
                    selectedWeekdays={newWeekdays}
                    onToggleWeekday={toggleWeekday}
                  />
                )}

                {/* Add button */}
                <div className="flex justify-end">
                  <button
                    onClick={addTask}
                    disabled={!canAdd}
                    title={!canAdd && newFrequency === 'weekdays' ? 'Select at least one day' : undefined}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${canAdd
                        ? 'bg-violet-600 text-white hover:bg-violet-500 shadow-sm shadow-violet-500/25'
                        : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'}`}
                  >
                    <Icons.Plus size={14} /> Add Task
                  </button>
                </div>
              </div>
            )}

            {/* Quick add button when name is empty */}
            {!newName.trim() && (
              <p className="text-[10px] text-slate-600 italic">Type a task name above to see frequency options</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** Day Detail Panel (drawer from right) */
function DayDetailPanel({
  dateStr, tasks, completions, notes, globalNotes,
  onToggleTask, onSaveNote, onClose, onEditDayTasks,
  onOpenInNotesPage, onSelectNoteAndNavigate,
  dayOverride
}) {
  const [openNoteId, setOpenNoteId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [showDayNotes, setShowDayNotes] = useState(false);

  const totalPoints = tasks.reduce((s, t) => s + t.points, 0);
  const earnedPoints = tasks.reduce((s, t) => (completions[t.id] ? s + t.points : s), 0);
  const pct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const color = getProgressColor(pct);

  const dayNotes = useMemo(() => {
    return (globalNotes || []).filter(n => n.date === dateStr);
  }, [globalNotes, dateStr]);

  const openNote = (task) => {
    const key = `${dateStr}-${task.id}`;
    setOpenNoteId(task.id === openNoteId ? null : task.id);
    setNoteText(notes[key] || '');
  };

  const saveNote = (taskId) => {
    const key = `${dateStr}-${taskId}`;
    onSaveNote(key, noteText);
    setOpenNoteId(null);
  };

  return (
    <ModalBackdrop onClose={onClose} className="justify-end">
      <div
        className="w-full max-w-md h-full bg-slate-900/98 backdrop-blur-xl border-l border-slate-700/50 overflow-y-auto animate-slide-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'slideFromRight 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">{fmtReadable(dateStr)}</h2>
              <p className={`text-sm font-medium ${color.text}`}>
                {earnedPoints} / {totalPoints} pts earned ({pct}%)
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-white transition-colors">
              <Icons.X size={20} />
            </button>
          </div>
          <ProgressBar value={earnedPoints} max={totalPoints} colorClass={color.bar} className="mt-3" />
          <ProgressMessage pct={pct} />
        </div>

        {/* Scrollable middle section */}
        <div className="flex-1 overflow-y-auto">
          {/* Tasks */}
          <div className="px-6 py-4 space-y-2">
            {tasks.length === 0 ? (
              <EmptyState
                icon={<Icons.Clipboard size={40} />}
                title="No tasks for this day"
                subtitle="Add tasks to your monthly template to see them here."
              />
            ) : (
              tasks.map(task => {
                const done = !!completions[task.id];
                const noteKey = `${dateStr}-${task.id}`;
                const hasNote = !!notes[noteKey];
                const isNoteOpen = openNoteId === task.id;

                return (
                  <div key={task.id} className="glass rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 p-3 group">
                      {/* Checkbox */}
                      <button
                        onClick={() => onToggleTask(dateStr, task.id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                          ${done ? 'bg-emerald-500 border-emerald-500 checkbox-pop' : 'border-slate-500 hover:border-violet-400'}`}
                      >
                        {done && <Icons.Check size={12} />}
                      </button>

                      {/* Task info */}
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium strikethrough ${done ? 'active text-slate-500' : 'text-white'}`}>
                          {task.name}
                        </span>
                      </div>

                      {/* Points badge */}
                      <span className="text-xs text-violet-400 bg-violet-500/20 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                        {task.points} pt{task.points > 1 ? 's' : ''}
                      </span>

                      {/* Note toggle */}
                      <button
                        onClick={() => openNote(task)}
                        className={`p-1 rounded transition-colors flex-shrink-0 ${hasNote ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'}`}
                        title={hasNote ? 'Edit Note' : 'Add Note'}
                      >
                        <Icons.Note size={14} filled={hasNote} />
                      </button>
                    </div>

                    {/* Note textarea (inline slide-in) */}
                    {isNoteOpen && (
                      <div className="px-3 pb-3 note-slide-in">
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add a note..."
                          className="w-full bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 resize-none focus:border-violet-500/50 transition-colors"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => saveNote(task.id)}
                            className="px-3 py-1.5 text-[10px] sm:text-xs rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors font-medium"
                          >
                            Save as Quick Note
                          </button>
                          <button
                            onClick={() => {
                              onOpenInNotesPage(dateStr, task.id, noteText);
                              setOpenNoteId(null);
                            }}
                            className="px-3 py-1.5 text-[10px] sm:text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors font-medium"
                          >
                            Open in Notes Page
                          </button>
                          <button
                            onClick={() => setOpenNoteId(null)}
                            className="px-3 py-1.5 text-[10px] sm:text-xs rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800/50 transition-colors font-medium ml-auto"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Collapsible Notes Section */}
          {dayNotes.length > 0 && (
            <div className="px-6 py-2 border-t border-slate-700/30">
              <button
                onClick={() => setShowDayNotes(!showDayNotes)}
                className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-300 py-2 transition-colors"
              >
                <span>Notes for this day ({dayNotes.length})</span>
                {showDayNotes ? <Icons.ChevronUp size={14} /> : <Icons.ChevronDown size={14} />}
              </button>
              
              {showDayNotes && (
                <div className="space-y-2.5 mt-2 animate-slide-in pb-4">
                  {dayNotes.map(n => {
                    const hasTask = !!n.taskId;
                    const completed = hasTask && completions[n.taskId];
                    const borderClass = hasTask 
                      ? (completed ? 'border-l-4 border-emerald-500' : 'border-l-4 border-amber-500')
                      : 'border-l-4 border-slate-700';

                    const titleText = n.title || n.body.split('\n')[0] || 'Untitled Note';
                    const previewText = n.body.split('\n').slice(n.title ? 0 : 1).filter(line => line.trim()).slice(0, 2).join(' ') || n.body;

                    return (
                      <button
                        key={n.id}
                        onClick={() => {
                          onSelectNoteAndNavigate(n.id);
                          onClose();
                        }}
                        className={`w-full text-left p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 transition-all flex flex-col gap-1.5 ${borderClass}`}
                      >
                        <h4 className="text-xs font-bold text-white truncate">{titleText}</h4>
                        {previewText && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{previewText}</p>
                        )}
                        {n.taskName && (
                          <span className="inline-block text-[8px] bg-violet-500/10 text-violet-300 border border-violet-500/20 px-1.5 py-0.5 rounded self-start">
                            {n.taskName}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit Day Tasks Button */}
        <div className="px-6 py-4 border-t border-slate-700/30">
          <button
            onClick={() => onEditDayTasks(dateStr)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition-all duration-200 text-sm font-medium"
          >
            <Icons.Edit size={14} />
            {dayOverride ? 'Edit Day Override' : 'Override This Day\'s Tasks'}
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

/** Day Override Editor Modal */
function DayOverrideModal({ dateStr, currentTasks, onSave, onClose }) {
  const [tasks, setTasks] = useState(currentTasks.map(t => ({ ...t })));
  const [newName, setNewName] = useState('');
  const [newPoints, setNewPoints] = useState(1);

  const addTask = () => {
    if (!newName.trim()) return;
    setTasks(prev => [...prev, { id: uid(), name: newName.trim(), points: Math.min(10, Math.max(1, newPoints)) }]);
    setNewName('');
    setNewPoints(1);
  };

  const removeTask = (id) => setTasks(prev => prev.filter(t => t.id !== id));

  return (
    <ModalBackdrop onClose={onClose} className="items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 w-full max-w-lg animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-1">Edit Tasks for {fmtReadable(dateStr)}</h2>
        <p className="text-sm text-slate-400 mb-4">Changes only apply to this specific day.</p>

        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {tasks.map(task => (
            <div key={task.id} className="flex items-center gap-2 bg-slate-800/40 rounded-lg px-3 py-2">
              <span className="flex-1 text-sm text-slate-300">{task.name}</span>
              <span className="text-xs text-violet-400 bg-violet-500/20 px-2 py-0.5 rounded-full">{task.points} pts</span>
              <button onClick={() => removeTask(task.id)} className="text-slate-500 hover:text-rose-400 transition-colors">
                <Icons.Trash size={14} />
              </button>
            </div>
          ))}
          {tasks.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No tasks — add some below</p>}
        </div>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Task name..."
            className="flex-1 bg-slate-800/60 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500"
          />
          <input
            type="number"
            min={1}
            max={10}
            value={newPoints}
            onChange={(e) => setNewPoints(parseInt(e.target.value) || 1)}
            className="w-16 bg-slate-800/60 border border-slate-600/50 rounded-lg px-2 py-2 text-sm text-white text-center"
          />
          <button onClick={addTask} className="p-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-colors">
            <Icons.Plus size={16} />
          </button>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-600/50 text-slate-400 hover:bg-slate-700/50 transition-all duration-200">
            Cancel
          </button>
          <button
            onClick={() => { onSave(dateStr, tasks); onClose(); }}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 text-white font-medium hover:from-violet-500 hover:to-violet-400 transition-all duration-200 shadow-lg shadow-violet-500/25"
          >
            Save Override
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

/** Copy From Previous Month Prompt */
function CopyMonthPrompt({ prevMonthName, onCopy, onFresh }) {
  return (
    <ModalBackdrop onClose={onFresh} className="items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-md animate-scale-in text-center" onClick={(e) => e.stopPropagation()}>
        <div className="text-violet-400 mb-4">
          <Icons.Copy size={40} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Set Up This Month</h2>
        <p className="text-sm text-slate-400 mb-6">
          Would you like to copy your task template from <span className="text-violet-400 font-medium">{prevMonthName}</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onFresh}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-600/50 text-slate-400 hover:bg-slate-700/50 transition-all duration-200"
          >
            Start Fresh
          </button>
          <button
            onClick={onCopy}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 text-white font-medium hover:from-violet-500 hover:to-violet-400 transition-all duration-200 shadow-lg shadow-violet-500/25"
          >
            Yes, Copy
          </button>
        </div>
      </div>
    </ModalBackdrop>
  );
}


/** Custom Recharts Tooltip — includes a progress message */
function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  const pct = data?.pct;
  const color = typeof pct === 'number' ? getProgressColor(pct) : null;
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs shadow-xl max-w-[220px]">
      <p className="font-medium text-white mb-1">{data?.tooltipLabel || `Day ${label}`}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || p.fill }} className="font-medium">
          {p.name}: {p.value} pts
        </p>
      ))}
      {typeof pct === 'number' && (
        <p className={`italic mt-1 ${color.text}`} style={{ fontSize: '10px' }}>
          {getProgressMessage(pct)}
        </p>
      )}
    </div>
  );
}

/** Daily Performance Bar Chart */
function DailyChart({ year, month, getTasksForDay, completions }) {
  const days = daysInMonth(year, month);
  const data = [];

  for (let d = 1; d <= days; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const tasks = getTasksForDay(dateStr);
    const maxPts = tasks.reduce((s, t) => s + t.points, 0);
    const earned = tasks.reduce((s, t) => ((completions[dateStr] || {})[t.id] ? s + t.points : s), 0);
    const pct = maxPts > 0 ? Math.round((earned / maxPts) * 100) : 0;
    data.push({
      day: d,
      earned,
      max: maxPts,
      pct,
      color: getProgressColor(pct).hex,
      tooltipLabel: `Day ${d} — ${earned} / ${maxPts} pts (${pct}%)`,
    });
  }

  const maxRef = data.length > 0 ? Math.max(...data.map(d => d.max)) : 0;

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">
        Daily Performance — {monthName(month)} {year}
      </h3>
      {data.every(d => d.max === 0) ? (
        <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
          No tasks defined for this month yet.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />
            <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
            <Tooltip content={<CustomBarTooltip />} />
            <ReferenceLine y={maxRef} stroke="#6366f1" strokeDasharray="5 5" label={{ value: 'Max', fill: '#6366f1', fontSize: 10 }} />
            <Bar dataKey="earned" name="Points" radius={[4, 4, 0, 0]} maxBarSize={20}>
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/** Month-over-Month Comparison Chart */
function ComparisonChart({ year, month, getTasksForDay, completions, templates }) {
  const mk = monthKey(year, month);
  const prev = prevMonth(year, month);
  const prevMk = monthKey(prev.year, prev.month);

  // Check if previous month has data
  const hasPrevData = !!templates[prevMk] && templates[prevMk].length > 0;

  // Group days into weeks
  const getWeeklyData = (y, m) => {
    const days = daysInMonth(y, m);
    const weeks = { 1: 0, 2: 0, 3: 0, 4: 0 };
    for (let d = 1; d <= days; d++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const tasks = getTasksForDay(dateStr);
      const earned = tasks.reduce((s, t) => ((completions[dateStr] || {})[t.id] ? s + t.points : s), 0);
      const weekNum = Math.min(getWeekOfMonth(d), 4);
      weeks[weekNum] += earned;
    }
    return weeks;
  };

  const currentWeeks = getWeeklyData(year, month);
  const prevWeeks = hasPrevData ? getWeeklyData(prev.year, prev.month) : { 1: 0, 2: 0, 3: 0, 4: 0 };

  const chartData = [1, 2, 3, 4].map(w => ({
    week: `Week ${w}`,
    current: currentWeeks[w],
    previous: prevWeeks[w],
  }));

  // Monthly totals
  const currentTotal = Object.values(currentWeeks).reduce((a, b) => a + b, 0);
  const prevTotal = Object.values(prevWeeks).reduce((a, b) => a + b, 0);
  const delta = currentTotal - prevTotal;

  // Calculate max possible for percentages
  const calcMaxForMonth = (y, m) => {
    const days = daysInMonth(y, m);
    let total = 0;
    for (let d = 1; d <= days; d++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const tasks = getTasksForDay(dateStr);
      total += tasks.reduce((s, t) => s + t.points, 0);
    }
    return total;
  };
  const currentMax = calcMaxForMonth(year, month);
  const prevMax = hasPrevData ? calcMaxForMonth(prev.year, prev.month) : 0;
  const currentPct = currentMax > 0 ? Math.round((currentTotal / currentMax) * 100) : 0;
  const prevPct = prevMax > 0 ? Math.round((prevTotal / prevMax) * 100) : 0;

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-white mb-4">
        Month Comparison — {shortMonth(month)} vs {shortMonth(prev.month)}
      </h3>

      {!hasPrevData ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <Icons.Calendar size={32} />
          <p className="text-sm mt-3">No data from {monthName(prev.month)} to compare with.</p>
          <p className="text-xs text-slate-600 mt-1">Previous month data will appear once available.</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />
              <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="current" name={shortMonth(month)} fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={30} />
              <Bar dataKey="previous" name={shortMonth(prev.month)} fill="#475569" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>

          {/* Summary Card */}
          <div className="mt-4 p-4 bg-slate-800/40 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <div className="text-center sm:text-left">
              <span className="text-slate-400">This month: </span>
              <span className="text-white font-semibold">{currentTotal} pts</span>
              <span className="text-slate-500 ml-1">({currentPct}%)</span>
            </div>
            <div className="text-center">
              <span className="text-slate-400">vs </span>
              <span className="text-slate-300 font-medium">{prevTotal} pts</span>
              <span className="text-slate-500 ml-1">({prevPct}%)</span>
            </div>
            <div className={`flex items-center gap-1 font-semibold ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {delta >= 0 ? <Icons.TrendUp size={14} /> : <Icons.TrendDown size={14} />}
              <span className={`px-2 py-0.5 rounded-full text-xs ${delta >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                {delta >= 0 ? '+' : ''}{delta} pts
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


/** Monthly Tracker Module */
function MonthlyTracker({
  templates, setTemplates,
  overrides, setOverrides,
  completions, setCompletions,
  notes, saveNote,
  onOpenInNotesPage,
  onSelectNoteAndNavigate
}) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showOverrideEditor, setShowOverrideEditor] = useState(null);
  const [showCopyPrompt, setShowCopyPrompt] = useState(false);
  const [templateCollapsed, setTemplateCollapsed] = useState(true);

  const mk = monthKey(viewYear, viewMonth);

  // Check if month needs initialization
  useEffect(() => {
    if (templates[mk] === undefined) {
      const prev = prevMonth(viewYear, viewMonth);
      const prevMk = monthKey(prev.year, prev.month);
      if (templates[prevMk] && templates[prevMk].length > 0) {
        setShowCopyPrompt(true);
      } else {
        // Auto-initialize with empty template
        setTemplates(mk, []);
      }
    }
  }, [mk, templates, setTemplates, viewYear, viewMonth]);

  const handleCopyFromPrev = () => {
    const prev = prevMonth(viewYear, viewMonth);
    const prevMk = monthKey(prev.year, prev.month);
    const prevTemplate = templates[prevMk] || [];
    // Copy tasks with new IDs; daily & weekdays tasks keep frequency, custom tasks reset to daily for new month
    const copied = prevTemplate.map(t => {
      if (t.frequency === 'weekdays') {
        return {
          ...t,
          id: uid(),
          frequency: 'weekdays',
          weekdays: [...(t.weekdays || [])],
        };
      }
      return {
        ...t,
        id: uid(),
        frequency: 'daily',
        customDays: [],
      };
    });
    setTemplates(mk, copied);
    setShowCopyPrompt(false);
  };

  const handleStartFresh = () => {
    setTemplates(mk, []);
    setShowCopyPrompt(false);
  };

  // Get current month template
  const currentTemplate = templates[mk] || [];

  const setCurrentTemplate = (updater) => {
    const currentTmpl = templates[mk] || [];
    const newTmpl = typeof updater === 'function' ? updater(currentTmpl) : updater;
    setTemplates(mk, newTmpl);
  };

  // Get tasks for a specific day (considering overrides + frequency filtering)
  const getTasksForDay = useCallback((dateStr) => {
    if (overrides[dateStr]) return overrides[dateStr];
    const dm = dateStr.substring(0, 7); // YYYY-MM
    const tmpl = templates[dm] || [];
    // Filter tasks based on frequency: include if daily OR if dateStr matches frequency criteria
    return tmpl.filter(t => {
      if (!t.frequency || t.frequency === 'daily') return true;
      if (t.frequency === 'weekdays') {
        const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay();
        return (t.weekdays || []).includes(dayOfWeek);
      }
      if (t.frequency === 'custom') return (t.customDays || []).includes(dateStr);
      return true;
    });
  }, [overrides, templates]);

  // Toggle task completion for a day
  const toggleTask = (dateStr, taskId) => {
    const currentCompletions = completions[dateStr] || {};
    const newCompletions = {
      ...currentCompletions,
      [taskId]: !currentCompletions[taskId]
    };
    setCompletions(dateStr, newCompletions);
  };

  // Navigate months
  const goToPrev = () => {
    const p = prevMonth(viewYear, viewMonth);
    setViewYear(p.year);
    setViewMonth(p.month);
  };
  const goToNext = () => {
    const n = nextMonth(viewYear, viewMonth);
    setViewYear(n.year);
    setViewMonth(n.month);
  };

  // Monthly stats
  const monthlyStats = useMemo(() => {
    const days = daysInMonth(viewYear, viewMonth);
    let totalEarned = 0, totalMax = 0;
    for (let d = 1; d <= days; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const tasks = getTasksForDay(dateStr);
      const dayMax = tasks.reduce((s, t) => s + t.points, 0);
      const dayEarned = tasks.reduce((s, t) => ((completions[dateStr] || {})[t.id] ? s + t.points : s), 0);
      totalMax += dayMax;
      totalEarned += dayEarned;
    }
    const pct = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
    return { earned: totalEarned, max: totalMax, pct };
  }, [viewYear, viewMonth, templates, overrides, completions, getTasksForDay]);

  const notesMap = useMemo(() => {
    const map = {};
    (notes || []).forEach(n => {
      if (n.date && n.taskId) {
        map[`${n.date}-${n.taskId}`] = n.body;
      }
    });
    return map;
  }, [notes]);

  // Calendar grid data
  const calendarDays = useMemo(() => {
    const days = daysInMonth(viewYear, viewMonth);
    const firstDay = firstDayOfMonth(viewYear, viewMonth);
    const cells = [];

    // Padding for first week
    for (let i = 0; i < firstDay; i++) cells.push(null);

    // Actual days
    for (let d = 1; d <= days; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const tasks = getTasksForDay(dateStr);
      const maxPts = tasks.reduce((s, t) => s + t.points, 0);
      const earnedPts = tasks.reduce((s, t) => ((completions[dateStr] || {})[t.id] ? s + t.points : s), 0);
      const pct = maxPts > 0 ? Math.round((earnedPts / maxPts) * 100) : -1;
      const hasNotes = (notes || []).some(n => n.date === dateStr);
      cells.push({ day: d, dateStr, tasks, maxPts, earnedPts, pct, hasNotes, isToday: isToday(dateStr) });
    }

    return cells;
  }, [viewYear, viewMonth, templates, overrides, completions, notes, getTasksForDay]);

  const progressColor = getProgressColor(monthlyStats.pct);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with month navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Monthly Tracker</h1>
          <p className="text-sm text-slate-400 mt-1">Track your daily habits and goals</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={goToPrev} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
            <Icons.ChevronLeft />
          </button>
          <span className="text-lg font-semibold text-white min-w-[180px] text-center">
            {monthName(viewMonth)} {viewYear}
          </span>
          <button onClick={goToNext} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
            <Icons.ChevronRight />
          </button>
        </div>
      </div>

      {/* Monthly Score Summary */}
      <div className="glass rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-sm text-slate-400">Month Score: </span>
            <span className="text-xl font-bold text-white">{monthlyStats.earned}</span>
            <span className="text-sm text-slate-500"> / {monthlyStats.max} pts</span>
          </div>
          <span className={`text-2xl font-bold ${progressColor.text}`}>
            {monthlyStats.pct}%
          </span>
        </div>
        <ProgressBar value={monthlyStats.earned} max={monthlyStats.max} colorClass={progressColor.bar} height="h-3" />
        <ProgressMessage pct={monthlyStats.pct} monthly monthIdx={viewMonth} />
      </div>

      {/* Template Panel */}
      <TemplatePanel
        template={currentTemplate}
        setTemplate={setCurrentTemplate}
        collapsed={templateCollapsed}
        setCollapsed={setTemplateCollapsed}
        viewYear={viewYear}
        viewMonth={viewMonth}
      />

      {/* Calendar Grid */}
      <div className="glass rounded-xl p-4 overflow-x-auto">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2 min-w-[560px]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-1 min-w-[560px]">
          {calendarDays.map((cell, idx) => (
            <div key={idx}>
              {cell ? (
                <button
                  onClick={() => setSelectedDay(cell.dateStr)}
                  className={`w-full min-h-[80px] sm:min-h-[100px] rounded-lg p-1.5 text-left transition-all duration-200 hover:bg-slate-700/40 border
                    ${cell.isToday ? 'border-violet-500/60 bg-violet-500/10 ring-1 ring-violet-500/30' : 'border-transparent hover:border-slate-600/30'}
                    ${isPast(cell.dateStr) && !cell.isToday ? 'opacity-75' : ''}`}
                >
                  {/* Day number + note icon */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold ${cell.isToday ? 'text-violet-400' : 'text-slate-400'}`}>
                      {cell.day}
                    </span>
                    <div className="flex items-center gap-1">
                      {cell.hasNotes && <span className="text-xs" title="Notes exist">🗒</span>}
                      {overrides[cell.dateStr] && (
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400" title="Day override" />
                      )}
                    </div>
                  </div>

                  {/* Task pills (max 3 shown) */}
                  <div className="space-y-0.5">
                    {cell.tasks.slice(0, 3).map(task => {
                      const done = !!(completions[cell.dateStr] || {})[task.id];
                      return (
                        <div key={task.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate
                          ${done ? 'bg-emerald-500/20 text-emerald-400 line-through' : 'bg-slate-700/50 text-slate-400'}`}>
                          {task.name}
                        </div>
                      );
                    })}
                    {cell.tasks.length > 3 && (
                      <div className="text-[9px] text-slate-500 px-1">+{cell.tasks.length - 3} more</div>
                    )}
                  </div>

                  {/* Progress indicator */}
                  {cell.pct >= 0 && (
                    <div className="mt-1">
                      <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className={`h-1 rounded-full ${getProgressColor(cell.pct).bar}`}
                          style={{ width: `${cell.pct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              ) : (
                <div className="min-h-[80px] sm:min-h-[100px]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <DailyChart
          year={viewYear}
          month={viewMonth}
          getTasksForDay={getTasksForDay}
          completions={completions}
        />
        <ComparisonChart
          year={viewYear}
          month={viewMonth}
          getTasksForDay={getTasksForDay}
          completions={completions}
          templates={templates}
        />
      </div>

      {/* Day Detail Panel */}
      {selectedDay && (
        <DayDetailPanel
          dateStr={selectedDay}
          tasks={getTasksForDay(selectedDay)}
          completions={completions[selectedDay] || {}}
          notes={notesMap}
          globalNotes={notes}
          onToggleTask={toggleTask}
          onSaveNote={saveNote}
          onOpenInNotesPage={onOpenInNotesPage}
          onSelectNoteAndNavigate={onSelectNoteAndNavigate}
          onClose={() => setSelectedDay(null)}
          onEditDayTasks={(d) => { setShowOverrideEditor(d); }}
          dayOverride={!!overrides[selectedDay]}
        />
      )}

      {/* Day Override Editor Modal */}
      {showOverrideEditor && (
        <DayOverrideModal
          dateStr={showOverrideEditor}
          currentTasks={getTasksForDay(showOverrideEditor)}
          onSave={setOverrides}
          onClose={() => setShowOverrideEditor(null)}
        />
      )}

      {/* Copy Month Prompt */}
      {showCopyPrompt && (
        <CopyMonthPrompt
          prevMonthName={`${monthName(prevMonth(viewYear, viewMonth).month)} ${prevMonth(viewYear, viewMonth).year}`}
          onCopy={handleCopyFromPrev}
          onFresh={handleStartFresh}
        />
      )}
    </div>
  );
}


// ============================================================
// SECTION 6.5 — NOTES MODULE & HELPERS
// ============================================================

const NotebookIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600/40 mb-4 animate-pulse">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <line x1="9" y1="6" x2="15" y2="6" />
    <line x1="9" y1="10" x2="15" y2="10" />
    <line x1="9" y1="14" x2="15" y2="14" />
  </svg>
);

function SearchableTaskDropdown({ tasks, selectedTaskId, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const filteredTasks = tasks.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white text-left focus:border-amber-500/50 transition-colors"
      >
        <span className="truncate">{selectedTask ? selectedTask.name : 'No task connected'}</span>
        <Icons.ChevronDown size={14} className="text-slate-400 flex-shrink-0 ml-1" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-[260px] flex flex-col">
          <input
            type="text"
            placeholder="Search task..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border-b border-slate-700 px-3 py-2 text-sm text-white focus:outline-none placeholder-slate-500"
            autoFocus
          />
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <button
              type="button"
              onClick={() => { onSelect('', ''); setIsOpen(false); }}
              className="w-full px-3 py-2 text-xs text-slate-400 hover:bg-slate-850 hover:text-white text-left transition-colors border-b border-slate-800"
            >
              None (No task)
            </button>
            {filteredTasks.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => { onSelect(t.id, t.name); setIsOpen(false); }}
                className={`w-full px-3 py-2 text-xs text-left transition-colors truncate
                  ${t.id === selectedTaskId ? 'bg-amber-600/30 text-amber-300 font-medium' : 'text-slate-200 hover:bg-slate-800'}`}
              >
                {t.name}
              </button>
            ))}
            {filteredTasks.length === 0 && (
              <div className="px-3 py-3 text-xs text-slate-500 italic text-center">No tasks found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotesModule({ notes, saveNote, deleteNote, templates, completions, prefilledNote, clearPrefilledNote }) {
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'month' | 'task'
  const [selectedTaskFilter, setSelectedTaskFilter] = useState('');
  
  // Editor form states
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDate, setNoteDate] = useState(today());
  const [noteTaskId, setNoteTaskId] = useState('');
  const [noteTaskName, setNoteTaskName] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving' | 'unsaved'

  // Handle prefilled note from other screens
  useEffect(() => {
    if (prefilledNote) {
      if (prefilledNote.noteId) {
        setActiveNoteId(prefilledNote.noteId);
      } else {
        const existing = (notes || []).find(n => n.date === prefilledNote.date && n.taskId === prefilledNote.taskId);
        if (existing) {
          setActiveNoteId(existing.id);
        } else {
          const newId = uid();
          const dm = prefilledNote.date.substring(0, 7);
          const tmpl = templates[dm] || [];
          const task = tmpl.find(t => t.id === prefilledNote.taskId);
          const taskName = task ? task.name : '';
          
          const newNote = {
            id: newId,
            title: '',
            body: prefilledNote.body || '',
            taskId: prefilledNote.taskId || '',
            taskName: taskName,
            date: prefilledNote.date,
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          
          saveNote(newNote);
          setActiveNoteId(newId);
        }
      }
      clearPrefilledNote();
    }
  }, [prefilledNote, notes, templates, saveNote, clearPrefilledNote]);

  // Load active note into editor states
  const activeNote = (notes || []).find(n => n.id === activeNoteId);

  useEffect(() => {
    if (activeNote) {
      setNoteTitle(activeNote.title || '');
      setNoteDate(activeNote.date || today());
      setNoteTaskId(activeNote.taskId || '');
      setNoteTaskName(activeNote.taskName || '');
      setNoteBody(activeNote.body || '');
      setSaveStatus('saved');
    } else {
      setNoteTitle('');
      setNoteDate(today());
      setNoteTaskId('');
      setNoteTaskName('');
      setNoteBody('');
      setSaveStatus('saved');
    }
  }, [activeNoteId, activeNote]);

  // Auto-save logic (1.5 seconds of inactivity)
  useEffect(() => {
    if (saveStatus !== 'unsaved') return;
    const timer = setTimeout(() => {
      setSaveStatus('saving');
      handleSave();
    }, 1500);
    return () => clearTimeout(timer);
  }, [noteTitle, noteDate, noteTaskId, noteTaskName, noteBody, saveStatus]);

  const handleFieldChange = (setter, value) => {
    setter(value);
    setSaveStatus('unsaved');
  };

  const handleSave = () => {
    if (!activeNoteId || !activeNote) return;
    const updatedNote = {
      ...activeNote,
      title: noteTitle.trim(),
      body: noteBody,
      taskId: noteTaskId,
      taskName: noteTaskName,
      date: noteDate,
      updatedAt: Date.now()
    };
    saveNote(updatedNote);
    setSaveStatus('saved');
  };

  const handleDelete = () => {
    if (!activeNoteId) return;
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(activeNoteId);
      setActiveNoteId(null);
    }
  };

  const handleNewNote = () => {
    if (saveStatus === 'unsaved') {
      handleSave();
    }
    const newId = uid();
    const newNote = {
      id: newId,
      title: '',
      body: '',
      taskId: '',
      taskName: '',
      date: today(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    saveNote(newNote);
    setActiveNoteId(newId);
  };

  // Get tasks for the selected note month (to populate dropdown)
  const availableTasks = useMemo(() => {
    if (!noteDate) return [];
    const dm = noteDate.substring(0, 7);
    return templates[dm] || [];
  }, [noteDate, templates]);

  // Compute unique tasks with notes for the By Task filter
  const uniqueTasksWithNotes = useMemo(() => {
    const map = {};
    (notes || []).forEach(n => {
      if (n.taskId && n.taskName) {
        map[n.taskId] = n.taskName;
      }
    });
    return Object.entries(map).map(([id, name]) => ({ id, name }));
  }, [notes]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    let result = [...(notes || [])];

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(n => 
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.taskName && n.taskName.toLowerCase().includes(q)) ||
        (n.body && n.body.toLowerCase().includes(q))
      );
    }

    // Chip filter
    if (filter === 'month') {
      const currentMonthStr = today().substring(0, 7); // "YYYY-MM"
      result = result.filter(n => n.date && n.date.substring(0, 7) === currentMonthStr);
    } else if (filter === 'task' && selectedTaskFilter) {
      result = result.filter(n => n.taskId === selectedTaskFilter);
    }

    // Sort by updatedAt descending
    result.sort((a, b) => b.updatedAt - a.updatedAt);
    return result;
  }, [notes, search, filter, selectedTaskFilter]);

  const handleSelectTask = (taskId, taskName) => {
    handleFieldChange(setNoteTaskId, taskId);
    setNoteTaskName(taskName);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-fade-in min-h-[calc(100vh-120px)]">
      {/* Left panel */}
      <div className="w-full md:w-[35%] flex flex-col gap-4">
        {/* search and buttons */}
        <div className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-white">My Notes</h2>
            <button
              onClick={handleNewNote}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors shadow-sm shadow-amber-500/20"
            >
              <Icons.Plus size={14} /> New Note
            </button>
          </div>
          
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-amber-500/50 transition-colors focus:outline-none"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Icons.Search size={14} />
            </div>
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['all', 'month', 'task'].map(type => {
              const label = type === 'all' ? 'All' : type === 'month' ? 'This Month' : 'By Task';
              const active = filter === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => { setFilter(type); if (type !== 'task') setSelectedTaskFilter(''); }}
                  className={`text-[10px] px-2.5 py-1 rounded-full border transition-all font-medium
                    ${active
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/10'
                      : 'bg-slate-800/40 border-slate-700/30 text-slate-500 hover:text-slate-400'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* By Task select */}
          {filter === 'task' && (
            <select
              value={selectedTaskFilter}
              onChange={(e) => setSelectedTaskFilter(e.target.value)}
              className="w-full bg-slate-850 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="">-- Select Task --</option>
              {uniqueTasksWithNotes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Scrollable list */}
        <div className="glass rounded-xl p-4 flex-1 overflow-y-auto max-h-[500px] md:max-h-[calc(100vh-280px)] space-y-2 custom-scrollbar">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs italic">
              No notes found.
            </div>
          ) : (
            filteredNotes.map(n => {
              // Left border color check
              const hasTask = !!n.taskId;
              const completed = hasTask && completions[n.date]?.[n.taskId];
              const borderClass = hasTask 
                ? (completed ? 'border-l-4 border-emerald-500' : 'border-l-4 border-amber-500')
                : 'border-l-4 border-slate-700';

              const titleText = n.title || n.body.split('\n')[0] || 'Untitled Note';
              const previewText = n.body.split('\n').slice(n.title ? 0 : 1).filter(line => line.trim()).slice(0, 2).join(' ') || n.body;

              return (
                <button
                  key={n.id}
                  onClick={() => {
                    if (saveStatus === 'unsaved' && activeNoteId && activeNoteId !== n.id) {
                      handleSave();
                    }
                    setActiveNoteId(n.id);
                  }}
                  className={`w-full text-left p-3 rounded-lg hover:bg-slate-800/50 transition-all duration-150 flex flex-col gap-1.5 border border-slate-800/40
                    ${activeNoteId === n.id ? 'bg-slate-800/80 border-slate-700/50 ring-1 ring-slate-700/30' : 'bg-slate-900/40'}
                    ${borderClass}`}
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <h4 className="text-sm font-semibold text-white truncate flex-1">{titleText}</h4>
                    <span className="text-[10px] text-slate-500 flex-shrink-0">{fmtReadable(n.date)}</span>
                  </div>
                  {previewText && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{previewText}</p>
                  )}
                  {n.taskName && (
                    <span className="inline-block text-[9px] bg-violet-500/10 text-violet-300 border border-violet-500/20 px-1.5 py-0.5 rounded self-start mt-1">
                      {n.taskName}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full md:w-[65%] flex">
        {activeNoteId ? (
          <div className="glass rounded-xl p-6 flex flex-col gap-4 w-full animate-slide-in">
            {/* Header info & actions */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-700/40 pb-4">
              <div className="flex items-center gap-2">
                {saveStatus === 'saved' && <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full"><Icons.Check size={12} /> Saved</span>}
                {saveStatus === 'saving' && <span className="text-xs text-slate-400 flex items-center gap-1 font-medium bg-slate-500/10 px-2 py-0.5 rounded-full">Saving...</span>}
                {saveStatus === 'unsaved' && <span className="text-xs text-amber-400 flex items-center gap-1 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full">Unsaved changes</span>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-xs bg-rose-600/20 hover:bg-rose-600/45 text-rose-400 font-semibold rounded-lg transition-colors border border-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4 flex-1 flex flex-col">
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => handleFieldChange(setNoteTitle, e.target.value)}
                placeholder="Untitled Note"
                className="w-full bg-transparent text-xl font-bold text-white placeholder-slate-600 border-none outline-none focus:ring-0 focus:outline-none"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date connection */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-slate-500">Connect to Date</label>
                  <input
                    type="date"
                    value={noteDate}
                    onChange={(e) => handleFieldChange(setNoteDate, e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500/50 transition-colors focus:outline-none"
                  />
                </div>

                {/* Task connection */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-semibold text-slate-500">Connect to Task</label>
                  <SearchableTaskDropdown
                    tasks={availableTasks}
                    selectedTaskId={noteTaskId}
                    onSelect={handleSelectTask}
                  />
                </div>
              </div>

              {/* Textarea */}
              <div className="flex-1 flex flex-col min-h-[300px] mt-2 relative">
                <textarea
                  value={noteBody}
                  onChange={(e) => handleFieldChange(setNoteBody, e.target.value)}
                  placeholder="Start writing..."
                  className="w-full flex-1 bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 resize-none font-mono focus:border-amber-500/30 transition-colors focus:outline-none leading-relaxed"
                />
                <span className="absolute bottom-3 right-4 text-[10px] text-slate-500 font-mono">
                  {noteBody.length} characters
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-xl flex flex-col items-center justify-center py-20 px-4 w-full">
            <NotebookIllustration />
            <h3 className="text-lg font-semibold text-slate-400 mb-1">No Note Selected</h3>
            <p className="text-sm text-slate-500 text-center max-w-xs leading-relaxed">Select a note from the list or create a new one to start writing.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SECTION 6.6 — LOADERS, SKELETONS & ERROR SCREENS
// ============================================================

function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy-900 animate-fade-in">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-16 h-16 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
        <div className="absolute w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Icons.Tasks size={16} className="text-white" />
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-400">Loading TaskTracker...</p>
    </div>
  );
}

function FullPageError({ onRetry }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy-900 animate-fade-in p-6 text-center">
      <svg className="w-16 h-16 text-rose-500 mb-4 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <h3 className="text-xl font-bold text-white mb-2">Connection Failed</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">We were unable to load your data from the server. Please check your internet connection and try again.</p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-violet-500/25 active:scale-95"
      >
        Retry Connection
      </button>
    </div>
  );
}

const GoogleLogo = () => (
  <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

function LoginScreen({ onLogin }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950 p-4 overflow-hidden">
      {/* Floating background mesh bubbles */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-float-slower" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl animate-fade-in text-center flex flex-col items-center">
        {/* App Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-6">
          <Icons.Tasks size={32} className="text-white" />
        </div>

        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent mb-2">
          TaskTracker
        </h1>
        <p className="text-sm text-slate-400 mb-8 font-medium">
          Track your tasks. Own your progress.
        </p>

        <button
          onClick={onLogin}
          className="flex items-center justify-center w-full px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl transition-all duration-200 border border-slate-200 shadow-md shadow-white/5 active:scale-95"
        >
          <GoogleLogo />
          Continue with Google
        </button>
      </div>
      
      {/* Inject custom floats into global styles */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        @keyframes floatSlower {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(20px) scale(0.95); }
        }
        .animate-float-slow { animation: floatSlow 8s ease-in-out infinite; }
        .animate-float-slower { animation: floatSlower 12s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function MyTasksSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-6 w-36 bg-slate-800 rounded" />
          <div className="h-4 w-20 bg-slate-800 rounded" />
        </div>
        <div className="h-10 w-28 bg-slate-800 rounded-xl" />
      </div>
      <div className="h-14 w-full bg-slate-800 rounded-xl" />
      <div className="space-y-3">
        <div className="h-16 w-full bg-slate-800 rounded-xl" />
        <div className="h-16 w-full bg-slate-800 rounded-xl" />
        <div className="h-16 w-full bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
}

function MonthlyTrackerSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-6 w-40 bg-slate-800 rounded" />
          <div className="h-4 w-24 bg-slate-800 rounded" />
        </div>
        <div className="h-10 w-48 bg-slate-800 rounded-lg" />
      </div>
      <div className="h-24 w-full bg-slate-800 rounded-xl" />
      <div className="h-12 w-full bg-slate-800 rounded-xl" />
      <div className="h-64 w-full bg-slate-800 rounded-xl" />
    </div>
  );
}

function NotesSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-6 animate-pulse min-h-[calc(100vh-120px)]">
      <div className="w-full md:w-[35%] space-y-4">
        <div className="h-28 w-full bg-slate-800 rounded-xl" />
        <div className="h-[350px] w-full bg-slate-800 rounded-xl" />
      </div>
      <div className="w-full md:w-[65%] bg-slate-800 rounded-xl h-[450px]" />
    </div>
  );
}

// ============================================================
// SECTION 7 — MAIN APP COMPONENT
// ============================================================

export default function App() {
  const [activeModule, setActiveModule] = useState('tasks');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1024);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [readError, setReadError] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Lifted React State
  const [tasks, setTasks] = useState([]);
  const [templates, setTemplates] = useState({});
  const [overrides, setOverrides] = useState({});
  const [completions, setCompletions] = useState({});
  const [notes, setNotes] = useState([]);
  const [prefilledNote, setPrefilledNote] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 3000);
  };

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    }, (err) => {
      console.error("Auth change error:", err);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  // Hydrate Data from Firestore
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setTemplates({});
      setOverrides({});
      setCompletions({});
      setNotes([]);
      setLoadingData(false);
      setReadError(false);
      return;
    }

    setLoadingData(true);
    setReadError(false);

    let unsubTasks = null;
    let unsubNotes = null;

    const loadData = async () => {
      try {
        const uid = user.uid;

        // 1. One-time fetch templates
        const templatesSnap = await getDocs(collection(db, 'users', uid, 'progress_templates'));
        const loadedTemplates = {};
        templatesSnap.forEach(doc => {
          loadedTemplates[doc.id] = doc.data().tasks || [];
        });
        setTemplates(loadedTemplates);

        // 2. One-time fetch overrides
        const overridesSnap = await getDocs(collection(db, 'users', uid, 'progress_overrides'));
        const loadedOverrides = {};
        overridesSnap.forEach(doc => {
          loadedOverrides[doc.id] = doc.data().tasks || [];
        });
        setOverrides(loadedOverrides);

        // 3. One-time fetch completions
        const completionsSnap = await getDocs(collection(db, 'users', uid, 'progress_completions'));
        const loadedCompletions = {};
        completionsSnap.forEach(doc => {
          loadedCompletions[doc.id] = doc.data().completions || {};
        });
        setCompletions(loadedCompletions);

        // 4. Real-time tasks sync
        unsubTasks = onSnapshot(collection(db, 'users', uid, 'my_tasks'), (snap) => {
          const loadedTasks = [];
          snap.forEach(doc => {
            loadedTasks.push(doc.data());
          });
          setTasks(loadedTasks);
        }, (err) => {
          console.error("Tasks sync failed:", err);
          showToast("Failed to sync tasks");
        });

        // 5. Real-time notes sync
        unsubNotes = onSnapshot(collection(db, 'users', uid, 'notes'), (snap) => {
          const loadedNotes = [];
          snap.forEach(doc => {
            loadedNotes.push(doc.data());
          });
          setNotes(loadedNotes);
        }, (err) => {
          console.error("Notes sync failed:", err);
          showToast("Failed to sync notes");
        });

        setLoadingData(false);
      } catch (err) {
        console.error("Firestore loading error:", err);
        setReadError(true);
        setLoadingData(false);
      }
    };

    loadData();

    return () => {
      if (unsubTasks) unsubTasks();
      if (unsubNotes) unsubNotes();
    };
  }, [user]);

  const handleRetry = () => {
    if (user) {
      setUser({ ...user });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google login failed:", err);
      showToast("Authentication failed. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Google logout failed:", err);
      showToast("Failed to sign out");
    }
  };

  // --- CRUD WRITES SCALED TO USER ---

  const saveMyTask = async (task) => {
    setTasks(prev => {
      const exists = prev.find(t => t.id === task.id);
      return exists ? prev.map(t => t.id === task.id ? task : t) : [...prev, task];
    });

    try {
      const taskRef = doc(db, 'users', user.uid, 'my_tasks', task.id);
      await setDoc(taskRef, task, { merge: true });
    } catch (err) {
      console.error("Firestore saveMyTask error:", err);
      showToast("Failed to save. Retrying...");
    }
  };

  const deleteMyTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'my_tasks', id));
    } catch (err) {
      console.error("Firestore deleteMyTask error:", err);
      showToast("Failed to delete task");
    }
  };

  const toggleMyTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updated = {
      ...task,
      status: task.status === 'Done' ? 'Pending' : 'Done'
    };

    setTasks(prev => prev.map(t => t.id === id ? updated : t));

    try {
      await setDoc(doc(db, 'users', user.uid, 'my_tasks', id), updated, { merge: true });
    } catch (err) {
      console.error("Firestore toggleMyTask error:", err);
      showToast("Failed to save. Retrying...");
    }
  };

  const saveTemplate = async (monthKey, newTemplate) => {
    setTemplates(prev => ({ ...prev, [monthKey]: newTemplate }));
    try {
      await setDoc(doc(db, 'users', user.uid, 'progress_templates', monthKey), { tasks: newTemplate }, { merge: true });
    } catch (err) {
      console.error("Firestore saveTemplate error:", err);
      showToast("Failed to save. Retrying...");
    }
  };

  const saveOverride = async (dateStr, newOverride) => {
    setOverrides(prev => ({ ...prev, [dateStr]: newOverride }));
    try {
      await setDoc(doc(db, 'users', user.uid, 'progress_overrides', dateStr), { tasks: newOverride }, { merge: true });
    } catch (err) {
      console.error("Firestore saveOverride error:", err);
      showToast("Failed to save. Retrying...");
    }
  };

  const saveCompletions = async (dateStr, newCompletions) => {
    setCompletions(prev => ({ ...prev, [dateStr]: newCompletions }));
    try {
      await setDoc(doc(db, 'users', user.uid, 'progress_completions', dateStr), { completions: newCompletions }, { merge: true });
    } catch (err) {
      console.error("Firestore saveCompletions error:", err);
      showToast("Failed to save. Retrying...");
    }
  };

  const saveNoteFromTracker = async (key, text) => {
    const parts = key.split('-');
    const dateStr = `${parts[0]}-${parts[1]}-${parts[2]}`;
    const taskId = parts.slice(3).join('-');

    const existing = (notes || []).find(n => n.date === dateStr && n.taskId === taskId);

    if (!text.trim()) {
      if (existing) {
        setNotes(prev => (prev || []).filter(n => n.id !== existing.id));
        try {
          await deleteDoc(doc(db, 'users', user.uid, 'notes', existing.id));
        } catch (err) {
          console.error("Delete note error:", err);
          showToast("Failed to delete note");
        }
      }
      return;
    }

    const dm = dateStr.substring(0, 7);
    const tmpl = templates[dm] || [];
    const task = tmpl.find(t => t.id === taskId);
    const taskName = task ? task.name : 'Quick Note Task';

    const updatedNote = {
      id: existing ? existing.id : uid(),
      title: existing ? existing.title : '',
      body: text.trim(),
      taskId: taskId,
      taskName: taskName,
      date: dateStr,
      createdAt: existing ? existing.createdAt : Date.now(),
      updatedAt: Date.now()
    };

    setNotes(prev => {
      const idx = (prev || []).findIndex(n => n.id === updatedNote.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = updatedNote;
        return next;
      } else {
        return [updatedNote, ...prev];
      }
    });

    try {
      await setDoc(doc(db, 'users', user.uid, 'notes', updatedNote.id), updatedNote, { merge: true });
    } catch (err) {
      console.error("Firestore saveNote error:", err);
      showToast("Failed to save. Retrying...");
    }
  };

  const saveNote = async (note) => {
    setNotes(prev => {
      const idx = (prev || []).findIndex(n => n.id === note.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = note;
        return next;
      } else {
        return [note, ...prev];
      }
    });

    try {
      await setDoc(doc(db, 'users', user.uid, 'notes', note.id), note, { merge: true });
    } catch (err) {
      console.error("Firestore saveNote error:", err);
      showToast("Failed to save note. Retrying...");
    }
  };

  const deleteNote = async (id) => {
    setNotes(prev => (prev || []).filter(n => n.id !== id));
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'notes', id));
    } catch (err) {
      console.error("Firestore deleteNote error:", err);
      showToast("Failed to delete note");
    }
  };

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (authLoading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <LoginScreen onLogin={handleGoogleSignIn} />;
  }

  if (readError) {
    return <FullPageError onRetry={handleRetry} />;
  }

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Sidebar */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 flex items-center px-4 z-20">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
        >
          <Icons.Menu />
        </button>
        <span className="ml-3 text-lg font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          TaskTracker
        </span>
      </div>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} pt-14 lg:pt-0`}
      >
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {loadingData ? (
            <>
              {activeModule === 'tasks' && <MyTasksSkeleton />}
              {activeModule === 'tracker' && <MonthlyTrackerSkeleton />}
              {activeModule === 'notes' && <NotesSkeleton />}
            </>
          ) : (
            <>
              {activeModule === 'tasks' && (
                <MyTasks
                  tasks={tasks}
                  saveTask={saveMyTask}
                  deleteTask={deleteMyTask}
                  toggleTask={toggleMyTask}
                />
              )}
              {activeModule === 'tracker' && (
                <MonthlyTracker
                  templates={templates}
                  setTemplates={saveTemplate}
                  overrides={overrides}
                  setOverrides={saveOverride}
                  completions={completions}
                  setCompletions={saveCompletions}
                  notes={notes}
                  saveNote={saveNoteFromTracker}
                  onOpenInNotesPage={(date, taskId, body) => {
                    setPrefilledNote({ date, taskId, body });
                    setActiveModule('notes');
                  }}
                  onSelectNoteAndNavigate={(noteId) => {
                    setPrefilledNote({ noteId });
                    setActiveModule('notes');
                  }}
                />
              )}
              {activeModule === 'notes' && (
                <NotesModule
                  notes={notes}
                  saveNote={saveNote}
                  deleteNote={deleteNote}
                  templates={templates}
                  completions={completions}
                  prefilledNote={prefilledNote}
                  clearPrefilledNote={() => setPrefilledNote(null)}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Toast Alert popup */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-rose-600/95 border border-rose-500 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg shadow-rose-950/40 animate-slide-in">
          {toastMessage}
        </div>
      )}

      {/* Global CSS for animations not in Tailwind config */}
      <style>{`
        @keyframes slideFromRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        /* Fix search icon positioning */
        .search-wrapper { position: relative; }
        .search-wrapper svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); }
      `}</style>
    </div>
  );
}
