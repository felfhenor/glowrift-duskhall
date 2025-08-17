import { rngUuid } from '@helpers/rng';
import type {
  CombatantCombatStats,
  CurrencyBlock,
  DropRarity,
  ElementBlock,
  EquipmentItem,
  EquipmentItemId,
  GameId,
  GameState,
  Hero,
  HeroId,
  LocationType,
  StatBlock,
  TalentTownStats,
  WorldConfigContent,
  WorldLocation,
  WorldPosition,
} from '@interfaces';

export function defaultGameState(): GameState {
  return {
    meta: {
      version: 1,
      isSetup: false,
      isPaused: false,
      createdAt: Date.now(),
      hasDismissedWinNotification: false,
      hasWon: false,
      wonAtTick: 0,
      lastSaveTick: 0,
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
        'Rally Point': 1,
      },
      merchant: {
        soldItems: [],
        ticksUntilRefresh: 0,
      },
      townUpgrades: {},
    },
    festival: {
      ticksWithoutFestivalStart: 0,
      festivals: {},
    },
  };
}

export function defaultWorldConfig(): WorldConfigContent {
  return {
    width: 50,
    height: 50,
    name: '',
    id: 'UNKNOWN',
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

export function defaultStats(): StatBlock {
  return {
    Aura: 0,
    Force: 0,
    Health: 0,
    Speed: 0,
  };
}

export function defaultAffinities(): ElementBlock {
  return {
    Air: 0,
    Earth: 0,
    Fire: 0,
    Water: 0,
  };
}

export function defaultHero(props: Partial<Hero> = {}): Hero {
  return {
    id: rngUuid() as HeroId,
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

export function defaultNodeTypePreferences(): Record<LocationType, boolean> {
  return {
    castle: true,
    cave: true,
    dungeon: true,
    town: true,
    village: true,
  };
}

export function defaultLootRarityPreferences(): Record<DropRarity, boolean> {
  return {
    Common: true,
    Uncommon: true,
    Rare: true,
    Mystical: true,
    Legendary: true,
    Unique: true,
  };
}

export function defaultLocation(x = -1, y = -1): WorldLocation {
  return {
    id: rngUuid(),
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
    locationUpgrades: {},
  };
}

export function defaultCombatStats(): CombatantCombatStats {
  return {
    repeatActionChance: defaultAffinities(),
    skillStrikeAgainChance: defaultAffinities(),
    skillAdditionalUseChance: defaultAffinities(),
    skillAdditionalUseCount: defaultAffinities(),
    redirectionChance: defaultAffinities(),
    missChance: defaultAffinities(),
    debuffIgnoreChance: defaultAffinities(),
    damageReflectPercent: defaultAffinities(),
    healingIgnorePercent: defaultAffinities(),
    reviveChance: 0,
  };
}

export function defaultTownStats(): TalentTownStats {
  return {
    breakdownCurrencyBonus: 0,
    healOverTimeBonus: 0,
    marketTradeBonusPercent: 0,
    merchantFindItemBonus: 0,
  };
}

export function defaultEquipment(): EquipmentItem {
  return {
    id: 'UNKNOWN' as EquipmentItemId,
    name: '',
    __type: 'trinket',
    sprite: 'item-sprite',
    rarity: 'Common',
    baseStats: defaultStats(),
    elementMultipliers: [],
    dropLevel: 0,
    enchantLevel: 0,
    skillIds: [],
    talentBoosts: [],
    traitIds: [],
    unableToUpgrade: [],
  };
}
