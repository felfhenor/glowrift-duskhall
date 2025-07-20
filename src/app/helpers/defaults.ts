import { uuid } from '@helpers/rng';
import type {
  CurrencyBlock,
  ElementBlock,
  Hero,
  HeroId,
  LocationType,
  StatBlock,
  WorldLocation,
  WorldPosition,
} from '@interfaces';

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
    Air: 1,
    Earth: 1,
    Fire: 1,
    Water: 1,
  };
}

export function defaultHero(props: Partial<Hero> = {}): Hero {
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

export function defaultPosition(): WorldPosition {
  return { x: 0, y: 0 };
}

export function defaultCurrencyBlock(): CurrencyBlock {
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

export function defaultNodeCountBlock(): Record<LocationType, number> {
  return {
    castle: 0,
    cave: 0,
    dungeon: 0,
    town: 0,
    village: 0,
  };
}

export function defaultWorldNode(x = -1, y = -1): WorldLocation {
  return {
    id: uuid(),
    elements: [],
    name: '',
    nodeType: undefined,
    sprite: '',
    objectSprite: '',
    x,
    y,
    claimCount: 0,
    currentlyClaimed: false,
    encounterLevel: 0,
    guardianIds: [],
    claimLootIds: [],
    unclaimTime: 0,
  };
}
