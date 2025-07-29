import {
  getCurrencyClaimsForNode,
  mergeCurrencyClaims,
} from '@helpers/currency';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { getWorldNode } from '@helpers/world';

export function isSetup(): boolean {
  const state = gamestate();
  return state.meta.isSetup;
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
}
