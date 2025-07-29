import { migrateItems } from '@helpers/migrate-items';
import { migrateSkills } from '@helpers/migrate-skills';
import { blankGameState, gamestate, setGameState } from '@helpers/state-game';
import { defaultOptions, options, setOptions } from '@helpers/state-options';
import { merge } from 'es-toolkit/compat';

export function migrateGameState() {
  const state = gamestate();
  const newState = merge(blankGameState(), state);
  setGameState(newState);

  migrateItems();
  migrateSkills();
}

export function migrateOptionsState() {
  const state = options();
  const newState = merge(defaultOptions(), state);
  setOptions(newState);
}
