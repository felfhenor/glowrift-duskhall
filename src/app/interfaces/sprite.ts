import type { Sprite, Text } from 'pixi.js';

export interface NodeSpriteData {
  terrain: Sprite;
  object?: Sprite;
  claimIndicator?: Sprite;
  debugText?: Text;
}

export type NodeSprites = Record<string, NodeSpriteData>;
