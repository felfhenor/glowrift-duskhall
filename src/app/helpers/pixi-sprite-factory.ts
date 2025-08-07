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

/**
 * Creates a travel line between two positions
 * @param fromX Start grid x position
 * @param fromY Start grid y position
 * @param toX End grid x position
 * @param toY End grid y position
 * @param container Container to add line to
 * @returns Graphics object representing the travel line
 */
export function createTravelLine(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  container: Container,
): Graphics {
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
  return graphics;
}

/**
 * Creates a destination marker for the travel target
 * @param x Grid x position
 * @param y Grid y position
 * @param container Container to add indicator to
 * @param ticker PIXI ticker for animation
 * @returns Graphics object with cleanup function
 */
export function createDestinationIndicator(
  x: number,
  y: number,
  container: Container,
  ticker: Ticker,
): Graphics {
  const pixelX = x * 64;
  const pixelY = y * 64;

  const graphics = new Graphics();
  graphics.setStrokeStyle({ width: 4, color: 0xff8000, alpha: 1 });
  graphics.rect(pixelX, pixelY, 64, 64);
  graphics.stroke();

  let scale = 1;
  let direction = 1;

  const animate = () => {
    scale += direction * 0.005;
    if (scale <= 0.9) direction = 1;
    if (scale >= 1.1) direction = -1;
    graphics.scale.set(scale, scale);
    graphics.x = pixelX + (64 * (1 - scale)) / 2;
    graphics.y = pixelY + (64 * (1 - scale)) / 2;
  };

  ticker.add(animate);
  container.addChild(graphics);

  return graphics;
}

/**
 * Creates a hero sprite indicator at the interpolated travel position
 * @param x Interpolated x position (can be fractional)
 * @param y Interpolated y position (can be fractional)
 * @param heroTexture Texture for the hero sprite
 * @param container Container to add sprite to
 * @param ticker PIXI ticker for animation
 * @returns Sprite object representing the traveling hero
 */
export function createTravelingHeroIndicator(
  x: number,
  y: number,
  heroTexture: Texture,
  container: Container,
  ticker: Ticker,
): Sprite {
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
  const animate = () => {
    bobOffset += 0.1;
    sprite.y = pixelY + Math.sin(bobOffset) * 2;
  };

  ticker.add(animate);
  container.addChild(sprite);

  return sprite;
}
