import { getDefaultHero } from '@helpers/defaults';
import { areAllHeroesDead, healHero } from '@helpers/hero';
import type { HeroId } from '@interfaces';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@helpers/rng', () => ({
  uuid: vi.fn(() => 'mock-uuid'),
}));

import { blankGameState, gamestate, setGameState } from '@helpers/state-game';

describe('Hero Health Management', () => {
  beforeEach(() => {
    setGameState(blankGameState());
  });

  test('areAllHeroesDead returns false when all heroes have health', () => {
    const state = blankGameState();
    state.hero.heroes = [
      getDefaultHero({ name: 'Hero1', hp: 10 }),
      getDefaultHero({ name: 'Hero2', hp: 5 }),
    ];
    setGameState(state);

    expect(areAllHeroesDead()).toBe(false);
  });

  test('areAllHeroesDead returns true when all heroes are dead', () => {
    const state = blankGameState();
    state.hero.heroes = [
      getDefaultHero({ name: 'Hero1', hp: 0 }),
      getDefaultHero({ name: 'Hero2', hp: 0 }),
    ];
    setGameState(state);

    expect(areAllHeroesDead()).toBe(true);
  });

  test('areAllHeroesDead returns false when some heroes are alive', () => {
    const state = blankGameState();
    state.hero.heroes = [
      getDefaultHero({ name: 'Hero1', hp: 0 }),
      getDefaultHero({ name: 'Hero2', hp: 5 }),
    ];
    setGameState(state);

    expect(areAllHeroesDead()).toBe(false);
  });

  test('healHero increases hero health', () => {
    const state = blankGameState();
    const hero = getDefaultHero({ name: 'Hero1', hp: 5 });
    state.hero.heroes = [hero];
    setGameState(state);

    healHero(hero.id, 3);

    expect(gamestate().hero.heroes[0].hp).toBe(8);
  });

  test('healHero does not exceed max health', () => {
    const state = blankGameState();
    const hero = getDefaultHero({
      name: 'Hero1',
      hp: 8,
      totalStats: { Force: 5, Health: 10, Speed: 1, Aura: 1 },
    });
    state.hero.heroes = [hero];
    setGameState(state);

    healHero(hero.id, 5);

    expect(gamestate().hero.heroes[0].hp).toBe(10);
  });

  test('healHero does nothing for non-existent hero', () => {
    const state = blankGameState();
    const hero = getDefaultHero({ name: 'Hero1', hp: 5 });
    state.hero.heroes = [hero];
    setGameState(state);

    healHero('non-existent-id' as HeroId, 3);

    expect(gamestate().hero.heroes[0].hp).toBe(5);
  });
});
