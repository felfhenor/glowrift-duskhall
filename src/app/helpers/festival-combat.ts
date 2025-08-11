import { festivalGetActive } from '@helpers/festival';
import type { FestivalEffectCombatAttribute } from '@interfaces';
import { sum } from 'es-toolkit/compat';

export function festivalGetCombatOutgoingAttributeMultiplier(
  attribute: FestivalEffectCombatAttribute,
): number {
  return sum(
    festivalGetActive().map(
      (f) => f?.effects?.combat?.outgoing?.[attribute] ?? 0,
    ),
  );
}

export function festivalGetCombatIncomingAttributeMultiplier(
  attribute: FestivalEffectCombatAttribute,
): number {
  return sum(
    festivalGetActive().map(
      (f) => f?.effects?.combat?.incoming?.[attribute] ?? 0,
    ),
  );
}
