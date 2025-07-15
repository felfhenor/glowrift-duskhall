import { EquipmentItem, EquipmentSlot, Hero } from '@interfaces';
import { updateHeroData } from '@helpers/hero';
import { recalculateStats } from '@helpers/hero-stats';
import { updateGamestate } from '@helpers/state-game';

export function getItemSlot(item: EquipmentItem): EquipmentSlot {
  return item.__type;
}

export function addItemToInventory(item: EquipmentItem): void {
  updateGamestate((state) => {
    state.inventory.items = [...state.inventory.items, item];
    return state;
  });
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
