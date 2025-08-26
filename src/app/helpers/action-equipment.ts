import { currencyGain } from '@helpers/currency';
import { itemInventoryRemove } from '@helpers/inventory-equipment';
import { itemSkills, itemStat, itemTalents, itemTraits } from '@helpers/item';
import { notifySuccess } from '@helpers/notify';
import { playSFX } from '@helpers/sfx';
import { townBuildingLevel } from '@helpers/town';
import type {
  DropRarity,
  EquipmentItem,
  EquipmentItemContent,
} from '@interfaces';
import { sumBy } from 'es-toolkit/compat';

export function actionItemSalvageValue(item: EquipmentItemContent): number {
  const traitRarityBaseValues: Record<DropRarity, number> = {
    Common: 100,
    Uncommon: 500,
    Rare: 1500,
    Mystical: 3000,
    Legendary: 10000,
    Unique: 25000,
  };

  return (
    itemStat(item, 'Aura') * 4 +
    itemStat(item, 'Force') * 6 +
    itemStat(item, 'Health') * 2 +
    itemStat(item, 'Speed') * 10 +
    itemSkills(item).length * 500 +
    sumBy(itemTalents(item), (t) => t.value) * 1000 +
    sumBy(itemTraits(item), (t) => traitRarityBaseValues[t.rarity])
  );
}

export function actionItemSalvage(item: EquipmentItem): void {
  const manaGained = actionItemSalvageValue(item);

  itemInventoryRemove([item]);
  currencyGain('Mana', manaGained);

  notifySuccess(`Salvaged ${item.name} for ${manaGained} mana!`);

  playSFX('item-salvage', 0);
}

export function actionItemBuyValue(item: EquipmentItemContent): number {
  return Math.floor(
    actionItemSalvageValue(item) * (10 - townBuildingLevel('Merchant') * 0.05),
  );
}
