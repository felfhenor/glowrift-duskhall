import { Combat } from '@interfaces/combat';
import { CurrencyBlock } from '@interfaces/currency';
import { EquipmentItem } from '@interfaces/equipment';
import { Hero, HeroRiskTolerance } from '@interfaces/hero';
import { Branded } from '@interfaces/identifiable';
import { EquipmentSkill } from '@interfaces/skill';
import { Timer } from '@interfaces/timer';
import { TownBuilding } from '@interfaces/town';
import { WorldLocation, WorldPosition } from '@interfaces/world';
import { LocationType } from '@interfaces/worldconfig';

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
