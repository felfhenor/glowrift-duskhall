import { getEntry } from '@helpers/content';
import { updateHeroData } from '@helpers/hero';
import type { Hero, TalentContent, TalentId } from '@interfaces';
import { sum } from 'es-toolkit/compat';

export function heroRemainingTalentPoints(hero: Hero): number {
  return Math.floor(hero.level / 2) - sum(Object.values(hero.talents));
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

export function allHeroEquipmentTalents(
  hero: Hero,
): Array<{ talent: TalentContent; level: number }> {
  const equipment = Object.values(hero.equipment)
    .filter(Boolean)
    .flatMap((item) =>
      item!.talentBoosts.concat(item!.mods?.talentBoosts ?? []),
    );

  return equipment.map((boost) => ({
    talent: getEntry<TalentContent>(boost.talentId)!,
    level: boost.value,
  }));
}

export function heroEquipmentTalentLevel(hero: Hero, talentId: string): number {
  return sum(
    allHeroEquipmentTalents(hero)
      .filter((boost) => boost.talent.id === talentId)
      .map((boost) => boost.level),
  );
}

export function heroTotalTalentLevel(hero: Hero, talentId: string): number {
  return (
    (hero.talents[talentId] ?? 0) + heroEquipmentTalentLevel(hero, talentId)
  );
}

export function getFullHeroTalentHash(hero: Hero): Record<TalentId, number> {
  const baseLevels = Object.assign({}, hero.talents);
  allHeroEquipmentTalents(hero).forEach((boost) => {
    baseLevels[boost.talent.id] =
      (baseLevels[boost.talent.id] ?? 0) + boost.level;
  });

  return baseLevels;
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
