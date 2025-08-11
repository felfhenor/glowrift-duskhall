import { gamestate, updateGamestate } from '@helpers/state-game';
import {
  merchantGenerateItems,
  merchantResetTicks,
} from '@helpers/town-merchant';

export function gameloopTownMerchant(numTicks: number): void {
  updateGamestate((state) => {
    state.town.merchant.ticksUntilRefresh -= numTicks;
    return state;
  });

  const ticksLeft = gamestate().town.merchant.ticksUntilRefresh;
  if (ticksLeft <= 0) {
    merchantGenerateItems();
    merchantResetTicks();
  }
}
