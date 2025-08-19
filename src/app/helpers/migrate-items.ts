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
    heroUpdateData(hero.id, {
      equipment: {
        accessory: hero.equipment.accessory
          ? getUpdatedItem(hero.equipment.accessory)
          : undefined,
        armor: hero.equipment.armor
          ? getUpdatedItem(hero.equipment.armor)
          : undefined,
        trinket: hero.equipment.trinket
          ? getUpdatedItem(hero.equipment.trinket)
          : undefined,
        weapon: hero.equipment.weapon
          ? getUpdatedItem(hero.equipment.weapon)
          : undefined,
      },
    });
  });
}
