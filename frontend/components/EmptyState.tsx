import React from 'react';
import { LucideIcon, FolderSearch } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-700 mb-4 shadow-sm">
        <Icon size={28} />
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mt-1 mb-5">{description}</p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn-primary text-sm py-2 px-4">
          {actionText}
        </button>
      )}
    </div>
  );
}
