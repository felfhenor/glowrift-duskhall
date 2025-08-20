import { error } from '@helpers/logging';
import type { LoadedTextures, TextureAtlas } from '@interfaces';
import { Assets, Rectangle, Texture } from 'pixi.js';

/**
 * Loads textures from a spritesheet and atlas data
 * @param spritesheetPath Path to the spritesheet image
 * @param atlasData Atlas data containing sprite coordinates
 * @returns Object containing loaded textures keyed by sprite name
 */
export async function pixiTextureAtlasLoad(
  spritesheetPath: string,
  atlasData: TextureAtlas,
): Promise<LoadedTextures> {
  const spritesheetTexture = await Assets.load(spritesheetPath);
  const textures: LoadedTextures = {};

  Object.keys(atlasData).forEach((key) => {
    const frameData = atlasData[key];
    const texture = new Texture({
      source: spritesheetTexture.source,
      frame: new Rectangle(
        frameData.x,
        frameData.y,
        frameData.width,
        frameData.height,
      ),
    });

    const spriteName = key.split('/').pop()?.replace('.png', '') || '';
    textures[spriteName] = texture;
  });

  return textures;
}

/**
 * Loads both terrain and object textures for the game map
 * @param terrainAtlasData Atlas data for terrain sprites
 * @param objectAtlasData Atlas data for object sprites
 * @returns Object containing both terrain and object textures
 */
export async function pixiTextureGameMapLoad(
  terrainAtlasData: TextureAtlas,
  objectAtlasData: TextureAtlas,
): Promise<{
  terrainTextures: LoadedTextures;
  objectTextures: LoadedTextures;
}> {
  const [terrainTextures, objectTextures] = await Promise.all([
    pixiTextureAtlasLoad(
      'art/spritesheets/world-terrain.webp',
      terrainAtlasData,
    ),
    pixiTextureAtlasLoad('art/spritesheets/world-object.webp', objectAtlasData),
  ]);

  return { terrainTextures, objectTextures };
}

/**
 * Creates a canvas-based texture for an icon
 * @param iconText Unicode character for the icon (e.g., "✓" or "✗")
 * @param color Color of the icon
 * @param size Size of the icon in pixels
 * @returns PIXI Texture
 */
export function pixiTextureClaimCreate(
  iconText: string,
  color: string = '#ffffff',
  size: number = 20,
): Texture {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = size;
  canvas.height = size;

  ctx.clearRect(0, 0, size, size);

  ctx.fillStyle = color;
  ctx.font = `bold ${size - 4}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.strokeText(iconText, size / 2, size / 2);
  ctx.fillText(iconText, size / 2, size / 2);

  try {
    return Texture.from(canvas);
  } catch (err) {
    error('PixiMap', 'Failed to create claim texture:', err);

    // Return a minimal fallback texture if creation fails
    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = size;
    fallbackCanvas.height = size;
    return Texture.from(fallbackCanvas);
  }
}

/**
 * Creates check and X textures for claim indicators
 * @returns Object with check and X textures
 */
export function pixiIconTextureClaimCreate(): {
  checkTexture: Texture;
  xTexture: Texture;
} {
  return {
    checkTexture: pixiTextureClaimCreate('✓', '#16a34a', 20),
    xTexture: pixiTextureClaimCreate('✗', '#dc2626', 20),
  };
}
