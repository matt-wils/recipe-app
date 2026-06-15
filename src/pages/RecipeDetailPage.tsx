import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Check, ShoppingCart } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ServingScaler } from '../components/recipe/ServingScaler';
import { NotesView } from '../components/recipe/NotesView';
import { TagPill } from '../components/ui/TagPill';
import { EmptyState } from '../components/ui/EmptyState';
import { useRecipe } from '../hooks/useRecipe';
import { useRecipeState } from '../hooks/useRecipeState';
import { useShoppingList } from '../hooks/useShoppingList';
import { scaleAmount, formatAmount } from '../utils/scaling';
import { relativeDays } from '../utils/relativeTime';
import { GERD_LABELS } from '../data/tags';

export function RecipeDetailPage() {
  const { id } = useParams();
  const { recipe, photo } = useRecipe(id);
  const { favorites, lastCooked, toggleFavorite, markCooked } = useRecipeState();
  const { ids: shoppingIds, addRecipe, removeRecipe } = useShoppingList();
  const [servings, setServings] = useState<number | null>(null);

  if (!recipe) {
    return (
      <>
        <PageHeader title="Not found" back />
        <EmptyState title="Recipe not found" />
      </>
    );
  }

  const currentServings = servings ?? recipe.servings;
  const scalable = recipe.ingredients.some((ing) => ing.amount != null);
  const isFavorite = favorites.has(recipe.id);
  const onShoppingList = shoppingIds.has(recipe.id);
  const cookedAt = lastCooked[recipe.id];
  const macros = recipe.macros;

  return (
    <>
      <PageHeader
        title={recipe.name}
        back
        action={
          <button
            aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}
            onClick={() => void toggleFavorite(recipe.id)}
            className="flex h-10 w-10 items-center justify-center rounded-full active:bg-gray-100"
          >
            <Heart
              size={20}
              className={isFavorite ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}
            />
          </button>
        }
      />

      <div className="flex flex-col gap-5 p-4">
        {photo && (
          <img src={photo} alt={recipe.name} className="h-56 w-full rounded-xl object-cover" />
        )}

        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.map((t) => (
              <TagPill key={t}>{t}</TagPill>
            ))}
          </div>
        )}

        {(recipe.gerd || macros) && (
          <div className="flex flex-wrap gap-2 text-sm">
            {recipe.gerd && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                {GERD_LABELS[recipe.gerd]}
              </span>
            )}
            {macros && (macros.calories != null || macros.protein != null) && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                {[
                  macros.calories != null && `${macros.calories} cal`,
                  macros.protein != null && `${macros.protein}g protein`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={() => void markCooked(recipe.id)}
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 font-semibold text-white active:bg-emerald-700"
          >
            <Check size={18} /> Made it today
          </button>
          <button
            onClick={() =>
              void (onShoppingList
                ? removeRecipe(recipe.id)
                : addRecipe(recipe.id, currentServings))
            }
            className={`flex h-11 items-center justify-center gap-1.5 rounded-xl font-medium active:bg-gray-200 ${
              onShoppingList ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <ShoppingCart size={18} /> {onShoppingList ? 'On shopping list' : 'Add to list'}
          </button>
          {cookedAt && (
            <p className="text-center text-sm text-gray-500">
              Last cooked {relativeDays(cookedAt)}
            </p>
          )}
        </div>

        {scalable && <ServingScaler servings={currentServings} onChange={setServings} />}

        <section>
          <h2 className="mb-2 text-lg font-semibold">Ingredients</h2>
          <ul className="flex flex-col gap-1.5">
            {recipe.ingredients.map((ing, i) => {
              const amount =
                ing.amount != null
                  ? scaleAmount(ing.amount, recipe.servings, currentServings)
                  : undefined;
              return (
                <li key={i} className="flex justify-between gap-3 border-b border-gray-100 py-1.5">
                  <span>{ing.name}</span>
                  {amount != null && (
                    <span className="shrink-0 text-gray-600">
                      {formatAmount(amount)} {ing.unit}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {recipe.notes && (
          <section>
            <h2 className="mb-2 text-lg font-semibold">Notes</h2>
            <NotesView notes={recipe.notes} />
          </section>
        )}
      </div>
    </>
  );
}
