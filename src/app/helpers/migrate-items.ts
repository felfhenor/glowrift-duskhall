import { EquipmentItem } from '@interfaces';
import { getEntry } from './content';
import { getDroppableEquippableBaseId } from './droppable';
import { allHeroes, updateHeroData } from './hero';
import { gamestate, updateGamestate } from './state-game';

export function getUpdatedItem(item: EquipmentItem): EquipmentItem {
  return Object.assign(item, getEntry(getDroppableEquippableBaseId(item)), {
    id: item.id,
  });
}

export function migrateItems() {
  migrateInventoryItems();
  migrateEquippedItems();
}

export function migrateInventoryItems() {
  const items = gamestate().inventory.items;
  const newItems = items.map((s) => getUpdatedItem(s));

  updateGamestate((state) => {
    state.inventory.items = newItems;
    return state;
  });
}

export function migrateEquippedItems() {
  allHeroes().forEach((hero) => {
    updateHeroData(hero.id, {
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
