import { checkFestivalExpirations, maybeStartNewFestival } from './festival';
import { updateGamestate } from './state-game';

export function festivalGameloop(numTicks: number): void {
  updateGamestate((state) => {
    state.festival.ticksWithoutFestivalStart += numTicks;
    return state;
  });

  checkFestivalExpirations();
  maybeStartNewFestival();
}
