import { getEntriesByType } from '@helpers/content';
import { rngChoiceRarity, rngSucceedsChance } from '@helpers/rng';
import { symmetryLevel } from '@helpers/symmetry';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { TraitEquipmentContent } from '@interfaces/content-trait-equipment';

export function traitCanAddToEquipment() {
  return rngSucceedsChance(25);
}

export function traitMaxForEquipment(item: EquipmentItem) {
  const level = symmetryLevel(item);

  let traits = 1;

  if (item.rarity === 'Uncommon' && level >= 5) traits += 1;
  if (item.rarity === 'Rare' && level >= 3) traits += 1;
  if (item.rarity === 'Mystical' && level >= 3) traits += 1;
  if (item.rarity === 'Mystical' && level >= 5) traits += 1;
  if (item.rarity === 'Legendary' && level >= 1) traits += 1;
  if (item.rarity === 'Legendary' && level >= 3) traits += 1;

  return traits;
}

export function traitAddToEquipment(item: EquipmentItem) {
  item.mods ??= {};
  item.mods.traitIds ??= [];

  const allValidTraits = getEntriesByType<TraitEquipmentContent>(
    'traitequipment',
  ).filter((t) => !item.mods?.traitIds?.includes(t.id));
  const chosenTrait = rngChoiceRarity(allValidTraits);
  if (!chosenTrait) return;

  item.mods.traitIds.push(chosenTrait.id);
}
