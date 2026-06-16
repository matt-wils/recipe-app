import { components } from 'virtual:plate-library';
import type { PlateComponent, PlateSlot } from '../types';

/**
 * The read-only build-a-plate component library, bundled from plates.yaml at
 * build time. Mirrors src/data/library.ts for recipes.
 */

const byId = new Map(components.map((c) => [c.id, c]));

/** Slots in the order they appear in the builder reels. */
export const SLOT_ORDER: readonly PlateSlot[] = ['protein', 'carb', 'vegetable'];

export const SLOT_LABELS: Record<PlateSlot, string> = {
  protein: 'Protein',
  carb: 'Carb',
  vegetable: 'Vegetable',
};

/** All components, or just those in one slot. */
export function getPlateComponents(slot?: PlateSlot): PlateComponent[] {
  return slot ? components.filter((c) => c.slot === slot) : components;
}

export function getComponent(id: string): PlateComponent | undefined {
  return byId.get(id);
}
