import { getEntriesByType } from '@helpers/content';
import { randomChoiceByRarity, succeedsChance } from '@helpers/rng';
import type { EquipmentItem } from '@interfaces/equipment';
import type { TraitEquipmentContent } from '@interfaces/trait-equipment';

export function canAddTraitToEquipment() {
  return succeedsChance(25);
}

export function addTraitToEquipment(item: EquipmentItem) {
  item.traitIds ??= [];

  const allValidTraits =
    getEntriesByType<TraitEquipmentContent>('traitequipment');
  const chosenTrait = randomChoiceByRarity(allValidTraits);
  if (!chosenTrait) return;

  item.traitIds.push(chosenTrait.id);
}
