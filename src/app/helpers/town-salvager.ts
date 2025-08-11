import { currencyGainMultiple } from '@helpers/currency';
import { itemInventoryRemove } from '@helpers/inventory-equipment';
import { townBuildingLevel } from '@helpers/town';
import type { GameCurrency } from '@interfaces/content-currency';
import type { EquipmentItem } from '@interfaces/content-equipment';

export function salvagerItemsMax() {
  return Math.floor(Math.min(15, 3 + townBuildingLevel('Salvager') / 3));
}

export function salvagerSalvageItems(items: EquipmentItem[]): void {
  items.forEach((item) => {
    salvagerSalvageItem(item);
  });
}

export function salvagerSalvageItem(item: EquipmentItem): void {
  itemInventoryRemove(item);

  const currenciesGain = salvagerItemSalvageCurrencyGain(item);
  currencyGainMultiple(currenciesGain);
}

export function salvagerMultiItemSalvageCurrencyGain(
  items: EquipmentItem[],
): Partial<Record<GameCurrency, number>> {
  const result: Partial<Record<GameCurrency, number>> = {};

  items.forEach((item) => {
    const currencies = salvagerItemSalvageCurrencyGain(item);
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

export function salvagerItemSalvageCurrencyGain(
  item: EquipmentItem,
): Partial<Record<GameCurrency, number>> {
  const currency: GameCurrency = `${item.rarity} Dust`;

  return { [currency]: Math.max(1, Math.floor(item.dropLevel * 0.05)) };
}
