import { locationTraits } from '@helpers/trait-location';
import type { WorldLocation } from '@interfaces/world';
import { sumBy } from 'es-toolkit/compat';

export function locationTraitEncounterLevelModifier(
  location: WorldLocation,
): number {
  return sumBy(
    locationTraits(location),
    (t) => t.effects.worldgen?.encounterLevelModifier ?? 0,
  );
}

export function locationTraitGuardianCountModifier(
  location: WorldLocation,
): number {
  return sumBy(
    locationTraits(location),
    (t) => t.effects.worldgen?.guardianCountModifier ?? 0,
  );
}

export function locationTraitLootCountModifier(
  location: WorldLocation,
): number {
  return sumBy(
    locationTraits(location),
    (t) => t.effects.worldgen?.lootCountModifier ?? 0,
  );
}
