import { actionItemSalvageValue } from '@helpers/action-equipment';
import { analyticsSendDesignEvent } from '@helpers/analytics';
import { currencyGain } from '@helpers/currency';
import { droppableSortedRarityList } from '@helpers/droppable';
import { heroUpdateData } from '@helpers/hero';
import { heroRecalculateStats } from '@helpers/hero-stats';
import { notifyError } from '@helpers/notify';
import { updateGamestate } from '@helpers/state-game';
import type { EquipmentItem, EquipmentSlot, Hero } from '@interfaces';
import { groupBy, sumBy } from 'es-toolkit/compat';

export function itemInventoryMaxSize(): number {
  return 100;
}

export function itemSlotForItem(item: EquipmentItem): EquipmentSlot {
  return item.__type;
}

export function itemInventoryAdd(item: EquipmentItem): void {
  const lostItems: EquipmentItem[] = [];

  updateGamestate((state) => {
    const itemGroups = groupBy(state.inventory.items, (i) => i.__type);

    // Get the group for the new item's type
    const itemType = item.__type;
    const items = itemGroups[itemType] || [];

    // If we're at capacity for this item type, find a non-favorited item to remove
    while (items.length >= itemInventoryMaxSize()) {
      const sortedItems = droppableSortedRarityList(items);
      const worstItem = sortedItems.reverse().find((i) => !i.isFavorite);

      // If no non-favorited items found, reject the new item
      if (!worstItem) {
        lostItems.push(item);
        notifyError('Could not add item to inventory as there is no space');
        break;
      }

      // Remove the worst non-favorited item
      lostItems.push(worstItem);
      items.splice(items.indexOf(worstItem), 1);
      itemGroups[itemType] = items;
    }

    // Now add the new item
    itemGroups[itemType] = itemGroups[itemType] || [];
    itemGroups[itemType].push(item);

    // Sort all groups
    Object.keys(itemGroups).forEach((type) => {
      itemGroups[type] = droppableSortedRarityList(itemGroups[type]);
    });

    state.inventory.items = Object.values(itemGroups).flat();

    return state;
  });

  // Salvage any lost items for mana
  const value = sumBy(lostItems, (s) => actionItemSalvageValue(s));
  if (value > 0) {
    currencyGain('Mana', value);
  }
}

export function itemInventoryRemove(item: EquipmentItem): void {
  updateGamestate((state) => {
    state.inventory.items = state.inventory.items.filter(
      (i) => i.id !== item.id,
    );
    return state;
  });
}

export function itemEquip(hero: Hero, item: EquipmentItem): void {
  const existingItem = hero.equipment[itemSlotForItem(item)];
  if (existingItem) {
    itemUnequip(hero, existingItem);
  }

  hero.equipment[itemSlotForItem(item)] = item;
  heroUpdateData(hero);

  itemInventoryRemove(item);

  heroRecalculateStats(hero.id);

  analyticsSendDesignEvent(`Game:Hero:EquipItem:${item.name}`);
}

export function itemUnequip(hero: Hero, item: EquipmentItem): void {
  hero.equipment[itemSlotForItem(item)] = undefined;
  heroUpdateData(hero);

  itemInventoryAdd(item);
  heroRecalculateStats(hero.id);
}
