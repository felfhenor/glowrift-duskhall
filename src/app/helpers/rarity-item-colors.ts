export function RarityItemColors(rarity: string): string {
  const rarityColorRecord: Record<string, string> = {
    Uncommon: 'green-400',
    Rare: 'blue-400',
    Mystical: 'purple-400',
    Legendary: 'yellow-400',
    Unique: 'rose-400',
  };

  return rarityColorRecord[rarity] ?? 'white-400'; //common and default are set to white.
}
