import type { Sprite } from 'pixi.js';

export interface NodeSpriteData {
  terrain: Sprite;
  object?: Sprite;
  claimIndicator?: Sprite;
}

export type NodeSprites = Record<string, NodeSpriteData>;
