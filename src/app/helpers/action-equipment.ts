import { EquipmentItem, EquipmentItemContent } from '@interfaces';
import { gainCurrency } from '@helpers/currency';
import { removeItemFromInventory } from '@helpers/inventory-equipment';
import { getItemStat } from '@helpers/item';
import { notifySuccess } from '@helpers/notify';

export function itemSalvageValue(item: EquipmentItemContent): number {
  return (
    getItemStat(item, 'Aura') * 4 +
    getItemStat(item, 'Force') * 6 +
    getItemStat(item, 'Health') * 2 +
    getItemStat(item, 'Speed') * 10
  );
}

export function itemSalvage(item: EquipmentItem): void {
  const manaGained = itemSalvageValue(item);

  removeItemFromInventory(item);
  gainCurrency('Mana', manaGained);

  notifySuccess(`Salvaged ${item.name} for ${manaGained} mana!`);
}

export function itemBuyValue(item: EquipmentItemContent): number {
  return itemSalvageValue(item) * 10;
}
