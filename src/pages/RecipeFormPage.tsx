import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { RecipeForm } from '../components/recipe/RecipeForm';
import { useRecipe } from '../hooks/useRecipe';
import { putRecipe, putPhoto, deletePhoto } from '../db';
import type { Recipe } from '../types';

export function RecipeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recipe, photo, loading } = useRecipe(id);
  const isEdit = Boolean(id);

  if (isEdit && loading) {
    return <PageHeader title="Edit recipe" back />;
  }

  const save = async (next: Recipe, nextPhoto: string | undefined) => {
    await putRecipe(next);
    if (nextPhoto !== undefined) {
      await putPhoto(next.id, nextPhoto);
    } else if (isEdit) {
      await deletePhoto(next.id);
    }
    navigate(`/recipe/${next.id}`, { replace: true });
  };

  return (
    <>
      <PageHeader title={isEdit ? 'Edit recipe' : 'New recipe'} back />
      <RecipeForm initial={recipe} initialPhoto={photo} onSubmit={save} />
    </>
  );
}
