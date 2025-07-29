import { locationTraits } from '@helpers/trait-location';
import type { WorldLocation } from '@interfaces/world';
import { sumBy } from 'es-toolkit/compat';

export function locationTraitExplorationMultiplier(
  location: WorldLocation,
): number {
  return sumBy(
    locationTraits(location),
    (t) => t.effects.exploration?.travelTimePercent ?? 0,
  );
}
