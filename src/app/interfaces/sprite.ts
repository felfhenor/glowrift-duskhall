import type { Sprite, Text } from 'pixi.js';

export interface NodeSpriteData {
  terrain: Sprite;
  object?: Sprite;
  claimIndicator?: Sprite;
  debugText?: Text;
  levelIndicator?: Text;
  upgradeIndicator?: Text;
}

export type NodeSprites = Record<string, NodeSpriteData>;
