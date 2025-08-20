import type { Texture } from 'pixi.js';
import { Graphics, Sprite } from 'pixi.js';

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

  return graphics;
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
): { sprite: Sprite; ticker: () => void } {
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

  const ticker = () => {
    bobOffset += 0.4;
    sprite.y = pixelY + Math.sin(bobOffset) * 2;
  };

  return { sprite, ticker };
}
