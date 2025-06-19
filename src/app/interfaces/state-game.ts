import { Combat } from './combat';
import { CurrencyBlock } from './currency';
import { EquipmentItem } from './equipment';
import { Hero, HeroRiskTolerance } from './hero';
import { Branded } from './identifiable';
import { EquipmentSkill } from './skill';
import { Timer } from './timer';
import { TownBuilding } from './town';
import { WorldLocation, WorldPosition } from './world';
import { LocationType } from './worldconfig';

export type GameId = Branded<string, 'GameId'>;

export interface GameStateMeta {
  version: number;
  isSetup: boolean;
  isPaused: boolean;
  createdAt: number;
}

export type GameStateCamera = WorldPosition;

export type GameStateHeroesPosition = WorldPosition & { nodeId: string };

export interface GameStateWorld {
  width: number;
  height: number;
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
}
