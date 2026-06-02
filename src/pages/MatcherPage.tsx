import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Textarea } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { useRecipes } from '../hooks/useRecipes';
import { computeMatches } from '../utils/matching';

export function MatcherPage() {
  const { recipes } = useRecipes();
  const [pantryText, setPantryText] = useState('');

  const pantry = useMemo(
    () =>
      pantryText
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean),
    [pantryText],
  );

  const matches = useMemo(() => computeMatches(pantry, recipes), [pantry, recipes]);

  return (
    <>
      <PageHeader title="What can I make?" />
      <div className="flex flex-col gap-4 p-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Ingredients you have
          </label>
          <Textarea
            rows={3}
            value={pantryText}
            onChange={(e) => setPantryText(e.target.value)}
            placeholder="eggs, flour, milk…"
          />
          <p className="mt-1 text-xs text-gray-500">Separate with commas or new lines.</p>
        </div>

        {pantry.length === 0 ? (
          <EmptyState
            icon={<Search size={36} />}
            title="Enter your ingredients"
            message="We'll rank recipes by how many you already have."
          />
        ) : matches.length === 0 ? (
          <EmptyState title="No matching recipes" />
        ) : (
          <ul className="flex flex-col gap-3">
            {matches.map(({ recipe, matchPercent, matchedCount, totalCount, missingIngredients }) => (
              <li key={recipe.id}>
                <Link
                  to={`/recipe/${recipe.id}`}
                  className="block rounded-xl bg-white p-3 shadow-sm active:bg-gray-50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{recipe.name}</span>
                    <span className="shrink-0 text-sm font-medium text-emerald-700">
                      {Math.round(matchPercent)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${matchPercent}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    Have {matchedCount}/{totalCount}.
                    {missingIngredients.length > 0 && (
                      <> Missing: {missingIngredients.join(', ')}</>
                    )}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
