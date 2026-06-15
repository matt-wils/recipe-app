import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { RecipeCard } from '../components/recipe/RecipeCard';
import { SortControl } from '../components/ui/SortControl';
import { TagPill } from '../components/ui/TagPill';
import { EmptyState } from '../components/ui/EmptyState';
import { useRecipes } from '../hooks/useRecipes';
import { useRecipeState } from '../hooks/useRecipeState';
import { sortRecipes } from '../utils/sortRecipes';
import { TAG_DIMENSION_ORDER, TAG_DIMENSIONS } from '../data/tags';
import type { SortField, SortOrder } from '../types';

export function RecipeListPage() {
  const { recipes } = useRecipes();
  const { lastCooked, favorites } = useRecipeState();
  const [field, setField] = useState<SortField>('name');
  const [order, setOrder] = useState<SortOrder>('asc');
  const [params, setParams] = useSearchParams();
  const activeTag = params.get('tag');

  // Tags grouped by dimension (meal → cuisine → protein → effort) rather than a
  // flat A→Z list, so meals read breakfast→dinner. Only render dimensions/tags
  // that some recipe actually uses.
  const tagGroups = useMemo(() => {
    const used = new Set(recipes.flatMap((r) => r.tags));
    return TAG_DIMENSION_ORDER.map((dim) => ({
      dim,
      tags: TAG_DIMENSIONS[dim].filter((t) => used.has(t)),
    })).filter((g) => g.tags.length > 0);
  }, [recipes]);

  const visible = useMemo(() => {
    const filtered = activeTag ? recipes.filter((r) => r.tags.includes(activeTag)) : recipes;
    return sortRecipes(filtered, field, order, lastCooked);
  }, [recipes, activeTag, field, order, lastCooked]);

  const toggleTag = (tag: string) => {
    setParams(activeTag === tag ? {} : { tag });
  };

  return (
    <>
      <PageHeader
        title="Browse"
        action={
          <Link
            to="/common"
            aria-label="Ingredient frequency"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 active:bg-gray-100"
          >
            <BarChart3 size={20} />
          </Link>
        }
      />

      {recipes.length === 0 ? (
        <EmptyState title="No recipes" message="Add recipes to recipes.yaml." />
      ) : (
        <div className="flex flex-col gap-3 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {visible.length} recipe{visible.length === 1 ? '' : 's'}
            </span>
            <SortControl
              field={field}
              order={order}
              onChange={(f, o) => {
                setField(f);
                setOrder(o);
              }}
            />
          </div>

          {tagGroups.length > 0 && (
            <div className="flex flex-col gap-2">
              {tagGroups.map(({ dim, tags }) => (
                <div key={dim}>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {dim}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <TagPill key={t} active={activeTag === t} onClick={() => toggleTag(t)}>
                        {t}
                      </TagPill>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {visible.map((r) => (
            <RecipeCard key={r.id} recipe={r} favorite={favorites.has(r.id)} />
          ))}
        </div>
      )}
    </>
  );
}
