import { currencyGain } from '@helpers/currency';
import { itemInventoryRemove } from '@helpers/inventory-equipment';
import { itemStat, itemTalents } from '@helpers/item';
import { notifySuccess } from '@helpers/notify';
import { townBuildingLevel } from '@helpers/town';
import type { EquipmentItem, EquipmentItemContent } from '@interfaces';
import { sumBy } from 'es-toolkit/compat';

export function actionItemSalvageValue(item: EquipmentItemContent): number {
  return (
    itemStat(item, 'Aura') * 4 +
    itemStat(item, 'Force') * 6 +
    itemStat(item, 'Health') * 2 +
    itemStat(item, 'Speed') * 10 +
    sumBy(itemTalents(item), (t) => t.value) * 1000
  );
}

export function actionItemSalvage(item: EquipmentItem): void {
  const manaGained = actionItemSalvageValue(item);

  itemInventoryRemove(item);
  currencyGain('Mana', manaGained);

  notifySuccess(`Salvaged ${item.name} for ${manaGained} mana!`);
}

export function actionItemBuyValue(item: EquipmentItemContent): number {
  return Math.floor(
    actionItemSalvageValue(item) * (10 - townBuildingLevel('Merchant') * 0.05),
  );
}
