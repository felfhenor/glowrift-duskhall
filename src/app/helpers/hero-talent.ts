import { getEntry } from '@helpers/content';
import { heroUpdateData } from '@helpers/hero';
import { talentIdsInTalentTree } from '@helpers/talent';
import type {
  Hero,
  TalentContent,
  TalentId,
  TalentTreeContent,
} from '@interfaces';
import { sum } from 'es-toolkit/compat';

export function heroRemainingTalentPoints(hero: Hero): number {
  return Math.floor(hero.level / 2) - sum(Object.values(hero.talents));
}

export function heroSpendTalentPoint(hero: Hero, talentId: string): void {
  heroUpdateData(hero.id, {
    talents: {
      ...hero.talents,
      [talentId]: (hero.talents[talentId] ?? 0) + 1,
    },
  });
}

export function heroHasTalent(hero: Hero, talentId: string): boolean {
  return !!hero.talents[talentId];
}

export function heroAllEquipmentTalents(
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
    heroAllEquipmentTalents(hero)
      .filter((boost) => boost.talent.id === talentId)
      .map((boost) => boost.level),
  );
}

export function heroTotalTalentLevel(hero: Hero, talentId: string): number {
  return (
    (hero.talents[talentId] ?? 0) + heroEquipmentTalentLevel(hero, talentId)
  );
}

export function heroTalentsInvestedInTree(
  hero: Hero,
  talentTree: TalentTreeContent,
): number {
  const talentIdsInTree = talentIdsInTalentTree(talentTree);
  return sum(talentIdsInTree.map((talentId) => hero.talents[talentId] ?? 0));
}

export function heroFullTalentHash(hero: Hero): Record<TalentId, number> {
  const baseLevels = Object.assign({}, hero.talents);
  heroAllEquipmentTalents(hero).forEach((boost) => {
    baseLevels[boost.talent.id] =
      (baseLevels[boost.talent.id] ?? 0) + boost.level;
  });

  return baseLevels;
}

export function heroCanBuyTalent(
  hero: Hero,
  talent: TalentContent,
  requiredLevel: number,
  talentTree?: TalentTreeContent,
  requiredTalentsInvested?: number,
): boolean {
  const meetsInvestmentRequirement =
    !requiredTalentsInvested ||
    !talentTree ||
    heroTalentsInvestedInTree(hero, talentTree) >= requiredTalentsInvested;

  return (
    talent.name !== 'Blank Talent' &&
    (talent.requireTalentId ? !!hero.talents[talent.requireTalentId] : true) &&
    !hero.talents[talent.id] &&
    hero.level >= requiredLevel &&
    heroRemainingTalentPoints(hero) > 0 &&
    meetsInvestmentRequirement
  );
}
