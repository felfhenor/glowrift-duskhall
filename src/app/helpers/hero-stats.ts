import { heroGet, heroUpdateData } from '@helpers/hero';
import { itemElementMultiplier, itemStat } from '@helpers/item';
import type {
  ElementBlock,
  GameElement,
  GameStat,
  Hero,
  StatBlock,
} from '@interfaces';
import type { HeroId } from '@interfaces/hero';
import { sum } from 'es-toolkit/compat';

export function heroBaseStat(hero: Hero, stat: GameStat): number {
  return hero.baseStats[stat];
}

export function heroEquipmentStat(hero: Hero, stat: GameStat): number {
  return sum(
    Object.values(hero.equipment ?? {}).map((i) => (i ? itemStat(i, stat) : 0)),
  );
}

export function heroTotalStat(hero: Hero, stat: GameStat): number {
  return heroBaseStat(hero, stat) + heroEquipmentStat(hero, stat);
}

export function heroEquipmentElement(hero: Hero, element: GameElement): number {
  return sum(
    Object.values(hero.equipment ?? {}).map((i) =>
      i ? itemElementMultiplier(i, element) : 0,
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

export function heroRecalculateStats(heroId: HeroId): void {
  const thisHero = heroGet(heroId);

  if (!thisHero) {
    return;
  }

  const newStats = heroStats(thisHero);
  newStats.Health = Math.floor(newStats.Health);

  heroUpdateData(thisHero.id, {
    totalStats: newStats,
    hp: Math.min(newStats.Health, thisHero.hp),
  });
}
