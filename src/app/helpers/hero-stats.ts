import { sum } from 'lodash';
import type { GameStat, Hero, StatBlock } from '@interfaces';
import { updateHeroData } from '@helpers/hero';
import { getItemStat } from '@helpers/item';
import { getHero } from '@helpers/hero';
import type { HeroId } from '@interfaces/hero';

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

export function recalculateStats(heroId: HeroId): void {
  const thisHero = getHero(heroId);

  if (!thisHero) {
    return;
  }

  const newStats = heroStats(thisHero);

  updateHeroData(thisHero.id, {
    totalStats: newStats,
    hp: newStats.Health,
  });
}
