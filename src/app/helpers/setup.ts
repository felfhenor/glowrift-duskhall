import { getCurrencyClaimsForNode, mergeCurrencyClaims } from '@helpers/currency';
import { gamestate, setGameState } from '@helpers/state-game';
import { getWorldNode } from '@helpers/world';

export function isSetup(): boolean {
  const state = gamestate();
  return state.meta.isSetup;
}

export function finishSetup(): void {
  const state = gamestate();
  state.meta.isSetup = true;
  setGameState(state);

  const laflotte = getWorldNode(state.world.homeBase.x, state.world.homeBase.y);
  if (!laflotte) return;

  const claims = getCurrencyClaimsForNode(laflotte);
  mergeCurrencyClaims(claims);
}
