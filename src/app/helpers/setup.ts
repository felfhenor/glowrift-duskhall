import { getEntry } from '@helpers/content';
import {
  currencyClaimsGetForNode,
  currencyClaimsMerge,
} from '@helpers/currency';
import { droppableMakeReal } from '@helpers/droppable';
import { allHeroes } from '@helpers/hero';
import { skillEquip } from '@helpers/inventory-skill';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { timerAddMerchantRefreshAction, timerGetRegisterTick } from '@helpers/timer';
import { merchantGenerateItems } from '@helpers/town-merchant';
import { locationGet } from '@helpers/world-location';
import type { EquipmentSkill } from '@interfaces/content-skill';

export function isSetup(): boolean {
  const state = gamestate();
  return state.meta.isSetup;
}

function giveHeroesDefaultItems(): void {
  const items = ['Earthspike I', 'Firewisp I', 'Healsprite I', 'Thunderwave I'];

  allHeroes().forEach((hero, index) => {
    const skill = items[index];
    const createdSkill = droppableMakeReal(
      getEntry<EquipmentSkill>(skill)!,
    ) as EquipmentSkill;

    skillEquip(hero, createdSkill, 0);
  });
}

export function setupFinish(): void {
  updateGamestate((state) => {
    state.meta.isSetup = true;
    return state;
  });

  const homeBase = gamestate().world.homeBase;
  const laflotte = locationGet(homeBase.x, homeBase.y);
  if (!laflotte) return;

  const claims = currencyClaimsGetForNode(laflotte);
  currencyClaimsMerge(claims);

  giveHeroesDefaultItems();

  // Generate initial merchant items and schedule the first refresh
  merchantGenerateItems();
  timerAddMerchantRefreshAction(timerGetRegisterTick(3600));
}
