import { heroPositionGet } from '@helpers/hero';
import { localStorageSignal } from '@helpers/signal';
import { gamestate } from '@helpers/state-game';
import { windowHeightTiles, windowWidthTiles } from '@helpers/ui';
import type { WorldPosition } from '@interfaces/world';
import { clamp } from 'es-toolkit/compat';

const _camera = localStorageSignal<WorldPosition>('camera', { x: 0, y: 0 });
export const camera = _camera.asReadonly();

export function cameraPositionSet(x: number, y: number) {
  const worldWidth = gamestate().world.config.width;
  const worldHeight = gamestate().world.config.height;

  const tileWidth = windowWidthTiles();
  const tileHeight = windowHeightTiles();

  _camera.set({
    x: clamp(Math.floor(x), 0, Math.floor(worldWidth - tileWidth)),
    y: clamp(Math.floor(y), 0, Math.floor(worldHeight - tileHeight)),
  });
}

export function cameraPosition(): { x: number; y: number } {
  return _camera();
}

export function cameraCenterOn(x: number, y: number): void {
  const tileWidth = windowWidthTiles();
  const tileHeight = windowHeightTiles();

  cameraPositionSet(x - tileWidth / 2, y - tileHeight / 2);
}

export function cameraCenterOnPlayer() {
  const { x, y } = heroPositionGet();

  cameraCenterOn(x, y);
}
