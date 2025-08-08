import { getEntry } from '@helpers/content';
import {
  getCurrencyClaimsForNode,
  mergeCurrencyClaims,
} from '@helpers/currency';
import { makeDroppableIntoRealItem } from '@helpers/droppable';
import { allHeroes } from '@helpers/hero';
import { equipSkill } from '@helpers/inventory-skill';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { getWorldNode } from '@helpers/world';
import type { EquipmentSkill } from '@interfaces/content-skill';

export function isSetup(): boolean {
  const state = gamestate();
  return state.meta.isSetup;
}

function giveHeroesDefaultItems(): void {
  const items = ['Earthspike I', 'Firewisp I', 'Healsprite I', 'Thunderwave I'];

  allHeroes().forEach((hero, index) => {
    const skill = items[index];
    const createdSkill = makeDroppableIntoRealItem(
      getEntry<EquipmentSkill>(skill)!,
    ) as EquipmentSkill;

    equipSkill(hero, createdSkill, 0);
  });
}

export function finishSetup(): void {
  updateGamestate((state) => {
    state.meta.isSetup = true;
    return state;
  });

  const homeBase = gamestate().world.homeBase;
  const laflotte = getWorldNode(homeBase.x, homeBase.y);
  if (!laflotte) return;

  const claims = getCurrencyClaimsForNode(laflotte);
  mergeCurrencyClaims(claims);

  giveHeroesDefaultItems();
}
