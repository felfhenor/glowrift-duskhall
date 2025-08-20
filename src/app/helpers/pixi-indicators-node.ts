import { locationGetHighestLootRarity } from '@helpers/world-location';
import type { DropRarity } from '@interfaces/droppable';
import type { WorldLocation } from '@interfaces/world';
import type { Texture } from 'pixi.js';
import { Sprite, Text } from 'pixi.js';

/**
 * Maps rarity levels to their display colors
 */
const RARITY_COLORS: Record<DropRarity, number> = {
  Common: 0xffffff, // White
  Uncommon: 0x1eff00, // Green
  Rare: 0x0070dd, // Blue
  Mystical: 0xa335ee, // Purple
  Legendary: 0xff8000, // Orange
  Unique: 0xe6cc80, // Gold
};

/**
 * Creates claim status indicator sprite (check or x)
 * @param isClaimed Whether the location is claimed
 * @param x Grid x position
 * @param y Grid y position
 * @param checkTexture Texture for claimed indicator
 * @param xTexture Texture for unclaimed indicator
 * @returns Sprite for the claim indicator
 */
export function pixiInidicatorNodeClaimCreate(
  isClaimed: boolean,
  checkTexture: Texture,
  xTexture: Texture,
): Sprite {
  const texture = isClaimed ? checkTexture : xTexture;
  const sprite = new Sprite(texture);

  sprite.x = 44;
  sprite.y = 64 - 24;
  sprite.width = 20;
  sprite.height = 20;
  sprite.interactive = false;

  return sprite;
}

/**
 * Creates a level indicator sprite showing the location level and rarity color
 * @param x Grid x position
 * @param y Grid y position
 * @param location World location data
 * @returns Text sprite for the level indicator
 */
export function pixiIndicatorNodeLevelCreate(location: WorldLocation): Text {
  const highestRarity = locationGetHighestLootRarity(location);
  const color = highestRarity ? RARITY_COLORS[highestRarity] : 0xffffff; // Default to white

  const levelText = new Text({
    text: `Lv.${location.encounterLevel}`,
    style: {
      fontSize: 12,
      fill: color,
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: { color: 0x000000, width: 1 }, // Black outline for better visibility
    },
  });

  // Position text at bottom left of tile
  levelText.x = 2;
  levelText.y = 64 - 22; // 14px from bottom for 12px font
  levelText.cullable = true;

  return levelText;
}

/**
 * Creates a node level indicator sprite showing the upgrade level of the location
 * @param x Grid x position
 * @param y Grid y position
 * @param location World location data
 * @returns Text sprite for the level indicator
 */
export function pixiIndicatorNodeUpgradeLevelCreate(
  upgradeLevel: number,
): Text {
  const upgradeText = new Text({
    text: `+${upgradeLevel}`,
    style: {
      fontSize: 12,
      fill: '#16a34a',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: { color: 0x000000, width: 1 }, // Black outline for better visibility
    },
  });

  // Position text at bottom right of tile
  upgradeText.x = 64 - 22;
  upgradeText.y = 64 - 22; // 14px from bottom for 12px font
  upgradeText.cullable = true;

  return upgradeText;
}
