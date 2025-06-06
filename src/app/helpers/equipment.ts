import { cloneDeep } from 'lodash';
import {
  EquipmentItem,
  EquipmentItemDefinition,
  EquipmentItemId,
  EquipmentSlot,
  Hero,
} from '../interfaces';
import { getEntriesByType, getEntry } from './content';
import { gainCurrency } from './currency';
import { recalculateStats, updateHeroData } from './hero';
import { notifySuccess } from './notify';
import { randomIdentifiableChoice, seededrng, uuid } from './rng';
import { updateGamestate } from './state-game';

export function pickRandomItemDefinition(
  rng = seededrng(uuid()),
): EquipmentItemDefinition {
  const allItems = [
    ...getEntriesByType<EquipmentItemDefinition>('accessory'),
    ...getEntriesByType<EquipmentItemDefinition>('armor'),
    ...getEntriesByType<EquipmentItemDefinition>('trinket'),
    ...getEntriesByType<EquipmentItemDefinition>('weapon'),
  ];

  const chosenItem = randomIdentifiableChoice<EquipmentItemDefinition>(
    allItems,
    rng,
  );
  if (!chosenItem) throw new Error('Could not generate an item.');

  const chosenItemDefinition = getEntry<EquipmentItemDefinition>(chosenItem);
  if (!chosenItemDefinition) throw new Error('Could not generate an item.');

  return cloneDeep(chosenItemDefinition);
}

export function createItem(def: EquipmentItemDefinition): EquipmentItem {
  const defClone = cloneDeep(def);
  delete defClone.canBeModified;

  return {
    ...defClone,
    id: `${defClone.id}|${uuid()}` as EquipmentItemId,
    mods: {},
  };
}

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

  recalculateStats(hero);
}

export function unequipItem(hero: Hero, item: EquipmentItem): void {
  updateHeroData(hero.id, {
    equipment: {
      ...hero.equipment,
      [getItemSlot(item)]: undefined,
    },
  });

  addItemToInventory(item);

  recalculateStats(hero);
}

export function itemSalvageValue(item: EquipmentItem): number {
  return (
    (item.baseStats.aura ?? 0) * 4 +
    (item.baseStats.force ?? 0) * 6 +
    (item.baseStats.health ?? 0) * 2 +
    (item.baseStats.speed ?? 0) * 10
  );
}

export function itemSalvage(item: EquipmentItem): void {
  const manaGained = itemSalvageValue(item);

  removeItemFromInventory(item);
  gainCurrency('Mana', manaGained);

  notifySuccess(`Salvaged ${item.name} for ${manaGained} mana!`);
}
