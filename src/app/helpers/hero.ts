import { Hero, HeroId, HeroRiskTolerance, WorldPosition } from '../interfaces';
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
