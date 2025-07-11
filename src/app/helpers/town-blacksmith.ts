import { EquipmentItem, GameCurrency } from '@interfaces';
import { gainCurrency } from '@helpers/currency';
import { removeItemFromInventory } from '@helpers/inventory-equipment';
import { getBuildingLevel } from '@helpers/town';

export function maxBlacksmithItems() {
  return Math.floor(Math.min(15, 3 + getBuildingLevel('Blacksmith') / 3));
}

export function salvageItems(items: EquipmentItem[]): void {
  items.forEach((item) => {
    salvageItem(item);
  });
}

export function salvageItem(item: EquipmentItem): void {
  removeItemFromInventory(item);

  const currencyGain = itemSalvageCurrencyGain(item);
  Object.entries(currencyGain).forEach(([curr, amount]) => {
    const currency = curr as GameCurrency;
    gainCurrency(currency, amount);
  });
}

export function multiItemSalvageCurrencyGain(
  items: EquipmentItem[],
): Partial<Record<GameCurrency, number>> {
  const result: Partial<Record<GameCurrency, number>> = {};

  items.forEach((item) => {
    const currencies = itemSalvageCurrencyGain(item);
    Object.entries(currencies).forEach(([curr, amount]) => {
      const currency = curr as GameCurrency;

      if (result[currency]) {
        result[currency] += amount;
      } else {
        result[currency] = amount;
      }
    });
  });

  return result;
}

export function itemSalvageCurrencyGain(
  item: EquipmentItem,
): Partial<Record<GameCurrency, number>> {
  const currency: GameCurrency = `${item.rarity} Dust`;

  return { [currency]: Math.max(1, Math.floor(item.dropLevel * 0.05)) };
}
