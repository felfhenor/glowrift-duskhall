import { getEntriesByType, getEntry } from '@helpers/content';
import { hasCurrency, loseCurrency } from '@helpers/currency';
import { randomChoiceByRarity } from '@helpers/rng';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { TraitEquipmentContent } from '@interfaces/content-trait-equipment';
import type { DropRarity } from '@interfaces/droppable';
import { sumBy } from 'es-toolkit/compat';

export function blacksmithRerollItemTraitCost(item: EquipmentItem): number {
  if (item.traitIds.length === 0) return 1000;

  const costs: Record<DropRarity, number> = {
    Common: 500,
    Uncommon: 1500,
    Rare: 3500,
    Mystical: 7500,
    Legendary: 10000,
    Unique: 250000,
  };

  return sumBy(
    item.traitIds,
    (t) => costs[getEntry<TraitEquipmentContent>(t)!.rarity] ?? 500,
  );
}

export function blacksmithRerollItemTrait(item: EquipmentItem): void {
  const cost = blacksmithRerollItemTraitCost(item);
  if (!hasCurrency('Mana', cost)) return;

  loseCurrency('Mana', cost);

  const allTraits = getEntriesByType<TraitEquipmentContent>('traitequipment');
  item.traitIds = item.traitIds.map(() => randomChoiceByRarity(allTraits)!.id);
}
