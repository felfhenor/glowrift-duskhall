import { sum } from 'lodash';
import type { FestivalEffectCombatAttribute } from '@interfaces';
import { getActiveFestivals } from '@helpers/festival';

export function getCombatOutgoingAttributeMultiplier(
  attribute: FestivalEffectCombatAttribute,
): number {
  return sum(
    getActiveFestivals().map(
      (f) => f?.effects?.combat?.outgoing?.[attribute] ?? 0,
    ),
  );
}

export function getCombatIncomingAttributeMultiplier(
  attribute: FestivalEffectCombatAttribute,
): number {
  return sum(
    getActiveFestivals().map(
      (f) => f?.effects?.combat?.incoming?.[attribute] ?? 0,
    ),
  );
}
