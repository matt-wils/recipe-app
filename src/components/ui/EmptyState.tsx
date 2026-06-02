import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-gray-500">
      {icon}
      <p className="text-lg font-medium text-gray-700">{title}</p>
      {message && <p className="max-w-xs text-sm">{message}</p>}
      {action}
    </div>
  );
}
