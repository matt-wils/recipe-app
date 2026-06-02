import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { RecipeCard } from '../components/recipe/RecipeCard';
import { SortControl } from '../components/ui/SortControl';
import { TagPill } from '../components/ui/TagPill';
import { EmptyState } from '../components/ui/EmptyState';
import { useRecipes } from '../hooks/useRecipes';
import { sortRecipes } from '../utils/sortRecipes';
import type { SortField, SortOrder } from '../types';

export function RecipeListPage() {
  const { recipes, loading } = useRecipes();
  const [field, setField] = useState<SortField>('createdAt');
  const [order, setOrder] = useState<SortOrder>('desc');
  const [params, setParams] = useSearchParams();
  const activeTag = params.get('tag');

  const allTags = useMemo(
    () => Array.from(new Set(recipes.flatMap((r) => r.tags))).sort(),
    [recipes],
  );

  const visible = useMemo(() => {
    const filtered = activeTag
      ? recipes.filter((r) => r.tags.includes(activeTag))
      : recipes;
    return sortRecipes(filtered, field, order);
  }, [recipes, activeTag, field, order]);

  const toggleTag = (tag: string) => {
    setParams(activeTag === tag ? {} : { tag });
  };

  return (
    <>
      <PageHeader
        title="My Recipes"
        action={
          <Link
            to="/recipe/new"
            aria-label="Add recipe"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white active:bg-emerald-700"
          >
            <Plus size={22} />
          </Link>
        }
      />

      {!loading && recipes.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={40} />}
          title="No recipes yet"
          message="Tap the + button to add your first recipe."
        />
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

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((t) => (
                <TagPill key={t} active={activeTag === t} onClick={() => toggleTag(t)}>
                  {t}
                </TagPill>
              ))}
            </div>
          )}

          {visible.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}
    </>
  );
}
