import { defaultHero } from '@helpers/defaults';
import { heroAreAllDead } from '@helpers/hero';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('@helpers/rng', () => ({
  rngUuid: vi.fn(() => 'mock-uuid'),
}));

import { blankGameState, setGameState } from '@helpers/state-game';

describe('Hero Health Management', () => {
  beforeEach(() => {
    setGameState(blankGameState());
  });

  test('areAllHeroesDead returns false when all heroes have health', () => {
    const state = blankGameState();
    state.hero.heroes = [
      defaultHero({ name: 'Hero1', hp: 10 }),
      defaultHero({ name: 'Hero2', hp: 5 }),
    ];
    setGameState(state);

    expect(heroAreAllDead()).toBe(false);
  });

  test('areAllHeroesDead returns true when all heroes are dead', () => {
    const state = blankGameState();
    state.hero.heroes = [
      defaultHero({ name: 'Hero1', hp: 0 }),
      defaultHero({ name: 'Hero2', hp: 0 }),
    ];
    setGameState(state);

    expect(heroAreAllDead()).toBe(true);
  });

  test('areAllHeroesDead returns false when some heroes are alive', () => {
    const state = blankGameState();
    state.hero.heroes = [
      defaultHero({ name: 'Hero1', hp: 0 }),
      defaultHero({ name: 'Hero2', hp: 5 }),
    ];
    setGameState(state);

    expect(heroAreAllDead()).toBe(false);
  });
});
