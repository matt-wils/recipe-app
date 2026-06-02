import type { ReactNode } from 'react';

interface TagPillProps {
  children: ReactNode;
  onClick?: () => void;
  active?: boolean;
}

export function TagPill({ children, onClick, active = false }: TagPillProps) {
  const cls = active
    ? 'bg-emerald-600 text-white'
    : 'bg-emerald-50 text-emerald-700';
  return (
    <span
      onClick={onClick}
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${cls} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {children}
    </span>
  );
}
