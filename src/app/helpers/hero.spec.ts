import {
  allHeroes,
  heroGet,
  heroPickSpriteByName,
  heroPositionGet,
  heroPositionSet,
  heroUpdateData,
} from '@helpers/hero';
import type { Hero, HeroId, WorldLocation, WorldPosition } from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/sprite', () => ({
  spriteGetFromIndex: vi.fn((index: number) =>
    index.toString().padStart(4, '0'),
  ),
}));

vi.mock('@helpers/world-location', () => ({
  locationGet: vi.fn(),
}));

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
  updateGamestate: vi.fn((callback) =>
    callback({ hero: { heroes: [], position: {} } }),
  ),
}));

import { gamestate, updateGamestate } from '@helpers/state-game';
import { locationGet } from '@helpers/world-location';

describe('Hero Helper Functions', () => {
  const mockHero: Hero = {
    id: 'hero-1' as HeroId,
    name: 'Test Hero',
    level: 1,
    xp: 0,
    hp: 10,
    baseStats: { Force: 5, Health: 10, Speed: 1, Aura: 1 },
    totalStats: { Force: 5, Health: 10, Speed: 1, Aura: 1 },
    equipment: {
      accessory: undefined,
      armor: undefined,
      trinket: undefined,
      weapon: undefined,
    },
    skills: [],
    talents: {},
    sprite: 'hero-1',
    frames: 1,
    targettingType: 'Random',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('allHeroes', () => {
    it('should return all heroes from gamestate', () => {
      vi.mocked(gamestate).mockReturnValue({
        hero: { heroes: [mockHero] },
      } as ReturnType<typeof gamestate>);

      expect(allHeroes()).toEqual([mockHero]);
    });
  });

  describe('updateHeroData', () => {
    it('should throw error if hero not found', () => {
      vi.mocked(gamestate).mockReturnValue({
        hero: { heroes: [] },
      } as ReturnType<typeof gamestate>);

      expect(() =>
        heroUpdateData('non-existent' as HeroId, { level: 2 }),
      ).toThrow('Hero with ID non-existent not found');
    });
  });

  describe('pickSpriteForHeroName', () => {
    it('should return predefined sprites for specific heroes', () => {
      expect(heroPickSpriteByName('Ignatius')).toBe('0004');
      expect(heroPickSpriteByName('Aquara')).toBe('0000');
      expect(heroPickSpriteByName('Terrus')).toBe('0060');
      expect(heroPickSpriteByName('Zephyra')).toBe('0036');
    });

    it('should generate consistent sprite for other names', () => {
      const sprite = heroPickSpriteByName('TestHero');
      expect(sprite).toMatch(/^\d{4}$/);
    });
  });

  describe('getHeroPosition', () => {
    it('should return hero position from gamestate', () => {
      const position: WorldPosition = { x: 10, y: 20 };
      vi.mocked(gamestate).mockReturnValue({
        hero: { position },
      } as ReturnType<typeof gamestate>);

      expect(heroPositionGet()).toEqual(position);
    });
  });

  describe('setHeroPosition', () => {
    it('should update hero position', () => {
      const mockNode = { id: 'node-1' };
      vi.mocked(locationGet).mockReturnValue(mockNode as WorldLocation);

      heroPositionSet(10, 20);

      expect(updateGamestate).toHaveBeenCalled();
      expect(locationGet).toHaveBeenCalledWith(10, 20);
    });

    it('should handle missing node', () => {
      vi.mocked(locationGet).mockReturnValue(undefined);

      heroPositionSet(10, 20);

      expect(updateGamestate).toHaveBeenCalled();
    });
  });

  describe('getHero', () => {
    it('should return hero by id', () => {
      vi.mocked(gamestate).mockReturnValue({
        hero: { heroes: [mockHero] },
      } as ReturnType<typeof gamestate>);

      expect(heroGet(mockHero.id)).toEqual(mockHero);
    });

    it('should return undefined if hero not found', () => {
      vi.mocked(gamestate).mockReturnValue({
        hero: { heroes: [] },
      } as ReturnType<typeof gamestate>);

      expect(heroGet('non-existent' as HeroId)).toBeUndefined();
    });
  });
});
