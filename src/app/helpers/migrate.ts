import { defaultGameState } from '@helpers/defaults';
import { migrateItems } from '@helpers/migrate-items';
import { migrateSkills } from '@helpers/migrate-skills';
import {
  gamestate,
  gamestateTickEnd,
  gamestateTickStart,
  saveGameState,
  setGameState,
} from '@helpers/state-game';
import { defaultOptions, options, setOptions } from '@helpers/state-options';
import { migrateCleanupOldTimerEntries } from '@helpers/timer';
import {
  migratePermanentlyClaimedNodes,
  migrateResetClaimedNodeCounts,
  migrateUnclaimMissedNodes,
} from '@helpers/world-location';
import { merge } from 'es-toolkit/compat';

export function migrateGameState() {
  const state = gamestate();
  const newState = merge(defaultGameState(), state);
  setGameState(newState);

  gamestateTickStart();
  migrateItems();
  migrateSkills();

  migrateCleanupOldTimerEntries();
  migrateUnclaimMissedNodes();
  migratePermanentlyClaimedNodes();
  migrateResetClaimedNodeCounts();
  gamestateTickEnd();
  saveGameState();
}

export function migrateOptionsState() {
  const state = options();
  const newState = merge(defaultOptions(), state);
  setOptions(newState);
}
