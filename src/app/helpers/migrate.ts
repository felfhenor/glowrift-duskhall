import { defaultGameState } from '@helpers/defaults';
import { interconnectednessRecalculate } from '@helpers/interconnectedness';
import { migrateHeroes } from '@helpers/migrate-heroes';
import { migrateItems } from '@helpers/migrate-items';
import { migrateSkills } from '@helpers/migrate-skills';
import {
  migrateLocationTypeCounts,
  migratePermanentlyClaimedNodes,
  migrateResetClaimedNodeCounts,
  migrateUnclaimMissedNodes,
} from '@helpers/migrate-world';
import {
  gamestate,
  gamestateTickEnd,
  gamestateTickStart,
  saveGameState,
  setGameState,
} from '@helpers/state-game';
import { defaultOptions, options, setOptions } from '@helpers/state-options';
import { migrateCleanupOldTimerEntries } from '@helpers/timer';
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
  migrateLocationTypeCounts();
  migrateHeroes();
  gamestateTickEnd();
  saveGameState();

  interconnectednessRecalculate();
}

export function migrateOptionsState() {
  const state = options();
  const { empireSelectedLocationTypes, empireSelectedOwnershipTypes } = state;

  const newState = merge(defaultOptions(), state);

  newState.empireSelectedLocationTypes = empireSelectedLocationTypes ?? [];
  newState.empireSelectedOwnershipTypes = empireSelectedOwnershipTypes ?? [];

  setOptions(newState);
}
