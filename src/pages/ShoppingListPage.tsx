import { useEffect, useMemo, useState } from 'react';
import { Check, ShoppingCart, X } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useRecipes } from '../hooks/useRecipes';
import { useShoppingList } from '../hooks/useShoppingList';
import { aggregateShoppingList } from '../utils/shopping';

export function ShoppingListPage() {
  const { recipes } = useRecipes();
  const {
    entries,
    extras,
    checked,
    loading,
    removeRecipe,
    removeExtra,
    clear,
    toggleChecked,
    pruneChecked,
  } = useShoppingList();
  const [confirmClear, setConfirmClear] = useState(false);

  const byId = useMemo(() => new Map(recipes.map((r) => [r.id, r])), [recipes]);

  // Resolve stored entries to recipes (skip any whose recipe vanished from the
  // library) and aggregate into grouped, deduped shopping sections.
  const added = useMemo(
    () =>
      entries
        .map((e) => ({ recipe: byId.get(e.id), servings: e.servings }))
        .filter((a): a is { recipe: NonNullable<typeof a.recipe>; servings: number } =>
          Boolean(a.recipe),
        ),
    [entries, byId],
  );
  const sections = useMemo(() => aggregateShoppingList(added, extras), [added, extras]);

  // Once loaded, drop any checked keys whose item is no longer on the list, so a
  // removed-then-re-added ingredient can't come back pre-checked.
  const validKeys = useMemo(() => sections.flatMap((s) => s.items.map((it) => it.key)), [sections]);
  useEffect(() => {
    if (!loading) void pruneChecked(validKeys);
  }, [loading, validKeys, pruneChecked]);

  // Hold the empty state until the first load resolves, else it flashes on entry.
  if (loading) {
    return <PageHeader title="Shopping" />;
  }

  if (added.length === 0 && extras.length === 0) {
    return (
      <>
        <PageHeader title="Shopping" />
        <EmptyState
          icon={<ShoppingCart size={40} />}
          title="Your list is empty"
          message="Add a recipe from Tonight, or build a plate, to start your shopping list."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Shopping"
        action={
          <button
            onClick={() => setConfirmClear(true)}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-red-600 active:bg-red-50"
          >
            Clear
          </button>
        }
      />

      <div className="flex flex-col gap-5 p-4">
        {/* Contributing recipes (emerald) and plate components (amber) — removable. */}
        <div className="flex flex-wrap gap-1.5">
          {added.map(({ recipe }) => (
            <span
              key={recipe.id}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 py-1 pl-3 pr-1 text-xs font-medium text-emerald-700"
            >
              {recipe.name}
              <button
                aria-label={`Remove ${recipe.name}`}
                onClick={() => void removeRecipe(recipe.id)}
                className="flex h-5 w-5 items-center justify-center rounded-full active:bg-emerald-200"
              >
                <X size={13} />
              </button>
            </span>
          ))}
          {extras.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 rounded-full bg-amber-50 py-1 pl-3 pr-1 text-xs font-medium text-amber-700"
            >
              {name}
              <button
                aria-label={`Remove ${name}`}
                onClick={() => void removeExtra(name)}
                className="flex h-5 w-5 items-center justify-center rounded-full active:bg-amber-200"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>

        {sections.map((section) => (
          <section key={section.category}>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {section.category}
            </h2>
            <ul className="flex flex-col">
              {section.items.map((it) => {
                const isChecked = checked.has(it.key);
                return (
                  <li key={it.key}>
                    <button
                      onClick={() => void toggleChecked(it.key)}
                      className="flex w-full items-center gap-3 border-b border-gray-100 py-2.5 text-left active:bg-gray-50"
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          isChecked
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {isChecked && <Check size={14} />}
                      </span>
                      <span
                        className={`flex-1 ${isChecked ? 'text-gray-400 line-through' : 'text-gray-900'}`}
                      >
                        {it.label}
                      </span>
                      {it.summary && (
                        <span
                          className={`shrink-0 text-sm ${isChecked ? 'text-gray-300' : 'text-gray-500'}`}
                        >
                          {it.summary}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <Modal
        open={confirmClear}
        title="Clear shopping list?"
        onClose={() => setConfirmClear(false)}
      >
        <p className="mb-4 text-sm text-gray-600">
          This removes everything on your list — all recipes, plate items, and their ingredients.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmClear(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              void clear();
              setConfirmClear(false);
            }}
          >
            Clear list
          </Button>
        </div>
      </Modal>
    </>
  );
}
