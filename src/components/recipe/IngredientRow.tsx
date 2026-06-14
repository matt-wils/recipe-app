import { Trash2 } from 'lucide-react';
import { Input } from '../ui/Input';
import type { Ingredient } from '../../types';

interface IngredientRowProps {
  ingredient: Ingredient;
  onChange: (next: Ingredient) => void;
  onRemove: () => void;
}

export function IngredientRow({ ingredient, onChange, onRemove }: IngredientRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          aria-label="Ingredient name"
          className="flex-1"
          placeholder="Ingredient"
          value={ingredient.name}
          onChange={(e) => onChange({ ...ingredient, name: e.target.value })}
        />
        <button
          type="button"
          aria-label="Remove ingredient"
          onClick={onRemove}
          className="flex w-10 shrink-0 items-center justify-center rounded-xl text-gray-400 active:bg-gray-100"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <div className="flex gap-2">
        <Input
          aria-label="Amount"
          type="number"
          inputMode="decimal"
          className="w-24"
          placeholder="Qty"
          value={ingredient.amount === 0 ? '' : ingredient.amount}
          onChange={(e) => onChange({ ...ingredient, amount: parseFloat(e.target.value) || 0 })}
        />
        <Input
          aria-label="Unit"
          className="w-24"
          placeholder="Unit"
          value={ingredient.unit}
          onChange={(e) => onChange({ ...ingredient, unit: e.target.value })}
        />
      </div>
    </div>
  );
}
