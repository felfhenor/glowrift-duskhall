import { sortBy } from 'lodash';
import {
  DroppableEquippable,
  DropRarity,
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

export function rarityItemColor(rarity: DropRarity): string {
  const rarityColorRecord: Record<DropRarity, string> = {
    Common: 'white-400',
    Uncommon: 'green-400',
    Rare: 'blue-400',
    Mystical: 'purple-400',
    Legendary: 'yellow-400',
    Unique: 'rose-400',
  };

  return rarityColorRecord[rarity];
}
