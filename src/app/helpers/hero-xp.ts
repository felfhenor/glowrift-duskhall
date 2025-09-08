import { allHeroes } from '@helpers/hero';
import { heroStats } from '@helpers/hero-stats';
import { riftglowUpgradeGetValue } from '@helpers/riftglow';
import { rngChoice, rngSeeded } from '@helpers/rng';
import { updateGamestate } from '@helpers/state-game';
import { locationTooHardClear } from '@helpers/world-location';
import type { Hero, StatBlock } from '@interfaces';
import { clamp } from 'es-toolkit/compat';

export function heroXpRequiredForLevelUp(level: number): number {
  return 10 * (level + 1) ** 2;
}

function heroLevelUp(hero: Hero): void {
  const levelUpSeed = `${hero.id}-${hero.level}`;
  const rng = rngSeeded(levelUpSeed);

  const newStats: StatBlock = {
    Force: hero.baseStats.Force + rngChoice([0.5, 1, 1.5, 2, 2.5, 3], rng),
    Health:
      hero.baseStats.Health + rngChoice([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], rng),
    Speed: hero.baseStats.Speed + rngChoice([0, 0.3, 0.5], rng),
    Aura: hero.baseStats.Aura + rngChoice([0.3, 0.5, 1, 1.5, 2], rng),
  };

  hero.level += 1;
  hero.xp = 0;
  hero.baseStats = newStats;
  hero.hp = newStats.Health;

  const newTotalStats = heroStats(hero);
  hero.totalStats = newTotalStats;
  hero.hp = hero.totalStats.Health;

  // Clear the "too hard" nodes list when any hero levels up
  locationTooHardClear();
}

export function heroXpGained(xp: number): number {
  const xpMultiplier = riftglowUpgradeGetValue('BonusXP') / 100;
  const finalXpGained = xp * (1 + xpMultiplier);

  return Math.floor(finalXpGained);
}

export function heroAllGainXp(xp: number): void {
  const heroes = allHeroes();

  heroes.forEach((hero) => {
    const maxXp = heroXpRequiredForLevelUp(hero.level);
    const newXp = clamp(hero.xp + xp, 0, maxXp);

    hero.xp = newXp;

    if (newXp >= maxXp && hero.level < 99) {
      heroLevelUp(hero);
    }
  });

  updateGamestate((state) => {
    state.hero.heroes = structuredClone(heroes);
    return state;
  });
}
