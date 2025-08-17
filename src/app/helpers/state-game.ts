import type { Signal } from '@angular/core';
import { signal } from '@angular/core';
import { defaultGameState } from '@helpers/defaults';
import { error } from '@helpers/logging';
import { localStorageSignal } from '@helpers/signal';
import { type GameId, type GameState } from '@interfaces';

const _uncommittedGamestate = signal<GameState | undefined>(undefined);
export const uncommittedGamestate: Signal<GameState | undefined> =
  _uncommittedGamestate.asReadonly();

const _gamestate = localStorageSignal<GameState>(
  'gamestate',
  defaultGameState(),
);
const __backingGamestate: Signal<GameState> = _gamestate.asReadonly();

export function gamestate(): GameState {
  return _uncommittedGamestate() ?? __backingGamestate();
}

export const isGameStateReady = signal<boolean>(false);

export function resetGameState(): void {
  _gamestate.set(defaultGameState());
}

export function setGameState(state: GameState): void {
  _gamestate.set(structuredClone(state));
}

export function updateGamestate(func: (state: GameState) => GameState): void {
  const uncommitted = _uncommittedGamestate();
  if (uncommitted) {
    const res = func(uncommitted);
    if (!res) {
      error(
        'GameState:Update',
        `Failed to update game state. Would be set to a falsy value.`,
        new Error().stack,
      );
      return;
    }

    _uncommittedGamestate.set(res);
    return;
  }

  const res = func(__backingGamestate());
  if (!res) {
    error(
      'GameState:Update',
      `Failed to update game state. Would be set to a falsy value.`,
      new Error().stack,
    );
    return;
  }

  setGameState(res);
}

export function myGameId(): GameId {
  return __backingGamestate().gameId;
}

export function beginGameStateCommits(): void {
  _uncommittedGamestate.set(structuredClone(uncommittedGamestate()));
}

export function endGameStateCommits(): void {
  const uncommitted = _uncommittedGamestate();
  if (uncommitted) {
    setGameState(uncommitted);
  }

  _uncommittedGamestate.set(undefined);
}
