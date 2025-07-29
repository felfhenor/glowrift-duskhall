import type { WorldLocation } from '@interfaces';
import type { NodeSpriteData } from '@interfaces/sprite';
import type { Container, Texture, Ticker } from 'pixi.js';
import { Graphics, Sprite } from 'pixi.js';

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
 * @returns Created sprite data
 */
export function createNodeSprites(
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

  if (objectSprite && checkTexture && xTexture) {
    const claimIndicator = createClaimIndicator(
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

  return spriteData;
}

/**
 * Creates an animated player indicator at the specified position
 * @param x Grid x position
 * @param y Grid y position
 * @param container Container to add indicator to
 * @param ticker PIXI ticker for animation
 * @returns Graphics object with cleanup function
 */
export function createPlayerIndicator(
  x: number,
  y: number,
  container: Container,
  ticker: Ticker,
): Graphics {
  const pixelX = x * 64;
  const pixelY = y * 64;

  const graphics = new Graphics();
  graphics.setStrokeStyle({ width: 4, color: 0xffffff, alpha: 1 });
  graphics.rect(pixelX, pixelY, 64, 64);
  graphics.stroke();

  let alpha = 1;
  let direction = -1;

  const animate = () => {
    alpha += direction * 0.01;
    if (alpha <= 0.3) direction = 1;
    if (alpha >= 1) direction = -1;
    graphics.alpha = alpha;
  };

  ticker.add(animate);
  container.addChild(graphics);

  return graphics;
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
export function createClaimIndicator(
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

  sprite.x = pixelX + 2;
  sprite.y = pixelY + 64 - 24;
  sprite.width = 20;
  sprite.height = 20;

  return sprite;
}
