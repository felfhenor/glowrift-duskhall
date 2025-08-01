import type { Combat } from '@interfaces/combat';
import type { CurrencyBlock } from '@interfaces/content-currency';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { EquipmentSkill } from '@interfaces/content-skill';
import type { Hero, HeroRiskTolerance } from '@interfaces/hero';
import type { Branded } from '@interfaces/identifiable';
import type { Timer } from '@interfaces/timer';
import type { TownBuilding } from '@interfaces/town';
import type { WorldLocation, WorldPosition } from '@interfaces/world';
import type { LocationType, WorldConfigContent } from '@interfaces/worldconfig';

export type GameId = Branded<string, 'GameId'>;

export interface GameStateMeta {
  version: number;
  isSetup: boolean;
  isPaused: boolean;
  hasWon: boolean;
  hasDismissedWinNotification: boolean;
  wonAtTick: number;
  createdAt: number;
}

export type GameStateCamera = WorldPosition;

export type GameStateHeroesPosition = WorldPosition & { nodeId: string };

export interface GameStateWorld {
  config: WorldConfigContent;
  nodes: Record<string, WorldLocation>;
  homeBase: WorldPosition;

  nodeCounts: Record<LocationType, number>;
  claimedCounts: Record<LocationType, number>;
}

export type GameStateHeroesTraveling = WorldPosition & {
  nodeId: string;
  ticksLeft: number;
};

export type GameStateHeroesLocation = {
  ticksTotal: number;
  ticksLeft: number;
};

export interface GameStateHeroes {
  riskTolerance: HeroRiskTolerance;
  heroes: Hero[];
  position: GameStateHeroesPosition;
  travel: GameStateHeroesTraveling;
  location: GameStateHeroesLocation;
  respawnTicks: number;
  combat?: Combat;
}

export interface GameStateInventory {
  items: EquipmentItem[];
  skills: EquipmentSkill[];
}

export interface GameStateCurrency {
  currencyPerTickEarnings: CurrencyBlock;
  currencies: CurrencyBlock;
}

export interface GameStateActionClock {
  numTicks: number;
  timers: Record<number, Timer[]>;
}

export interface GameStateTownMerchant {
  ticksUntilRefresh: number;
  soldItems: (EquipmentItem | undefined)[];
}

export interface GameStateTown {
  buildingLevels: Record<TownBuilding, number>;
  merchant: GameStateTownMerchant;
}

export interface GameStateFestival {
  ticksWithoutFestivalStart: number;
  festivals: Record<string, number>;
}

export interface GameState {
  meta: GameStateMeta;
  gameId: GameId;
  world: GameStateWorld;
  camera: GameStateCamera;
  hero: GameStateHeroes;
  inventory: GameStateInventory;
  currency: GameStateCurrency;
  actionClock: GameStateActionClock;
  town: GameStateTown;
  festival: GameStateFestival;
}
