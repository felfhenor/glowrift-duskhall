import type { WorldLocation } from '@interfaces/world';
import { REVELATION_RADIUS } from '@interfaces/world';
import { Graphics } from 'pixi.js';

/**
 * Creates an animated player indicator at the specified position
 *
 * @returns Object with graphics and cleanup function
 */
export function pixiIndicatorNodePlayerAtLocationCreate(): {
  graphics: Graphics;
  ticker: () => void;
} {
  const graphics = new Graphics()
    .rect(0, 0, 64, 64)
    .fill(0xffffff)
    .rect(2, 2, 60, 60)
    .cut();

  graphics.cullable = true;

  let alpha = 1;
  let direction = -1;
  let lastTime = performance.now();
  const animationSpeed = 0.002; // Slower animation speed

  const ticker = () => {
    const now = performance.now();

    const deltaTime = now - lastTime;
    lastTime = now;

    alpha += direction * animationSpeed * deltaTime;
    if (alpha <= 0.4) direction = 1;
    if (alpha >= 0.8) direction = -1;

    // Clamp alpha to valid range
    alpha = Math.max(0.4, Math.min(0.8, alpha));
    graphics.alpha = alpha;
  };

  return { graphics, ticker };
}

export function pixiIndicatorNodePlayerAtLocationArrowCreate(): {
  graphics: Graphics;
  ticker: () => void;
} {
  const START_X = 27;
  const START_Y = 22;

  const graphics = new Graphics()
    .moveTo(START_X - 1, START_Y - 1)
    .lineTo(START_X + 9, START_Y)
    .lineTo(START_X + 9, START_Y + 17)
    .lineTo(START_X + 13, START_Y + 17)
    .lineTo(START_X + 6, START_Y + 26)
    .lineTo(START_X + 4, START_Y + 26)
    .lineTo(START_X - 5, START_Y + 17)
    .lineTo(START_X - 1, START_Y + 17)
    .lineTo(START_X - 1, START_Y - 1)
    .fill(0x000000)

    .moveTo(START_X, START_Y)
    .lineTo(START_X + 8, START_Y)
    .lineTo(START_X + 8, START_Y + 16)
    .lineTo(START_X + 12, START_Y + 16)
    .lineTo(START_X + 5, START_Y + 25)
    .lineTo(START_X + 3, START_Y + 25)
    .lineTo(START_X - 4, START_Y + 16)
    .lineTo(START_X, START_Y + 16)
    .lineTo(START_X, START_Y)
    .fill(0xffffff);

  graphics.cullable = true;

  const pixelY = -64;

  let bobOffset = 0;

  const ticker = () => {
    bobOffset += 0.4;
    graphics.y = pixelY + Math.sin(bobOffset) * 2;
  };

  return { graphics, ticker };
}

/**
 * Creates an animated territory ownership square
 *
 * @returns Object with graphics and cleanup function
 */
export function pixiIndicatorNodeTerritoryOwnershipCreate(node: WorldLocation):
  | {
      graphics: Graphics;
      ticker: () => void;
    }
  | undefined {
  const type = node.nodeType!;
  if (!['village', 'town'].includes(type)) return undefined;

  const radius = REVELATION_RADIUS[type];
  if (radius === 0) return undefined;

  const numTilesToEnclose = radius * 2 + 1;
  const spaceEncompassed = numTilesToEnclose * 64;

  const graphics = new Graphics()
    .rect(0, 0, spaceEncompassed, spaceEncompassed)
    .fill(0x00ff00)
    .rect(2, 2, spaceEncompassed - 4, spaceEncompassed - 4)
    .cut();

  graphics.zIndex = 10;

  let alpha = 1;
  let direction = -1;
  let lastTime = performance.now();
  const animationSpeed = 0.001; // Slower animation speed

  const ticker = () => {
    const now = performance.now();

    const deltaTime = now - lastTime;
    lastTime = now;

    alpha += direction * animationSpeed * deltaTime;
    if (alpha <= 0.4) direction = 1;
    if (alpha >= 0.8) direction = -1;

    // Clamp alpha to valid range
    alpha = Math.max(0.4, Math.min(0.8, alpha));
    graphics.alpha = alpha;
  };

  return { graphics, ticker };
}
