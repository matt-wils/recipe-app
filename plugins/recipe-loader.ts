import yaml from 'js-yaml';
import type { Ingredient, Recipe } from '../src/types';
import { ALLOWED_TAGS, GERD_LEVELS } from '../src/data/tags';

/**
 * Pure transform + validation from raw `recipes.yaml` text to the runtime
 * Recipe[]. Shared by the Vite plugin (build time) and the unit tests.
 * Throws a descriptive Error on any malformed entry so the build fails loudly.
 */

const DEFAULT_SERVINGS = 4;

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fail(index: number, msg: string): never {
  throw new Error(`recipes.yaml: entry #${index + 1} ${msg}`);
}

function parseIngredient(raw: unknown, index: number): Ingredient {
  if (typeof raw === 'string') {
    const name = raw.trim();
    if (!name) fail(index, 'has an empty ingredient');
    return { name };
  }
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    const name = typeof obj.name === 'string' ? obj.name.trim() : '';
    if (!name) fail(index, 'has an ingredient missing a name');
    const out: Ingredient = { name };
    if (obj.amount != null) {
      if (typeof obj.amount !== 'number' || Number.isNaN(obj.amount)) {
        fail(index, `ingredient "${name}" has a non-numeric amount`);
      }
      out.amount = obj.amount;
    }
    if (obj.unit != null) out.unit = String(obj.unit);
    return out;
  }
  return fail(index, 'has an ingredient that is neither a string nor an object');
}

function parseEntry(raw: unknown, index: number, seen: Set<string>): Recipe {
  if (!raw || typeof raw !== 'object') fail(index, 'is not a mapping');
  const obj = raw as Record<string, unknown>;

  const name = typeof obj.name === 'string' ? obj.name.trim() : '';
  if (!name) fail(index, 'is missing a name');

  const id = typeof obj.id === 'string' && obj.id.trim() ? obj.id.trim() : slugify(name);
  if (!id) fail(index, `produced an empty id from name "${name}"`);
  if (seen.has(id)) fail(index, `has a duplicate id "${id}"`);
  seen.add(id);

  if (!Array.isArray(obj.ingredients) || obj.ingredients.length === 0) {
    fail(index, `("${name}") has no ingredients`);
  }
  const ingredients = obj.ingredients.map((ing) => parseIngredient(ing, index));

  const tags = Array.isArray(obj.tags) ? obj.tags.map((t) => String(t).trim()) : [];
  for (const tag of tags) {
    if (!ALLOWED_TAGS.has(tag)) {
      fail(index, `("${name}") has unknown tag "${tag}" — add it to src/data/tags.ts`);
    }
  }

  const recipe: Recipe = {
    id,
    name,
    ingredients,
    notes: typeof obj.note === 'string' ? obj.note.trim() : '',
    tags,
    servings:
      typeof obj.servings === 'number' && obj.servings > 0
        ? obj.servings
        : DEFAULT_SERVINGS,
  };

  if (obj.gerd != null) {
    if (!GERD_LEVELS.includes(obj.gerd as never)) {
      fail(index, `("${name}") has invalid gerd "${String(obj.gerd)}" (use high|medium|low)`);
    }
    recipe.gerd = obj.gerd as Recipe['gerd'];
  }

  if (obj.macros != null) {
    if (typeof obj.macros !== 'object') fail(index, `("${name}") macros must be a mapping`);
    const m = obj.macros as Record<string, unknown>;
    const macros: NonNullable<Recipe['macros']> = {};
    for (const key of ['calories', 'protein'] as const) {
      if (m[key] != null) {
        if (typeof m[key] !== 'number' || Number.isNaN(m[key])) {
          fail(index, `("${name}") macros.${key} must be a number`);
        }
        macros[key] = m[key] as number;
      }
    }
    recipe.macros = macros;
  }

  if (typeof obj.photo === 'string' && obj.photo.trim()) {
    recipe.photo = obj.photo.trim();
  }

  return recipe;
}

export function loadRecipes(yamlText: string): Recipe[] {
  const parsed = yaml.load(yamlText);
  if (parsed == null) return [];
  if (!Array.isArray(parsed)) {
    throw new Error('recipes.yaml: top level must be a list of recipes');
  }
  const seen = new Set<string>();
  return parsed.map((entry, i) => parseEntry(entry, i, seen));
}
