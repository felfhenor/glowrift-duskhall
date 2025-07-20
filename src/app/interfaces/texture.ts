import type { Texture } from 'pixi.js';

export type Tile = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TextureAtlas = Record<string, Tile>;

export type LoadedTextures = Record<string, Texture>;
