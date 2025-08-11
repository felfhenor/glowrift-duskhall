import {
  timerActionDo,
  timerGetTickActions,
  timerTicksElapsed,
} from '@helpers/timer';

export function gameloopTimers(numTicks: number): void {
  const baseTicks = timerTicksElapsed();

  for (let i = baseTicks; i < baseTicks + numTicks; i++) {
    const actions = timerGetTickActions(i);
    timerActionDo(actions, i);
  }
}
