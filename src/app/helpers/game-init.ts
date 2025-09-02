import { cameraCenterOn } from '@helpers/camera';
import { combatLogReset } from '@helpers/combat-log';
import { fogInvalidateCache } from '@helpers/fog-of-war';
import { heroPositionSet } from '@helpers/hero';
import {
  interconnectednessRecalculate,
  interconnectednessReset,
} from '@helpers/interconnectedness';
import { setupFinish } from '@helpers/setup';
import { gamestate, resetGameState } from '@helpers/state-game';
import { setWorld } from '@helpers/world';
import { worldgenGenerateWorld } from '@helpers/worldgen';

export async function gameStart(): Promise<void> {
  const config = gamestate().world.config;
  const world = await worldgenGenerateWorld(config);
  if (!world.didFinish) return;

  delete world.didFinish;

  setWorld(world);

  setTimeout(() => {
    interconnectednessRecalculate();
    heroPositionSet(world.homeBase.x, world.homeBase.y);
    cameraCenterOn(world.homeBase.x, world.homeBase.y + 1);
    setupFinish();
  }, 0);
}

export function gameReset(): void {
  resetGameState();
  combatLogReset();
  fogInvalidateCache();
  interconnectednessReset();
}
