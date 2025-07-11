import { clamp } from 'lodash';
import { Hero, StatBlock } from '@interfaces';
import { updateHeroData } from './hero';
import { recalculateStats } from './hero-stats';
import { randomChoice, seededrng } from './rng';
import { gamestate } from './state-game';

export function heroXpRequiredForLevelUp(level: number): number {
  return 10 * (level + 1) ** 2;
}

export function heroLevelUp(hero: Hero): void {
  const levelUpSeed = `${hero.id}-${hero.level}`;
  const rng = seededrng(levelUpSeed);

  const newStats: StatBlock = {
    Force: hero.baseStats.Force + randomChoice([0.5, 1, 1.5, 2, 2.5, 3], rng),
    Health:
      hero.baseStats.Health +
      randomChoice([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], rng),
    Speed: hero.baseStats.Speed + randomChoice([0, 0.3, 0.5], rng),
    Aura: hero.baseStats.Aura + randomChoice([0.3, 0.5, 1, 1.5, 2], rng),
  };

  updateHeroData(hero.id, {
    level: hero.level + 1,
    xp: 0,
    baseStats: newStats,
    hp: newStats.Health,
  });

  const newHero = gamestate().hero.heroes.find((h) => h.id === hero.id);
  if (newHero) {
    recalculateStats(newHero);
  }
}

export function heroGainXp(hero: Hero, xp: number): void {
  const maxXp = heroXpRequiredForLevelUp(hero.level);
  const newXp = clamp(hero.xp + xp, 0, maxXp);
  updateHeroData(hero.id, { xp: newXp });

  if (newXp >= maxXp && hero.level < 99) {
    heroLevelUp(hero);
  }
}
