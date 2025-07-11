import { checkFestivalExpirations, maybeStartNewFestival } from '@helpers/festival';
import { updateGamestate } from '@helpers/state-game';

export function festivalGameloop(numTicks: number): void {
  updateGamestate((state) => {
    state.festival.ticksWithoutFestivalStart += numTicks;
    return state;
  });

  checkFestivalExpirations();
  maybeStartNewFestival();
}
