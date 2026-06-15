import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { TagPill } from '../ui/TagPill';
import { displayPhotoUrl } from '../../data/library';
import type { Recipe } from '../../types';

interface RecipeCardProps {
  recipe: Recipe;
  favorite?: boolean;
}

export function RecipeCard({ recipe, favorite = false }: RecipeCardProps) {
  const photo = displayPhotoUrl(recipe);
  const protein = recipe.macros?.protein;

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm active:bg-gray-50"
    >
      <img src={photo} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate font-semibold text-gray-900">
          {favorite && <Heart size={14} className="shrink-0 fill-rose-500 text-rose-500" />}
          {recipe.name}
        </p>
        <p className="text-xs text-gray-500">
          {recipe.ingredients.length} ingredient
          {recipe.ingredients.length === 1 ? '' : 's'} · {recipe.servings} serving
          {recipe.servings === 1 ? '' : 's'}
          {protein != null && ` · ${protein}g protein`}
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
