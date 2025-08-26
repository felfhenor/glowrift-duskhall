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
  objectSpriteName: string,
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

  const spriteContainer = new Container();
  const spriteData: NodeSpriteData = { objectContainer: spriteContainer };

  spriteData.objectContainer = spriteContainer;
  spriteContainer.x = pixelX;
  spriteContainer.y = pixelY;
  mapContainer.addChild(spriteContainer);

  const terrainSprite = new Sprite(terrainTexture);
  terrainSprite.cullable = true;
  spriteContainer.addChild(terrainSprite);

  if (objectSpriteName) {
    const objectTexture = objectTextures[objectSpriteName];
    if (objectTexture) {
      const objectSprite = new Sprite(objectTexture);
      objectSprite.interactive = true;
      objectSprite.cursor = 'pointer';
      objectSprite.cullable = true;

      if (onObjectClick) {
        objectSprite.on('click', () => {
          onObjectClick(nodeData);
        });
      }

      spriteContainer.addChild(objectSprite);
    }
  }

  const upgradeLevel = locationLevel(nodeData);
  if (
    nodeData.nodeType &&
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
    spriteContainer.addChild(claimIndicator);
  }

  // Add upgrade level indicator if it makes sense to
  if (nodeData.currentlyClaimed && upgradeLevel >= 1) {
    const upgradeIndicator = pixiIndicatorNodeUpgradeLevelCreate(upgradeLevel);
    upgradeIndicator.eventMode = 'none';
    upgradeIndicator.cullable = true;
    spriteContainer.addChild(upgradeIndicator);
  }

  // Add level indicator showing encounter level with rarity-based color
  if (nodeData.encounterLevel >= 1) {
    const levelIndicator = pixiIndicatorNodeLevelCreate(nodeData);
    levelIndicator.eventMode = 'none';
    levelIndicator.cullable = true;
    spriteContainer.addChild(levelIndicator);
  }

  if (
    !getOption('debugDisableFogOfWar') &&
    !fogIsPositionRevealed(nodeData.x, nodeData.y)
  ) {
    const fogOfWarSprite = new Sprite(objectTextures['0000']);
    fogOfWarSprite.width = 64;
    fogOfWarSprite.height = 64;
    fogOfWarSprite.interactive = false;
    fogOfWarSprite.alpha = 0.65;
    spriteContainer.addChild(fogOfWarSprite);
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
    debugText.x = 64 - 30; // 30px from right edge
    debugText.y = 2; // 2px from top
    debugText.cullable = true;
    debugText.eventMode = 'none'; // Disable interaction

    spriteContainer.addChild(debugText);
  }

  return spriteData;
}
