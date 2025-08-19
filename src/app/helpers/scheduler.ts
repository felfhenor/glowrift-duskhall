/* eslint-disable @typescript-eslint/no-explicit-any */

export async function schedulerYield() {
  if ((window as any).scheduler?.yield) {
    return (window as any).scheduler.yield();
  }

  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
