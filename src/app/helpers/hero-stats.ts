import { getHero, updateHeroData } from '@helpers/hero';
import { getItemElementMultiplier, getItemStat } from '@helpers/item';
import type {
  ElementBlock,
  GameElement,
  GameStat,
  Hero,
  StatBlock,
} from '@interfaces';
import type { HeroId } from '@interfaces/hero';
import { sum } from 'lodash';

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

export function heroEquipmentElement(hero: Hero, element: GameElement): number {
  return sum(
    Object.values(hero.equipment ?? {}).map((i) =>
      i ? getItemElementMultiplier(i, element) : 0,
    ),
  );
}

export function heroTotalElement(hero: Hero, element: GameElement): number {
  return 1 + heroEquipmentElement(hero, element);
}

export function heroStats(hero: Hero): StatBlock {
  return {
    Force: heroTotalStat(hero, 'Force'),
    Health: heroTotalStat(hero, 'Health'),
    Speed: heroTotalStat(hero, 'Speed'),
    Aura: heroTotalStat(hero, 'Aura'),
  };
}

export function heroElements(hero: Hero): ElementBlock {
  return {
    Air: heroTotalElement(hero, 'Air'),
    Earth: heroTotalElement(hero, 'Earth'),
    Fire: heroTotalElement(hero, 'Fire'),
    Water: heroTotalElement(hero, 'Water'),
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
