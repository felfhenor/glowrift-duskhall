import { festivalMaybeStartNew } from '@helpers/festival';
import { updateGamestate } from '@helpers/state-game';

export function gameloopFestival(numTicks: number): void {
  updateGamestate((state) => {
    state.festival.ticksWithoutFestivalStart += numTicks;
    return state;
  });

  festivalMaybeStartNew();
}
