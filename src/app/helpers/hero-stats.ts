import { sum } from 'lodash';
import { GameStat, Hero, StatBlock } from '@interfaces';
import { updateHeroData } from './hero';
import { getItemStat } from './item';

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

export function heroStats(hero: Hero): StatBlock {
  return {
    Force: heroTotalStat(hero, 'Force'),
    Health: heroTotalStat(hero, 'Health'),
    Speed: heroTotalStat(hero, 'Speed'),
    Aura: heroTotalStat(hero, 'Aura'),
  };
}

export function recalculateStats(hero: Hero): void {
  const newStats = heroStats(hero);

  updateHeroData(hero.id, {
    totalStats: newStats,
    hp: newStats.Health,
  });
}
