import { clamp, sum } from 'lodash';
import {
  GameStat,
  Hero,
  HeroId,
  HeroRiskTolerance,
  StatBlock,
  WorldPosition,
} from '../interfaces';
import { getItemStat } from './item';
import { randomChoice, seededrng } from './rng';
import { indexToSprite } from './sprite';
import { gamestate, updateGamestate } from './state-game';
import { getWorldNode } from './world';

export function allHeroes(): Hero[] {
  return gamestate().hero.heroes;
}

export function updateHeroData(heroId: HeroId, heroData: Partial<Hero>): void {
  updateGamestate((state) => {
    const hero = state.hero.heroes.find((f) => f.id === heroId);
    if (!hero) {
      throw new Error(`Hero with ID ${heroId} not found`);
    }

    Object.assign(hero, heroData);
    return state;
  });
}

export function pickSpriteForHeroName(heroName: string): string {
  if (heroName === 'Ignatius') return '0004';
  if (heroName === 'Aquara') return '0000';
  if (heroName === 'Terrus') return '0060';
  if (heroName === 'Zephyra') return '0036';

  const nameHash = Array.from(heroName).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );
  const spriteIndex = 4 * (nameHash % 27);
  return indexToSprite(spriteIndex);
}

export function heroBaseStat(hero: Hero, stat: GameStat): number {
  return hero.baseStats[stat];
}

export function heroEquipmentStat(hero: Hero, stat: GameStat): number {
  return sum(
    Object.values(hero.equipment ?? {}).map((i) =>
      i ? getItemStat(i, stat) : 0,
    ),
  );
}

export function heroTotalStat(hero: Hero, stat: GameStat): number {
  return heroBaseStat(hero, stat) + heroEquipmentStat(hero, stat);
}

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

  recalculateStats(hero);
}

export function heroGainXp(hero: Hero, xp: number): void {
  const maxXp = heroXpRequiredForLevelUp(hero.level);
  const newXp = clamp(hero.xp + xp, 0, maxXp);
  updateHeroData(hero.id, { xp: newXp });

  if (newXp >= maxXp && hero.level < 99) {
    heroLevelUp(hero);
  }
}

export function heroStats(hero: Hero): StatBlock {
  return {
    Force: heroTotalStat(hero, 'Force'),
    Health: heroTotalStat(hero, 'Health'),
    Speed: heroTotalStat(hero, 'Speed'),
    Aura: heroTotalStat(hero, 'Aura'),
  };
}

export function getHeroPosition(): WorldPosition {
  const hero = gamestate().hero;
  return {
    x: hero.position.x,
    y: hero.position.y,
  };
}

export function setHeroPosition(x: number, y: number): void {
  const node = getWorldNode(x, y);

  updateGamestate((state) => {
    state.hero.position.nodeId = node?.id ?? '';
    state.hero.position.x = x;
    state.hero.position.y = y;
    return state;
  });
}

export function setHeroRiskTolerance(riskTolerance: HeroRiskTolerance): void {
  updateGamestate((state) => {
    state.hero.riskTolerance = riskTolerance;
    return state;
  });
}

export function recalculateStats(hero: Hero): void {
  const newStats = heroStats(hero);

  updateHeroData(hero.id, {
    totalStats: newStats,
    hp: newStats.Health,
  });
}
