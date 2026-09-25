import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'subject' | 'room' | 'role';
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, type = 'status', size = 'sm' }: StatusBadgeProps) {
  const s = (status || '').toUpperCase();
  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  let colorClasses = 'bg-gray-100 text-gray-700 border-gray-200';

  if (s === 'PUBLISHED') {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
  } else if (s === 'DRAFT') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (s === 'ARCHIVED') {
    colorClasses = 'bg-slate-100 text-slate-600 border-slate-200';
  } else if (s === 'LAB') {
    colorClasses = 'bg-teal-50 text-teal-800 border-teal-200 font-medium';
  } else if (s === 'THEORY') {
    colorClasses = 'bg-blue-50 text-blue-800 border-blue-200 font-medium';
  } else if (s === 'ADMIN') {
    colorClasses = 'bg-green-100 text-green-900 border-green-300 font-bold';
  } else if (s === 'FACULTY') {
    colorClasses = 'bg-indigo-50 text-indigo-800 border-indigo-200 font-semibold';
  } else if (s === 'STUDENT') {
    colorClasses = 'bg-sky-50 text-sky-800 border-sky-200 font-semibold';
  } else if (s === 'CLASSROOM') {
    colorClasses = 'bg-slate-50 text-slate-700 border-slate-200';
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${padding} ${colorClasses} tracking-tight`}>
      {s === 'PUBLISHED' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>}
      {s === 'DRAFT' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>}
      {status}
    </span>
  );
}
