import { Link } from 'react-router-dom';
import { Utensils } from 'lucide-react';
import { TagPill } from '../ui/TagPill';
import type { Recipe } from '../../types';

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm active:bg-gray-50"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-400">
        <Utensils size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-gray-900">{recipe.name}</p>
        <p className="text-xs text-gray-500">
          {recipe.ingredients.length} ingredient
          {recipe.ingredients.length === 1 ? '' : 's'} · {recipe.servings} serving
          {recipe.servings === 1 ? '' : 's'}
        </p>
        {recipe.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((t) => (
              <TagPill key={t}>{t}</TagPill>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
