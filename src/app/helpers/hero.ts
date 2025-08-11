import { spriteGetFromIndex } from '@helpers/sprite';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { worldNodeGet, worldNodeGetCurrent } from '@helpers/world';
import type {
  DropRarity,
  Hero,
  HeroId,
  HeroRiskTolerance,
  LocationType,
  WorldPosition,
} from '@interfaces';
import { meanBy } from 'es-toolkit/compat';

export function allHeroes(): Hero[] {
  return gamestate().hero.heroes;
}

export function heroUpdateData(heroId: HeroId, heroData: Partial<Hero>): void {
  updateGamestate((state) => {
    const hero = state.hero.heroes.find((f) => f.id === heroId);
    if (!hero) {
      throw new Error(`Hero with ID ${heroId} not found`);
    }

    Object.assign(hero, heroData);
    return state;
  });
}

export function heroPickSpriteByName(heroName: string): string {
  if (heroName === 'Ignatius') return '0004';
  if (heroName === 'Aquara') return '0000';
  if (heroName === 'Terrus') return '0060';
  if (heroName === 'Zephyra') return '0036';

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
  const node = worldNodeGet(x, y);

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
  if (worldNodeGetCurrent()?.nodeType !== 'town') return false;

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
  const heroes = allHeroes();
  heroes.forEach((hero) => {
    const maxHealth = hero.totalStats.Health;
    const newHp = Math.min(hero.hp + amount, maxHealth);

    hero.hp = newHp;
  });

  updateGamestate((state) => {
    state.hero.heroes = structuredClone(heroes);
    return state;
  });
}
