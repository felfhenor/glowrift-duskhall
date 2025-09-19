import { combatReset, currentCombat } from '@helpers/combat';
import { combatMessageLog } from '@helpers/combat-log';
import { getEntry } from '@helpers/content';
import { currencyClaimsUpdate, currencyGain } from '@helpers/currency';
import { droppableMakeReal } from '@helpers/droppable';
import {
  exploreAddFailureToCapture,
  exploreClearFailures,
  exploreProgressPercent,
  exploringUpdateGlobalStatusText,
} from '@helpers/explore';
import { allHeroes, heroGet, heroGetName, heroUpdateData } from '@helpers/hero';
import { heroAllGainXp, heroXpGained } from '@helpers/hero-xp';
import { locationTraitCurrencySpecialModifier } from '@helpers/trait-location-currency';
import { travelHome } from '@helpers/travel';
import { worldNodeGetAccessId } from '@helpers/world';
import {
  locationAddTooHard,
  locationGet,
  locationRewardsGain,
} from '@helpers/world-location';
import type { Guardian } from '@interfaces';
import {
  type Combat,
  type Combatant,
  type DroppableEquippable,
  type HeroId,
} from '@interfaces';
import { sumBy } from 'es-toolkit/compat';

export function combatHasGuardiansAlive(): boolean {
  const combat = currentCombat();
  if (!combat) return false;
  return combat.guardians.some((guardian) => !combatantIsDead(guardian));
}

export function combatantIsDead(combatant: Combatant): boolean {
  return combatant.hp <= 0;
}

function updateHeroHealthAfterCombat(combat: Combat): void {
  combat.heroes.forEach((combatant) => {
    const hero = heroGet(combatant.id as HeroId);
    if (!hero) return;

    hero.hp = Math.min(combatant.hp, hero.totalStats.Health);
    heroUpdateData(hero);
  });
}

export function isCombatOver(combat: Combat): boolean {
  const allHeroesDead = combat.heroes.every((hero) => combatantIsDead(hero));
  const allGuardiansDead = combat.guardians.every((guardian) =>
    combatantIsDead(guardian),
  );

  return allHeroesDead || allGuardiansDead;
}

function didHeroesWin(combat: Combat): boolean {
  return combat.guardians.every((guardian) => combatantIsDead(guardian));
}

function handleCombatVictory(combat: Combat): void {
  combatMessageLog(combat, 'Heroes have won the combat!');

  // Update hero health after combat
  updateHeroHealthAfterCombat(combat);

  const currentNode = locationGet(
    combat.locationPosition.x,
    combat.locationPosition.y,
  );

  if (currentNode) {
    const baseXp = currentNode.encounterLevel * currentNode.guardianIds.length;
    const xpGainedForClaim = heroXpGained(baseXp);

    combatMessageLog(combat, `Heroes claimed **${currentNode.name}**!`);
    exploringUpdateGlobalStatusText('');
    exploreProgressPercent.set(0);

    allHeroes().forEach((hero) => {
      combatMessageLog(
        combat,
        `**${heroGetName(hero)}** gained ${xpGainedForClaim} XP!`,
      );
    });

    heroAllGainXp(xpGainedForClaim);

    const soulEssenceGained = Math.floor(
      sumBy(currentNode.guardianIds, (g) => {
        const guardian = getEntry<Guardian>(g);
        if (!guardian) return 0;

        return (
          currentNode.encounterLevel *
          ((guardian.statScaling.Aura ?? 0) + (guardian.statScaling.Force ?? 0))
        );
      }) *
        (1 + locationTraitCurrencySpecialModifier(currentNode, 'Soul Essence')),
    );

    currencyGain('Soul Essence', soulEssenceGained);
    combatMessageLog(combat, `You gained ${soulEssenceGained} Soul Essence!`);

    locationRewardsGain(currentNode);

    currentNode.claimLootIds.forEach((lootDefId) => {
      const lootDef = getEntry<DroppableEquippable>(lootDefId);
      if (!lootDef) return;

      const created = droppableMakeReal(lootDef);
      combatMessageLog(
        combat,
        `Heroes found \`rarity:${created.rarity}:${created.name}\`!`,
      );
    });
  }

  combatReset();
  currencyClaimsUpdate();
  exploreClearFailures();
}

export function combatHandleDefeat(combat: Combat): void {
  combatMessageLog(combat, 'Heroes have lost the combat!');
  combatMessageLog(combat, 'Heroes have been sent home for recovery!');

  // Update hero health after combat
  updateHeroHealthAfterCombat(combat);

  // Track this node as too hard for now
  const currentNodeId = worldNodeGetAccessId(combat.locationPosition);
  locationAddTooHard(currentNodeId);

  travelHome();
  exploreAddFailureToCapture();
}

export function combatCheckIfOver(combat: Combat): boolean {
  if (!isCombatOver(combat)) return false;

  combatMessageLog(combat, 'Combat is over.');

  if (didHeroesWin(combat)) {
    handleCombatVictory(combat);
  } else {
    combatHandleDefeat(combat);
  }

  combatReset();

  combatMessageLog(combat, '');

  return true;
}
