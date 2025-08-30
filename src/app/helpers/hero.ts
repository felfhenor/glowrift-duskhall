import { getEntriesByType } from '@helpers/content';
import { heroTotalElement, heroTotalStat } from '@helpers/hero-stats';
import { skillTechniqueDamageScalingStat } from '@helpers/skill';
import { spriteGetFromIndex } from '@helpers/sprite';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { talentTownStatTotalForAllHeroes } from '@helpers/talent';
import { locationGet, locationGetCurrent } from '@helpers/world-location';
import type {
  CameoContent,
  EquipmentSkill,
  EquipmentSkillContentTechnique,
  GameStat,
} from '@interfaces';
import {
  type DropRarity,
  type Hero,
  type HeroId,
  type HeroRiskTolerance,
  type LocationType,
  type WorldPosition,
} from '@interfaces';
import { meanBy, sumBy } from 'es-toolkit/compat';

export function allHeroes(): Hero[] {
  return gamestate().hero.heroes;
}

export function heroAverageLevel(): number {
  return meanBy(allHeroes(), (hero) => hero.level);
}

export function heroUpdateData(heroData: Hero): void {
  updateGamestate((state) => {
    const hero = state.hero.heroes.find((f) => f.id === heroData.id);
    if (!hero) {
      throw new Error(`Hero with ID ${heroData.id} not found`);
    }

    Object.assign(hero, heroData);
    return state;
  });
}

export function heroPickSpriteByName(heroName: string): string {
  const existing = getEntriesByType<CameoContent>('cameo').find(
    (c) => c.name === heroName,
  );
  if (existing) return existing.sprite;

  const nameHash = Array.from(heroName).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0,
  );
  const spriteIndex = 4 * (nameHash % 27);
  return spriteGetFromIndex(spriteIndex);
}

export function heroPositionGet(): WorldPosition {
  const hero = gamestate().hero;
  return {
    x: hero.position.x,
    y: hero.position.y,
  };
}

export function heroPositionSet(x: number, y: number): void {
  const node = locationGet(x, y);

  updateGamestate((state) => {
    state.hero.position.nodeId = node?.id ?? '';
    state.hero.position.x = x;
    state.hero.position.y = y;
    return state;
  });
}

export function heroSetRiskTolerance(riskTolerance: HeroRiskTolerance): void {
  updateGamestate((state) => {
    state.hero.riskTolerance = riskTolerance;
    return state;
  });
}

export function heroSetNodeTypePreference(
  nodeType: LocationType,
  enabled: boolean,
): void {
  updateGamestate((state) => {
    state.hero.nodeTypePreferences[nodeType] = enabled;
    return state;
  });
}

export function heroNodeTypePreferences(): Record<LocationType, boolean> {
  return gamestate().hero.nodeTypePreferences;
}

export function heroSetLootRarityPreference(
  rarity: DropRarity,
  enabled: boolean,
): void {
  updateGamestate((state) => {
    state.hero.lootRarityPreferences[rarity] = enabled;
    return state;
  });
}

export function heroLootPreferences(): Record<DropRarity, boolean> {
  return gamestate().hero.lootRarityPreferences;
}

export function heroGet(heroId: HeroId): Hero | undefined {
  return allHeroes().find((h) => h.id === heroId);
}

export function heroAreAllDead(): boolean {
  const heroes = allHeroes();
  return heroes.every((hero) => hero.hp <= 0);
}

export function heroRecoveringInTown(): boolean {
  if (locationGetCurrent()?.nodeType !== 'town') return false;

  const heroes = allHeroes();
  return heroes.some((hero) => hero.hp < hero.totalStats.Health);
}

export function heroRecoveryPercent(): string {
  return (
    meanBy(allHeroes(), (hero) => {
      return Math.min(hero.hp / hero.totalStats.Health, 1);
    }) * 100
  ).toFixed(0);
}

export function heroHealAll(amount: number): void {
  const totalAmount =
    amount * (1 + talentTownStatTotalForAllHeroes('healOverTimeBonus'));

  const heroes = allHeroes();

  heroes.forEach((hero) => {
    const maxHealth = hero.totalStats.Health;
    const newHp = Math.min(hero.hp + totalAmount, maxHealth);

    hero.hp = newHp;
  });

  updateGamestate((state) => {
    state.hero.heroes = structuredClone(heroes);
    return state;
  });
}

export function heroDamageForSkillTechnique(
  hero: Hero,
  skill: EquipmentSkill,
  tech: EquipmentSkillContentTechnique,
): number {
  const statScalars = Object.keys(tech.damageScaling)
    .filter((d) => tech.damageScaling[d as GameStat])
    .map((d) => {
      const statMult = skillTechniqueDamageScalingStat(
        skill,
        tech,
        d as GameStat,
      );

      return { stat: d, multiplier: statMult };
    });

  const baseDamage = sumBy(
    statScalars,
    (s) => s.multiplier * heroTotalStat(hero, s.stat as GameStat),
  );

  const affinityElementBoostMultiplier = sumBy(tech.elements, (el) =>
    heroTotalElement(hero, el),
  );

  return baseDamage * affinityElementBoostMultiplier;
}
