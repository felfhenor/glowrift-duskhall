import { getDefaultHero } from '@helpers/defaults';
import { areAllHeroesDead } from '@helpers/hero';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@helpers/rng', () => ({
  uuid: vi.fn(() => 'mock-uuid'),
}));

import { blankGameState, setGameState } from '@helpers/state-game';

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
});
