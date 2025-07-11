import { clamp } from 'lodash';
import { getHeroPosition } from '@helpers/hero';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { windowHeightTiles, windowWidthTiles } from '@helpers/ui';

export function setCameraPosition(x: number, y: number) {
  const worldWidth = gamestate().world.width;
  const worldHeight = gamestate().world.height;

  const tileWidth = windowWidthTiles();
  const tileHeight = windowHeightTiles();

  updateGamestate((state) => {
    x = clamp(Math.floor(x), 0, Math.floor(worldWidth - tileWidth));
    y = clamp(Math.floor(y), 0, Math.floor(worldHeight - tileHeight));
    state.camera.x = x;
    state.camera.y = y;
    return state;
  });
}

export function centerCameraOn(x: number, y: number): void {
  const tileWidth = windowWidthTiles();
  const tileHeight = windowHeightTiles();

  setCameraPosition(x - tileWidth / 2, y - tileHeight / 2);
}

export function focusCameraOnPlayer() {
  const { x, y } = getHeroPosition();

  centerCameraOn(x, y);
}
