import yaml from 'js-yaml';
import type { CookingMethod, PlateComponent, PlateSlot } from '../src/types';
import { slugify } from './recipe-loader';
import { capitalize } from '../src/utils/capitalize';

/**
 * Pure transform + validation from raw `plates.yaml` text to the runtime
 * PlateComponent[]. Shared by the Vite plugin (build time) and the unit tests.
 * Throws a descriptive Error on any malformed entry so the build fails loudly,
 * mirroring plugins/recipe-loader.ts.
 *
 * Shape: a top-level mapping of `proteins`/`carbs`/`vegetables`, each a list of
 * components { name, photo?, methods: [{ name, how }] }.
 */

const SLOTS: { key: string; slot: PlateSlot }[] = [
  { key: 'proteins', slot: 'protein' },
  { key: 'carbs', slot: 'carb' },
  { key: 'vegetables', slot: 'vegetable' },
];

function fail(slotKey: string, msg: string): never {
  throw new Error(`plates.yaml: ${slotKey} ${msg}`);
}

function parseMethod(raw: unknown, slotKey: string, name: string): CookingMethod {
  if (!raw || typeof raw !== 'object') {
    fail(slotKey, `component "${name}" has a method that is not a mapping`);
  }
  const obj = raw as Record<string, unknown>;
  const methodName = typeof obj.name === 'string' ? obj.name.trim() : '';
  if (!methodName) fail(slotKey, `component "${name}" has a method missing a name`);
  const how = typeof obj.how === 'string' ? obj.how.trim() : '';
  if (!how) fail(slotKey, `component "${name}" method "${methodName}" is missing "how"`);
  return { name: methodName, how };
}

function parseComponent(
  raw: unknown,
  slotKey: string,
  slot: PlateSlot,
  seen: Set<string>,
): PlateComponent {
  if (!raw || typeof raw !== 'object') fail(slotKey, 'has a component that is not a mapping');
  const obj = raw as Record<string, unknown>;

  const name = typeof obj.name === 'string' ? obj.name.trim() : '';
  if (!name) fail(slotKey, 'has a component missing a name');

  const id = slugify(name);
  if (!id) fail(slotKey, `produced an empty id from name "${name}"`);
  if (seen.has(id)) fail(slotKey, `has a duplicate component id "${id}"`);
  seen.add(id);

  if (!Array.isArray(obj.methods) || obj.methods.length === 0) {
    fail(slotKey, `component "${name}" has no methods`);
  }
  const methods = obj.methods.map((m) => parseMethod(m, slotKey, name));

  const component: PlateComponent = { id, name: capitalize(name), slot, methods };
  if (typeof obj.photo === 'string' && obj.photo.trim()) {
    component.photo = obj.photo.trim();
  }
  return component;
}

export function loadPlates(yamlText: string): PlateComponent[] {
  const parsed = yaml.load(yamlText);
  if (parsed == null) return [];
  if (typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('plates.yaml: top level must be a mapping of proteins/carbs/vegetables');
  }
  const root = parsed as Record<string, unknown>;
  const seen = new Set<string>();
  const components: PlateComponent[] = [];

  for (const { key, slot } of SLOTS) {
    if (root[key] == null) continue;
    if (!Array.isArray(root[key])) {
      throw new Error(`plates.yaml: ${key} must be a list`);
    }
    for (const raw of root[key] as unknown[]) {
      components.push(parseComponent(raw, key, slot, seen));
    }
  }
  return components;
}
