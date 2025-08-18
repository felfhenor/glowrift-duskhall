import { signal } from '@angular/core';
import { defaultGameState } from '@helpers/defaults';
import { error } from '@helpers/logging';
import { indexedDbSignal } from '@helpers/signal';
import { type GameState } from '@interfaces';

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

export function updateGamestate(func: (state: GameState) => GameState): void {
  if (tickGamestate) {
    const uncommitted = tickGamestate;
    const res = func(uncommitted);
    if (!res) {
      error(
        'GameState:Update',
        `Failed to update game state. Would be set to a falsy value.`,
        new Error().stack,
      );
      return;
    }

    tickGamestate = res;
    return;
  }

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

  _liveGameState.set(structuredClone(res));
}

export function resetGameState(): void {
  setGameState(defaultGameState());
}

export function saveGameState(): void {
  _savedGamestate.set(structuredClone(_liveGameState()));
}

export function gamestateTickStart(): void {
  tickGamestate = structuredClone(_liveGameState());
}

export function gamestateTickEnd(): void {
  if (tickGamestate) {
    _liveGameState.set(tickGamestate);
  }

  tickGamestate = undefined;
}
