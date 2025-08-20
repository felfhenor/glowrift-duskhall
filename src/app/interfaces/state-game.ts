import type { Combat } from '@interfaces/combat';
import type { CurrencyBlock } from '@interfaces/content-currency';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { EquipmentSkill } from '@interfaces/content-skill';
import type { TownUpgradeId } from '@interfaces/content-townupgrade';
import type {
  LocationType,
  WorldConfigContent,
} from '@interfaces/content-worldconfig';
import type { DropRarity } from '@interfaces/droppable';
import type { Hero, HeroRiskTolerance } from '@interfaces/hero';
import type { Branded } from '@interfaces/identifiable';
import type { Timer } from '@interfaces/timer';
import type { TownBuilding } from '@interfaces/town';
import type { WorldLocation, WorldPosition } from '@interfaces/world';

export type GameId = Branded<string, 'GameId'>;

export interface GameStateMeta {
  version: number;
  isSetup: boolean;
  isPaused: boolean;
  hasWon: boolean;
  hasDismissedWinNotification: boolean;
  wonAtTick: number;
  lastSaveTick: number;
  createdAt: number;
}

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
  ticksTotal: number;
};

export type GameStateHeroesLocation = {
  ticksTotal: number;
  ticksLeft: number;
};

export interface GameStateHeroes {
  riskTolerance: HeroRiskTolerance;
  nodeTypePreferences: Record<LocationType, boolean>;
  lootRarityPreferences: Record<DropRarity, boolean>;
  heroes: Hero[];
  position: GameStateHeroesPosition;
  travel: GameStateHeroesTraveling;
  location: GameStateHeroesLocation;
  respawnTicks: number;
  tooHardNodes: string[];
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
  soldItems: (EquipmentItem | undefined)[];
}

export interface GameStateTown {
  buildingLevels: Record<TownBuilding, number>;
  merchant: GameStateTownMerchant;
  townUpgrades: Record<TownUpgradeId, boolean>;
}

export interface GameStateFestival {
  ticksWithoutFestivalStart: number;
  festivals: Record<string, number>;
}

export interface GameState {
  meta: GameStateMeta;
  gameId: GameId;
  world: GameStateWorld;
  hero: GameStateHeroes;
  inventory: GameStateInventory;
  currency: GameStateCurrency;
  actionClock: GameStateActionClock;
  town: GameStateTown;
  festival: GameStateFestival;
}
