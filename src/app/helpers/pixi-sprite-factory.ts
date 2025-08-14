import { worldNodeGetHighestLootRarity } from '@helpers/world';
import { locationLevel } from '@helpers/world-location';
import type { WorldLocation } from '@interfaces';
import type { DropRarity } from '@interfaces/droppable';
import type { NodeSpriteData } from '@interfaces/sprite';
import type { Container, Texture } from 'pixi.js';
import { Graphics, Sprite, Text } from 'pixi.js';

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
 * Creates a level indicator sprite showing the location level and rarity color
 * @param x Grid x position
 * @param y Grid y position
 * @param location World location data
 * @returns Text sprite for the level indicator
 */
export function pixiIndicatorNodeLevelCreate(
  x: number,
  y: number,
  location: WorldLocation,
): Text {
  const pixelX = x * 64;
  const pixelY = y * 64;

  const highestRarity = worldNodeGetHighestLootRarity(location);
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
  levelText.x = pixelX + 2;
  levelText.y = pixelY + 64 - 22; // 14px from bottom for 12px font
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
  x: number,
  y: number,
  upgradeLevel: number,
): Text {
  const pixelX = x * 64;
  const pixelY = y * 64;

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
  upgradeText.x = pixelX + 64 - 22;
  upgradeText.y = pixelY + 64 - 22; // 14px from bottom for 12px font
  upgradeText.cullable = true;

  return upgradeText;
}

/**
 * Creates terrain and object sprites for a single map node
 * @param x Grid x position
 * @param y Grid y position
 * @param nodeData World location data
 * @param terrainTextures Available terrain textures
 * @param objectTextures Available object textures
 * @param mapContainer Container to add sprites to
 * @param checkTexture Texture for claimed indicator
 * @param xTexture Texture for unclaimed indicator
 * @param onObjectClick Callback for object sprite clicks
 * @param debugMode Whether to show debug coordinates
 * @returns Created sprite data
 */
export function pixiIndicatorNodeSpriteCreate(
  x: number,
  y: number,
  nodeData: WorldLocation,
  tileSprite: string,
  objectSprite: string,
  terrainTextures: Record<string, Texture>,
  objectTextures: Record<string, Texture>,
  mapContainer: Container,
  checkTexture?: Texture,
  xTexture?: Texture,
  onObjectClick?: (nodeData: WorldLocation) => void,
  debugMode?: boolean,
): NodeSpriteData | null {
  const pixelX = x * 64;
  const pixelY = y * 64;

  const terrainTexture = terrainTextures[tileSprite];
  if (!terrainTexture) return null;

  const terrainSprite = new Sprite(terrainTexture);
  terrainSprite.x = pixelX;
  terrainSprite.y = pixelY;
  terrainSprite.cullable = true;
  mapContainer.addChild(terrainSprite);

  const spriteData: NodeSpriteData = { terrain: terrainSprite };

  if (objectSprite) {
    const objectTexture = objectTextures[objectSprite];
    if (objectTexture) {
      const objectSprite = new Sprite(objectTexture);
      objectSprite.x = pixelX;
      objectSprite.y = pixelY;
      objectSprite.interactive = true;
      objectSprite.cursor = 'pointer';
      objectSprite.cullable = true;

      if (onObjectClick) {
        objectSprite.on('pointerdown', () => {
          onObjectClick(nodeData);
        });
      }

      mapContainer.addChild(objectSprite);
      spriteData.object = objectSprite;
    }
  }

  const upgradeLevel = locationLevel(nodeData);
  if (
    objectSprite &&
    checkTexture &&
    xTexture &&
    (upgradeLevel === 0 || !nodeData.currentlyClaimed)
  ) {
    const claimIndicator = pixiInidicatorNodeClaimCreate(
      nodeData.currentlyClaimed,
      x,
      y,
      checkTexture,
      xTexture,
    );
    claimIndicator.cullable = true;
    mapContainer.addChild(claimIndicator);
    spriteData.claimIndicator = claimIndicator;
  }

  // Add upgrade level indicator if it makes sense to
  if (nodeData.currentlyClaimed && upgradeLevel >= 1) {
    const upgradeIndicator = pixiIndicatorNodeUpgradeLevelCreate(
      x,
      y,
      upgradeLevel,
    );
    mapContainer.addChild(upgradeIndicator);
    spriteData.upgradeIndicator = upgradeIndicator;
  }

  // Add level indicator showing encounter level with rarity-based color
  if (nodeData.encounterLevel >= 1) {
    const levelIndicator = pixiIndicatorNodeLevelCreate(x, y, nodeData);
    mapContainer.addChild(levelIndicator);
    spriteData.levelIndicator = levelIndicator;
  }

  // Add debug text showing coordinates if debug mode is enabled
  if (debugMode) {
    const debugText = new Text({
      text: `${x},${y}`,
      style: {
        fontSize: 10,
        fill: 0xffffff, // White text
        fontFamily: 'Arial',
      },
    });

    // Position text at top right of tile to avoid conflict with level indicator
    debugText.x = pixelX + 64 - 30; // 30px from right edge
    debugText.y = pixelY + 2; // 2px from top
    debugText.cullable = true;

    mapContainer.addChild(debugText);
    spriteData.debugText = debugText;
  }

  return spriteData;
}

/**
 * Creates an animated player indicator at the specified position
 * @param x Grid x position
 * @param y Grid y position
 * @param container Container to add indicator to
 * @returns Object with graphics and cleanup function
 */
export function pixiIndicatorNodePlayerAtLocationCreate(
  x: number,
  y: number,
  container: Container,
): { graphics: Graphics; cleanup: () => void } {
  const pixelX = x * 64;
  const pixelY = y * 64;

  const graphics = new Graphics();
  graphics.setStrokeStyle({ width: 4, color: 0xffffff, alpha: 1 });
  graphics.rect(pixelX, pixelY, 64, 64);
  graphics.stroke();

  let alpha = 1;
  let direction = -1;
  let animationId: number | null = null;

  const animate = () => {
    alpha += direction * 0.01;
    if (alpha <= 0.4) direction = 1;
    if (alpha >= 0.8) direction = -1;
    graphics.alpha = alpha;

    // Schedule next frame during idle time
    animationId = requestIdleCallback(animate);
  };

  // Start animation
  animationId = requestIdleCallback(animate);
  container.addChild(graphics);

  const cleanup = () => {
    if (animationId !== null) {
      cancelIdleCallback(animationId);
      animationId = null;
    }
    container.removeChild(graphics);
    graphics.destroy();
  };

  return { graphics, cleanup };
}

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
  x: number,
  y: number,
  checkTexture: Texture,
  xTexture: Texture,
): Sprite {
  const pixelX = x * 64;
  const pixelY = y * 64;

  const texture = isClaimed ? checkTexture : xTexture;
  const sprite = new Sprite(texture);

  sprite.x = pixelX + 44;
  sprite.y = pixelY + 64 - 24;
  sprite.width = 20;
  sprite.height = 20;

  return sprite;
}

/**
 * Creates a travel line between two positions
 * @param fromX Start grid x position
 * @param fromY Start grid y position
 * @param toX End grid x position
 * @param toY End grid y position
 * @param container Container to add line to
 * @returns Object with graphics and cleanup function
 */
export function pixiIndicatorTravelLineCreate(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  container: Container,
): { graphics: Graphics; cleanup: () => void } {
  const graphics = new Graphics();

  const fromPixelX = fromX * 64 + 32; // Center of tile
  const fromPixelY = fromY * 64 + 32; // Center of tile
  const toPixelX = toX * 64 + 32; // Center of tile
  const toPixelY = toY * 64 + 32; // Center of tile

  graphics.setStrokeStyle({ width: 3, color: 0xffffff, alpha: 0.8 });
  graphics.moveTo(fromPixelX, fromPixelY);
  graphics.lineTo(toPixelX, toPixelY);
  graphics.stroke();

  container.addChild(graphics);

  const cleanup = () => {
    container.removeChild(graphics);
    graphics.destroy();
  };

  return { graphics, cleanup };
}

/**
 * Creates a hero sprite indicator at the interpolated travel position
 * @param x Interpolated x position (can be fractional)
 * @param y Interpolated y position (can be fractional)
 * @param heroTexture Texture for the hero sprite
 * @param container Container to add sprite to
 * @returns Object with sprite and cleanup function
 */
export function pixiIndicatorHeroTravelCreate(
  x: number,
  y: number,
  heroTexture: Texture,
  container: Container,
): { sprite: Sprite; cleanup: () => void } {
  const pixelX = x * 64 + 16; // Offset to center the sprite
  const pixelY = y * 64 + 16; // Offset to center the sprite

  const sprite = new Sprite(heroTexture);
  sprite.x = pixelX;
  sprite.y = pixelY;
  sprite.width = 32; // Smaller than full tile
  sprite.height = 32; // Smaller than full tile
  sprite.anchor.set(0.5, 0.5);

  // Add a subtle bobbing animation
  let bobOffset = 0;
  let animationId: number | null = null;

  const animate = () => {
    bobOffset += 0.2;
    sprite.y = pixelY + Math.sin(bobOffset) * 2;

    // Schedule next frame during idle time
    animationId = requestIdleCallback(animate);
  };

  // Start animation
  animationId = requestIdleCallback(animate);
  container.addChild(sprite);

  const cleanup = () => {
    if (animationId !== null) {
      cancelIdleCallback(animationId);
      animationId = null;
    }
    container.removeChild(sprite);
    sprite.destroy();
  };

  return { sprite, cleanup };
}
