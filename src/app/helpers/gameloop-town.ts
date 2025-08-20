import { heroHealAll } from '@helpers/hero';
import { heroAllGainXp } from '@helpers/hero-xp';
import { locationGetCurrent } from '@helpers/world-location';

export function gameloopTown(): void {
  const currentNode = locationGetCurrent();
  if (currentNode?.nodeType !== 'town') return;

  heroAllGainXp(1);
  heroHealAll(1);
}
