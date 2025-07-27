import { focusCameraOnPlayer } from '@helpers/camera';
import { resetCombatLog } from '@helpers/combat-log';
import { setHeroPosition } from '@helpers/hero';
import { finishSetup } from '@helpers/setup';
import { gamestate, resetGameState } from '@helpers/state-game';
import { setWorld } from '@helpers/world';
import { generateWorld } from '@helpers/worldgen';

export async function startGame(): Promise<void> {
  const config = gamestate().world.config;
  const world = await generateWorld(config);
  if (!world.didFinish) return;

  delete world.didFinish;

  setWorld(world);
  setHeroPosition(config.width / 2, config.height / 2);
  focusCameraOnPlayer();
  finishSetup();
}

export function resetGame(): void {
  resetGameState();
  resetCombatLog();
}
