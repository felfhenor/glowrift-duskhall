import type { WorldLocation } from '@interfaces/world';
import type { Application, Container } from 'pixi.js';

export interface MapTileData {
  x: number;
  y: number;
  tileSprite: string;
}

export interface MapGridData {
  tiles: MapTileData[][];
  width: number;
  height: number;
}

export interface PixiAppConfig {
  width: number;
  height: number;
  backgroundAlpha?: number;
  antialias?: boolean;
}

export interface WorldNodeChangeEvent {
  type: 'claim' | 'unclaim' | 'update';
  node: WorldLocation;
  worldX: number;
  worldY: number;
  timestamp: number;
}

export interface MapState {
  tiles: MapTileData[][];
  width: number;
  height: number;
  cameraX: number;
  cameraY: number;
}

export interface DragHandlerConfig {
  app: Application;
  containers: Container[];
  viewportWidth: number;
  viewportHeight: number;
  tileSize?: number;
}
