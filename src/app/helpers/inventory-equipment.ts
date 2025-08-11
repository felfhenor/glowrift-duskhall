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
    if (items.length >= itemInventoryMaxSize()) {
      const sortedItems = droppableSortedRarityList(items);

      // Find the worst non-favorited item
      let worstItemIndex = -1;
      for (let i = sortedItems.length - 1; i >= 0; i--) {
        if (!sortedItems[i].isFavorite) {
          worstItemIndex = i;
          break;
        }
      }

      // If no non-favorited items found, reject the new item
      if (worstItemIndex === -1) {
        // Auto-salvage the new item and show error
        const value = actionItemSalvageValue(item);
        currencyGain('Mana', value);
        notifyError('Could not add item to inventory as there is no space');
        return state; // Don't add the item to inventory
      }

      // Remove the worst non-favorited item
      const worstItem = sortedItems.splice(worstItemIndex, 1)[0];
      lostItems.push(worstItem);
      itemGroups[itemType] = sortedItems;
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

  heroUpdateData(hero.id, {
    equipment: {
      ...hero.equipment,
      [itemSlotForItem(item)]: item,
    },
  });

  itemInventoryRemove(item);

  heroRecalculateStats(hero.id);

  analyticsSendDesignEvent(`Game:Hero:EquipItem:${item.name}`);
}

export function itemUnequip(hero: Hero, item: EquipmentItem): void {
  heroUpdateData(hero.id, {
    equipment: {
      ...hero.equipment,
      [itemSlotForItem(item)]: undefined,
    },
  });

  itemInventoryAdd(item);
  heroRecalculateStats(hero.id);
}
