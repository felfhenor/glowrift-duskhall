import {
  timerActionDo,
  timerGetTickActionsBeforeAndIncluding,
  timerTicksElapsed,
} from '@helpers/timer';

export function gameloopTimers(numTicks: number): void {
  const baseTicks = timerTicksElapsed();

  for (let i = baseTicks; i < baseTicks + numTicks; i++) {
    const actions = timerGetTickActionsBeforeAndIncluding(i);
    timerActionDo(actions, i);
  }
}
