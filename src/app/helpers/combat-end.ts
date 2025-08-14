import { combatReset, currentCombat } from '@helpers/combat';
import { combatMessageLog } from '@helpers/combat-log';
import { getEntry } from '@helpers/content';
import { currencyClaimsUpdate, currencyGain } from '@helpers/currency';
import { droppableMakeReal } from '@helpers/droppable';
import {
  exploreProgressPercent,
  exploringUpdateGlobalStatusText,
} from '@helpers/explore';
import { allHeroes, heroUpdateData } from '@helpers/hero';
import { heroAllGainXp } from '@helpers/hero-xp';
import { locationTraitCurrencySpecialModifier } from '@helpers/trait-location-currency';
import { travelHome } from '@helpers/travel';
import {
  worldNodeAddTooHard,
  worldNodeGet,
  worldNodeGetAccessId,
  worldNodeRewardsGain,
} from '@helpers/world';
import type {
  Combat,
  Combatant,
  DroppableEquippable,
  HeroId,
} from '@interfaces';

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
    heroUpdateData(combatant.id as HeroId, {
      hp: combatant.hp,
    });
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

  const currentNode = worldNodeGet(
    combat.locationPosition.x,
    combat.locationPosition.y,
  );

  if (currentNode) {
    const xpGainedForClaim =
      currentNode.encounterLevel * currentNode.guardianIds.length;

    combatMessageLog(combat, `Heroes claimed **${currentNode.name}**!`);
    exploringUpdateGlobalStatusText('');
    exploreProgressPercent.set(0);

    allHeroes().forEach((hero) => {
      combatMessageLog(
        combat,
        `**${hero.name}** gained ${xpGainedForClaim} XP!`,
      );
    });

    heroAllGainXp(xpGainedForClaim);

    const soulEssenceGained =
      xpGainedForClaim +
      currentNode.guardianIds.length *
        locationTraitCurrencySpecialModifier(currentNode, 'Soul Essence');
    currencyGain('Soul Essence', soulEssenceGained);
    combatMessageLog(combat, `You gained ${soulEssenceGained} Soul Essence!`);

    worldNodeRewardsGain(currentNode);

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
}

export function combatHandleDefeat(combat: Combat): void {
  combatMessageLog(combat, 'Heroes have lost the combat!');
  combatMessageLog(combat, 'Heroes have been sent home for recovery!');

  // Update hero health after combat
  updateHeroHealthAfterCombat(combat);

  // Track this node as too hard for now
  const currentNodeId = worldNodeGetAccessId(combat.locationPosition);
  worldNodeAddTooHard(currentNodeId);

  travelHome();
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
