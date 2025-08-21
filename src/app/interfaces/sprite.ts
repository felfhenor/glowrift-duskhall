import type { Container } from 'pixi.js';

export interface NodeSpriteData {
  objectContainer: Container;
}

export type NodeSprites = Record<string, NodeSpriteData>;
