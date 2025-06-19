import { sortBy } from 'lodash';
import {
  DroppableEquippable,
  EquipmentItem,
  EquipmentItemDefinition,
  GameStat,
} from '../interfaces';

export function sortedRarityList<T extends DroppableEquippable>(
  items: T[],
): T[] {
  return sortBy(items, [
    (i) => {
      switch (i.rarity) {
        case 'Common':
          return 0;
        case 'Uncommon':
          return -1;
        case 'Rare':
          return -2;
        case 'Mystical':
          return -3;
        case 'Legendary':
          return -4;
        case 'Unique':
          return -5;
        default:
          return 0;
      }
    },
    (i) => -i.dropLevel,
  ]);
}

export function getItemStat(
  item: EquipmentItemDefinition,
  stat: GameStat,
): number {
  return (
    item.baseStats[stat] ??
    0 + ((item as EquipmentItem)?.mods?.baseStats?.[stat] ?? 0)
  );
}
