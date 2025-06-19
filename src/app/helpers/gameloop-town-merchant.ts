import { gamestate, updateGamestate } from './state-game';
import { generateMerchantItems, resetTownMerchantTicks } from './town-merchant';

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
