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

// Per-slot placeholder artwork (public/recipe-photos/placeholders/) shown for
// components without their own `photo:`. `vegetable` reuses the existing veg.svg.
const SLOT_PLACEHOLDER: Record<PlateSlot, string> = {
  protein: 'protein',
  carb: 'carb',
  vegetable: 'veg',
};

/** A component's own photo if it has one, otherwise its per-slot placeholder. */
export function componentPhotoUrl(component: PlateComponent): string {
  if (component.photo) {
    return `${import.meta.env.BASE_URL}recipe-photos/${component.photo}`;
  }
  return `${import.meta.env.BASE_URL}recipe-photos/placeholders/${SLOT_PLACEHOLDER[component.slot]}.svg`;
}
