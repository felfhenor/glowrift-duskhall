import { WorldLocation } from '@interfaces/world';

export interface MapTileData {
  x: number;
  y: number;
  nodeData: WorldLocation;
}

export interface MapGridData {
  tiles: MapTileData[][];
  width: number;
  height: number;
}
