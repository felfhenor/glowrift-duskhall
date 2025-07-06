import { DropRarity } from '../interfaces/droppable';

export function RarityItemColor(rarity: DropRarity): string {
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
