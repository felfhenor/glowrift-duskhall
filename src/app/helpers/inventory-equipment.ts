import { itemSalvageValue } from '@helpers/action-equipment';
import { gainCurrency } from '@helpers/currency';
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
    
    // If we're at capacity for this item type, remove the worst existing item first
    if (items.length >= maxItemInventorySize()) {
      const sortedItems = sortedRarityList(items);
      const worstItem = sortedItems.pop();
      if (worstItem) {
        lostItems.push(worstItem);
      }
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

  const value = sumBy(lostItems, (s) => itemSalvageValue(s));
  gainCurrency('Mana', value);
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
