import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ServingScaler } from '../components/recipe/ServingScaler';
import { NotesView } from '../components/recipe/NotesView';
import { TagPill } from '../components/ui/TagPill';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { useRecipe } from '../hooks/useRecipe';
import { deleteRecipe } from '../db';
import { scaleAmount, formatAmount } from '../utils/scaling';

export function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipe, photo, loading } = useRecipe(id);
  const [servings, setServings] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (loading) return <PageHeader title="" back />;
  if (!recipe) {
    return (
      <>
        <PageHeader title="Not found" back />
        <EmptyState title="Recipe not found" />
      </>
    );
  }

  const currentServings = servings ?? recipe.servings;

  const onDelete = async () => {
    await deleteRecipe(recipe.id);
    navigate('/', { replace: true });
  };

  return (
    <>
      <PageHeader
        title={recipe.name}
        back
        action={
          <div className="flex gap-1">
            <Link
              to={`/recipe/${recipe.id}/edit`}
              aria-label="Edit"
              className="flex h-10 w-10 items-center justify-center rounded-full active:bg-gray-100"
            >
              <Pencil size={20} />
            </Link>
            <button
              aria-label="Delete"
              onClick={() => setConfirmOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-red-600 active:bg-red-50"
            >
              <Trash2 size={20} />
            </button>
          </div>
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

        <ServingScaler servings={currentServings} onChange={setServings} />

        <section>
          <h2 className="mb-2 text-lg font-semibold">Ingredients</h2>
          <ul className="flex flex-col gap-1.5">
            {recipe.ingredients.map((ing, i) => {
              const amount = scaleAmount(ing.amount, recipe.servings, currentServings);
              return (
                <li key={i} className="flex justify-between gap-3 border-b border-gray-100 py-1.5">
                  <span>{ing.name}</span>
                  <span className="shrink-0 text-gray-600">
                    {ing.amount > 0 && formatAmount(amount)} {ing.unit}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Notes</h2>
          <NotesView notes={recipe.notes} />
        </section>
      </div>

      <Modal open={confirmOpen} title="Delete recipe?" onClose={() => setConfirmOpen(false)}>
        <p className="mb-4 text-sm text-gray-600">
          "{recipe.name}" will be permanently removed.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
