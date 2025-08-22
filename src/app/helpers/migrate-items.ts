import { getEntry } from '@helpers/content';
import { droppableGetBaseId } from '@helpers/droppable';
import { allHeroes, heroUpdateData } from '@helpers/hero';
import { gamestate, updateGamestate } from '@helpers/state-game';
import type { EquipmentItem } from '@interfaces';

function getUpdatedItem(item: EquipmentItem): EquipmentItem {
  return Object.assign(item, getEntry(droppableGetBaseId(item)) ?? {}, {
    id: item.id,
    isFavorite: item.isFavorite,
  });
}

export function migrateItems() {
  migrateInventoryItems();
  migrateEquippedItems();
}

function migrateInventoryItems() {
  const items = gamestate().inventory.items;
  const newItems = items.map((s) => getUpdatedItem(s));

  updateGamestate((state) => {
    state.inventory.items = newItems;
    return state;
  });
}

function migrateEquippedItems() {
  allHeroes().forEach((hero) => {
    const heroEquipment = hero.equipment;
    heroEquipment.accessory = heroEquipment.accessory
      ? getUpdatedItem(heroEquipment.accessory)
      : undefined;

    heroEquipment.armor = heroEquipment.armor
      ? getUpdatedItem(heroEquipment.armor)
      : undefined;

    heroEquipment.trinket = heroEquipment.trinket
      ? getUpdatedItem(heroEquipment.trinket)
      : undefined;

    heroEquipment.weapon = heroEquipment.weapon
      ? getUpdatedItem(heroEquipment.weapon)
      : undefined;

    heroUpdateData(hero);
  });
}
