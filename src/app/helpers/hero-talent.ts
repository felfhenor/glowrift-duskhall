import { sum } from 'lodash';
import { Hero, TalentContent } from '@interfaces';
import { getEntry } from './content';
import { updateHeroData } from './hero';

export function heroRemainingTalentPoints(hero: Hero): number {
  return hero.level - sum(Object.values(hero.talents));
}

export function heroSpendTalentPoint(hero: Hero, talentId: string): void {
  updateHeroData(hero.id, {
    talents: {
      ...hero.talents,
      [talentId]: (hero.talents[talentId] ?? 0) + 1,
    },
  });
}

export function heroHasTalent(hero: Hero, talentId: string): boolean {
  return !!hero.talents[talentId];
}

export function allHeroTalents(hero: Hero): TalentContent[] {
  return Object.entries(hero.talents)
    .filter(([, level]) => level > 0)
    .map(([talentId]) => getEntry<TalentContent>(talentId))
    .filter((talent): talent is TalentContent => !!talent);
}

export function canHeroBuyTalent(
  hero: Hero,
  talent: TalentContent,
  requiredLevel: number,
): boolean {
  return (
    talent.name !== 'Blank Talent' &&
    (talent.requireTalentId ? !!hero.talents[talent.requireTalentId] : true) &&
    !hero.talents[talent.id] &&
    hero.level >= requiredLevel &&
    heroRemainingTalentPoints(hero) > 0
  );
}
