import { gamestate, updateGamestate } from '@helpers/state-game';
import { generateMerchantItems, resetTownMerchantTicks } from '@helpers/town-merchant';

export function townMerchantGameloop(numTicks: number): void {
  updateGamestate((state) => {
    state.town.merchant.ticksUntilRefresh -= numTicks;
    return state;
  });

  const ticksLeft = gamestate().town.merchant.ticksUntilRefresh;
  if (ticksLeft <= 0) {
    generateMerchantItems();
    resetTownMerchantTicks();
  }
}
