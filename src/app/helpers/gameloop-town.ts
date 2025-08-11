import { gameloopTownMerchant } from '@helpers/gameloop-town-merchant';
import { heroHealAll } from '@helpers/hero';
import { heroAllGainXp } from '@helpers/hero-xp';
import { worldNodeGetCurrent } from '@helpers/world';

export function gameloopTown(numTicks: number): void {
  gameloopTownMerchant(numTicks);

  const currentNode = worldNodeGetCurrent();
  if (currentNode?.nodeType !== 'town') return;

  heroAllGainXp(numTicks);
  heroHealAll(numTicks);
}
