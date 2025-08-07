import { currentCombat, resetCombat } from '@helpers/combat';
import { logCombatMessage } from '@helpers/combat-log';
import { getEntry } from '@helpers/content';
import { gainCurrency, updateCurrencyClaims } from '@helpers/currency';
import { makeDroppableIntoRealItem } from '@helpers/droppable';
import {
  exploreProgressPercent,
  travelHome,
  updateExploringAndGlobalStatusText,
} from '@helpers/explore';
import { allHeroes, updateHeroData } from '@helpers/hero';
import { heroGainXp } from '@helpers/hero-xp';
import { locationTraitCurrencySpecialModifier } from '@helpers/trait-location-currency';
import { gainNodeRewards, getWorldNode } from '@helpers/world';
import type { Combat, Combatant, DroppableEquippable, HeroId } from '@interfaces';

export function currentCombatHasGuardiansAlive(): boolean {
  const combat = currentCombat();
  if (!combat) return false;
  return combat.guardians.some((guardian) => !isDead(guardian));
}

export function isDead(combatant: Combatant): boolean {
  return combatant.hp <= 0;
}

function updateHeroHealthAfterCombat(combat: Combat): void {
  combat.heroes.forEach((combatant) => {
    updateHeroData(combatant.id as HeroId, {
      hp: combatant.hp,
    });
  });
}

export function isCombatOver(combat: Combat): boolean {
  const allHeroesDead = combat.heroes.every((hero) => isDead(hero));
  const allGuardiansDead = combat.guardians.every((guardian) =>
    isDead(guardian),
  );

  return allHeroesDead || allGuardiansDead;
}

export function didHeroesWin(combat: Combat): boolean {
  return combat.guardians.every((guardian) => isDead(guardian));
}

export function handleCombatVictory(combat: Combat): void {
  logCombatMessage(combat, 'Heroes have won the combat!');

  // Update hero health after combat
  updateHeroHealthAfterCombat(combat);

  const currentNode = getWorldNode(
    combat.locationPosition.x,
    combat.locationPosition.y,
  );

  if (currentNode) {
    const xpGainedForClaim =
      currentNode.encounterLevel * currentNode.guardianIds.length;

    logCombatMessage(combat, `Heroes claimed **${currentNode.name}**!`);
    updateExploringAndGlobalStatusText('');
    exploreProgressPercent.set(0);

    allHeroes().forEach((hero) => {
      logCombatMessage(
        combat,
        `**${hero.name}** gained ${xpGainedForClaim} XP!`,
      );
      heroGainXp(hero, xpGainedForClaim);
    });

    const soulEssenceGained =
      xpGainedForClaim +
      currentNode.guardianIds.length *
        locationTraitCurrencySpecialModifier(currentNode, 'Soul Essence');
    gainCurrency('Soul Essence', soulEssenceGained);
    logCombatMessage(combat, `You gained ${soulEssenceGained} Soul Essence!`);

    gainNodeRewards(currentNode);

    currentNode.claimLootIds.forEach((lootDefId) => {
      const lootDef = getEntry<DroppableEquippable>(lootDefId);
      if (!lootDef) return;

      const created = makeDroppableIntoRealItem(lootDef);
      logCombatMessage(
        combat,
        `Heroes found \`rarity:${created.rarity}:${created.name}\`!`,
      );
    });
  }

  resetCombat();
  updateCurrencyClaims();
}

export function handleCombatDefeat(combat: Combat): void {
  logCombatMessage(combat, 'Heroes have lost the combat!');
  logCombatMessage(combat, 'Heroes have been sent home for recovery!');

  // Update hero health after combat
  updateHeroHealthAfterCombat(combat);

  travelHome();
}

export function checkCombatOver(combat: Combat): boolean {
  if (!isCombatOver(combat)) return false;

  logCombatMessage(combat, 'Combat is over.');

  if (didHeroesWin(combat)) {
    handleCombatVictory(combat);
  } else {
    handleCombatDefeat(combat);
  }

  resetCombat();

  logCombatMessage(combat, '');

  return true;
}
