import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { useRecipes } from '../hooks/useRecipes';
import { computeIngredientFrequency } from '../utils/matching';

export function CommonIngredientsPage() {
  const { recipes } = useRecipes();
  const freq = useMemo(() => computeIngredientFrequency(recipes), [recipes]);
  const max = freq[0]?.count ?? 1;

  return (
    <>
      <PageHeader title="Common ingredients" />
      {freq.length === 0 ? (
        <EmptyState
          icon={<BarChart3 size={36} />}
          title="Nothing to compare yet"
          message="Add recipes to see which ingredients you use most."
        />
      ) : (
        <ul className="flex flex-col gap-2 p-4">
          {freq.map((f) => (
            <li key={f.name} className="rounded-xl bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium capitalize">{f.name}</span>
                <span className="shrink-0 text-sm text-gray-500">
                  {f.count} recipe{f.count === 1 ? '' : 's'}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${(f.count / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
