import type { Signal } from '@angular/core';
import { signal } from '@angular/core';
import {
  defaultCurrencyBlock,
  defaultHero,
  defaultNodeCountBlock,
  defaultPosition,
} from '@helpers/defaults';
import { uuid } from '@helpers/rng';
import { localStorageSignal } from '@helpers/signal';
import type { GameId, GameState } from '@interfaces';
import { cloneDeep } from 'lodash';

export function blankGameState(): GameState {
  return {
    meta: {
      version: 1,
      isSetup: false,
      isPaused: false,
      createdAt: Date.now(),
    },
    gameId: uuid() as GameId,
    world: {
      width: 0,
      height: 0,
      nodes: {},
      homeBase: defaultPosition(),
      nodeCounts: defaultNodeCountBlock(),
      claimedCounts: defaultNodeCountBlock(),
    },
    camera: defaultPosition(),
    hero: {
      respawnTicks: 0,
      riskTolerance: 'low',
      heroes: [
        defaultHero({ name: 'Ignatius', sprite: '0004' }),
        defaultHero({ name: 'Aquara', sprite: '0000' }),
        defaultHero({ name: 'Terrus', sprite: '0060' }),
        defaultHero({ name: 'Zephyra', sprite: '0036' }),
      ],
      position: {
        nodeId: '',
        ...defaultPosition(),
      },
      travel: {
        nodeId: '',
        ...defaultPosition(),
        ticksLeft: 0,
      },
      location: {
        ticksLeft: 0,
        ticksTotal: 0,
      },
    },
    inventory: {
      items: [],
      skills: [],
    },
    currency: {
      currencyPerTickEarnings: defaultCurrencyBlock(),
      currencies: defaultCurrencyBlock(),
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
