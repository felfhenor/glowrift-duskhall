import { uuid } from '@helpers/rng';
import type {
  CombatantCombatStats,
  CurrencyBlock,
  ElementBlock,
  Hero,
  HeroId,
  LocationType,
  StatBlock,
  WorldConfigContent,
  WorldLocation,
  WorldPosition,
} from '@interfaces';

export function getDefaultWorldConfig(): WorldConfigContent {
  return {
    width: 50,
    height: 50,
    name: '',
    id: 'Unknown',
    maxLevel: 25,
    __type: 'worldconfig',
    nodeCount: {
      castle: {
        min: 1,
        max: 1,
      },
      cave: {
        min: 0,
        max: 1,
      },
      dungeon: {
        min: 0,
        max: 1,
      },
      town: {
        min: 1,
        max: 2,
      },
      village: {
        min: 1,
        max: 3,
      },
    },
  };
}

export function getDefaultStats(): StatBlock {
  return {
    Aura: 0,
    Force: 0,
    Health: 0,
    Speed: 0,
  };
}

export function getDefaultAffinities(): ElementBlock {
  return {
    Air: 0,
    Earth: 0,
    Fire: 0,
    Water: 0,
  };
}

export function getDefaultHero(props: Partial<Hero> = {}): Hero {
  return {
    id: uuid() as HeroId,
    name: '',
    sprite: '',
    frames: 4,
    targettingType: 'Random',
    level: 1,
    xp: 0,
    hp: 10,
    baseStats: {
      Force: 5,
      Health: 10,
      Speed: 1,
      Aura: 1,
    },
    totalStats: {
      Force: 5,
      Health: 10,
      Speed: 1,
      Aura: 1,
    },

    equipment: {
      accessory: undefined,
      armor: undefined,
      trinket: undefined,
      weapon: undefined,
    },

    skills: [],

    talents: {},

    ...props,
  };
}

export function getDefaultPosition(): WorldPosition {
  return { x: 0, y: 0 };
}

export function getDefaultCurrencyBlock(): CurrencyBlock {
  return {
    'Fire Sliver': 0,
    'Fire Shard': 0,
    'Fire Crystal': 0,
    'Fire Core': 0,
    'Water Sliver': 0,
    'Water Shard': 0,
    'Water Crystal': 0,
    'Water Core': 0,
    'Air Sliver': 0,
    'Air Shard': 0,
    'Air Crystal': 0,
    'Air Core': 0,
    'Earth Sliver': 0,
    'Earth Shard': 0,
    'Earth Crystal': 0,
    'Earth Core': 0,
    'Soul Essence': 0,
    'Common Dust': 0,
    'Uncommon Dust': 0,
    'Rare Dust': 0,
    'Legendary Dust': 0,
    'Mystical Dust': 0,
    'Unique Dust': 0,
    Mana: 0,
  };
}

export function getDefaultNodeCountBlock(): Record<LocationType, number> {
  return {
    castle: 0,
    cave: 0,
    dungeon: 0,
    town: 0,
    village: 0,
  };
}

export function getDefaultWorldNode(x = -1, y = -1): WorldLocation {
  return {
    id: uuid(),
    elements: [],
    name: '',
    nodeType: undefined,
    x,
    y,
    claimCount: 0,
    currentlyClaimed: false,
    encounterLevel: 0,
    guardianIds: [],
    claimLootIds: [],
    unclaimTime: 0,
    traitIds: [],
  };
}

export function getDefaultCombatStats(): CombatantCombatStats {
  return {
    repeatActionChance: getDefaultAffinities(),
    skillStrikeAgainChance: getDefaultAffinities(),
    skillAdditionalUseChance: getDefaultAffinities(),
    skillAdditionalUseCount: getDefaultAffinities(),
    redirectionChance: getDefaultAffinities(),
    reviveChance: 0,
  };
}
