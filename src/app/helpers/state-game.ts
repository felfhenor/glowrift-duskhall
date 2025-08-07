import type { Signal } from '@angular/core';
import { signal } from '@angular/core';
import {
  getDefaultCurrencyBlock,
  getDefaultHero,
  getDefaultNodeCountBlock,
  getDefaultPosition,
  getDefaultWorldConfig,
} from '@helpers/defaults';
import { uuid } from '@helpers/rng';
import { localStorageSignal } from '@helpers/signal';
import { type GameId, type GameState } from '@interfaces';
import { cloneDeep } from 'es-toolkit/compat';

export function blankGameState(): GameState {
  return {
    meta: {
      version: 1,
      isSetup: false,
      isPaused: false,
      createdAt: Date.now(),
      hasDismissedWinNotification: false,
      hasWon: false,
      wonAtTick: 0,
    },
    gameId: uuid() as GameId,
    world: {
      config: getDefaultWorldConfig(),
      nodes: {},
      homeBase: getDefaultPosition(),
      nodeCounts: getDefaultNodeCountBlock(),
      claimedCounts: getDefaultNodeCountBlock(),
    },
    camera: getDefaultPosition(),
    hero: {
      respawnTicks: 0,
      riskTolerance: 'medium',
      heroes: [
        getDefaultHero({ name: 'Ignatius', sprite: '0004' }),
        getDefaultHero({ name: 'Aquara', sprite: '0000' }),
        getDefaultHero({ name: 'Zephyra', sprite: '0036' }),
        getDefaultHero({ name: 'Terrus', sprite: '0060' }),
      ],
      position: {
        nodeId: '',
        ...getDefaultPosition(),
      },
      travel: {
        nodeId: '',
        ...getDefaultPosition(),
        ticksLeft: 0,
      },
      location: {
        ticksLeft: 0,
        ticksTotal: 0,
      },
      tooHardNodes: [],
    },
    inventory: {
      items: [],
      skills: [],
    },
    currency: {
      currencyPerTickEarnings: getDefaultCurrencyBlock(),
      currencies: getDefaultCurrencyBlock(),
    },
    actionClock: {
      numTicks: 0,
      timers: {},
    },
    town: {
      buildingLevels: {
        Academy: 1,
        Alchemist: 1,
        Blacksmith: 1,
        Market: 1,
        Merchant: 1,
        Salvager: 1,
      },
      merchant: {
        soldItems: [],
        ticksUntilRefresh: 0,
      },
    },
    festival: {
      ticksWithoutFestivalStart: 0,
      festivals: {},
    },
  };
}

const _gamestate = localStorageSignal<GameState>('gamestate', blankGameState());
export const gamestate: Signal<GameState> = _gamestate.asReadonly();

export const isGameStateReady = signal<boolean>(false);

export function resetGameState(): void {
  _gamestate.set(blankGameState());
}

export function setGameState(state: GameState): void {
  _gamestate.set(cloneDeep(state));
}

export function updateGamestate(func: (state: GameState) => GameState): void {
  const newState = func(gamestate());
  setGameState(newState);
}

export function myGameId(): GameId {
  return gamestate().gameId;
}
