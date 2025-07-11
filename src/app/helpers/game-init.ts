import { WorldConfig } from '../interfaces';
import { focusCameraOnPlayer } from './camera';
import { resetCombatLog } from './combat-log';
import { setHeroPosition } from './hero';
import { finishSetup } from './setup';
import { resetGameState } from './state-game';
import { setWorld } from './world';
import { generateWorld } from './worldgen';

export function startGame(config: WorldConfig): void {
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
