import type { WorldConfigContent } from '@interfaces';
import { focusCameraOnPlayer } from '@helpers/camera';
import { resetCombatLog } from '@helpers/combat-log';
import { setHeroPosition } from '@helpers/hero';
import { finishSetup } from '@helpers/setup';
import { resetGameState } from '@helpers/state-game';
import { setWorld } from '@helpers/world';
import { generateWorld } from '@helpers/worldgen';

export function startGame(config: WorldConfigContent): void {
  const world = generateWorld(config);

  setWorld(world);
  setHeroPosition(config.width / 2, config.height / 2);
  focusCameraOnPlayer();
  finishSetup();
}

export function resetGame(): void {
  resetGameState();
  resetCombatLog();
}
