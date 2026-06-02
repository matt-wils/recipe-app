import { Minus, Plus } from 'lucide-react';

interface ServingScalerProps {
  servings: number;
  onChange: (servings: number) => void;
}

export function ServingScaler({ servings, onChange }: ServingScalerProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">Servings</span>
      <div className="flex items-center gap-3 rounded-full bg-gray-100 px-2 py-1">
        <button
          type="button"
          aria-label="Decrease servings"
          onClick={() => onChange(Math.max(1, servings - 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white active:bg-gray-200"
        >
          <Minus size={16} />
        </button>
        <span className="w-6 text-center font-semibold" aria-label="Servings count">
          {servings}
        </span>
        <button
          type="button"
          aria-label="Increase servings"
          onClick={() => onChange(servings + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white active:bg-gray-200"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
