import { locationTraits } from '@helpers/trait-location';
import type { GameElement } from '@interfaces/element';
import type { WorldLocation } from '@interfaces/world';
import { sum } from 'es-toolkit/compat';

export function locationTraitCombatElementPercentageModifier(
  location: WorldLocation,
  element: GameElement,
): number {
  const elementBoosts = locationTraits(location)
    .flatMap((loc) => loc.effects.combat?.damage.all ?? [])
    .filter((curr) => curr.element === element)
    .map((curr) => curr.multiplier);

  return sum(elementBoosts);
}
