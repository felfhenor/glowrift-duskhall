import {
  defaultCurrencyBlock,
  defaultHero,
  defaultNodeCountBlock,
  defaultPosition,
  defaultWorldNode,
  getDefaultAffinities,
  getDefaultStats,
} from '@helpers/defaults';
import type {
  ElementBlock,
  Hero,
  HeroId,
  LocationType,
  StatBlock,
  WorldLocation,
} from '@interfaces';
import { describe, expect, it, vi } from 'vitest';

// Mock uuid generator
vi.mock('@helpers/rng', () => ({
  uuid: () => 'mock-uuid',
}));

describe('Default Helpers', () => {
  describe('getDefaultStats', () => {
    it('should return default stat block with zeroes', () => {
      const expected: StatBlock = {
        Aura: 0,
        Force: 0,
        Health: 0,
        Speed: 0,
      };
      expect(getDefaultStats()).toEqual(expected);
    });
  });

  describe('getDefaultAffinities', () => {
    it('should return default element block with ones', () => {
      const expected: ElementBlock = {
        Air: 0,
        Earth: 0,
        Fire: 0,
        Water: 0,
      };
      expect(getDefaultAffinities()).toEqual(expected);
    });
  });

  describe('defaultHero', () => {
    it('should return default hero with base values', () => {
      const hero = defaultHero();
      const expectedStats: StatBlock = {
        Force: 5,
        Health: 10,
        Speed: 1,
        Aura: 1,
      };

      expect(hero.id).toBe('mock-uuid' as HeroId);
      expect(hero.level).toBe(1);
      expect(hero.xp).toBe(0);
      expect(hero.hp).toBe(10);
      expect(hero.baseStats).toEqual(expectedStats);
      expect(hero.totalStats).toEqual(expectedStats);
      expect(hero.equipment).toEqual({
        accessory: undefined,
        armor: undefined,
        trinket: undefined,
        weapon: undefined,
      });
      expect(hero.skills).toEqual([]);
      expect(hero.talents).toEqual({});
    });

    it('should override default values with provided props', () => {
      const customProps: Partial<Hero> = {
        name: 'TestHero',
        hp: 20,
        level: 2,
      };

      const hero = defaultHero(customProps);

      expect(hero.name).toBe('TestHero');
      expect(hero.hp).toBe(20);
      expect(hero.level).toBe(2);
    });
  });

  describe('defaultPosition', () => {
    it('should return position with x and y as 0', () => {
      expect(defaultPosition()).toEqual({ x: 0, y: 0 });
    });
  });

  describe('defaultCurrencyBlock', () => {
    it('should return currency block with all currencies at 0', () => {
      const currencies = defaultCurrencyBlock();

      // Check all currencies are present and set to 0
      Object.values(currencies).forEach((value) => {
        expect(value).toBe(0);
      });

      // Check specific currencies exist
      expect(currencies).toHaveProperty('Mana', 0);
      expect(currencies).toHaveProperty('Soul Essence', 0);
      expect(currencies).toHaveProperty('Fire Sliver', 0);
      expect(currencies).toHaveProperty('Water Core', 0);
      expect(currencies).toHaveProperty('Common Dust', 0);
      expect(currencies).toHaveProperty('Unique Dust', 0);
    });
  });

  describe('defaultNodeCountBlock', () => {
    it('should return node count block with all location types at 0', () => {
      const expected: Record<LocationType, number> = {
        castle: 0,
        cave: 0,
        dungeon: 0,
        town: 0,
        village: 0,
      };
      expect(defaultNodeCountBlock()).toEqual(expected);
    });
  });
});

describe('defaultWorldNode', () => {
  it('should create default world node with default coordinates', () => {
    const node = defaultWorldNode();
    const expected: WorldLocation = {
      id: 'mock-uuid',
      elements: [],
      name: '',
      nodeType: undefined,
      x: -1,
      y: -1,
      claimCount: 0,
      currentlyClaimed: false,
      encounterLevel: 0,
      guardianIds: [],
      claimLootIds: [],
      unclaimTime: 0,
      traitIds: [],
    };

    expect(node).toEqual(expected);
  });

  it('should create world node with provided coordinates', () => {
    const x = 5;
    const y = 10;
    const node = defaultWorldNode(x, y);

    expect(node.x).toBe(x);
    expect(node.y).toBe(y);
    expect(node.id).toBe('mock-uuid');
  });
});
