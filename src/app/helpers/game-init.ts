import { cameraCenterOnPlayer } from '@helpers/camera';
import { combatLogReset } from '@helpers/combat-log';
import { heroPositionSet } from '@helpers/hero';
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
  heroPositionSet(config.width / 2, config.height / 2);
  cameraCenterOnPlayer();
  setupFinish();
}

export function gameReset(): void {
  resetGameState();
  combatLogReset();
}
