import { fogIsPositionRevealed } from '@helpers/fog-of-war';
import {
  pixiIndicatorNodeLevelCreate,
  pixiIndicatorNodeUpgradeLevelCreate,
  pixiInidicatorNodeClaimCreate,
} from '@helpers/pixi-indicators-node';
import { getOption } from '@helpers/state-options';
import { locationLevel } from '@helpers/world-location-upgrade';
import type { WorldLocation } from '@interfaces';
import type { NodeSpriteData } from '@interfaces/sprite';
import type { Texture } from 'pixi.js';
import { Container, Sprite, Text } from 'pixi.js';

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
      const spriteContainer = new Container();
      spriteData.objectContainer = spriteContainer;
      mapContainer.addChild(spriteContainer);
      spriteContainer.x = pixelX;
      spriteContainer.y = pixelY;

      const objectSprite = new Sprite(objectTexture);
      objectSprite.interactive = true;
      objectSprite.cursor = 'pointer';
      objectSprite.cullable = true;

      if (onObjectClick) {
        objectSprite.on('pointerdown', () => {
          onObjectClick(nodeData);
        });
      }

      spriteData.objectContainer.addChild(objectSprite);
    }
  }

  const upgradeLevel = locationLevel(nodeData);
  if (
    spriteData.objectContainer &&
    checkTexture &&
    xTexture &&
    (upgradeLevel === 0 || !nodeData.currentlyClaimed)
  ) {
    const claimIndicator = pixiInidicatorNodeClaimCreate(
      nodeData.currentlyClaimed,
      checkTexture,
      xTexture,
    );
    claimIndicator.eventMode = 'none';
    claimIndicator.cullable = true;
    spriteData.objectContainer.addChild(claimIndicator);
  }

  // Add upgrade level indicator if it makes sense to
  if (
    spriteData.objectContainer &&
    nodeData.currentlyClaimed &&
    upgradeLevel >= 1
  ) {
    const upgradeIndicator = pixiIndicatorNodeUpgradeLevelCreate(upgradeLevel);
    upgradeIndicator.eventMode = 'none';
    upgradeIndicator.cullable = true;
    spriteData.objectContainer.addChild(upgradeIndicator);
  }

  // Add level indicator showing encounter level with rarity-based color
  if (spriteData.objectContainer && nodeData.encounterLevel >= 1) {
    const levelIndicator = pixiIndicatorNodeLevelCreate(nodeData);
    levelIndicator.eventMode = 'none';
    levelIndicator.cullable = true;
    spriteData.objectContainer.addChild(levelIndicator);
  }

  if (
    !getOption('debugDisableFogOfWar') &&
    !fogIsPositionRevealed(nodeData.x, nodeData.y)
  ) {
    const fogOfWarSprite = new Sprite(objectTextures['0027']);
    fogOfWarSprite.x = pixelX;
    fogOfWarSprite.y = pixelY;
    fogOfWarSprite.width = 64;
    fogOfWarSprite.height = 64;
    fogOfWarSprite.interactive = false;
    fogOfWarSprite.alpha = 0.65;
    mapContainer.addChild(fogOfWarSprite);
  }

  // Add debug text showing coordinates if debug mode is enabled
  if (debugMode) {
    const debugText = new Text({
      text: `${nodeData.x},${nodeData.y}`,
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
    debugText.eventMode = 'none'; // Disable interaction

    mapContainer.addChild(debugText);
    spriteData.debugText = debugText;
  }

  return spriteData;
}
