import { itemSalvageValue } from '@helpers/action-equipment';
import { gainCurrency } from '@helpers/currency';
import { notifyError } from '@helpers/notify';
import { updateHeroData } from '@helpers/hero';
import { recalculateStats } from '@helpers/hero-stats';
import { sortedRarityList } from '@helpers/item';
import { updateGamestate } from '@helpers/state-game';
import type { EquipmentItem, EquipmentSlot, Hero } from '@interfaces';
import { groupBy, sumBy } from 'es-toolkit/compat';

export function maxItemInventorySize(): number {
  return 100;
}

export function getItemSlot(item: EquipmentItem): EquipmentSlot {
  return item.__type;
}

export function addItemToInventory(item: EquipmentItem): void {
  const lostItems: EquipmentItem[] = [];

  updateGamestate((state) => {
    const itemGroups = groupBy(
      state.inventory.items,
      (i) => i.__type,
    );
    
    // Get the group for the new item's type
    const itemType = item.__type;
    const items = itemGroups[itemType] || [];
    
    // If we're at capacity for this item type, find a non-favorited item to remove
    if (items.length >= maxItemInventorySize()) {
      const sortedItems = sortedRarityList(items);
      
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
        const value = itemSalvageValue(item);
        gainCurrency('Mana', value);
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
      itemGroups[type] = sortedRarityList(itemGroups[type]);
    });

    state.inventory.items = Object.values(itemGroups).flat();

    return state;
  });

  // Salvage any lost items for mana
  const value = sumBy(lostItems, (s) => itemSalvageValue(s));
  if (value > 0) {
    gainCurrency('Mana', value);
  }
}

export function removeItemFromInventory(item: EquipmentItem): void {
  updateGamestate((state) => {
    state.inventory.items = state.inventory.items.filter(
      (i) => i.id !== item.id,
    );
    return state;
  });
}

export function equipItem(hero: Hero, item: EquipmentItem): void {
  const existingItem = hero.equipment[getItemSlot(item)];
  if (existingItem) {
    unequipItem(hero, existingItem);
  }

  updateHeroData(hero.id, {
    equipment: {
      ...hero.equipment,
      [getItemSlot(item)]: item,
    },
  });

  removeItemFromInventory(item);

  recalculateStats(hero.id);
}

export function unequipItem(hero: Hero, item: EquipmentItem): void {
  updateHeroData(hero.id, {
    equipment: {
      ...hero.equipment,
      [getItemSlot(item)]: undefined,
    },
  });

  addItemToInventory(item);
  recalculateStats(hero.id);
}
