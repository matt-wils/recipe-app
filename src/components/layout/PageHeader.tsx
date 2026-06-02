import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  back?: boolean;
  action?: ReactNode;
}

export function PageHeader({ title, back = false, action }: PageHeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-gray-200 bg-white/90 px-3 py-3 backdrop-blur safe-top">
      {back && (
        <button
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full active:bg-gray-100"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      <h1 className="flex-1 truncate text-xl font-bold">{title}</h1>
      {action}
    </header>
  );
}
