import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shuffle, Check, ChefHat, SlidersHorizontal } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { TagPill } from '../components/ui/TagPill';
import { EmptyState } from '../components/ui/EmptyState';
import { useRecipes } from '../hooks/useRecipes';
import { useRecipeState } from '../hooks/useRecipeState';
import { pickRecipe, type ShuffleFilters } from '../utils/shuffle';
import { photoUrl } from '../data/library';
import { TAG_DIMENSION_ORDER, TAG_DIMENSIONS, GERD_LEVELS, GERD_LABELS } from '../data/tags';
import type { GerdLevel, Recipe } from '../types';

export function HomePage() {
  const { recipes } = useRecipes();
  const { lastCooked, markCooked } = useRecipeState();
  const [filters, setFilters] = useState<ShuffleFilters>({ tags: [], gerd: [] });
  const [showFilters, setShowFilters] = useState(false);
  const [pick, setPick] = useState<Recipe | undefined>();
  const [justCooked, setJustCooked] = useState(false);

  // Only offer facet chips for tags actually present in the library.
  const availableTags = useMemo(() => new Set(recipes.flatMap((r) => r.tags)), [recipes]);

  const shuffle = useCallback(() => {
    setJustCooked(false);
    setPick(pickRecipe(recipes, lastCooked, filters));
  }, [recipes, lastCooked, filters]);

  // Pick on first load and whenever the filters change.
  useEffect(() => {
    setJustCooked(false);
    setPick(pickRecipe(recipes, lastCooked, filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, recipes]);

  const toggleTag = (tag: string) =>
    setFilters((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));

  const toggleGerd = (level: GerdLevel) =>
    setFilters((f) => ({
      ...f,
      gerd: f.gerd.includes(level) ? f.gerd.filter((g) => g !== level) : [...f.gerd, level],
    }));

  const onMadeIt = async () => {
    if (!pick) return;
    await markCooked(pick.id);
    setJustCooked(true);
  };

  const activeFilterCount = filters.tags.length + filters.gerd.length;

  return (
    <>
      <PageHeader
        title="Tonight"
        action={
          <button
            aria-label="Filters"
            onClick={() => setShowFilters((s) => !s)}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full active:bg-gray-100 ${
              activeFilterCount > 0 ? 'text-emerald-600' : 'text-gray-600'
            }`}
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-600" />
            )}
          </button>
        }
      />

      <div className="flex flex-col gap-4 p-4">
        {showFilters && (
          <div className="flex flex-col gap-3 rounded-xl bg-white p-3 shadow-sm">
            {TAG_DIMENSION_ORDER.map((dim) => {
              const tags = TAG_DIMENSIONS[dim].filter((t) => availableTags.has(t));
              if (tags.length === 0) return null;
              return (
                <div key={dim}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {dim}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <TagPill
                        key={t}
                        active={filters.tags.includes(t)}
                        onClick={() => toggleTag(t)}
                      >
                        {t}
                      </TagPill>
                    ))}
                  </div>
                </div>
              );
            })}
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                reflux
              </p>
              <div className="flex flex-wrap gap-1.5">
                {GERD_LEVELS.map((level) => (
                  <TagPill
                    key={level}
                    active={filters.gerd.includes(level)}
                    onClick={() => toggleGerd(level)}
                  >
                    {GERD_LABELS[level]}
                  </TagPill>
                ))}
              </div>
            </div>
          </div>
        )}

        {pick ? (
          <PickCard recipe={pick} justCooked={justCooked} onMadeIt={onMadeIt} onShuffle={shuffle} />
        ) : (
          <EmptyState
            icon={<ChefHat size={40} />}
            title="Nothing matches"
            message={
              activeFilterCount > 0
                ? 'No recipes fit those filters. Try loosening them.'
                : 'Add recipes to recipes.yaml to get started.'
            }
          />
        )}
      </div>
    </>
  );
}

function PickCard({
  recipe,
  justCooked,
  onMadeIt,
  onShuffle,
}: {
  recipe: Recipe;
  justCooked: boolean;
  onMadeIt: () => void;
  onShuffle: () => void;
}) {
  const photo = photoUrl(recipe);
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm">
      {photo && (
        <img src={photo} alt={recipe.name} className="h-48 w-full rounded-xl object-cover" />
      )}
      <div>
        <h2 className="text-2xl font-bold leading-tight">{recipe.name}</h2>
        {recipe.notes && <p className="mt-1 text-sm text-gray-600">{recipe.notes}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {recipe.tags.map((t) => (
          <TagPill key={t}>{t}</TagPill>
        ))}
      </div>

      {recipe.macros && (recipe.macros.calories != null || recipe.macros.protein != null) && (
        <p className="text-sm text-gray-500">
          {[
            recipe.macros.calories != null && `${recipe.macros.calories} cal`,
            recipe.macros.protein != null && `${recipe.macros.protein}g protein`,
          ]
            .filter(Boolean)
            .join(' · ')}{' '}
          per serving
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Link
          to={`/recipe/${recipe.id}`}
          className="flex h-12 items-center justify-center rounded-xl bg-emerald-600 font-semibold text-white active:bg-emerald-700"
        >
          Cook this
        </Link>
        <div className="flex gap-2">
          <button
            onClick={onMadeIt}
            disabled={justCooked}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-100 font-medium text-gray-700 active:bg-gray-200 disabled:text-emerald-700"
          >
            <Check size={18} /> {justCooked ? 'Logged!' : 'Made it'}
          </button>
          <button
            onClick={onShuffle}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-gray-100 font-medium text-gray-700 active:bg-gray-200"
          >
            <Shuffle size={18} /> Shuffle
          </button>
        </div>
      </div>
    </div>
  );
}
