import { heroRemainingTalentPoints } from '@helpers/hero-talent';
import { gamestate, updateGamestate } from '@helpers/state-game';
import type { Hero } from '@interfaces/hero';
import type { RiftglowUpgrade } from '@interfaces/riftglow';
import { clamp, sum } from 'es-toolkit/compat';

export function riftglowTotalUnspent(): number {
  return (
    sum(Object.values(gamestate().riftglow.convertedPerHero)) -
    sum(Object.values(gamestate().riftglow.upgradeLevels))
  );
}

export function riftglowTalentPointsForHero(hero: Hero): number {
  return gamestate().riftglow.convertedPerHero[hero.id] ?? 0;
}

export function riftglowConvertFromHeroTalents(hero: Hero, points: number) {
  const maxPossible = heroRemainingTalentPoints(hero);
  points = clamp(points, 0, maxPossible);

  updateGamestate((state) => {
    state.riftglow.convertedPerHero[hero.id] =
      (state.riftglow.convertedPerHero[hero.id] ?? 0) + points;
    return state;
  });
}

export function riftglowConvertToHeroTalents(hero: Hero, points: number) {
  const maxPossible = gamestate().riftglow.convertedPerHero[hero.id] ?? 0;
  points = clamp(points, 0, maxPossible);

  updateGamestate((state) => {
    state.riftglow.convertedPerHero[hero.id] = Math.max(
      0,
      (state.riftglow.convertedPerHero[hero.id] ?? 0) - points,
    );
    return state;
  });
}

export function riftglowUpgradeAddPoints(
  upgrade: RiftglowUpgrade,
  points: number,
) {
  updateGamestate((state) => {
    state.riftglow.upgradeLevels[upgrade] = Math.max(
      0,
      (state.riftglow.upgradeLevels[upgrade] ?? 0) + points,
    );
    return state;
  });
}

export function riftglowUpgradeGet(stat: RiftglowUpgrade) {
  return gamestate().riftglow.upgradeLevels[stat] ?? 0;
}

export function riftglowUpgradeGetValue(stat: RiftglowUpgrade) {
  const level = riftglowUpgradeGet(stat);

  const upgradeValues: Record<RiftglowUpgrade, number> = {
    BonusXP: 5,
    BonusExploreSpeed: 5,
    BonusLootLevel: 1,
    BonusWorldMovementSpeed: 5,
  };

  return upgradeValues[stat] * level;
}
