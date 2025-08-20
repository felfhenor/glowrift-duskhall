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
