import { heroPositionGet } from '@helpers/hero';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { windowHeightTiles, windowWidthTiles } from '@helpers/ui';
import { clamp } from 'es-toolkit/compat';

export function cameraPositionSet(x: number, y: number) {
  const worldWidth = gamestate().world.config.width;
  const worldHeight = gamestate().world.config.height;

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

export function cameraCenterOn(x: number, y: number): void {
  const tileWidth = windowWidthTiles();
  const tileHeight = windowHeightTiles();

  cameraPositionSet(x - tileWidth / 2, y - tileHeight / 2);
}

export function cameraCenterOnPlayer() {
  const { x, y } = heroPositionGet();

  cameraCenterOn(x, y);
}
