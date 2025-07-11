import { doTimerActions, getTickActions, totalTicksElapsed } from '@helpers/timer';

export function gameloopTimers(numTicks: number): void {
  const baseTicks = totalTicksElapsed();

  for (let i = baseTicks; i < baseTicks + numTicks; i++) {
    const actions = getTickActions(i);
    doTimerActions(actions, i);
  }
}
