import {
  allHeroes,
  getHero,
  getHeroPosition,
  pickSpriteForHeroName,
  setHeroPosition,
  updateHeroData,
} from '@helpers/hero';
import type { Hero, HeroId, WorldLocation, WorldPosition } from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/sprite', () => ({
  indexToSprite: vi.fn((index: number) => index.toString().padStart(4, '0')),
}));

vi.mock('@helpers/world', () => ({
  getWorldNode: vi.fn(),
}));

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
  updateGamestate: vi.fn((callback) =>
    callback({ hero: { heroes: [], position: {} } }),
  ),
}));

import { gamestate, updateGamestate } from '@helpers/state-game';
import { getWorldNode } from '@helpers/world';

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
        updateHeroData('non-existent' as HeroId, { level: 2 }),
      ).toThrow('Hero with ID non-existent not found');
    });
  });

  describe('pickSpriteForHeroName', () => {
    it('should return predefined sprites for specific heroes', () => {
      expect(pickSpriteForHeroName('Ignatius')).toBe('0004');
      expect(pickSpriteForHeroName('Aquara')).toBe('0000');
      expect(pickSpriteForHeroName('Terrus')).toBe('0060');
      expect(pickSpriteForHeroName('Zephyra')).toBe('0036');
    });

    it('should generate consistent sprite for other names', () => {
      const sprite = pickSpriteForHeroName('TestHero');
      expect(sprite).toMatch(/^\d{4}$/);
    });
  });

  describe('getHeroPosition', () => {
    it('should return hero position from gamestate', () => {
      const position: WorldPosition = { x: 10, y: 20 };
      vi.mocked(gamestate).mockReturnValue({
        hero: { position },
      } as ReturnType<typeof gamestate>);

      expect(getHeroPosition()).toEqual(position);
    });
  });

  describe('setHeroPosition', () => {
    it('should update hero position', () => {
      const mockNode = { id: 'node-1' };
      vi.mocked(getWorldNode).mockReturnValue(mockNode as WorldLocation);

      setHeroPosition(10, 20);

      expect(updateGamestate).toHaveBeenCalled();
      expect(getWorldNode).toHaveBeenCalledWith(10, 20);
    });

    it('should handle missing node', () => {
      vi.mocked(getWorldNode).mockReturnValue(undefined);

      setHeroPosition(10, 20);

      expect(updateGamestate).toHaveBeenCalled();
    });
  });

  describe('getHero', () => {
    it('should return hero by id', () => {
      vi.mocked(gamestate).mockReturnValue({
        hero: { heroes: [mockHero] },
      } as ReturnType<typeof gamestate>);

      expect(getHero(mockHero.id)).toEqual(mockHero);
    });

    it('should return undefined if hero not found', () => {
      vi.mocked(gamestate).mockReturnValue({
        hero: { heroes: [] },
      } as ReturnType<typeof gamestate>);

      expect(getHero('non-existent' as HeroId)).toBeUndefined();
    });
  });
});
