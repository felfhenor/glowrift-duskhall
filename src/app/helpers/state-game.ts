import type { Signal } from '@angular/core';
import { signal } from '@angular/core';
import {
  defaultCurrencyBlock,
  defaultHero,
  defaultLootRarityPreferences,
  defaultNodeCountBlock,
  defaultNodeTypePreferences,
  defaultPosition,
  defaultWorldConfig,
} from '@helpers/defaults';
import { rngUuid } from '@helpers/rng';
import { localStorageSignal } from '@helpers/signal';
import { type GameId, type GameState } from '@interfaces';

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
    gameId: rngUuid() as GameId,
    world: {
      config: defaultWorldConfig(),
      nodes: {},
      homeBase: defaultPosition(),
      nodeCounts: defaultNodeCountBlock(),
      claimedCounts: defaultNodeCountBlock(),
    },
    camera: defaultPosition(),
    hero: {
      respawnTicks: 0,
      riskTolerance: 'medium',
      nodeTypePreferences: defaultNodeTypePreferences(),
      lootRarityPreferences: defaultLootRarityPreferences(),
      heroes: [
        defaultHero({ name: 'Ignatius', sprite: '0004' }),
        defaultHero({ name: 'Aquara', sprite: '0000' }),
        defaultHero({ name: 'Zephyra', sprite: '0036' }),
        defaultHero({ name: 'Terrus', sprite: '0060' }),
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
      tooHardNodes: [],
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

let uncommittedGamestate: GameState | undefined = undefined;

const _gamestate = localStorageSignal<GameState>('gamestate', blankGameState());
const __backingGamestate: Signal<GameState> = _gamestate.asReadonly();

export function gamestate(): GameState {
  return uncommittedGamestate ?? __backingGamestate();
}

export const isGameStateReady = signal<boolean>(false);

export function resetGameState(): void {
  _gamestate.set(blankGameState());
}

export function setGameState(state: GameState): void {
  _gamestate.set(structuredClone(state));
}

export function updateGamestate(func: (state: GameState) => GameState): void {
  if (uncommittedGamestate) {
    uncommittedGamestate = func(uncommittedGamestate);
    return;
  }

  const newState = func(__backingGamestate());
  setGameState(newState);
}

export function myGameId(): GameId {
  return __backingGamestate().gameId;
}

export function beginGameStateCommits(): void {
  uncommittedGamestate = structuredClone(__backingGamestate());
}

export function endGameStateCommits(): void {
  if (uncommittedGamestate) {
    setGameState(uncommittedGamestate);
  }

  uncommittedGamestate = undefined;
}
