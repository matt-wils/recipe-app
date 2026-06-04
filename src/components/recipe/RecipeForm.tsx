import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { IngredientRow } from './IngredientRow';
import { PhotoUpload } from './PhotoUpload';
import type { Ingredient, Recipe } from '../../types';

interface RecipeFormProps {
  initial?: Recipe;
  initialPhoto?: string;
  onSubmit: (recipe: Recipe, photo: string | undefined) => void;
}

const emptyIngredient = (): Ingredient => ({ name: '', amount: 0, unit: '' });

export function RecipeForm({ initial, initialPhoto, onSubmit }: RecipeFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [servings, setServings] = useState(initial?.servings ?? 4);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initial?.ingredients.length ? initial.ingredients : [emptyIngredient()],
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(', '));
  const [photo, setPhoto] = useState<string | undefined>(initialPhoto);
  const [error, setError] = useState('');

  const updateIngredient = (index: number, next: Ingredient) =>
    setIngredients((prev) => prev.map((ing, i) => (i === index ? next : ing)));

  const removeIngredient = (index: number) =>
    setIngredients((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Please enter a recipe name.');
      return;
    }
    const cleanIngredients = ingredients.filter((i) => i.name.trim().length > 0);
    if (cleanIngredients.length === 0) {
      setError('Please add at least one ingredient.');
      return;
    }

    const now = Date.now();
    const recipe: Recipe = {
      id: initial?.id ?? crypto.randomUUID(),
      name: trimmedName,
      ingredients: cleanIngredients,
      notes: notes.trim(),
      tags: tagsText
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      servings: servings > 0 ? servings : 1,
      hasPhoto: photo !== undefined,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
    };
    onSubmit(recipe, photo);
  };

  return (
    <form
      className="flex flex-col gap-5 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <Field label="Name">
        <Input
          aria-label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Banana Bread"
        />
      </Field>

      <Field label="Photo">
        <PhotoUpload value={photo} onChange={setPhoto} />
      </Field>

      <Field label="Servings">
        <Input
          aria-label="Servings"
          type="number"
          inputMode="numeric"
          className="w-24"
          value={servings}
          onChange={(e) => setServings(parseInt(e.target.value, 10) || 0)}
        />
      </Field>

      <Field label="Ingredients">
        <div className="flex flex-col gap-4">
          {ingredients.map((ing, i) => (
            <IngredientRow
              key={i}
              ingredient={ing}
              onChange={(next) => updateIngredient(i, next)}
              onRemove={() => removeIngredient(i)}
            />
          ))}
          <Button
            type="button"
            variant="secondary"
            className="flex items-center justify-center gap-1"
            onClick={() => setIngredients((prev) => [...prev, emptyIngredient()])}
          >
            <Plus size={18} /> Add ingredient
          </Button>
        </div>
      </Field>

      <Field label="Notes">
        <Textarea
          aria-label="Notes"
          rows={6}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={'Anything worth remembering — tips, swaps, timing…'}
        />
      </Field>

      <Field label="Tags (comma separated)">
        <Input
          aria-label="Tags"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="breakfast, vegetarian"
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit">Save recipe</Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
    </div>
  );
}
