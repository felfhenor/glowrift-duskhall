import type { Container, Sprite, Text } from 'pixi.js';

export interface NodeSpriteData {
  terrain: Sprite;
  objectContainer?: Container;
  debugText?: Text;
}

export type NodeSprites = Record<string, NodeSpriteData>;
