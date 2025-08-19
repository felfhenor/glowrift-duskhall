/* eslint-disable @typescript-eslint/no-explicit-any */

export async function schedulerYield() {
  if (!(window as any).scheduler) return;
  await (window as any).scheduler.yield();
}
