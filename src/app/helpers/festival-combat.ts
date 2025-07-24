import { getActiveFestivals } from '@helpers/festival';
import type { FestivalEffectCombatAttribute } from '@interfaces';
import { sum } from 'es-toolkit/compat';

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
