import { signal } from '@angular/core';
import { defaultGameState } from '@helpers/defaults';
import { error } from '@helpers/logging';
import { schedulerYield } from '@helpers/scheduler';
import { indexedDbSignal } from '@helpers/signal';
import {
  type EquipmentItem,
  type EquipmentSkill,
  type GameState,
} from '@interfaces';

export const isGameStateReady = signal<boolean>(false);

let tickGamestate: GameState | undefined = undefined;

const _liveGameState = signal<GameState>(defaultGameState());

export function gamestate() {
  return tickGamestate ?? _liveGameState();
}

const _savedGamestate = indexedDbSignal<GameState>(
  'gamestate',
  defaultGameState(),
  (state: GameState) => {
    _liveGameState.set(state);
  },
);

export function setGameState(state: GameState, commit = true): void {
  _liveGameState.set(state);

  if (commit) {
    saveGameState();
  }
}

export async function updateGamestate(
  func: (state: GameState) => GameState,
): Promise<void> {
  if (tickGamestate) {
    const uncommitted = tickGamestate;
    const res = func(uncommitted);
    if (!res) {
      error(
        'GameState:Update',
        `Failed to update game state. Would be set to a falsy value.`,
        new Error(),
      );
      return;
    }

    tickGamestate = res;

    return;
  }

  await schedulerYield();
  const uncommitted = _liveGameState();
  const res = func(uncommitted);
  if (!res) {
    error(
      'GameState:Update',
      `Failed to update game state. Would be set to a falsy value.`,
      new Error().stack,
    );
    return;
  }

  setGameState(structuredClone(res));
}

export function resetGameState(): void {
  setGameState(defaultGameState());
}

export function saveGameState(): void {
  _savedGamestate.set(formatGameStateForSave(_liveGameState()));
}

export function formatGameStateForSave(gameState: GameState): GameState {
  const optimized = structuredClone(gameState);

  // Strip default/empty properties from inventory items
  optimized.inventory.items = optimized.inventory.items.map((item) => {
    const result: Partial<EquipmentItem> = { ...item };

    delete result.elementMultipliers;
    delete result.traitIds;
    delete result.talentBoosts;
    delete result.skillIds;
    delete result.unableToUpgrade;
    delete result.enchantLevel;
    delete result.preventModification;
    delete result.preventDrop;
    delete result.baseStats;
    delete result.dropLevel;
    delete result.name;
    delete result.rarity;
    delete result.sprite;
    delete result.__type;
    delete result.description;
    delete result.symmetryCount;

    // Remove empty mods object
    if (item.mods && Object.keys(item.mods).length === 0) delete result.mods;
    if (item.isFavorite === false) delete result.isFavorite;

    return result as EquipmentItem;
  });

  // Strip default/empty properties from inventory skills
  optimized.inventory.skills = optimized.inventory.skills.map((skill) => {
    const result: Partial<EquipmentSkill> = { ...skill };

    delete result.techniques;
    delete result.unableToUpgrade;
    delete result.enchantLevel;
    delete result.usesPerCombat;
    delete result.numTargets;
    delete result.frames;
    delete result.damageScaling;
    delete result.statusEffectChanceBoost;
    delete result.preventDrop;
    delete result.disableUpgrades;
    delete result.statusEffectDurationBoost;
    delete result.preventModification;
    delete result.__type;
    delete result.description;
    delete result.rarity;
    delete result.name;
    delete result.dropLevel;
    delete result.sprite;
    delete result.symmetryCount;

    if (skill.mods && Object.keys(skill.mods).length === 0) delete result.mods;
    if (skill.isFavorite === false) delete result.isFavorite;

    return result as EquipmentSkill;
  });

  return optimized;
}

export function gamestateTickStart(): void {
  tickGamestate = Object.assign({}, _liveGameState());
}

export function gamestateTickEnd(): void {
  if (tickGamestate) {
    _liveGameState.set(tickGamestate);
  }

  tickGamestate = undefined;
}
